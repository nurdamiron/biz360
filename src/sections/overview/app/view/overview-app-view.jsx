import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';
import Button from '@mui/material/Button';
import { useTheme } from '@mui/material/styles';


import { DashboardContent } from 'src/layouts/dashboard';
import { SeoIllustration } from 'src/assets/illustrations';
import { _appAuthors, _appRelated, _appFeatured, _appInvoices, _appInstalled } from 'src/_mock';

import { svgColorClasses } from 'src/components/svg-color';

import { useMockedEmployee } from 'src/auth/hooks';

import { AppWidget } from '../app-widget';
import { AppWelcome } from '../app-welcome';
import { AppFeatured } from '../app-featured';
import { AppNewInvoice } from '../app-new-invoice';
import { AppTopAuthors } from '../app-top-authors';
import { AppTopRelated } from '../app-top-related';
import { AppAreaInstalled } from '../app-area-installed';
import { AppWidgetSummary } from '../app-widget-summary';
import { AppCurrentDownload } from '../app-current-download';
import { AppTopInstalledCountries } from '../app-top-installed-countries';
import { useState, useEffect } from 'react';

import { SalesDashboard } from '../../../../sections/overview/e-commerce/view';
import { LogisticsDashboard } from '../../../../sections/overview/course/view';
import { AccountingDashboard } from '../../../../sections/overview/banking/view'; 
// import { ManufactureDashboard } from '../../../../sections/overview/course/view';
// ----------------------------------------------------------------------

export function OverviewAppView() {
  const { employee } = useMockedEmployee();
  const theme = useTheme();

  // Состояние для хранения данных заказов
  const [invoices, setInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Получение заказов с бэкенда
  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/orders'); // Используем ваш API endpoint
        const data = await response.json();
        
        // Форматируем данные для отображения
        const formattedInvoices = data.map(order => ({
          id: order.order_number,
          category: order.status,
          price: order.total,
          status: order.status === 'pending' ? 'В обработке' : 
                 order.status === 'completed' ? 'Завершен' : 
                 order.status === 'cancelled' ? 'Отменен' : 'В работе',
          customer: {
            name: order.customer_name,
            email: order.customer_email
          }
        }));

        setInvoices(formattedInvoices);
      } catch (err) {
        console.error('Error fetching invoices:', err);
        setError('Ошибка при загрузке заказов');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvoices();
  }, []); // Пустой массив зависимостей для однократной загрузки

  return (
    <DashboardContent maxWidth="xl">
      <Grid container spacing={3}>
        {/* <Grid size={{ xs: 12, md: 8 }}>
          <AppWelcome
            title={`Добро пожаловать в BIZ360👋 \n ${employee?.displayName}`}
            description=""
            img={<SeoIllustration hideBackground />}
            action={
              <Button variant="contained" color="primary">
                Go now
              </Button>
            }
          />
        </Grid> */}

        {/* <Grid size={{ xs: 12, md: 4 }}>
          <AppFeatured list={_appFeatured} />
        </Grid> */}

        <Grid size={{ xs: 12, md: 4 }}>
          <AppWidgetSummary
            title="Total active employees"
            percent={2.6}
            total={18765}
            chart={{
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
              series: [15, 18, 12, 51, 68, 11, 39, 37],
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <AppWidgetSummary
            title="Total installed"
            percent={0.2}
            total={4876}
            chart={{
              colors: [theme.palette.info.main],
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
              series: [20, 41, 63, 33, 28, 35, 50, 46],
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <AppWidgetSummary
            title="Total downloads"
            percent={-0.1}
            total={678}
            chart={{
              colors: [theme.palette.error.main],
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
              series: [18, 19, 31, 8, 16, 37, 12, 33],
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <AppCurrentDownload
            title="Current download"
            subheader="Downloaded by operating system"
            chart={{
              series: [
                { label: 'Mac', value: 12244 },
                { label: 'Window', value: 53345 },
                { label: 'iOS', value: 44313 },
                { label: 'Android', value: 78343 },
              ],
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 8 }}>
          <AppAreaInstalled
            title="Area installed"
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
                    { name: 'Asia', data: [12, 10, 18, 22, 20, 12, 8, 21, 20, 14, 15, 16] },
                    { name: 'Europe', data: [12, 10, 18, 22, 20, 12, 8, 21, 20, 14, 15, 16] },
                    { name: 'Americas', data: [12, 10, 18, 22, 20, 12, 8, 21, 20, 14, 15, 16] },
                  ],
                },
                {
                  name: '2023',
                  data: [
                    { name: 'Asia', data: [6, 18, 14, 9, 20, 6, 22, 19, 8, 22, 8, 17] },
                    { name: 'Europe', data: [6, 18, 14, 9, 20, 6, 22, 19, 8, 22, 8, 17] },
                    { name: 'Americas', data: [6, 18, 14, 9, 20, 6, 22, 19, 8, 22, 8, 17] },
                  ],
                },
                {
                  name: '2024',
                  data: [
                    { name: 'Asia', data: [6, 20, 15, 18, 7, 24, 6, 10, 12, 17, 18, 10] },
                    { name: 'Europe', data: [6, 20, 15, 18, 7, 24, 6, 10, 12, 17, 18, 10] },
                    { name: 'Americas', data: [6, 20, 15, 18, 7, 24, 6, 10, 12, 17, 18, 10] },
                  ],
                },
              ],
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, lg: 8 }}>
        <AppNewInvoice
            title="Новые заказы"
            tableData={invoices}
            isLoading={isLoading}
            error={error}
            headCells={[
              { id: 'id', label: 'Номер заказа' },
              { id: 'category', label: 'Категория' },
              { id: 'price', label: 'Сумма' },
              { id: 'status', label: 'Статус' },
              { id: '', label: 'Действия' }
            ]}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <AppTopRelated title="Related applications" list={_appRelated} />
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <AppTopInstalledCountries title="Top installed countries" list={_appInstalled} />
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <AppTopAuthors title="Top authors" list={_appAuthors} />
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <Box sx={{ gap: 3, display: 'flex', flexDirection: 'column' }}>
            <AppWidget
              title="Conversion"
              total={38566}
              icon="solar:employee-rounded-bold"
              chart={{ series: 48 }}
            />

            <AppWidget
              title="Applications"
              total={55566}
              icon="fluent:mail-24-filled"
              chart={{
                series: 75,
                colors: [theme.vars.palette.info.light, theme.vars.palette.info.main],
              }}
              sx={{ bgcolor: 'info.dark', [`& .${svgColorClasses.root}`]: { color: 'info.light' } }}
            />
          </Box>
        </Grid>
      </Grid>
    </DashboardContent>
  );
}
