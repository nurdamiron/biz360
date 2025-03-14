// src/sections/order/order-bonus-calculator.js
import { useState, useEffect, useCallback } from 'react';
import { useFormContext } from 'react-hook-form';

/**
 * Хук для расчета бонусов и маржи на основе данных заказа
 * @returns {Object} {totalBonus, avgMargin}
 */
export function useOrderBonusCalculator() {
  const methods = useFormContext();
  const [totalBonus, setTotalBonus] = useState(0);
  const [avgMargin, setAvgMargin] = useState(0);
  
  // Безопасное получение items из формы
  const getItems = useCallback(() => {
    if (!methods || typeof methods.watch !== 'function') {
      return [];
    }
    return methods.watch('items') || [];
  }, [methods]);
  
  // Функция расчета бонусов
  const calculateBonus = useCallback(() => {
    // Страховка от null
    if (!methods || typeof methods.watch !== 'function') {
      return;
    }
    
    let bonus = 0;
    let totalMargin = 0;
    let validItemsCount = 0;
    
    const items = getItems();
    
    items.forEach((item) => {
      if (item && item.base_price && item.unit_price && item.quantity) {
        const itemMargin = (item.unit_price - item.base_price) * item.quantity;
        const itemMarginPercentage = ((item.unit_price - item.base_price) / item.base_price) * 100;
        
        totalMargin += itemMarginPercentage;
        bonus += Math.round(itemMargin * 0.05); // 5% от маржи как бонус
        validItemsCount += 1;
      }
    });
    
    setTotalBonus(bonus);
    setAvgMargin(validItemsCount > 0 ? totalMargin / validItemsCount : 0);
  }, [methods, getItems]);
  
  // Инициализация и обновление при изменении товаров
  useEffect(() => {
    if (!methods || typeof methods.watch !== 'function') {
      return undefined; // Возвращаем undefined, а не просто return;
    }
  
    calculateBonus();
  
    const handleOrderItemUpdated = () => {
      calculateBonus();
    };
  
    document.addEventListener('orderItemUpdated', handleOrderItemUpdated);
  
    return () => {
      document.removeEventListener('orderItemUpdated', handleOrderItemUpdated);
    };
  }, [methods, calculateBonus]);
  
  
  // Дополнительная подписка на изменения самих items
  useEffect(() => {
    if (!methods || typeof methods.watch !== 'function') {
      return undefined;
    }
  
    const subscription = methods.watch((value, { name }) => {
      if (name?.startsWith('items')) {
        calculateBonus();
      }
    });
  
    return () => {
      if (subscription?.unsubscribe) {
        subscription.unsubscribe();
      }
    };
  }, [methods, calculateBonus]);
  
  
  return { totalBonus, avgMargin };
}