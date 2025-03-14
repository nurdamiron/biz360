// OrderNewEditDetails.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import {
  Box,
  Stack,
  Button,
  Divider,
  Typography,
  Alert
} from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { Field } from 'src/components/hook-form';
import { NumericField } from 'src/components/form/NumericField';
import { fetcher, endpoints } from 'src/lib/axios';
import OrderItemRow from './order-item-row';

// Значения по умолчанию для новой позиции
export const defaultItem = {
  productId: '',
  title: '',
  description: '',
  service: '',
  quantity: 1,
  unit_price: 0,
  base_price: 0, // Базовая (фиксированная) цена для расчёта бонуса
  total_price: 0,
  margin_percentage: 0,
  potential_bonus: 0
};

// Проверка, нужно ли применять НДС
function shouldApplyVat(companyType) {
  if (!companyType) return false;
  const vatCompanies = ['ТОО', 'АО', 'ГП', 'ПК'];
  return vatCompanies.includes(companyType);
}

// Безопасное преобразование в число
function safeNumber(value, defaultValue = 0) {
  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
}

export function OrderNewEditDetails() {
  console.log('Рендеринг компонента OrderNewEditDetails');
  
  const { control, setValue, watch, getValues } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  
  // Определяем, нужно ли применять НДС по типу компании поставщика
  const supplierCompanyType = watch('supplier_company_type');
  const isVatSupplier = shouldApplyVat(supplierCompanyType);
  
  // Состояние компонента
  const [productList, setProductList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Процент бонуса
  const BONUS_PERCENTAGE = 5; // 5%
  
  // Функция загрузки списка товаров
  const fetchProducts = useCallback(async () => {
    try {
      console.log('Загрузка списка товаров...');
      setIsLoading(true);
      setError(null);
      
      const response = await fetcher(endpoints.product.list);
      console.log(`Получено ${response.products?.length || 0} товаров`);
      
      setProductList(response.products || []);
    } catch (err) {
      console.error('Ошибка загрузки списка товаров:', err);
      setError('Не удалось загрузить список товаров');
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Загружаем список товаров при первом рендере
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);
  
  // Получаем данные заказа из формы
  const items = watch('items') || [];
  const shipping = safeNumber(watch('shipping'));
  const discount = safeNumber(watch('discount'));
  
  // Рассчитываем общую сумму заказа
  const calculateTotal = useCallback(() => {
    try {
      let subtotal = 0;
      
      // Суммируем все позиции
      items.forEach(item => {
        const itemTotal = safeNumber(item.quantity) * safeNumber(item.unit_price);
        subtotal += itemTotal;
      });
      
      // Добавляем доставку, применяем скидку
      const withShippingAndDiscount = subtotal + shipping - discount;
      
      return withShippingAndDiscount;
    } catch (err) {
      console.error('Ошибка расчета суммы заказа:', err);
      return 0;
    }
  }, [items, shipping, discount]);
  
  const total = calculateTotal();
  
  // Рассчитываем суммы с НДС и без НДС
  const subtotal = isVatSupplier ? Number((total / 1.12).toFixed(2)) : total;
  const tax = isVatSupplier ? Number((subtotal * 0.12).toFixed(2)) : 0;
  
  // Обновляем налог в зависимости от типа поставщика
  useEffect(() => {
    console.log(`Расчёт НДС: ${isVatSupplier ? 'Да' : 'Нет'}, сумма НДС: ${tax} ₸`);
    setValue('tax', tax);
  }, [isVatSupplier, subtotal, setValue, tax]);
  
  // Обновляем итоговые суммы в форме
  useEffect(() => {
    console.log(`Обновление итоговых сумм: без НДС ${subtotal} ₸, НДС ${tax} ₸, всего ${total} ₸`);
    setValue('subtotal', subtotal);
    setValue('tax', tax);
    setValue('total', total);
  }, [subtotal, tax, total, setValue]);
  
  // Рассчитываем общую сумму потенциального бонуса
  const calculateTotalBonus = useCallback(() => {
    try {
      return items.reduce((sum, item) => {
        const bonus = safeNumber(item.potential_bonus);
        return sum + bonus;
      }, 0);
    } catch (err) {
      console.error('Ошибка расчета общего бонуса:', err);
      return 0;
    }
  }, [items]);
  
  const totalPotentialBonus = calculateTotalBonus();
  
  // Показываем индикатор загрузки
  if (isLoading) {
    return <Typography>Загрузка списка товаров...</Typography>;
  }
  
  // Показываем сообщение об ошибке
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error}</Typography>
        <Button variant="outlined" onClick={fetchProducts} sx={{ mt: 2 }}>
          Повторить попытку
        </Button>
      </Box>
    );
  }
  
  // Обработчик добавления новой позиции
  const handleAddItem = () => {
    console.log('Добавляем новую позицию');
    
    // Проверяем, что все текущие позиции заполнены
    const existingProductIds = getValues('items').map(item => item.productId);
    
    if (existingProductIds.includes('')) {
      console.log('Нельзя добавить новую позицию - есть незаполненные');
      alert('Сначала выберите продукт для текущей строки перед добавлением новой');
      return;
    }
    
    append(defaultItem);
  };
  
  // Обработчик удаления позиции
  const handleRemoveItem = (index) => {
    console.log(`Удаляем позицию с индексом ${index}`);
    remove(index);
  };
  
  // Обработчик изменения числовых полей
  const handleNumericChange = (name, value) => {
    setValue(name, value);
  };
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ color: 'text.disabled', mb: 3 }}>
        Детали заказа:
      </Typography>
      
      {/* Информация о бонусах */}
      {items.some(item => safeNumber(item.potential_bonus) > 0) && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Бонусы рассчитываются как {BONUS_PERCENTAGE}% от маржи (разница между ценой продажи и фиксированной ценой)
        </Alert>
      )}
      
      {/* Список позиций */}
      <Stack divider={<Divider flexItem sx={{ borderStyle: 'dashed' }} />} spacing={3}>
        {fields.map((item, index) => (
          <OrderItemRow 
            key={item.id} 
            index={index} 
            productList={productList} 
            onRemove={() => handleRemoveItem(index)} 
          />
        ))}
      </Stack>
      
      <Divider sx={{ my: 3, borderStyle: 'dashed' }} />
      
      <Box
        sx={{
          gap: 3,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'flex-end', md: 'center' },
        }}
      >
        {/* Кнопка добавления товара */}
        <Button
          size="small"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={handleAddItem}
          sx={{ flexShrink: 0 }}
        >
          Добавить товар
        </Button>
        
        {/* Дополнительные поля (доставка, скидка, НДС) */}
        <Box
          sx={{
            gap: 2,
            width: 1,
            display: 'flex',
            justifyContent: 'flex-end',
            flexDirection: { xs: 'column', md: 'row' },
          }}
        >
          {/* Доставка */}
          <NumericField
            name="shipping"
            label="Доставка"
            prefix="₸"
            min={0}
            onChange={(value) => handleNumericChange('shipping', value)}
            sx={{ maxWidth: { md: 120 } }}
          />
          
          {/* Скидка */}
          <NumericField
            name="discount"
            label="Скидка"
            prefix="₸"
            min={0}
            onChange={(value) => handleNumericChange('discount', value)}
            sx={{ maxWidth: { md: 120 } }}
          />
          
          {/* НДС (если применимо) */}
          {isVatSupplier && (
            <NumericField
              name="tax"
              label="Сумма НДС (12%)"
              prefix="₸"
              disabled
              sx={{ maxWidth: { md: 150 } }}
            />
          )}
        </Box>
      </Box>
      
      {/* Итоговые суммы */}
      <Box sx={{ mt: 3 }}>
        <Stack spacing={2}>
          {/* Сумма без НДС */}
          <Stack direction="row" justifyContent="space-between">
            <Typography>Сумма без НДС:</Typography>
            <Typography>{subtotal.toLocaleString()} ₸</Typography>
          </Stack>
          
          {/* НДС (если применимо) */}
          {isVatSupplier && (
            <Stack direction="row" justifyContent="space-between">
              <Typography>НДС (12%):</Typography>
              <Typography>{tax.toLocaleString()} ₸</Typography>
            </Stack>
          )}
          
          <Divider sx={{ borderStyle: 'dashed' }} />
          
          {/* Итого */}
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="h6">Итого (с НДС):</Typography>
            <Typography variant="h6">{total.toLocaleString()} ₸</Typography>
          </Stack>
          
          {/* Потенциальный бонус */}
          {totalPotentialBonus > 0 && (
            <Stack direction="row" justifyContent="space-between" sx={{ color: 'success.main' }}>
              <Typography>Потенциальный бонус:</Typography>
              <Typography>{totalPotentialBonus.toLocaleString()} ₸</Typography>
            </Stack>
          )}
        </Stack>
      </Box>
    </Box>
  );
}