import { useFormContext } from 'react-hook-form';

import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';

import { Field } from 'src/components/hook-form';

// ----------------------------------------------------------------------

export function OrderNewEditStatusDate() {
  const { watch, setValue } = useFormContext();
  const values = watch();
  
  const documentTypes = [
    { value: 'invoice', label: 'Счет на оплату' },
    { value: 'nakladnaya', label: 'Накладная' },
    { value: 'schet-faktura', label: 'Счет-фактура' }
  ];

  return (
    
    <Box
      sx={{
        p: 3,
        gap: 2,
        display: 'flex',
        bgcolor: 'background.neutral',
        flexDirection: { xs: 'column', sm: 'row' },
      }}
    >
      {/* Номер документа */}
      <Field.Text
        name="orderNumber"
        label="Номер заказа"
        // value={values.invoiceNumber} // если нужно
      />

      {/* Статус */}
      {/* <Field.Select
        fullWidth
        name="status"
        label="Status"
      >
        {['draft', 'pending', 'paid', 'overdue'].map((option) => (
          <MenuItem key={option} value={option} sx={{ textTransform: 'capitalize' }}>
            {option}
          </MenuItem>
        ))}
      </Field.Select> */}

      {/* Выбор типа документа */}
      <Field.Select
        name="document_type"
        label="Тип документа"
        onChange={(e) => {
          setValue('document_type', e.target.value);
          // Trigger document recreation if needed
        }}
      >
        {documentTypes.map((type) => (
          <MenuItem key={type.value} value={type.value}>
            {type.label}
          </MenuItem>
        ))}
      </Field.Select>

      {/* Дата создания */}
      <Field.DatePicker
        name="createDate"
        label="Дата создания"
        value={watch('createDate')}

      />

      {/* Дата окончания */}
      <Field.DatePicker
        name="due_date"
        label="Дата окончания"
        value={watch('dueDate')}
      />
    </Box>
  );
}
