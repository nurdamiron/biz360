import { useFormContext } from 'react-hook-form';

import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';

import { Field } from 'src/components/hook-form';

// ----------------------------------------------------------------------

export function InvoiceNewEditStatusDate() {
  const { watch } = useFormContext();
  const values = watch();

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
        name="invoiceNumber"
        label="Номер документа"
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
      >
        <MenuItem value="invoice">Счет на оплату</MenuItem>
        <MenuItem value="nakladnaya">Накладная</MenuItem>
        <MenuItem value="sf">Счет-фактура</MenuItem>
      </Field.Select>

      {/* Дата создания */}
      <Field.DatePicker
        name="createDate"
        label="Дата создания"
      />

      {/* Дата окончания */}
      <Field.DatePicker
        name="due_date"
        label="Дата окончания"
      />
    </Box>
  );
}
