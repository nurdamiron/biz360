import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';

import { CONFIG } from 'src/global-config';
import { DashboardContent } from 'src/layouts/dashboard';
import { _bankingContacts, _bankingCreditCard, _bankingRecentTransitions } from 'src/_mock';

import { Iconify } from 'src/components/iconify/iconify';

import { BankingContacts } from '../banking-contacts';
import { BankingOverview } from '../banking-overview';
import { BankingQuickTransfer } from '../banking-quick-transfer';
import { BankingInviteFriends } from '../banking-invite-friends';
import { BankingCurrentBalance } from '../banking-current-balance';
import { BankingBalanceStatistics } from '../banking-balance-statistics';
import { BankingRecentTransitions } from '../banking-recent-transitions';
import { BankingExpensesCategories } from '../banking-expenses-categories';
import { useAuthContext } from 'src/auth/hooks';
import { useTheme } from '@mui/material/styles';

// ----------------------------------------------------------------------

export function AccountingDashboard() {
  const theme = useTheme();
  const { user } = useAuthContext();

   // Примеры «нулевых» значений
   const ZERO_SERIES = [0, 0, 0, 0, 0, 0, 0];
   const ZERO_ARRAY_12 = Array(12).fill(0);

  return (
    <DashboardContent maxWidth="xl">
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 7, lg: 8 }}>
          <Box sx={{ gap: 3, display: 'flex', flexDirection: 'column' }}>
            <BankingOverview />

            <BankingBalanceStatistics
              title="Статистика баланса"
              subheader="Статистика баланса по времени"
              chart={{
                series: [
                  {
                    name: 'Неделя',
                    categories: ['Неделя 1', 'Неделя 2', 'Неделя 3', 'Неделя 4', 'Неделя 5'],
                    data: [
                      { name: 'Выручка', data: ZERO_SERIES },
                      { name: 'Сбережения', data: ZERO_SERIES },
                      { name: 'Инвестиции', data: ZERO_SERIES },
                    ],
                  },
                  {
                    name: 'Месяц',
                    categories: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен'],
                    data: [
                      { name: 'Выручка', data: ZERO_SERIES },
                      { name: 'Сбережения', data: ZERO_SERIES },
                      { name: 'Инвестиции', data: ZERO_SERIES },
                    ],
                  },
                  {
                    name: 'Год',
                    categories: ['2020', '2021', '2022', '2023', '2024', '2025'],
                    data: [
                      { name: 'Выручка', data: ZERO_SERIES },
                      { name: 'Сбережения', data: ZERO_SERIES },
                      { name: 'Инвестиции', data: ZERO_SERIES },
                    ],
                  },
                ],
              }}
            />

            {/* <BankingExpensesCategories
              title="Категории расходов"
              chart={{
                series: [
                  { label: 'Развлечения',  value: 22 },
                  { label: 'Топливо', value: 18 },
                  { label: 'Быстрые продукты', value: 16 },
                  { label: 'Кафе', value: 17 },
                  { label: 'Сonnection', value: 14 },
                  { label: 'Healthcare', value: 22 },
                  { label: 'Fitness', value: 10 },
                  { label: 'Supermarket', value: 21 },
                ],
                icons: [
                  <Iconify icon="streamline:dices-entertainment-gaming-dices-solid" />,
                  <Iconify icon="maki:fuel" />,
                  <Iconify icon="ion:fast-food" />,
                  <Iconify icon="maki:cafe" />,
                  <Iconify icon="basil:mobile-phone-outline" />,
                  <Iconify icon="solar:medical-kit-bold" />,
                  <Iconify icon="ic:round-fitness-center" />,
                  <Iconify icon="solar:cart-3-bold" />,
                ],
              }}
            />

            <BankingRecentTransitions
              title="Recent transitions"
              tableData={_bankingRecentTransitions}
              headCells={[
                { id: 'description', label: 'Description' },
                { id: 'date', label: 'Date' },
                { id: 'amount', label: 'Amount' },
                { id: 'status', label: 'Status' },
                { id: '' },
              ]}
            /> */}
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 5, lg: 4 }}>
          <Box sx={{ gap: 3, display: 'flex', flexDirection: 'column' }}>
            <BankingCurrentBalance list={_bankingCreditCard} />

            <BankingQuickTransfer title="Быстрый перевод" list={_bankingContacts} />

            <BankingContacts
              title="Contacts"
              subheader="You have 122 contacts"
              list={_bankingContacts.slice(-5)}
            />
          </Box>
        </Grid>
      </Grid>
    </DashboardContent>
  );
}
