import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import Card from '@mui/material/Card';
import LoadingButton from '@mui/lab/LoadingButton';

import { useRouter } from 'src/routes/hooks';
import { Form } from 'src/components/hook-form';
import { toast } from 'src/components/snackbar';
import { useBoolean } from 'minimal-shared/hooks';

import { InvoiceNewEditAddress } from './invoice-new-edit-address';
import { InvoiceNewEditStatusDate } from './invoice-new-edit-status-date';
import { InvoiceNewEditDetails, defaultItem } from './invoice-new-edit-details';

import axiosInstance, { endpoints } from 'src/lib/axios';

// ----------------------------------------------------------------------
// Шаг 1. Схема валидации через Zod

// Пример: можно расширять по ситуации (kp, act, nakladnaya)
const DocTypeEnum = zod.enum(['invoice', 'nakladnaya', 'schet_faktura', 'bank_transfer']);

const NewInvoiceSchema = zod.object({
  // Тип документа
  document_type: DocTypeEnum.default('invoice'),
  // Статус
  status: zod.string().default('draft'),
  // Дата окончания (например, "срок оплаты")
  due_date: zod.date().nullable().optional(),
  // Поставщик
  billing_from: zod.number().optional().default(0),
  // Клиент
  billing_to: zod.preprocess(val => {
    // Преобразуем входное значение в число, если оно не пустое
    if (val === '' || val === null || val === undefined) return undefined;
    return Number(val);
  }, zod.number({ required_error: 'Billing_to (ID клиента) обязательно для заполнения' })),

  // Массив товаров
  items: zod.array(
    zod.object({
      title: zod.string().min(1, 'Название обязательно'),
      service: zod.string().default(0),
      // Кол-во
      quantity: zod
        .number({
          required_error: 'Количество обязательно',
          invalid_type_error: 'Количество должно быть числом',
        })
        .int('Количество должно быть целым числом')
        .min(1, 'Минимум 1 единица'), 
      // Цена
      unit_price: zod
        .number({
          required_error: 'Цена обязательна',
          invalid_type_error: 'Цена должна быть числом',
        })
        .nonnegative('Цена не может быть отрицательной'),
      total_price: zod.number().default(0),
    })
  ).min(1, 'Нужно добавить хотя бы одну позицию товаров'),

  // Поля для расчёта
  subtotal: zod.number().default(0),
  shipping: zod.number().default(0),
  discount: zod.number().default(0),
  tax: zod.number().default(0),
  total: zod.number().default(0),

  notes: zod.string().optional(),
});

// ----------------------------------------------------------------------
// Шаг 2. Основной компонент

export function InvoiceNewEditForm({ currentInvoice }) {
  const router = useRouter();
  const loadingSave = useBoolean(); // Состояние кнопки "Save as Draft"
  const loadingSend = useBoolean(); // Состояние кнопки "Create & Send"

  const [vatPerUnit, setVatPerUnit] = useState(0);


  // Значения по умолчанию для новой формы
  const defaultValues = {
    document_type: 'invoice',
    status: 'draft',
    due_date: null,
    billing_from: '',
    billing_to: '',
    items: [defaultItem], // хотя бы одна строка товара
    subtotal: 0,
    shipping: 0,
    discount: 0,
    tax: 0,
    total: 0,
    notes: '',
  };

  // Инициализируем React Hook Form
  const methods = useForm({
    mode: 'onChange',
    resolver: zodResolver(NewInvoiceSchema),
    defaultValues,
    // Если есть "currentInvoice" (редактируемый), можно подставить в "values"
    values: currentInvoice
      ? {
          ...currentInvoice,
          due_date: currentInvoice.dueDate
            ? new Date(currentInvoice.dueDate)
            : null,
          billing_from: currentInvoice.billing_from || '',
          billing_to: currentInvoice.billing_to || '',
          items: currentInvoice.items?.map((item) => ({
            title: item.title || '',
            description: item.description || '',
            service: item.service || '',
            quantity: item.quantity || 1,
            unit_price: item.unit_price || 0,
            total_price: item.total_price || 0,
          })) || [defaultItem],
        }
      : undefined,
  });

  // Деструктурируем удобства
  const {
    watch,
    setValue,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = methods;

  // Следим за items, shipping, discount, tax, чтобы пересчитать subtotal / total
  const items = watch('items');
  const shipping = watch('shipping');
  const discount = watch('discount');
  const tax = watch('tax'); // Теперь UI обновляется
  const subtotal = watch('subtotal');
  const total = watch('total');

  useEffect(() => {
    let calcSubtotal = 0;
    items.forEach((it) => {
      calcSubtotal += it.quantity * it.unit_price;
    });

    const calcTotal = calcSubtotal + Number(shipping) + Number(tax) - Number(discount);

    setValue('subtotal', calcSubtotal);
    setValue('total', calcTotal);
    setValue('tax', Number((calcSubtotal * 0.12).toFixed(2))); // Правильный расчет НДС

    console.log('🔹 Обновлено:', { calcSubtotal, calcTotal, tax: (calcSubtotal * 0.12).toFixed(2) });
  }, [items, shipping, discount, setValue]);

  // Функция "Сохранить как черновик"
  const handleSaveAsDraft = handleSubmit(async (formData) => {
    loadingSave.onTrue();
    try {
      // Если редактируем уже существующий
      if (currentInvoice?.id) {
        await axiosInstance.put(endpoints.invoice.update(currentInvoice.id), {
          ...formData,
          status: 'draft',
          items: formData.items.map((i) => ({
            ...i,
            total_price: i.quantity * i.unit_price,
          })),
        });
        toast.success('Draft updated successfully!');
      } else {
        // Создаём новый
        await axiosInstance.post(endpoints.invoice.create, {
          ...formData,
          status: 'draft',
          items: formData.items.map((i) => ({
            ...i,
            total_price: i.quantity * i.unit_price,
          })),
        });
        toast.success('Draft created successfully!');
      }

      reset();
      router.push('/dashboard/invoice'); // либо paths.dashboard.invoice.root
    } catch (error) {
      console.error('handleSaveAsDraft error:', error);
      toast.error(error?.message || 'Failed to save draft');
    } finally {
      loadingSave.onFalse();
    }
  });

  // Функция "Создать и Отправить"
  const handleCreateAndSend = handleSubmit(async (formData) => {
    loadingSend.onTrue();
    try {
      // Рассчитываем total_price для каждого элемента
      const payload = {
        ...formData,
        status: 'pending',
        sent: 1, // признак отправки
        items: formData.items.map((i) => ({
          ...i,
          total_price: i.quantity * i.unit_price,
        })),
      };
  
      console.log('Отправляем payload:', payload);
  
      let response;
      if (currentInvoice?.id) {
        response = await axiosInstance.put(
          endpoints.invoice.update(currentInvoice.id),
          payload
        );
        console.log('Ответ обновления:', response.data);
        toast.success('Invoice updated and sent!');
      } else {
        response = await axiosInstance.post(
          endpoints.invoice.create,
          payload
        );
        console.log('Ответ создания:', response.data);
        toast.success('Invoice created and sent!');
      }
  
      // Сброс формы и переход на список счетов
      reset();
      router.push('/dashboard/invoice');
    } catch (error) {
      console.error('handleCreateAndSend error:', error);
      // Попробуйте выводить более подробную ошибку, если есть response.data.error
      const errorMessage =
        error?.response?.data?.error || error.message || 'Failed to create and send';
      toast.error(errorMessage);
    } finally {
      loadingSend.onFalse();
    }
  });
  


  return (
    <Form methods={methods}>
      <Card>
        <InvoiceNewEditAddress />
        <InvoiceNewEditStatusDate />
        <InvoiceNewEditDetails />
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
          loading={loadingSend.value && isSubmitting}
          onClick={handleCreateAndSend}
        >
          {currentInvoice ? 'Обновить' : 'Создать'} & Отправить
        </LoadingButton>
      </Box>
    </Form>
  );
}