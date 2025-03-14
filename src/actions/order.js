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

// Константа для расчета бонуса (базовая ставка)
const BASE_BONUS_PERCENTAGE = 5;

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
 * Хук для создания и редактирования заказа с расширенной функциональностью
 */
export function useOrderForm(initialOrder = null) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [order, setOrder] = useState(initialOrder);
  
  // Получение заказа по ID, если он передан
  const fetchOrder = useCallback(async (orderId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(endpoints.order.details(orderId));
      setOrder(response.data);
      return response.data;
    } catch (err) {
      console.error('Ошибка при загрузке заказа:', err);
      setError(err.message || 'Ошибка при загрузке заказа');
      toast.error('Не удалось загрузить заказ');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Расчет потенциального бонуса по правильной формуле:
   * 1. Базовый бонус = базовая цена * 5%
   * 2. Актуальный бонус = базовый бонус * (цена продажи / базовая цена)
   * 3. Итоговый бонус = актуальный бонус * количество
   * 
   * @param {Array} items - элементы заказа
   * @returns {number} - сумма потенциального бонуса
   */
  const calculatePotentialBonus = useCallback((items) => {
    let totalBonus = 0;
    
    items.forEach(item => {
      const quantity = Number(item.quantity) || 0;
      const unitPrice = Number(item.unit_price) || 0;
      const basePrice = Number(item.base_price) || unitPrice;
      
      // Пропускаем позиции с невалидными значениями
      if (basePrice <= 0 || unitPrice <= 0 || quantity <= 0) {
        return;
      }
      
      // Шаг 1: Рассчитываем базовый бонус (5% от базовой цены)
      const baseBonus = basePrice * (BASE_BONUS_PERCENTAGE / 100);
      
      // Шаг 2: Корректируем бонус пропорционально цене продажи
      const adjustedBonus = baseBonus * (unitPrice / basePrice);
      
      // Шаг 3: Рассчитываем общий бонус для указанного количества
      const itemBonus = Math.round(adjustedBonus * quantity);
      
      totalBonus += itemBonus;
    });
    
    return totalBonus;
  }, []);

  // Сохранение заказа (создание или обновление)
  const saveOrder = useCallback(async (orderData, isDraft = false) => {
    try {
      setLoading(true);
      setError(null);
      
      // Calculate creation time
      const creationTime = Math.floor((Date.now() - (order?.creationStartTime || Date.now())) / 1000);
      
      // Преобразуем элементы заказа в нужный формат для API
      const formattedItems = orderData.items.map((item) => ({
        product_id: item.productId,
        product_name: item.title,
        description: item.description || '',
        quantity: item.quantity,
        unit_price: item.unit_price,
        base_price: item.base_price || item.unit_price,
        total_price: item.quantity * item.unit_price,
        margin_percentage: item.margin_percentage || 0,
        potential_bonus: item.potential_bonus || 0
      }));
      
      // Рассчитываем потенциальный бонус по правильной формуле
      const potentialBonus = calculatePotentialBonus(formattedItems);
      
      const payload = {
        ...orderData,
        status: isDraft ? 'draft' : 'new',
        items: formattedItems,
        creation_time: creationTime,
        potential_bonus: potentialBonus
      };
      
      let response;
      
      if (order?.id) {
        // Обновление существующего заказа
        response = await axios.put(endpoints.order.update(order.id), payload);
        toast.success(isDraft ? 'Черновик заказа обновлен' : 'Заказ успешно обновлен');
      } else {
        // Создание нового заказа
        response = await axios.post(endpoints.order.create, payload);
        toast.success(isDraft ? 'Черновик заказа создан' : 'Заказ успешно создан');
      }
      
      // Обновляем локальное состояние заказа
      setOrder(response.data);
      return response.data;
    } catch (err) {
      console.error('Ошибка при сохранении заказа:', err);
      setError(err.message || 'Ошибка при сохранении заказа');
      toast.error('Не удалось сохранить заказ');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [order, calculatePotentialBonus]);

  // Расчет итоговых сумм заказа и маржи
  const calculateOrderTotals = useCallback((items, shipping = 0, discount = 0, supplierType = '') => {
    let subtotal = 0;
    let totalBaseCost = 0;
    let totalBonus = 0;
    
    // Суммируем все позиции и рассчитываем базовую стоимость
    items.forEach((item) => {
      const quantity = Number(item.quantity) || 0;
      const unitPrice = Number(item.unit_price) || 0;
      const basePrice = Number(item.base_price) || unitPrice;
      
      subtotal += quantity * unitPrice;
      totalBaseCost += quantity * basePrice;
      
      // Рассчитываем бонус для каждой позиции по правильной формуле
      if (basePrice > 0 && unitPrice > 0 && quantity > 0) {
        // Шаг 1: Рассчитываем базовый бонус (5% от базовой цены)
        const baseBonus = basePrice * (BASE_BONUS_PERCENTAGE / 100);
        
        // Шаг 2: Корректируем бонус пропорционально цене продажи
        const adjustedBonus = baseBonus * (unitPrice / basePrice);
        
        // Шаг 3: Рассчитываем общий бонус для указанного количества
        const itemBonus = Math.round(adjustedBonus * quantity);
        
        totalBonus += itemBonus;
      }
    });
    
    // Рассчитываем НДС только для определенных типов организаций
    const vatEnabled = ['ТОО', 'АО', 'ГП', 'ПК'].includes(supplierType);
    const tax = vatEnabled ? Number((subtotal * 0.12).toFixed(2)) : 0;
    
    // Финальная сумма
    const total = subtotal + shipping - discount + tax;
    
    // Рассчитываем маржу и маржинальность
    const margin = subtotal - totalBaseCost;
    const marginPercentage = totalBaseCost > 0 ? (margin / totalBaseCost) * 100 : 0;
    
    return {
      subtotal,
      tax,
      total,
      shipping,
      discount,
      margin,
      marginPercentage,
      potentialBonus: totalBonus,
      totalBaseCost
    };
  }, []);

  // Проверка доступности продуктов
  const checkProductsAvailability = useCallback(async (items) => {
    try {
      setLoading(true);
      
      const productIds = items
        .map(item => item.productId)
        .filter(id => id && id !== '');
      
      if (productIds.length === 0) {
        return { allAvailable: true, items: [] };
      }
      
      // Получаем информацию о продуктах
      const productPromises = productIds.map(id => 
        axios.get(endpoints.product.details(id)).then(res => res.data)
      );
      
      const products = await Promise.all(productPromises);
      
      // Проверяем доступность каждого продукта
      const availabilityResult = {
        allAvailable: true,
        items: []
      };
      
      items.forEach(item => {
        if (!item.productId) return;
        
        const product = products.find(p => p.id == item.productId);
        
        if (!product) {
          availabilityResult.items.push({
            productId: item.productId,
            productName: item.title || 'Неизвестный продукт',
            requested: item.quantity,
            available: 0,
            isAvailable: false
          });
          availabilityResult.allAvailable = false;
          return;
        }
        
        const isAvailable = product.quantity >= item.quantity;
        
        availabilityResult.items.push({
          productId: product.id,
          productName: product.name,
          requested: item.quantity,
          available: product.quantity,
          isAvailable
        });
        
        if (!isAvailable) {
          availabilityResult.allAvailable = false;
        }
      });
      
      return availabilityResult;
    } catch (err) {
      console.error('Ошибка при проверке доступности продуктов:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Получение деталей продукта и установка базовой цены
  const fetchProductDetails = useCallback(async (productId) => {
    try {
      setLoading(true);
      
      const response = await axios.get(endpoints.product.details(productId));
      const product = response.data;
      
      // Используем исходную цену продукта как базовую,
      // не применяем скидку 20% как было ранее
      const basePrice = product.base_price || product.price;
      
      return {
        ...product,
        base_price: basePrice
      };
    } catch (err) {
      console.error('Ошибка при получении деталей продукта:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    order,
    loading,
    error,
    fetchOrder,
    saveOrder,
    calculateOrderTotals,
    checkProductsAvailability,
    calculatePotentialBonus,
    fetchProductDetails
  };
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
    pending_validation: 'На проверке',
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
    { value: 'pending_validation', label: 'На проверке', color: 'warning' },
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