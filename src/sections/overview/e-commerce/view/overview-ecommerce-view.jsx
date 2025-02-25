// src/sections/overview/e-commerce/view/overview-ecommerce-view.jsx

import Grid from '@mui/material/Grid2';
import Button from '@mui/material/Button';
import { useTheme } from '@mui/material/styles';
import SvgIcon from '@mui/material/SvgIcon';

import { DashboardContent } from 'src/layouts/dashboard';
import { MotivationIllustration } from 'src/assets/illustrations';
import {
  _ecommerceNewProducts,
  _ecommerceBestSalesman,
  _ecommerceSalesOverview,
  _ecommerceLatestProducts,
} from 'src/_mock';

import { useMockedEmployee } from 'src/auth/hooks';
import { useAuthContext } from 'src/auth/hooks';

import { EcommerceWelcome } from '../ecommerce-welcome';
import { EcommerceNewProducts } from '../ecommerce-new-products';
import { EcommerceYearlySales } from '../ecommerce-yearly-sales';
import { EcommerceBestSalesman } from '../ecommerce-best-salesman';
import { EcommerceSaleByGender } from '../ecommerce-sale-by-gender';
import { EcommerceSalesOverview } from '../ecommerce-sales-overview';
import { EcommerceWidgetSummary } from '../ecommerce-widget-summary';
import { EcommerceLatestProducts } from '../ecommerce-latest-products';
import { EcommerceCurrentBalance } from '../ecommerce-current-balance';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function SalesDashboard() {
  const { user } = useAuthContext();
  console.log('SalesDashboard user data:', user);
  const theme = useTheme();

  const getWelcomeDescription = () => {
    if (!user?.employee?.id) {
      return 'Завершите регистрацию сотрудника';
    }
    if (!user?.company?.id) {
      return 'Ожидание привязки к компании';
    }
    return user.employee.department
      ? `${user.employee.role} • ${user.employee.department} • ${user.company.name}`
      : `${user.employee.role} • ${user.company.name}`;
  };

  // Конфигурация навигации аккаунта
  const accountNavigation = [
    {
      label: 'Профиль',
      href: `./employee/${user?.employee?.id || ''}`, // Добавляем ID сотрудника в URL
      icon: (
        <SvgIcon>
          <path
            opacity="0.5"
            d="M2.28099 19.6575C2.36966 20.5161 2.93261 21.1957 3.77688 21.3755C5.1095 21.6592 7.6216 22 12 22C16.3784 22 18.8905 21.6592 20.2232 21.3755C21.0674 21.1957 21.6303 20.5161 21.719 19.6575C21.8505 18.3844 22 16.0469 22 12C22 7.95305 21.8505 5.6156 21.719 4.34251C21.6303 3.48389 21.0674 2.80424 20.2231 2.62451C18.8905 2.34081 16.3784 2 12 2C7.6216 2 5.1095 2.34081 3.77688 2.62451C2.93261 2.80424 2.36966 3.48389 2.28099 4.34251C2.14952 5.6156 2 7.95305 2 12C2 16.0469 2.14952 18.3844 2.28099 19.6575Z"
            fill="currentColor"
          />
          <path
            d="M13.9382 13.8559C15.263 13.1583 16.1663 11.7679 16.1663 10.1666C16.1663 7.8655 14.3008 6 11.9996 6C9.69841 6 7.83291 7.8655 7.83291 10.1666C7.83291 11.768 8.73626 13.1584 10.0612 13.856C8.28691 14.532 6.93216 16.1092 6.51251 18.0529C6.45446 18.3219 6.60246 18.5981 6.87341 18.6471C7.84581 18.8231 9.45616 19 12.0006 19C14.545 19 16.1554 18.8231 17.1278 18.6471C17.3977 18.5983 17.5454 18.3231 17.4876 18.0551C17.0685 16.1103 15.7133 14.5321 13.9382 13.8559Z"
            fill="currentColor"
          />
        </SvgIcon>
      ),
    },
    { 
      label: 'Настройки', 
      href: `./employee/${user?.employee?.id || ''}/account`, 
      icon: <Iconify icon="solar:settings-bold-duotone" /> 
    },
  ];

  return (
    <DashboardContent maxWidth="xl">
      <Grid container spacing={3}>
        {/* <Grid size={{ xs: 12, md: 8 }}>
          <EcommerceWelcome
            title={`Добро пожаловать, ${user?.first_name} ${user?.last_name} 👋`}
            description={getWelcomeDescription()}
            img={<MotivationIllustration hideBackground />}
          />
        </Grid> */}

        <Grid size={{ xs: 12, md: 4 }}>
          <EcommerceWidgetSummary
            title="Продажи"
            percent={2.6}
            total={765}
            chart={{
              series: [22, 8, 35, 50, 82, 84, 77, 12],
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <EcommerceWidgetSummary
            title="Общий баланс"
            percent={-0.1}
            total={user?.company?.total_balance || 0}
            chart={{
              colors: [theme.palette.warning.light, theme.palette.warning.main],
              series: user?.company?.balance_chart || [56, 47, 40, 62, 73, 30, 23, 54],
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <EcommerceWidgetSummary
            title="Прибыль"
            percent={0.6}
            total={user?.company?.total_profit || 0}
            chart={{
              colors: [theme.palette.error.light, theme.palette.error.main],
              series: user?.company?.profit_chart || [40, 70, 75, 70, 50, 28, 7, 64],
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <EcommerceSaleByGender
            title="Sale by gender"
            total={2324}
            chart={{
              series: [
                { label: 'Mens', value: 25 },
                { label: 'Womens', value: 50 },
                { label: 'Kids', value: 75 },
              ],
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 8 }}>
          <EcommerceYearlySales
            title="Yearly sales"
            subheader="(+43%) than last year"
            chart={{
              categories: [
                'Jan',
                'Feb',
                'Mar',
                'Apr',
                'May',
                'Jun',
                'Jul',
                'Aug',
                'Sep',
                'Oct',
                'Nov',
                'Dec',
              ],
              series: [
                {
                  name: '2022',
                  data: [
                    {
                      name: 'Total income',
                      data: [10, 41, 35, 51, 49, 62, 69, 91, 148, 35, 51, 49],
                    },
                    {
                      name: 'Total expenses',
                      data: [10, 34, 13, 56, 77, 88, 99, 77, 45, 13, 56, 77],
                    },
                  ],
                },
                {
                  name: '2023',
                  data: [
                    {
                      name: 'Total income',
                      data: [51, 35, 41, 10, 91, 69, 62, 148, 91, 69, 62, 49],
                    },
                    {
                      name: 'Total expenses',
                      data: [56, 13, 34, 10, 77, 99, 88, 45, 77, 99, 88, 77],
                    },
                  ],
                },
              ],
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 8 }}>
          <EcommerceSalesOverview title="Sales overview" data={_ecommerceSalesOverview} />
        </Grid>

        {user?.employee?.role === 'owner' && (
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <EcommerceBestSalesman
              title="Лучшие продавцы"
              tableData={user?.company?.best_salesmen || _ecommerceBestSalesman}
              headCells={[
                { id: 'name', label: 'Продавец' },
                { id: 'category', label: 'Продукт' },
                { id: 'country', label: 'Регион' },
                { id: 'totalAmount', label: 'Сумма', align: 'right' },
                { id: 'rank', label: 'Ранг', align: 'right' },
              ]}
            />
          </Grid>
        )}

        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <EcommerceCurrentBalance
            title="Текущий баланс"
            earning={user?.company?.current_earning || 25500}
            refunded={user?.company?.refunded || 1600}
            orderTotal={user?.company?.order_total || 287650}
            currentBalance={user?.company?.current_balance || 187650}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 8 }}>
          <EcommerceLatestProducts title="Latest products" list={_ecommerceLatestProducts} />
        </Grid>
      </Grid>
    </DashboardContent>
  );
}
