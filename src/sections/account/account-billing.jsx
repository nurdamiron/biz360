// src/sections/account/account-billing.jsx
import Grid from '@mui/material/Grid2';
import { useAuthContext } from 'src/auth/hooks';

import { AccountBillingPlan } from './account-billing-plan';
import { AccountBillingPayment } from './account-billing-payment';
import { AccountBillingHistory } from './account-billing-history';
import { AccountBillingAddress } from './account-billing-address';

// ----------------------------------------------------------------------

export function AccountBilling({ cards, plans, invoices, addressBook }) {
  const { employee } = useAuthContext();

  // Используем данные из authContext, если они есть
  const userData = {
    cards: employee?.paymentCards || cards || [],
    plans: employee?.plans || plans || [],
    invoices: employee?.invoices || invoices || [],
    addressBook: employee?.addresses || addressBook || [],
  };

  return (
    <Grid container spacing={5}>
      <Grid size={{ xs: 12, md: 8 }}>
        <AccountBillingPlan 
          plans={userData.plans} 
          cardList={userData.cards} 
          addressBook={userData.addressBook} 
        />
        <AccountBillingPayment cards={userData.cards} />
        <AccountBillingAddress addressBook={userData.addressBook} />
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <AccountBillingHistory invoices={userData.invoices} />
      </Grid>
    </Grid>
  );
}