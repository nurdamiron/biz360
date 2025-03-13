// src/actions/order.js
import useSWR from 'swr';
import { useMemo, useState, useCallback } from 'react';
import axios from 'src/lib/axios';
import { fetcher, endpoints } from 'src/lib/axios';
import { toast } from 'src/components/snackbar';

const SWR_OPTIONS = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};

/**
 * Хук для получения списка заказов
 */
export function useGetOrders() {
  const url = endpoints.order.list;
  const {
    data,
    error,
    mutate,
    isLoading,
    isValidating,
  } = useSWR(url, fetcher, SWR_OPTIONS);

  return useMemo(() => {
    const orders = data || [];
    const ordersEmpty = !isLoading && !isValidating && orders.length === 0;
    
    return {
      orders,
      ordersLoading: isLoading,
      ordersError: error,
      ordersValidating: isValidating,
      ordersEmpty,
      refetchOrders: mutate,
    };
  }, [data, error, isLoading, isValidating, mutate]);
}

/**
 * Хук для получения деталей одного заказа
 */
export function useGetOrder(orderId) {
  const url = orderId ? endpoints.order.details(orderId) : null;
  const { data, isLoading, error, isValidating, mutate } = useSWR(url, fetcher, SWR_OPTIONS);

  return useMemo(() => ({
    order: data || null,
    orderLoading: isLoading,
    orderError: error,
    orderValidating: isValidating,
    refetchOrder: mutate,
  }), [data, error, isLoading, isValidating, mutate]);
}

/**
 * Хук для создания заказа
 */
export function useCreateOrder() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createOrder = useCallback(async (orderData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post(endpoints.order.create, orderData);
      
      toast.success('Заказ успешно создан');
      return response.data;
    } catch (err) {
      console.error('Ошибка при создании заказа:', err);
      setError(err.message || 'Ошибка при создании заказа');
      toast.error('Не удалось создать заказ');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createOrder, loading, error };
}

/**
 * Хук для обновления заказа
 */
export function useUpdateOrder() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateOrder = useCallback(async (orderId, orderData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.put(endpoints.order.update(orderId), orderData);
      
      toast.success('Заказ успешно обновлен');
      return response.data;
    } catch (err) {
      console.error('Ошибка при обновлении заказа:', err);
      setError(err.message || 'Ошибка при обновлении заказа');
      toast.error('Не удалось обновить заказ');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { updateOrder, loading, error };
}

/**
 * Хук для удаления заказа
 */
export function useDeleteOrder() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const deleteOrder = useCallback(async (orderId) => {
    try {
      setLoading(true);
      setError(null);
      
      await axios.delete(endpoints.order.delete(orderId));
      
      toast.success('Заказ успешно удален');
      return true;
    } catch (err) {
      console.error('Ошибка при удалении заказа:', err);
      setError(err.message || 'Ошибка при удалении заказа');
      toast.error('Не удалось удалить заказ');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { deleteOrder, loading, error };
}

/**
 * Хук для обновления статуса заказа
 */
export function useUpdateOrderStatus() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateStatus = useCallback(async (orderId, newStatus) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.put(endpoints.order.update(orderId), { status: newStatus });
      
      toast.success(`Статус заказа изменен на "${getStatusLabel(newStatus)}"`);
      return response.data;
    } catch (err) {
      console.error('Ошибка при обновлении статуса заказа:', err);
      setError(err.message || 'Ошибка при обновлении статуса заказа');
      toast.error('Не удалось обновить статус заказа');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { updateStatus, loading, error };
}

/**
 * Функция для получения цвета статуса заказа
 */
export function getStatusColor(status) {
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
}

/**
 * Функция для получения названия статуса заказа на русском
 */
export function getStatusLabel(status) {
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
}

/**
 * Функция для получения следующих доступных статусов
 */
export function getNextStatuses(currentStatus) {
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
}

/**
 * Функция для получения отдела, ответственного за текущий статус
 */
export function getResponsibleDepartment(status) {
  const departmentMapping = {
    new: 'sales',
    pending_validation: 'sales',
    pending_payment: 'accounting',
    paid: 'accounting',
    in_processing: 'logistics',
    shipped: 'logistics',
    delivered: 'logistics',
    completed: 'sales',
    rejected: 'sales',
    cancelled: 'sales',
  };
  
  return departmentMapping[status] || null;
}

/**
 * Получение списка всех возможных статусов заказа
 */
export function getAllOrderStatuses() {
  return [
    { value: 'new', label: 'Новый', color: 'primary' },
    { value: 'pending_payment', label: 'Ожидает оплаты', color: 'info' },
    { value: 'paid', label: 'Оплачен', color: 'success' },
    { value: 'in_processing', label: 'В обработке', color: 'warning' },
    { value: 'shipped', label: 'Отгружен', color: 'info' },
    { value: 'delivered', label: 'Доставлен', color: 'success' },
    { value: 'completed', label: 'Завершен', color: 'success' },
    { value: 'rejected', label: 'Отклонен', color: 'error' },
    { value: 'cancelled', label: 'Отменен', color: 'error' },
  ];
}