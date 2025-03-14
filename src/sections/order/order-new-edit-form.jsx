// src/sections/order/order-new-edit-form.jsx
import { z as zod } from 'zod';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, Field } from 'src/components/hook-form';
import { useState, useEffect, useCallback } from 'react';
import { Box, Stack } from '@mui/material';
import Card from '@mui/material/Card';
import LoadingButton from '@mui/lab/LoadingButton';
import { useRouter } from 'src/routes/hooks';
import { toast } from 'src/components/snackbar';
import { useBoolean } from 'minimal-shared/hooks';
import { OrderNewEditAddress } from './order-new-edit-address';
import { OrderNewEditStatusDate } from './order-new-edit-status-date';
import { OrderNewEditDetails, defaultItem } from './order-new-edit-details';
import { OrderMetricsPreview } from './order-metrics-preview'; // Import our new component
import { OrderSuccessDialog } from './order-success-dialog'; // Import success dialog
import axiosInstance, { endpoints } from 'src/lib/axios';
import { useOrderForm } from 'src/actions/order';

// Схема валидации через Zod
const OrderSchema = zod.object({
  // Общие поля заказа
  order_number: zod.string().optional(),
  document_type: zod.string().default('invoice'),
  status: zod.string().default('new'),
  createDate: zod.instanceof(Date).default(() => new Date()),
  due_date: zod.instanceof(Date).nullable().optional(),
  
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
      quantity: zod
      .number()
      .transform((val) => Number(val)),
      unit_price: zod.number().nonnegative('Цена не может быть отрицательной'),
      total_price: zod.number().default(0),
      base_price: zod.number().optional(),
      margin_percentage: zod.number().optional(),
      potential_bonus: zod.number().optional()
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

  // State for success dialog
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [createdOrderData, setCreatedOrderData] = useState(null);
  const [createdInvoiceData, setCreatedInvoiceData] = useState(null);
  
  // Timer for tracking order creation time
  const [startTime, setStartTime] = useState(Date.now());
  
  // Состояния для бонусов и маржи
  const [totalBonus, setTotalBonus] = useState(0);
  const [avgMargin, setAvgMargin] = useState(0);
  
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
            total_price: item.total_price || 0,
            base_price: item.base_price || 0,
            margin_percentage: item.margin_percentage || 0,
            potential_bonus: item.potential_bonus || 0
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

  // Получение необходимых полей из формы
  const items = watch('items');
  const shipping = Number(watch('shipping') || 0);
  const discount = Number(watch('discount') || 0);
  const tax = Number(watch('tax') || 0);
  const supplierType = watch('supplier_company_type');
  const supplier_company_type = watch('supplier_company_type');

  // Функция расчета бонусов
  const calculateBonus = useCallback(() => {
    let bonus = 0;
    let totalMargin = 0;
    let validItemsCount = 0;
    
    if (!items || !items.length) return;
    
    items.forEach((item) => {
      if (item.base_price && item.unit_price && item.quantity) {
        const itemMargin = (item.unit_price - item.base_price) * item.quantity;
        const itemMarginPercentage = ((item.unit_price - item.base_price) / item.base_price) * 100;
        
        totalMargin += itemMarginPercentage;
        bonus += Math.round(itemMargin * 0.05); // 5% от маржи как бонус
        validItemsCount += 1;
      }
    });
    
    setTotalBonus(bonus);
    setAvgMargin(validItemsCount > 0 ? totalMargin / validItemsCount : 0);
  }, [items]);
  
  // Вычисление бонусов при изменении товаров
  useEffect(() => {
    calculateBonus();
    
    // Слушаем события обновления отдельных товаров
    const handleOrderItemUpdated = () => {
      calculateBonus();
    };
    
    document.addEventListener('orderItemUpdated', handleOrderItemUpdated);
    
    return () => {
      document.removeEventListener('orderItemUpdated', handleOrderItemUpdated);
    };
  }, [items, calculateBonus]);
  
  // Автоматический расчет итоговых сумм при изменении данных
  useEffect(() => {
    if (!items || !items.length) return;
    
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
  }, [items, shipping, discount, supplier_company_type, setValue]);

  // Calculate potential bonuses and margins
  const calculatePotentialBonuses = (orderItems) => {
    if (!orderItems || !orderItems.length) return 0;
    
    let totalMargin = 0;
    
    orderItems.forEach(item => {
      // Assuming base price is 80% of unit price if not provided
      const baseCost = item.base_price || (item.unit_price * 0.8);
      const itemMargin = (item.unit_price - baseCost) * item.quantity;
      totalMargin += itemMargin;
    });
    
    // Estimate potential bonus as 5% of total margin
    return Math.round(totalMargin * 0.05);
  };

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
          total_price: item.quantity * item.unit_price,
          base_price: item.base_price || 0,
          margin_percentage: item.margin_percentage || 0,
          potential_bonus: item.potential_bonus || 0
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
      // Calculate creation time
      const creationTime = Math.floor((Date.now() - startTime) / 1000);
      
      // Calculate potential bonus
      const potentialBonus = calculatePotentialBonuses(formData.items);
      
      let response;
      const payload = {
        ...formData,
        status: 'new',
        creation_time: creationTime,
        potential_bonus: potentialBonus,
        items: formData.items.map((item) => ({
          product_id: item.productId,
          product_name: item.title,
          description: item.description || '',
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.quantity * item.unit_price,
          base_price: item.base_price || 0,
          margin_percentage: item.margin_percentage || 0,
          potential_bonus: item.potential_bonus || 0
        }))
      };
      
      if (currentOrder?.id) {
        response = await axiosInstance.put(`/api/orders/${currentOrder.id}`, payload);
        toast.success('Заказ успешно обновлен');
        
        // Handle update case (normally we would redirect to order details)
        reset();
        router.push(`/dashboard/orders/${currentOrder.id}`);
      } else {
        // Create new order
        response = await axiosInstance.post('/api/orders', payload);
        
        // Store created order data for success dialog
        setCreatedOrderData(response.data);
        
        // Generate invoice automatically
        const invoiceResponse = await axiosInstance.post('/api/invoices', {
          order_id: response.data.id,
          document_type: formData.document_type,
          billing_from: formData.billing_from,
          billing_to: formData.billing_to,
          items: formData.items.map(item => ({
            product_id: item.productId,
            product_name: item.title,
            description: item.description || '',
            quantity: item.quantity,
            unit_price: item.unit_price,
            total_price: item.quantity * item.unit_price,
            base_price: item.base_price || 0,
            margin_percentage: item.margin_percentage || 0,
            potential_bonus: item.potential_bonus || 0
          })),
          subtotal: formData.subtotal,
          shipping: formData.shipping,
          discount: formData.discount,
          tax: formData.tax,
          total: formData.total,
          notes: formData.notes
        });
        
        // Store created invoice data for success dialog
        setCreatedInvoiceData(invoiceResponse.data);
        
        // Show success dialog instead of redirecting
        setShowSuccessDialog(true);
      }
    } catch (error) {
      console.error('Ошибка создания заказа:', error);
      toast.error(error?.message || 'Не удалось создать заказ');
    } finally {
      loadingSubmit.onFalse();
    }
  });

  // Handle closing the success dialog
  const handleCloseSuccessDialog = () => {
    setShowSuccessDialog(false);
    reset();
    router.push('/dashboard/orders');
  };

  return (
    <FormProvider {...methods}>
      <Form methods={methods}>
        <Card>
          <OrderNewEditAddress />
          
        </Card>
        
        <Card sx={{ flex: 1 }}>
          <OrderNewEditDetails />
        </Card>

        <Card sx={{ flex: 1 }}>
          <OrderMetricsPreview totalBonus={totalBonus} avgMargin={avgMargin} />
        </Card>
          <Box sx={{ p: 3 }}>
            <Field.Text
              name="notes"
              label="Примечания к заказу"
              multiline
              rows={4}
              fullWidth
            />
          </Box>
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
        
        {/* Success Dialog - New component */}
        <OrderSuccessDialog
          open={showSuccessDialog}
          onClose={handleCloseSuccessDialog}
          orderData={createdOrderData}
          invoiceData={createdInvoiceData}
        />
      </Form>
    </FormProvider>
  );
}