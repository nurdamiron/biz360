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
const DocTypeEnum = zod.enum(['invoice', 'kp', 'act', 'sf', 'nakladnaya']);

const NewInvoiceSchema = zod.object({
  // Тип документа
  document_type: DocTypeEnum.default('invoice'),
  // Статус
  status: zod.string().default('draft'),
  // Дата окончания (например, "срок оплаты")
  due_date: zod.date().nullable().optional(),
  // Поставщик
  billing_from: zod.number().or(zod.string()).default(''),
  // Клиент
  billing_to: zod.number().or(zod.string()).default(''),

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
  const tax = watch('tax');

  useEffect(() => {
    // Подсчёт subtotal = сумма total_price по всем строкам
    let calcSubtotal = 0;
    items.forEach((it) => {
      calcSubtotal += it.quantity * it.unit_price;
    });

    // total = subtotal + shipping + tax - discount
    const calcTotal = calcSubtotal + Number(shipping) + Number(tax) - Number(discount);

    // Обновляем поля
    setValue('subtotal', calcSubtotal);
    setValue('total', calcTotal);
  }, [items, shipping, discount, tax, setValue]);

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
      router.push('/dashboard/invoices'); // либо paths.dashboard.invoice.root
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
      const payload = {
        ...formData,
        status: 'pending',
        sent: 1, // признак отправки
        items: formData.items.map((i) => ({
          ...i,
          total_price: i.quantity * i.unit_price,
        })),
      };

      if (currentInvoice?.id) {
        // Обновляем счёт
        await axiosInstance.put(endpoints.invoice.update(currentInvoice.id), payload);
        toast.success('Invoice updated and sent!');
      } else {
        // Создаём новый счёт
        await axiosInstance.post(endpoints.invoice.create, payload);
        toast.success('Invoice created and sent!');
      }

      reset();
      router.push('/dashboard/invoices');
    } catch (error) {
      console.error('handleCreateAndSend error:', error);
      toast.error(error?.message || 'Failed to create and send');
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
          Save as Draft
        </LoadingButton>

        <LoadingButton
          variant="contained"
          size="large"
          loading={loadingSend.value && isSubmitting}
          onClick={handleCreateAndSend}
        >
          {currentInvoice ? 'Update' : 'Create'} & Send
        </LoadingButton>
      </Box>
    </Form>
  );
}