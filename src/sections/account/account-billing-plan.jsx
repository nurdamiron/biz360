// src/sections/account/account-billing-plan.jsx

import { useState, useCallback } from 'react';
import { useBoolean } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid2';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';

import { PlanFreeIcon, PlanStarterIcon, PlanPremiumIcon } from 'src/assets/icons';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

import { AddressListDialog } from '../address';
import { PaymentCardListDialog } from '../payment/payment-card-list-dialog';
import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

export function AccountBillingPlan({ cardList, addressBook, plans }) {
  const openAddress = useBoolean();
  const openCards = useBoolean();
  const { employee } = useAuthContext();

  const primaryCard = cardList.find((card) => card.primary) || null;
  const primaryAddress = addressBook.find((address) => address.primary) || null;

  const [selectedPlan, setSelectedPlan] = useState('');
  const [selectedCard, setSelectedCard] = useState(primaryCard);
  const [selectedAddress, setSelectedAddress] = useState(primaryAddress);

  const handleSelectPlan = useCallback(
    (newValue) => {
      const currentPlan = plans.find((plan) => plan.primary);
      if (currentPlan?.subscription !== newValue) {
        setSelectedPlan(newValue);
      }
    },
    [plans]
  );

  const handleSelectAddress = useCallback((newValue) => {
    setSelectedAddress(newValue);
  }, []);

  const handleSelectCard = useCallback((newValue) => {
    setSelectedCard(newValue);
  }, []);

  const renderPlans = () =>
    plans.map((plan) => (
      <Grid key={plan.subscription} size={{ xs: 12, md: 4 }}>
        <Paper
          variant="outlined"
          onClick={() => handleSelectPlan(plan.subscription)}
          sx={[
            (theme) => ({
              p: 2.5,
              borderRadius: 1.5,
              cursor: 'pointer',
              position: 'relative',
              ...(plan.primary && { opacity: 0.48, cursor: 'default' }),
              ...(plan.subscription === selectedPlan && {
                boxShadow: `0 0 0 2px ${theme.vars.palette.text.primary}`,
              }),
            }),
          ]}
        >
          {plan.primary && (
            <Label
              color="info"
              startIcon={<Iconify icon="eva:star-fill" />}
              sx={{ position: 'absolute', top: 8, right: 8 }}
            >
              Текущий
            </Label>
          )}

          {plan.subscription === 'basic' && <PlanFreeIcon />}
          {plan.subscription === 'starter' && <PlanStarterIcon />}
          {plan.subscription === 'premium' && <PlanPremiumIcon />}

          <Box
            sx={{
              typography: 'subtitle2',
              mt: 2,
              mb: 0.5,
              textTransform: 'capitalize',
            }}
          >
            {plan.subscription === 'basic' && 'Базовый'}
            {plan.subscription === 'starter' && 'Стартовый'}
            {plan.subscription === 'premium' && 'Премиум'}
          </Box>

          <Box sx={{ display: 'flex', typography: 'h4', alignItems: 'center' }}>
            {plan.price ? `${plan.price} ₸` : 'Бесплатно'}

            {!!plan.price && (
              <Box component="span" sx={{ typography: 'body2', color: 'text.disabled', ml: 0.5 }}>
                /мес
              </Box>
            )}
          </Box>
        </Paper>
      </Grid>
    ));

  return (
    <>
      <Card>
        <CardHeader title="Тарифный план" />

        <Grid container spacing={2} sx={{ p: 3 }}>
          {renderPlans()}
        </Grid>

        <Stack spacing={2} sx={{ p: 3, pt: 0, typography: 'body2' }}>
          <Grid container spacing={{ xs: 0.5, md: 2 }}>
            <Grid sx={{ color: 'text.secondary' }} size={{ xs: 12, md: 4 }}>
              План
            </Grid>

            <Grid
              sx={{ typography: 'subtitle2', textTransform: 'capitalize' }}
              size={{ xs: 12, md: 8 }}
            >
              {selectedPlan === 'basic' && 'Базовый'}
              {selectedPlan === 'starter' && 'Стартовый'}
              {selectedPlan === 'premium' && 'Премиум'}
              {!selectedPlan && '-'}
            </Grid>
          </Grid>

          <Grid container spacing={{ xs: 0.5, md: 2 }}>
            <Grid sx={{ color: 'text.secondary' }} size={{ xs: 12, md: 4 }}>
              Плательщик
            </Grid>

            <Grid size={{ xs: 12, md: 8 }}>
              <Button
                onClick={openAddress.onTrue}
                endIcon={<Iconify width={16} icon="eva:arrow-ios-downward-fill" />}
                sx={{ typography: 'subtitle2', p: 0, borderRadius: 0 }}
              >
                {selectedAddress?.name || employee?.name || 'Не указан'}
              </Button>
            </Grid>
          </Grid>

          <Grid container spacing={{ xs: 0.5, md: 2 }}>
            <Grid sx={{ color: 'text.secondary' }} size={{ xs: 12, md: 4 }}>
              Адрес плательщика
            </Grid>

            <Grid sx={{ color: 'text.secondary' }} size={{ xs: 12, md: 8 }}>
              {selectedAddress?.fullAddress || employee?.address || 'Не указан'}
            </Grid>
          </Grid>

          <Grid container spacing={{ xs: 0.5, md: 2 }}>
            <Grid sx={{ color: 'text.secondary' }} size={{ xs: 12, md: 4 }}>
              Телефон плательщика
            </Grid>

            <Grid sx={{ color: 'text.secondary' }} size={{ xs: 12, md: 8 }}>
              {selectedAddress?.phoneNumber || employee?.phoneNumber || 'Не указан'}
            </Grid>
          </Grid>

          <Grid container spacing={{ xs: 0.5, md: 2 }}>
            <Grid sx={{ color: 'text.secondary' }} size={{ xs: 12, md: 4 }}>
              Способ оплаты
            </Grid>

            <Grid size={{ xs: 12, md: 8 }}>
              <Button
                onClick={openCards.onTrue}
                endIcon={<Iconify width={16} icon="eva:arrow-ios-downward-fill" />}
                sx={{ typography: 'subtitle2', p: 0, borderRadius: 0 }}
              >
                {selectedCard?.cardNumber || 'Не указан'}
              </Button>
            </Grid>
          </Grid>
        </Stack>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Box
          sx={{
            p: 3,
            gap: 1.5,
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <Button variant="outlined">Отменить план</Button>
          <Button variant="contained">Обновить план</Button>
        </Box>
      </Card>

      <PaymentCardListDialog
        list={cardList}
        open={openCards.value}
        onClose={openCards.onFalse}
        selected={(selectedId) => selectedCard?.id === selectedId}
        onSelect={handleSelectCard}
      />

      <AddressListDialog
        list={addressBook}
        open={openAddress.value}
        onClose={openAddress.onFalse}
        selected={(selectedId) => selectedAddress?.id === selectedId}
        onSelect={handleSelectAddress}
        action={
          <Button
            size="small"
            startIcon={<Iconify icon="mingcute:add-line" />}
            sx={{ alignSelf: 'flex-end' }}
          >
            Новый
          </Button>
        }
      />
    </>
  );
}