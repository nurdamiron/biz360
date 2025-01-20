// invoice-new-edit-form.jsx

import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { useBoolean } from 'minimal-shared/hooks';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import LoadingButton from '@mui/lab/LoadingButton';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { today, fIsAfter } from 'src/utils/format-time';

import { _addressBooks } from 'src/_mock';

import { Form, schemaHelper } from 'src/components/hook-form';

import { InvoiceNewEditAddress } from './invoice-new-edit-address';
import { InvoiceNewEditStatusDate } from './invoice-new-edit-status-date';
import { defaultItem, InvoiceNewEditDetails } from './invoice-new-edit-details';

import axiosInstance, { endpoints } from 'src/lib/axios';
import { toast } from 'src/components/snackbar';

// ----------------------------------------------------------------------

// Zod-схема + валидация
export const NewInvoiceSchema = zod
  .object({
    invoiceTo: schemaHelper.nullableInput(zod.custom(), {
      message: 'Invoice to is required!',
    }),
    createDate: schemaHelper.date({ message: { required: 'Create date is required!' } }),
    dueDate: schemaHelper.date({ message: { required: 'Due date is required!' } }),
    items: zod.array(
      zod.object({
        title: zod.string().min(1, { message: 'Title is required!' }),
        service: zod.string().min(1, { message: 'Service is required!' }),
        quantity: zod
          .number()
          .int()
          .positive()
          .min(1, { message: 'Quantity must be more than 0' }),
        price: zod.number().optional(),
        total: zod.number().optional(),
        description: zod.string().optional(),
      })
    ),
    taxes: zod.number().optional(),
    status: zod.string().optional(),
    discount: zod.number().optional(),
    shipping: zod.number().optional(),
    subtotal: zod.number().optional(),
    totalAmount: zod.number().optional(),
    invoiceNumber: zod.string().optional(),
    invoiceFrom: zod.custom().nullable(),
  })
  .refine((data) => !fIsAfter(data.createDate, data.dueDate), {
    message: 'Due date cannot be earlier than create date!',
    path: ['dueDate'],
  });

// ----------------------------------------------------------------------

export function InvoiceNewEditForm({ currentInvoice }) {
  const router = useRouter();

  const loadingSave = useBoolean();
  const loadingSend = useBoolean();

  // Значения по умолчанию (создание новой накладной)
  const defaultValues = {
    invoiceNumber: 'INV-1990',
    createDate: today(),
    dueDate: null,
    taxes: 0,
    shipping: 0,
    status: 'draft',
    discount: 0,
    invoiceFrom: _addressBooks[0], // можете поставить null, если хотите
    invoiceTo: null,
    subtotal: 0,
    totalAmount: 0,
    items: [defaultItem],
  };

  // Инициализация react-hook-form
  // Если передан currentInvoice (редактирование), мы впихиваем его в поля
  const methods = useForm({
    mode: 'all',
    resolver: zodResolver(NewInvoiceSchema),
    defaultValues,
    values: currentInvoice, // если undefined/null, просто возьмет defaultValues
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  // (A) Сохранить как черновик (status='draft')
  const handleSaveAsDraft = handleSubmit(async (data) => {
    loadingSave.onTrue();
    try {
      // ставим статус 'draft'
      const payload = { ...data, status: 'draft' };

      if (currentInvoice?.id) {
        // PUT /api/invoices/:id
        await axiosInstance.put(
          `${endpoints.invoice.update}/${currentInvoice.id}`,
          payload
        );
        toast.success('Draft updated successfully!');
      } else {
        // POST /api/invoices
        await axiosInstance.post(endpoints.invoice.create, payload);
        toast.success('Draft created successfully!');
      }

      // Можно сбросить форму, вернуться на список и т.д.
      reset();
      router.push(paths.dashboard.invoice.root);
      console.info('DATA (draft)', JSON.stringify(payload, null, 2));
    } catch (error) {
      console.error(error);
      toast.error('Error while saving draft');
    } finally {
      loadingSave.onFalse();
    }
  });

  // (B) Создать/обновить и отправить
  const handleCreateAndSend = handleSubmit(async (data) => {
    loadingSend.onTrue();
    try {
      // ставим статус 'pending' или 'sent'
      const payload = { ...data, status: 'pending' };

      if (currentInvoice?.id) {
        // PUT /api/invoices/:id
        await axiosInstance.put(
          `${endpoints.invoice.update}/${currentInvoice.id}`,
          payload
        );
        toast.success('Invoice updated & sent!');
      } else {
        // POST /api/invoices
        await axiosInstance.post(endpoints.invoice.create, payload);
        toast.success('Invoice created & sent!');
      }

      reset();
      router.push(paths.dashboard.invoice.root);
      console.info('DATA (create&send)', JSON.stringify(payload, null, 2));
    } catch (error) {
      console.error(error);
      toast.error('Error while creating/sending invoice');
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

      <Box
        sx={{
          mt: 3,
          gap: 2,
          display: 'flex',
          justifyContent: 'flex-end',
        }}
      >
        <LoadingButton
          color="inherit"
          size="large"
          variant="outlined"
          loading={loadingSave.value && isSubmitting}
          onClick={handleSaveAsDraft}
        >
          Save as draft
        </LoadingButton>

        <LoadingButton
          size="large"
          variant="contained"
          loading={loadingSend.value && isSubmitting}
          onClick={handleCreateAndSend}
        >
          {currentInvoice ? 'Update' : 'Create'} & send
        </LoadingButton>
      </Box>
    </Form>
  );
}
