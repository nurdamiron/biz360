// invoice-new-edit-form.jsx

import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { useBoolean } from 'minimal-shared/hooks';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import LoadingButton from '@mui/lab/LoadingButton';
import { useEffect } from 'react';

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
export const NewInvoiceSchema = zod.object({
  document_type: zod.enum(['invoice', 'kp', 'act', 'sf']).default('invoice'),
  status: zod.string().default('draft'),
  due_date: zod.date({
    required_error: 'Due date is required',
  }),
  billing_from: zod.number({
    required_error: 'Supplier is required',
  }),
  billing_to: zod.number({
    required_error: 'Customer is required',
  }),
  items: zod.array(
    zod.object({
      title: zod.string().min(1, 'Title is required'),
      description: zod.string().optional(),
      service: zod.string().min(1, 'Service is required'),
      quantity: zod.number().int().positive(),
      unit_price: zod.number().nonnegative(),
      total_price: zod.number().optional()
    })
  ).min(1, 'At least one item is required'),
  subtotal: zod.number().nonnegative(),
  shipping: zod.number().nonnegative().default(0),
  discount: zod.number().nonnegative().default(0),
  tax: zod.number().nonnegative().default(0),
  total: zod.number().nonnegative(),
  notes: zod.string().optional()
});

// ----------------------------------------------------------------------

export function InvoiceNewEditForm({ currentInvoice }) {
  const router = useRouter();
  const loadingSave = useBoolean();
  const loadingSend = useBoolean();

  const defaultValues = {
    document_type: 'invoice',
    status: 'draft',
    due_date: null,
    billing_from: null,
    billing_to: null,
    items: [{
      title: '',
      description: '',
      service: '',
      quantity: 1,
      unit_price: 0,
      total_price: 0
    }],
    subtotal: 0,
    shipping: 0,
    discount: 0,
    tax: 0,
    total: 0,
    notes: ''
  };

  const methods = useForm({
    mode: 'all',
    resolver: zodResolver(NewInvoiceSchema),
    defaultValues,
    values: currentInvoice ? {
      ...currentInvoice,
      due_date: currentInvoice.dueDate ? new Date(currentInvoice.dueDate) : null,
      billing_from: currentInvoice.invoice?.billing_from,
      billing_to: currentInvoice.invoice?.billing_to,
      items: currentInvoice.items?.map(item => ({
        title: item.title,
        description: item.description || '',
        service: item.service,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price
      }))
    } : undefined
  });

  const { 
    watch, 
    setValue, 
    handleSubmit,
    reset,
    formState: { isSubmitting }
  } = methods;
  
  const items = watch('items');
  
  useEffect(() => {
    const subtotal = items.reduce((sum, item) => 
      sum + (item.quantity * item.unit_price), 0);
    
    setValue('subtotal', subtotal);
    
    const total = subtotal + 
      (watch('shipping') || 0) + 
      (watch('tax') || 0) - 
      (watch('discount') || 0);
    
    setValue('total', total);
  }, [items, setValue, watch]);

  const handleSaveAsDraft = handleSubmit(async (data) => {
    loadingSave.onTrue();
    try {
      if (currentInvoice?.id) {
        await axiosInstance.put(
          endpoints.invoice.update(currentInvoice.id),
          {
            ...data,
            status: 'draft',
            items: data.items.map(item => ({
              ...item,
              total_price: item.quantity * item.unit_price
            }))
          }
        );
        toast.success('Draft updated successfully');
      } else {
        const response = await axiosInstance.post(
          endpoints.invoice.create,
          {
            ...data,
            status: 'draft',
            items: data.items.map(item => ({
              ...item,
              total_price: item.quantity * item.unit_price
            }))
          }
        );
        toast.success('Draft created successfully');
      }
      
      reset();
      router.push(paths.dashboard.invoice.root);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || 'Error saving draft');
    } finally {
      loadingSave.onFalse();
    }
  });

  const handleCreateAndSend = handleSubmit(async (data) => {
    loadingSend.onTrue();
    try {
      const payload = {
        ...data,
        status: 'pending',
        sent: 1,
        items: data.items.map(item => ({
          ...item,
          total_price: item.quantity * item.unit_price
        }))
      };

      if (currentInvoice?.id) {
        await axiosInstance.put(
          endpoints.invoice.update(currentInvoice.id),
          payload
        );
        toast.success('Invoice updated and sent');
      } else {
        await axiosInstance.post(endpoints.invoice.create, payload);
        toast.success('Invoice created and sent');
      }

      reset();
      router.push(paths.dashboard.invoice.root);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || 'Error creating/sending invoice');
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

      <Box sx={{ mt: 3, gap: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <LoadingButton
          color="inherit"
          size="large"
          variant="outlined"
          loading={loadingSave.value && isSubmitting}
          onClick={handleSaveAsDraft}
        >
          Save as Draft
        </LoadingButton>

        <LoadingButton
          size="large"
          variant="contained"
          loading={loadingSend.value && isSubmitting}
          onClick={handleCreateAndSend}
        >
          {currentInvoice ? 'Update' : 'Create'} & Send
        </LoadingButton>
      </Box>
    </Form>
  );
}