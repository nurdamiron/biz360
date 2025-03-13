// src/sections/order/order-new-edit-form.jsx
import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, Field } from 'src/components/hook-form';
import { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import Card from '@mui/material/Card';
import LoadingButton from '@mui/lab/LoadingButton';
import { useRouter } from 'src/routes/hooks';
import { toast } from 'src/components/snackbar';
import { useBoolean } from 'minimal-shared/hooks';
import { OrderNewEditAddress } from './order-new-edit-address';
import { OrderNewEditStatusDate } from './order-new-edit-status-date';
import { OrderNewEditDetails, defaultItem } from './order-new-edit-details';
import axiosInstance, { endpoints } from 'src/lib/axios';
import { useOrderForm } from 'src/actions/order';

// Схема валидации через Zod
const OrderSchema = zod.object({
  // Общие поля заказа
  order_number: zod.string().optional(),
  document_type: zod.string().default('invoice'),
  status: zod.string().default('new'),
  createDate: zod.date().default(() => new Date()),
  due_date: zod.date().nullable().optional(),
  
  // Контрагенты
  billing_from: zod.number().optional(),
  supplier_company_type: zod.string().optional(),
  billing_to: zod.number().min(1, 'Выберите клиента'),
  
  // Информация об отправителе и получателе
  invoiceFrom: zod.object({
    id: zod.any().optional(),
    name: zod.string().optional(),
    email: zod.string().optional(),
    phoneNumber: zod.string().optional(),
    fullAddress: zod.string().optional(),
    companyType: zod.string().optional(),
    bankName: zod.string().optional(),
    bankBik: zod.string().optional(),
    iik: zod.string().optional(),
    bankLogo: zod.string().optional()
  }).optional(),
  
  invoiceTo: zod.object({
    id: zod.any().optional(),
    name: zod.string().optional(),
    email: zod.string().optional(),
    phoneNumber: zod.string().optional(),
    fullAddress: zod.string().optional(),
    companyType: zod.string().optional(),
    bankName: zod.string().optional(),
    bankBik: zod.string().optional(),
    iik: zod.string().optional(),
    bankLogo: zod.string().optional()
  }).optional(),
  
  // Массив товаров
  items: zod.array(
    zod.object({
      productId: zod.any().optional(),
      title: zod.string().min(1, 'Название обязательно'),
      description: zod.string().optional(),
      service: zod.string().optional(),
      quantity: zod.number().min(1, 'Минимум 1 единица'),
      unit_price: zod.number().nonnegative('Цена не может быть отрицательной'),
      total_price: zod.number().default(0)
    })
  ).min(1, 'Добавьте хотя бы один товар'),
  
  // Расчетные поля
  subtotal: zod.number().default(0),
  shipping: zod.number().default(0),
  discount: zod.number().default(0),
  tax: zod.number().default(0),
  total: zod.number().default(0),
  notes: zod.string().optional()
});

export function OrderNewEditForm({ currentOrder }) {
  const router = useRouter();
  const loadingSave = useBoolean();
  const loadingSubmit = useBoolean();
  const { saveOrder, calculateOrderTotals, loading } = useOrderForm(currentOrder);

  // Значения по умолчанию для новой формы
  const defaultValues = {
    order_number: '',
    document_type: 'invoice',
    status: 'new',
    createDate: new Date(),
    due_date: null,
    billing_from: '',
    supplier_company_type: '',
    billing_to: '',
    invoiceFrom: null,
    invoiceTo: null,
    items: [defaultItem],
    subtotal: 0,
    shipping: 0,
    discount: 0,
    tax: 0,
    total: 0,
    notes: ''
  };

  // Инициализация React Hook Form
  const methods = useForm({
    mode: 'onChange',
    resolver: zodResolver(OrderSchema),
    defaultValues,
    values: currentOrder
      ? {
          ...currentOrder,
          createDate: currentOrder.created_at ? new Date(currentOrder.created_at) : new Date(),
          due_date: currentOrder.due_date ? new Date(currentOrder.due_date) : null,
          items: currentOrder.items?.map((item) => ({
            productId: item.product_id || '',
            title: item.title || item.product_name || '',
            description: item.description || '',
            service: item.service || '',
            quantity: item.quantity || 1,
            unit_price: item.unit_price || 0,
            total_price: item.total_price || 0
          })) || [defaultItem],
        }
      : undefined
  });

  const {
    watch,
    setValue,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors }
  } = methods;

  console.log('Form errors:', errors);

  // Получение необходимых полей из формы
  const items = watch('items');
  const shipping = Number(watch('shipping') || 0);
  const discount = Number(watch('discount') || 0);
  const tax = Number(watch('tax') || 0);
  const supplierType = watch('supplier_company_type');
  const supplier_company_type = watch('supplier_company_type');

  // Автоматический расчет итоговых сумм при изменении данных
  useEffect(() => {
    let calcSubtotal = 0;
    items.forEach((item) => {
      calcSubtotal += item.quantity * item.unit_price;
    });
    
    // Налог рассчитываем только для ТОО, АО, ГП, ПК
    const vatEnabled = ['ТОО', 'АО', 'ГП', 'ПК'].includes(supplier_company_type);
    const calcTax = vatEnabled ? Number((calcSubtotal * 0.12).toFixed(2)) : 0;
    
    const calcTotal = calcSubtotal + shipping - discount + calcTax;
    
    setValue('subtotal', calcSubtotal);
    setValue('tax', calcTax);
    setValue('total', calcTotal);
    
    console.log('Обновлены расчеты:', { calcSubtotal, calcTax, calcTotal });
  }, [items, shipping, discount, supplier_company_type, setValue]);

  // Сохранение заказа как черновика
  const handleSaveAsDraft = handleSubmit(async (formData) => {
    loadingSave.onTrue();
    try {
      let response;
      const payload = {
        ...formData,
        status: 'draft',
        items: formData.items.map((item) => ({
          product_id: item.productId,
          product_name: item.title,
          description: item.description || '',
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.quantity * item.unit_price
        }))
      };
      
      if (currentOrder?.id) {
        response = await axiosInstance.put(`/api/orders/${currentOrder.id}`, payload);
        toast.success('Черновик заказа успешно обновлен');
      } else {
        response = await axiosInstance.post('/api/orders', payload);
        toast.success('Черновик заказа успешно создан');
      }
      
      reset();
      router.push('/dashboard/orders');
    } catch (error) {
      console.error('Ошибка сохранения черновика:', error);
      toast.error(error?.message || 'Не удалось сохранить черновик');
    } finally {
      loadingSave.onFalse();
    }
  });

  
  // Создание и отправка заказа
  const handleCreateOrder = handleSubmit(async (formData) => {
    loadingSubmit.onTrue();
    try {
      let response;
      const payload = {
        ...formData,
        status: 'new',
        items: formData.items.map((item) => ({
          product_id: item.productId,
          product_name: item.title,
          description: item.description || '',
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.quantity * item.unit_price
        }))
      };
      
      if (currentOrder?.id) {
        response = await axiosInstance.put(`/api/orders/${currentOrder.id}`, payload);
        toast.success('Заказ успешно обновлен');
      } else {
        response = await axiosInstance.post('/api/orders', payload);
        toast.success('Заказ успешно создан');
      }
      
      reset();
      router.push('/dashboard/orders');
    } catch (error) {
      console.error('Ошибка создания заказа:', error);
      toast.error(error?.message || 'Не удалось создать заказ');
    } finally {
      loadingSubmit.onFalse();
    }
  });

  return (
    <Form methods={methods}>
      <Card>
        <OrderNewEditAddress />
        <OrderNewEditStatusDate />
        <OrderNewEditDetails />
        <Box sx={{ p: 3 }}>
          <Field.Text
            name="notes"
            label="Примечания к заказу"
            multiline
            rows={4}
            fullWidth
          />
        </Box>
      </Card>
      
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <LoadingButton
          color="inherit"
          variant="outlined"
          size="large"
          loading={loadingSave.value && isSubmitting}
          onClick={handleSaveAsDraft}
        >
          Сохранить как черновик
        </LoadingButton>
        
        <LoadingButton
          variant="contained"
          size="large"
          loading={loadingSubmit.value && isSubmitting}
          onClick={handleCreateOrder}
        >
          {currentOrder ? 'Обновить' : 'Создать'} заказ
        </LoadingButton>
      </Box>
    </Form>
  );
}