// src/sections/overview/app/view/overview-app-view.jsx

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';
import { useTheme } from '@mui/material/styles';
import axiosInstance from 'src/lib/axios';
import { useNavigate } from 'react-router-dom';
import { Iconify } from 'src/components/iconify';

import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import { DashboardContent } from 'src/layouts/dashboard';
import { CONFIG } from 'src/global-config';

import { useMockedEmployee } from 'src/auth/hooks';

import { AppNewInvoice } from '../app-new-invoice';
import { AppAreaInstalled } from '../app-area-installed';
import { AppWidgetSummary } from '../app-widget-summary';
import { AppCurrentDownload } from '../app-current-download';
import { useState, useEffect } from 'react';
import { FileWidget } from '../../../file-manager/file-widget';
import { FileStorageOverview } from '../../../file-manager/file-storage-overview';

// import { ManufactureDashboard } from '../../../../sections/overview/course/view';
// ----------------------------------------------------------------------

export function OverviewAppView() {
  const { employee } = useMockedEmployee();
  const theme = useTheme();
  const [departmentsMetrics, setDepartmentsMetrics] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Состояние для хранения данных заказов
  const [invoices, setInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllDepts = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get('/api/departments/metrics/all');
        // res.data.data => { sales: {...}, logistics: {...}, accounting: {...}, manufacture: {...} }
        setDepartmentsMetrics(res.data.data);
      } catch (err) {
        console.error(err);
        setError('Ошибка при загрузке метрик');
      } finally {
        setLoading(false);
      }
    };
    fetchAllDepts();
  }, []);

  if (error) {
    return (
      <DashboardContent>
        <div>{error}</div>
      </DashboardContent>
    );
  }
  if (loading) {
    return (
      <DashboardContent>
        <div>Загрузка...</div>
      </DashboardContent>
    );
  }

  const renderStorageOverview = () => (
    <FileStorageOverview
  sx={{ maxWidth: 400 }}
  chart={{
    series: 0, // 76% общая эффективность
  }}
  data={[
    {
      name: 'Продажи',
      icon: <Iconify icon="eva:shopping-cart-fill" />,
      value: 24, // 24% вклада
      subtitle: 'Средний чек: 0', // Доп. инфо
    },
    {
      name: 'Продукт',
      icon: <Iconify icon="eva:briefcase-fill" />,
      value: 32,
      subtitle: 'Качество: 0%',
    },
    {
      name: 'Учёт',
      icon: <Iconify icon="eva:file-text-fill" />,
      value: 20,
      subtitle: 'Ошибок: 0%',
    },
  ]}
/>

  );

  return (
    <DashboardContent maxWidth="xl">
      
      <Grid container spacing={3}>
      <Grid sx={{ display: { xs: '12', sm: '6' } }} size={18} >
            {renderStorageOverview()}
          </Grid>


        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <FileWidget
              icon={`${CONFIG.assetsDir}/assets/icons/navbar/ic-analytics.svg`}
              title="Продажи"
              manager="Жанат Кульбаева"
              managerIcon="eva:person-fill"
              value={93}
              total={100}
              showAsPercent
              onClick={() => navigate('/dashboard/ecommerce')} // <-- пример
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <FileWidget
              icon={`${CONFIG.assetsDir}/assets/icons/navbar/ic-product.svg`}
              title="Продукт"
              manager="Амантаева Ляззат"
              managerIcon="eva:person-fill"
              value={92}
              total={100}
              showAsPercent
              onClick={() => navigate('/dashboard/ecommerce')} // <-- пример

            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <FileWidget
              icon={`${CONFIG.assetsDir}/assets/icons/navbar/ic-invoice.svg`}
              title="Учет"
              manager="Әлемгер"
              managerIcon="eva:person-fill"
              value={90}
              total={100}
              showAsPercent
              onClick={() => navigate('/dashboard/banking')} // <-- пример
            />
          </Grid>                                                                                 
        </Grid>
        {/* 1) Общая выручка */}
        <Grid size={{ xs: 12, md: 4 }}>
          <AppWidgetSummary
            title="Общая выручка" // Было: "Total active employees"
            percent={0}
            total={0}
            isCurrency
            // 4.2 млн, например
            chart={{
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
              series: [3.5, 3.5, 3.5, 3.5, 3.5, 3.5, 3.5, 3.5],
            }}
          />
        </Grid>

        {/* 2) Количество заказов */}
        <Grid size={{ xs: 12, md: 4 }}>
          <AppWidgetSummary
            title="Количество заказов" // Было: "Total installed"
            percent={0}
            total={0} // Пример: 876 заказов
            chart={{
              colors: [theme.palette.info.main],
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
              series: [700, 700, 700, 700, 700, 700, 700, 700],
            }}
          />
        </Grid>

        {/* 3) Чистая прибыль */}
        <Grid size={{ xs: 12, md: 4 }}>
          <AppWidgetSummary
            title="Чистая прибыль"
            percent={0}
            total={0} // числовое значение, например 678000
            isCurrency // <--- добавляем этот проп
            chart={{
              colors: [theme.palette.error.main],
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
              series: [600, 600, 600, 600, 600, 600, 600, 600],
            }}
          />
        </Grid>

        <Grid item xs={12} md={6} lg={4}>
  <AppCurrentDownload
    title="Распределение по категориям"
    subheader="Процентное соотношение"
    chart={{
      series: [
        { label: 'Комбинезоны', value: 40 },
        { label: 'Одноразовые костюмы', value: 25 },
        { label: 'Спецодежда', value: 20 },
        { label: 'Перчатки', value: 15 },
      ],
    }}
  />
</Grid>


        {/* <Grid size={{ xs: 12, md: 6, lg: 8 }}>
          <AppAreaInstalled
            title="Динамика продаж" // заголовок на русском
            subheader="Сравнение с прошлым годом" // подзаголовок
            chart={{
              // Месяцы на русском
              categories: [
                'Янв',
                'Фев',
                'Мар',
                'Апр',
                'Май',
                'Июн',
                'Июль',
                'Авг',
                'Сен',
                'Окт',
                'Ноя',
                'Дек',
              ],
              // Данные представлены в виде двух серий: 2022 и 2023 год
              series: [
                {
                  name: '2024',
                  data: [
                    {
                      name: 'Выручка (млн ₸)',
                      data: [3.1, 3.2, 3.4, 3.6, 3.8, 4.0, 4.1, 4.2, 4.0, 4.3, 4.5, 4.6],
                    },
                    {
                      name: 'Заказы',
                      data: [120, 125, 130, 135, 140, 145, 150, 155, 150, 160, 165, 170],
                    },
                    {
                      name: 'Прибыль (тыс ₸)',
                      data: [0.8, 0.85, 0.9, 0.95, 1.0, 1.05, 1.1, 1.15, 1.1, 1.2, 1.25, 1.3],
                    },
                  ],
                },
                {
                  name: '2025',
                  data: [
                    {
                      name: 'Выручка (млн ₸)',
                      data: [3.2, 3.3, 3.5, 3.7, 3.9, 4.1, 4.2, 4.3, 4.2, 4.4, 4.5, 4.7],
                    },
                    {
                      name: 'Заказы',
                      data: [125, 130, 135, 140, 145, 150, 155, 160, 155, 165, 170, 175],
                    },
                    {
                      name: 'Прибыль (тыс ₸)',
                      data: [0.85, 0.9, 0.95, 1.0, 1.05, 1.1, 1.15, 1.2, 1.15, 1.25, 1.3, 1.35],
                    },
                  ],
                },
              ],
            }}
          />
        </Grid> */}

        {/* 
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <AppTopRelated title="Related applications" list={_appRelated} />
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <AppTopInstalledCountries title="Top installed countries" list={_appInstalled} />
        </Grid> */}

        {/* <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <AppTopAuthors title="Top authors" list={_appAuthors} />
        </Grid> */}

        {/* <Grid size={{ xs: 12, md: 6, lg: 4 }}>
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
        </Grid> */}
      </Grid>

      

      <Box sx={{ mt: 3 }}>
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
              { id: '', label: 'Действия' },
            ]}
          />
        </Grid>
      </Box>
    </DashboardContent>
  );
}

function DepartmentCard({ departmentCode, metrics }) {
  // Для перевода кода отдела в человеко-понятное название
  const departmentName =
    departmentCode === 'sales'
      ? 'Отдел продаж'
      : departmentCode === 'logistics'
        ? 'Отдел логистики'
        : departmentCode === 'accounting'
          ? 'Бухгалтерия'
          : departmentCode === 'manufacture'
            ? 'Производство'
            : departmentCode;

  // В metrics.averages, metrics.trends и т. д. хранится информация
  return (
    <Card>
      <CardHeader title={departmentName} />
      <CardContent>
        {/* Выводим нужные поля */}
        <div>Производительность: {metrics.averages?.overall_performance ?? 0}%</div>
        <div>KPI: {metrics.averages?.kpi ?? 0}%</div>
        <div>Тренд производительности: {metrics.trends?.performance_trend}</div>
        {/* ... и т. д. */}
      </CardContent>
    </Card>
  );
}
