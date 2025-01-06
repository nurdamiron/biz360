import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

// ----------------------------------------------------------------------

export function PaymentBillingAddress() {
  return (
    <div>
      <Typography variant="h6">Платежный адрес</Typography>

      <Stack spacing={3} mt={5}>
        <TextField fullWidth label="ФИО" />
        <TextField fullWidth label="Номер телефона" />
        <TextField fullWidth label="Эл. почта" />
        <TextField fullWidth label="Адрес" />
      </Stack>
    </div>
  );
}
