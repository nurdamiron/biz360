// src/sections/orders/view/order-details-view.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from 'src/lib/axios';

import {
  Box,
  Card,
  Grid,
  Table,
  Stack,
  Divider,
  TableRow,
  TableBody,
  TableCell,
  CardHeader,
  Typography,
  TableContainer,
  CircularProgress,
  Alert,
  Button,
  Chip,
  Paper,
  IconButton
} from '@mui/material';

import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { TableHeadCustom } from 'src/components/table';
import { fDate } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';
import { Label } from 'src/components/label';

// ----------------------------------------------------------------------

import { OrderDetailsMetrics } from 'src/sections/order/order-details-metrics';


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

// ----------------------------------------------------------------------

export function OrderDetailsView() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getOrder = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/api/orders/${id}`);
        setOrder(response.data);
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('Не удалось загрузить данные заказа. Пожалуйста, попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      getOrder();
    }
  }, [id]);

  const handleUpdateStatus = async (newStatus) => {
    try {
      setLoading(true);
      await axiosInstance.put(`/api/orders/${id}`, { status: newStatus });
      // Обновляем заказ после изменения статуса
      const response = await axiosInstance.get(`/api/orders/${id}`);
      setOrder(response.data);
    } catch (err) {
      console.error('Error updating order status:', err);
      setError('Не удалось обновить статус заказа. Пожалуйста, попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardContent>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
          <Typography variant="h6" sx={{ ml: 2 }}>Загрузка данных заказа...</Typography>
        </Box>
      </DashboardContent>
    );
  }

  if (error) {
    return (
      <DashboardContent>
        <Alert severity="error">{error}</Alert>
      </DashboardContent>
    );
  }

  if (!order) {
    return (
      <DashboardContent>
        <Alert severity="warning">Заказ не найден</Alert>
      </DashboardContent>
    );
  }

  const {
    order_number,
    customer_name,
    customer_email,
    phone_number,
    status,
    subtotal = 0,
    discount = 0,
    tax = 0,
    shipping_cost = 0,
    total = 0,
    shipping_address = '',
    created_at,
    items = [],
  } = order;

  const tableHeadItems = [
    { id: 'product', label: 'Товар' },
    { id: 'description', label: 'Описание' },
    { id: 'quantity', label: 'Количество' },
    { id: 'unit_price', label: 'Цена за ед.' },
    { id: 'total_price', label: 'Сумма' },
  ];

  // Доступные следующие статусы в зависимости от текущего
  const getNextStatuses = (currentStatus) => {
    const statusFlow = {
      new: ['pending_validation', 'rejected'],
      pending_validation: ['pending_payment', 'rejected'],
      pending_payment: ['paid', 'cancelled'],
      paid: ['in_processing'],
      in_processing: ['shipped'],
      shipped: ['delivered'],
      delivered: ['completed'],
      completed: [],
      rejected: ['new'],
      cancelled: [],
    };
    
    return statusFlow[currentStatus] || [];
  };

  const nextStatuses = getNextStatuses(status);

  return (
    <DashboardContent>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
        <Stack direction="row" spacing={1} alignItems="center">
          <IconButton onClick={() => navigate(-1)}>
            <Iconify icon="eva:arrow-back-fill" />
          </IconButton>
          <Typography variant="h4">
            Заказ {order_number || `#${id}`}
          </Typography>
          <Label
            variant="soft"
            color={getStatusColor(status)}
          >
            {getStatusLabel(status)}
          </Label>
        </Stack>

        <Stack direction="row" spacing={1}>
          {nextStatuses.map((nextStatus) => (
            <Button 
              key={nextStatus}
              variant="contained"
              color={getStatusColor(nextStatus)}
              onClick={() => handleUpdateStatus(nextStatus)}
            >
              {getStatusLabel(nextStatus)}
            </Button>
          ))}
          <Button variant="outlined" onClick={() => window.print()}>
            <Iconify icon="eva:printer-fill" sx={{ mr: 1 }} />
            Печать
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader title="Информация о заказе" />
            <TableContainer>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell sx={{ width: '40%' }}>Номер заказа</TableCell>
                    <TableCell>{order_number || `#${id}`}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Дата создания</TableCell>
                    <TableCell>{created_at ? new Date(created_at).toLocaleString('ru-RU') : '-'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Статус</TableCell>
                    <TableCell>
                      <Label
                        variant="soft"
                        color={getStatusColor(status)}
                      >
                        {getStatusLabel(status)}
                      </Label>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Клиент</TableCell>
                    <TableCell>{customer_name || '-'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Email</TableCell>
                    <TableCell>{customer_email || '-'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Телефон</TableCell>
                    <TableCell>{phone_number || '-'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Адрес доставки</TableCell>
                    <TableCell>{shipping_address || '-'}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader title="Сумма заказа" />
            <TableContainer>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell>Подытог</TableCell>
                    <TableCell align="right">{fCurrency(subtotal)}</TableCell>
                  </TableRow>
                  {discount > 0 && (
                    <TableRow>
                      <TableCell>Скидка</TableCell>
                      <TableCell align="right" sx={{ color: 'error.main' }}>
                        -{fCurrency(discount)}
                      </TableCell>
                    </TableRow>
                  )}
                  {tax > 0 && (
                    <TableRow>
                      <TableCell>Налог (12%)</TableCell>
                      <TableCell align="right">{fCurrency(tax)}</TableCell>
                    </TableRow>
                  )}
                  {shipping_cost > 0 && (
                    <TableRow>
                      <TableCell>Доставка</TableCell>
                      <TableCell align="right">{fCurrency(shipping_cost)}</TableCell>
                    </TableRow>
                  )}
                  <TableRow>
                    <TableCell sx={{ typography: 'subtitle1' }}>Итого</TableCell>
                    <TableCell align="right" sx={{ typography: 'subtitle1' }}>
                      {fCurrency(total)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardHeader title="Товары заказа" />
            <TableContainer sx={{ minWidth: 720 }}>
              <Scrollbar>
                <Table>
                  <TableHeadCustom headLabel={tableHeadItems} />
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id || `item-${item.product_name}`}>
                        <TableCell>{item.product_name}</TableCell>
                        <TableCell>{item.description}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{fCurrency(item.unit_price)}</TableCell>
                        <TableCell>{fCurrency(item.total_price)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Scrollbar>
            </TableContainer>
          </Card>
          <OrderDetailsMetrics orderId={id} />

        </Grid>
      </Grid>
    </DashboardContent>
  );
}