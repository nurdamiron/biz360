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
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

// ----------------------------------------------------------------------

// Функция для получения цвета статуса заказа
const getStatusColor = (status) => {
  const statusColors = {
    new: 'primary',
    pending_validation: 'warning',
    pending_payment: 'info',
    paid: 'success',
    in_processing: 'warning',
    shipped: 'info',
    delivered: 'success',
    completed: 'success',
    rejected: 'error',
    cancelled: 'error',
  };
  return statusColors[status] || 'default';
};

// Функция для получения названия статуса заказа на русском
const getStatusLabel = (status) => {
  const statusLabels = {
    new: 'Новый',
    pending_payment: 'Ожидает оплаты',
    paid: 'Оплачен',
    in_processing: 'В обработке',
    shipped: 'Отгружен',
    delivered: 'Доставлен',
    completed: 'Завершен',
    rejected: 'Отклонен',
    cancelled: 'Отменен',
  };
  return statusLabels[status] || status;
};

export function OverviewAppView() {
  const { employee } = useMockedEmployee();
  const theme = useTheme();
  const [departmentsMetrics, setDepartmentsMetrics] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // Состояние для хранения данных заказов
  const [orders, setOrders] = useState([]);
  const [revenueData, setRevenueData] = useState({
    total: 0,
    percent: 0,
    chart: {
      categories: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг'],
      series: [0, 0, 0, 0, 0, 0, 0, 0],
    }
  });
  const [ordersCountData, setOrdersCountData] = useState({
    total: 0,
    percent: 0,
    chart: {
      colors: [theme.palette.info.main],
      categories: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг'],
      series: [0, 0, 0, 0, 0, 0, 0, 0],
    }
  });
  const [profitData, setProfitData] = useState({
    total: 0,
    percent: 0,
    chart: {
      colors: [theme.palette.error.main],
      categories: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг'],
      series: [0, 0, 0, 0, 0, 0, 0, 0],
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Запрос метрик департаментов
        const metricsRes = await axiosInstance.get('/api/departments/metrics/all');
        setDepartmentsMetrics(metricsRes.data.data || {});
        
        // Запрос заказов с фильтрацией только новых и активных
        const ordersRes = await axiosInstance.get('/api/orders');
        
        if (ordersRes.data) {
          // Фильтруем только новые и активные заказы (не завершенные и не отмененные)
          const activeOrders = ordersRes.data.filter(order => 
            !['completed', 'cancelled', 'rejected'].includes(order.status)
          );
          
          // Сортируем по дате создания (от новых к старым)
          activeOrders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          
          // Берем только 10 последних активных заказов
          const latestOrders = activeOrders.slice(0, 10);
          
          // Форматируем данные для отображения
          const formattedOrders = latestOrders.map(order => ({
            id: order.order_number || `№${order.id}`,
            orderId: order.id,
            category: 'Спецодежда', // Это можно заменить на реальные данные, если они есть
            price: order.total,
            status: order.status,
            statusLabel: getStatusLabel(order.status),
            statusColor: getStatusColor(order.status),
            customer: order.customer_name || 'Неизвестный клиент',
            date: new Date(order.created_at).toLocaleDateString('ru-RU'),
          }));
          
          setOrders(formattedOrders);
          
          // Рассчитываем общую выручку
          const totalRevenue = ordersRes.data.reduce((sum, order) => 
            sum + (parseFloat(order.total) || 0), 0);
          
          // Количество заказов
          const ordersCount = ordersRes.data.length;
          
          // Чистая прибыль (предположим 30% от выручки)
          const profit = totalRevenue * 0.3;
          
          setRevenueData({
            total: totalRevenue,
            percent: 12, // Рост на 12% (примерное значение)
            chart: {
              categories: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг'],
              series: [totalRevenue * 0.8, totalRevenue * 0.85, totalRevenue * 0.9, 
                totalRevenue * 0.95, totalRevenue, totalRevenue * 1.05, 
                totalRevenue * 1.1, totalRevenue * 1.15]
            }
          });
          
          setOrdersCountData({
            total: ordersCount,
            percent: 8, // Рост на 8% (примерное значение)
            chart: {
              colors: [theme.palette.info.main],
              categories: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг'],
              series: [Math.round(ordersCount * 0.8), Math.round(ordersCount * 0.85), 
                Math.round(ordersCount * 0.9), Math.round(ordersCount * 0.95), 
                ordersCount, Math.round(ordersCount * 1.05), 
                Math.round(ordersCount * 1.1), Math.round(ordersCount * 1.15)]
            }
          });
          
          setProfitData({
            total: profit,
            percent: 15, // Рост на 15% (примерное значение)
            chart: {
              colors: [theme.palette.error.main],
              categories: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг'],
              series: [profit * 0.8, profit * 0.85, profit * 0.9, profit * 0.95, 
                profit, profit * 1.05, profit * 1.1, profit * 1.15]
            }
          });
        }
      } catch (err) {
        console.error('Ошибка при загрузке данных:', err);
        setError('Ошибка при загрузке данных. Пожалуйста, попробуйте позже.');
      } finally {
        setIsLoading(false);
        setLoading(false);
      }
    };
    
    fetchData();
  }, [theme.palette.info.main, theme.palette.error.main]);
  
  if (error) {
    return (
      <DashboardContent>
        <Alert severity="error">{error}</Alert>
      </DashboardContent>
    );
  }
  
  if (loading) {
    return (
      <DashboardContent>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
          <Typography variant="h6" sx={{ ml: 2 }}>Загрузка данных...</Typography>
        </Box>
      </DashboardContent>
    );
  }
  
  const renderStorageOverview = () => (
    <FileStorageOverview
      sx={{ maxWidth: 400 }}
      chart={{
        series: 76, // 76% общая эффективность
      }}
      data={[
        {
          name: 'Продукт',
          icon: <Iconify icon="eva:briefcase-fill" />,
          value: 32,
          subtitle: 'Качество: 92%',
        },
        {
          name: 'Продажи',
          icon: <Iconify icon="eva:shopping-cart-fill" />,
          value: 24, // 24% вклада
          subtitle: 'Средний чек: 8,500₸', // Доп. инфо
        },
        {
          name: 'Учёт',
          icon: <Iconify icon="eva:file-text-fill" />,
          value: 20,
          subtitle: 'Ошибок: 0.5%',
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
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <FileWidget
            icon={`${CONFIG.assetsDir}/assets/icons/navbar/ic-product.svg`}
            title="Продукт"
            manager="Амантаева Ляззат"
            managerIcon="eva:person-fill"
            value={92}
            total={100}
            showAsPercent
            onClick={() => navigate('/dashboard/ecommerce')}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <FileWidget
            icon={`${CONFIG.assetsDir}/assets/icons/navbar/ic-analytics.svg`}
            title="Продажи"
            manager="Жанат Кульбаева"
            managerIcon="eva:person-fill"
            value={93}
            total={100}
            showAsPercent
            onClick={() => navigate('/dashboard/ecommerce')}
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
            onClick={() => navigate('/dashboard/banking')}
          />
        </Grid>
        
        {/* 1) Общая выручка */}
        <Grid size={{ xs: 12, md: 4 }}>
          <AppWidgetSummary
            title="Общая выручка"
            percent={revenueData.percent}
            total={revenueData.total}
            isCurrency
            chart={revenueData.chart}
          />
        </Grid>
        
        {/* 2) Количество заказов */}
        <Grid size={{ xs: 12, md: 4 }}>
          <AppWidgetSummary
            title="Количество заказов"
            percent={ordersCountData.percent}
            total={ordersCountData.total}
            chart={ordersCountData.chart}
          />
        </Grid>
        
        {/* 3) Чистая прибыль */}
        <Grid size={{ xs: 12, md: 4 }}>
          <AppWidgetSummary
            title="Чистая прибыль"
            percent={profitData.percent}
            total={profitData.total}
            isCurrency
            chart={profitData.chart}
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
      </Grid>
      
      <Box sx={{ mt: 3 }}>
        <Grid size={{ xs: 12, lg: 12 }}>
          <AppNewInvoice
            title="Новые и активные заказы"
            tableData={orders}
            isLoading={isLoading}
            error={error}
            headCells={[
              { id: 'id', label: 'Номер заказа' },
              { id: 'customer', label: 'Клиент' },
              { id: 'category', label: 'Категория' },
              { id: 'price', label: 'Сумма' },
              { id: 'status', label: 'Статус' },
              { id: 'date', label: 'Дата' },
              { id: '', label: 'Действия' },
            ]}
            renderStatus={(status, statusLabel, statusColor) => (
              <Chip 
                label={statusLabel} 
                color={statusColor} 
                size="small" 
                variant="outlined"
              />
            )}
            renderActions={(orderId) => (
              <Button 
                size="small" 
                variant="outlined" 
                onClick={() => navigate(`/dashboard/orders/${orderId}`)}
              >
                Подробнее
              </Button>
            )}
            emptyMessage="На данный момент нет новых заказов"
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
  
  return (
    <Card>
      <CardHeader title={departmentName} />
      <CardContent>
        <div>Производительность: {metrics.averages?.overall_performance ?? 0}%</div>
        <div>KPI: {metrics.averages?.kpi ?? 0}%</div>
        <div>Тренд производительности: {metrics.trends?.performance_trend}</div>
      </CardContent>
    </Card>
  );
}