// utils/orderCalculations.js

/**
 * Форматирует число для отображения с фиксированным количеством знаков после запятой
 * @param {number} value - Число для форматирования
 * @param {number} decimals - Количество знаков после запятой (по умолчанию 2)
 * @returns {number} - Отформатированное число
 */
export const formatNumber = (value, decimals = 2) => {
    // Проверяем, что значение является числом
    if (typeof value !== 'number' || isNaN(value)) {
      return 0;
    }
    // Округляем до указанного количества знаков после запятой и конвертируем обратно в число
    return parseFloat(value.toFixed(decimals));
  };
  
  /**
   * Безопасно преобразует значение в число
   * @param {any} value - Значение для преобразования
   * @param {number} defaultValue - Значение по умолчанию (используется при ошибке)
   * @returns {number} - Число или значение по умолчанию
   */
  export const safeNumber = (value, defaultValue = 0) => {
    if (value === undefined || value === null || value === '') {
      return defaultValue;
    }
    
    const number = Number(value);
    return isNaN(number) ? defaultValue : number;
  };
  
  /**
   * Рассчитывает итоговые суммы заказа
   * @param {Array} items - Массив товаров
   * @param {number} shipping - Стоимость доставки
   * @param {number} discount - Сумма скидки
   * @param {string} supplierType - Тип организации поставщика
   * @returns {Object} - Результаты расчета
   */
  export const calculateOrderTotals = (items = [], shipping = 0, discount = 0, supplierType = '') => {
    // Конвертируем значения в числа, чтобы избежать ошибок
    const shippingCost = safeNumber(shipping);
    const discountAmount = safeNumber(discount);
    
    // Рассчитываем подытог
    let subtotal = 0;
    let totalBaseCost = 0;
    
    // Проходим по всем товарам
    items.forEach(item => {
      const quantity = safeNumber(item.quantity, 1);
      const unitPrice = safeNumber(item.unit_price);
      const basePrice = safeNumber(item.base_price, unitPrice * 0.8); // По умолчанию базовая цена 80% от цены продажи
      
      subtotal += quantity * unitPrice;
      totalBaseCost += quantity * basePrice;
      
      // Устанавливаем отдельно стоимость каждой позиции для отображения
      item.total_price = quantity * unitPrice;
    });
    
    // Определяем, нужно ли применять НДС
    const vatEnabled = ['ТОО', 'АО', 'ГП', 'ПК'].includes(supplierType);
    const tax = vatEnabled ? formatNumber(subtotal * 0.12) : 0;
    
    // Рассчитываем итоговую сумму
    const total = formatNumber(subtotal + shippingCost - discountAmount + tax);
    
    // Рассчитываем маржу и процент маржи
    const margin = formatNumber(subtotal - totalBaseCost);
    const marginPercentage = totalBaseCost > 0 
      ? formatNumber((margin / totalBaseCost) * 100) 
      : 0;
    
    // Рассчитываем потенциальный бонус (5% от маржи)
    const potentialBonus = formatNumber(margin * 0.05);
    
    return {
      subtotal: formatNumber(subtotal),
      shipping: shippingCost,
      discount: discountAmount,
      tax,
      total,
      margin,
      marginPercentage,
      potentialBonus,
      totalBaseCost: formatNumber(totalBaseCost)
    };
  };