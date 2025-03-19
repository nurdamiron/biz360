// src/sections/account/account-billing-payment.jsx

import { useBoolean } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import CardHeader from '@mui/material/CardHeader';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import { Iconify } from 'src/components/iconify';

import { PaymentCardItem } from '../payment/payment-card-item';
import { PaymentNewCardForm } from '../payment/payment-new-card-form';
import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

export function AccountBillingPayment({ cards, sx, ...other }) {
  const openForm = useBoolean();
  const { employee } = useAuthContext();

  // Выбираем карты пользователя, если они есть, или используем переданные параметры
  const userCards = employee?.paymentCards || cards || [];

  return (
    <>
      <Card sx={[{ my: 3 }, ...(Array.isArray(sx) ? sx : [sx])]} {...other}>
        <CardHeader
          title="Способы оплаты"
          action={
            <Button
              size="small"
              color="primary"
              startIcon={<Iconify icon="mingcute:add-line" />}
              onClick={openForm.onTrue}
            >
              Новая карта
            </Button>
          }
        />

        <Box
          sx={{
            p: 3,
            rowGap: 2.5,
            columnGap: 2,
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)' },
          }}
        >
          {userCards.map((card) => (
            <PaymentCardItem key={card.id} card={card} />
          ))}
        </Box>
      </Card>

      <Dialog fullWidth maxWidth="xs" open={openForm.value} onClose={openForm.onFalse}>
        <DialogTitle>Добавить новую карту</DialogTitle>

        <DialogContent sx={{ overflow: 'unset' }}>
          <PaymentNewCardForm />
        </DialogContent>

        <DialogActions>
          <Button color="inherit" variant="outlined" onClick={openForm.onFalse}>
            Отмена
          </Button>

          <Button color="inherit" variant="contained" onClick={openForm.onFalse}>
            Добавить
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}