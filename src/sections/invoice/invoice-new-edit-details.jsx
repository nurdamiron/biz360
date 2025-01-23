import { sumBy } from 'es-toolkit';
import { useEffect } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import { inputBaseClasses } from '@mui/material/InputBase';

import { Field } from 'src/components/hook-form';
import { Iconify } from 'src/components/iconify';

// Default item structure matching database
export const defaultItem = {
  title: '',
  description: '',
  service: '',
  quantity: 1,
  unit_price: 0,
  total_price: 0
};

const getFieldNames = (index) => ({
  title: `items[${index}].title`,
  description: `items[${index}].description`,
  service: `items[${index}].service`,
  quantity: `items[${index}].quantity`,
  unit_price: `items[${index}].unit_price`,
  total_price: `items[${index}].total_price`
});

export function InvoiceNewEditDetails() {
  const { control, setValue, watch } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items'
  });

  // Use watch to track form values
  const items = watch('items') || [];
  const tax = watch('tax') || 0;
  const discount = watch('discount') || 0;
  const shipping = watch('shipping') || 0;

  // Calculate totals
  const subtotal = sumBy(items, (item) => 
    (item.quantity || 0) * (item.unit_price || 0)
  );
  
  const total = subtotal + shipping + tax - discount;

  // Update form values when calculations change
  useEffect(() => {
    setValue('subtotal', subtotal);
    setValue('total', total);
  }, [setValue, subtotal, total]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ color: 'text.disabled', mb: 3 }}>
        Детали заказа:
      </Typography>

      <Stack divider={<Divider flexItem sx={{ borderStyle: 'dashed' }} />} spacing={3}>
        {fields.map((item, index) => (
          <InvoiceItem
            key={item.id}
            fieldNames={getFieldNames(index)}
            onRemoveItem={() => remove(index)}
          />
        ))}
      </Stack>

      <Divider sx={{ my: 3, borderStyle: 'dashed' }} />

      <Box sx={{
        gap: 3,
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        alignItems: { xs: 'flex-end', md: 'center' }
      }}>
        <Button
          size="small"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={() => append(defaultItem)}
          sx={{ flexShrink: 0 }}
        >
          Добавить товар
        </Button>

        <Box sx={{
          gap: 2,
          width: 1,
          display: 'flex',
          justifyContent: 'flex-end',
          flexDirection: { xs: 'column', md: 'row' }
        }}>
          <Field.Text
            size="small"
            label="Доставка"
            name="shipping"
            type="number"
            sx={{ maxWidth: { md: 120 } }}
          />

          <Field.Text
            size="small"
            label="Скидка"
            name="discount"
            type="number"
            sx={{ maxWidth: { md: 120 } }}
          />

          <Field.Text
            size="small"
            label="Налог"
            name="tax"
            type="number"
            sx={{ maxWidth: { md: 120 } }}
          />
        </Box>
      </Box>

      <Box sx={{ mt: 3 }}>
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between">
            <Typography>Подытог:</Typography>
            <Typography>{subtotal} ₸</Typography>
          </Stack>
          
          {shipping > 0 && (
            <Stack direction="row" justifyContent="space-between">
              <Typography>Доставка:</Typography>
              <Typography>+{shipping} ₸</Typography>
            </Stack>
          )}
          
          {tax > 0 && (
            <Stack direction="row" justifyContent="space-between">
              <Typography>Налог:</Typography>
              <Typography>+{tax} ₸</Typography>
            </Stack>
          )}
          
          {discount > 0 && (
            <Stack direction="row" justifyContent="space-between">
              <Typography>Скидка:</Typography>
              <Typography color="error">-{discount} ₸</Typography>
            </Stack>
          )}
          
          <Divider sx={{ borderStyle: 'dashed' }} />
          
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="h6">Итого:</Typography>
            <Typography variant="h6">{total} ₸</Typography>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
}

function InvoiceItem({ fieldNames, onRemoveItem }) {
  const { watch, setValue } = useFormContext();

  const quantity = watch(fieldNames.quantity) || 0;
  const unitPrice = watch(fieldNames.unit_price) || 0;

  useEffect(() => {
    const total = Number((quantity * unitPrice).toFixed(2));
    setValue(fieldNames.total_price, total);
  }, [quantity, unitPrice, fieldNames.total_price, setValue]);

  return (
    <Box sx={{
      gap: 1.5,
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Box sx={{
        gap: 2,
        width: 1,
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' }
      }}>
        <Field.Text
          size="small"
          name={fieldNames.title}
          label="Название"
          required
        />

        <Field.Text
          multiline
          maxRows={3}
          size="small"
          name={fieldNames.description}
          label="Описание"
        />

        <Field.Text
          size="small"
          name={fieldNames.service}
          label="Услуга"
          required
        />

        <Field.Text
          size="small"
          type="number"
          name={fieldNames.quantity}
          label="Количество"
          required
          InputProps={{
            inputProps: { min: 1 }
          }}
          sx={{ maxWidth: { md: 96 } }}
        />

        <Field.Text
          size="small"
          type="number"
          name={fieldNames.unit_price}
          label="Цена за ед."
          required
          InputProps={{
            startAdornment: <InputAdornment position="start">₸</InputAdornment>,
            inputProps: { min: 0 }
          }}
          sx={{ maxWidth: { md: 120 } }}
        />

        <Field.Text
          disabled
          size="small"
          name={fieldNames.total_price}
          label="Итого"
          InputProps={{
            startAdornment: <InputAdornment position="start">₸</InputAdornment>
          }}
          sx={{
            maxWidth: { md: 120 },
            [`& .${inputBaseClasses.input}`]: {
              textAlign: 'right'
            }
          }}
        />
      </Box>

      <Button
        size="small"
        color="error"
        startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
        onClick={onRemoveItem}
      >
        Удалить
      </Button>
    </Box>
  );
}