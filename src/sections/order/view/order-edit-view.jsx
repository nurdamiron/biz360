// src/sections/order/view/order-edit-view.jsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { DashboardContent } from 'src/layouts/dashboard';
import { paths } from 'src/routes/paths';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { OrderNewEditForm } from '../order-new-edit-form';
import axiosInstance from 'src/lib/axios';
import { CircularProgress, Box, Alert } from '@mui/material';

export function OrderEditView() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/api/orders/${id}`);
        setOrder(response.data);
      } catch (err) {
        console.error('Ошибка при загрузке заказа:', err);
        setError('Не удалось загрузить заказ. Пожалуйста, попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrder();
    }
  }, [id]);

  if (loading) {
    return (
      <DashboardContent>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
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

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Редактирование заказа"
        links={[
          { name: 'Главная', href: paths.dashboard.root },
          { name: 'Заказы', href: paths.dashboard.order.root },
          { name: 'Редактирование' }
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <OrderNewEditForm currentOrder={order} />
    </DashboardContent>
  );
}