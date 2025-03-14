// OrderItemRow.jsx
import React, { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import {
  Box,
  Button,
  Alert,
  Stack,
  MenuItem,
  InputAdornment,
  Typography,
  Tooltip,
  TextField,
  Paper
} from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { Field } from 'src/components/hook-form';
import { fetcher, endpoints } from 'src/lib/axios';

// Бонус, % от маржи (разница между ценой продажи и базовой ценой)
const BONUS_PERCENTAGE = 5;

function getFieldNames(index) {
  return {
    productId: `items[${index}].productId`,
    title: `items[${index}].title`,
    description: `items[${index}].description`,
    service: `items[${index}].service`,
    quantity: `items[${index}].quantity`,
    unit_price: `items[${index}].unit_price`,
    base_price: `items[${index}].base_price`,
    total_price: `items[${index}].total_price`,
    margin_percentage: `items[${index}].margin_percentage`,
    potential_bonus: `items[${index}].potential_bonus`
  };
}

// Функция расчета бонуса и маржи
function calculateBonusAndMargin(basePrice, unitPrice, quantity) {
  if (!basePrice || !unitPrice || basePrice <= 0 || unitPrice <= 0 || !quantity || quantity <= 0) {
    return { bonus: 0, marginPercentage: 0 };
  }
  
  // Проверяем, что маржа положительная
  const priceDifference = unitPrice - basePrice;
  const marginPercentage = (priceDifference / basePrice) * 100;
  
  // Бонус 5% от маржи (разница в цене * количество * процент бонуса)
  const bonus = Math.round(priceDifference * quantity * (BONUS_PERCENTAGE / 100));
  
  return { 
    bonus, 
    marginPercentage,
    priceDifference
  };
}

export default function OrderItemRow({ index, onRemove, productList }) {
  const { watch, setValue, getValues } = useFormContext();
  const fieldNames = getFieldNames(index);

  // Состояние компонента
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [priceEditable, setPriceEditable] = useState(false);
  const [rowErrors, setRowErrors] = useState([]);
  const [quantityValue, setQuantityValue] = useState('1');

  // Извлекаем поля из формы
  const quantity = watch(fieldNames.quantity) || 1;
  const unitPrice = watch(fieldNames.unit_price) || 0;
  const basePrice = watch(fieldNames.base_price) || 0;

  // Синхронизация локального состояния с формой
  useEffect(() => {
    setQuantityValue(quantity.toString());
  }, [quantity]);

  // Проверки на ошибки
  const tooMuch = selectedProduct && quantity > (selectedProduct.quantity || 0);
  const priceTooLow = basePrice && unitPrice && unitPrice < basePrice;

  // Обновление расчетов при изменении данных
  useEffect(() => {
    // Сначала чистим ошибки
    const newErrors = [];

    // Расчет итоговых значений
    if (basePrice > 0 && unitPrice > 0 && quantity > 0) {
      // Итоговая цена строки
      const total = quantity * unitPrice;
      setValue(fieldNames.total_price, total);

      // Расчет маржи и бонуса
      const { bonus, marginPercentage } = calculateBonusAndMargin(basePrice, unitPrice, quantity);
      setValue(fieldNames.margin_percentage, marginPercentage);
      setValue(fieldNames.potential_bonus, bonus);

      // Отправляем событие для обновления общего бонуса
      setTimeout(() => {
        const calculatedEvent = new CustomEvent('orderItemUpdated', {
          detail: { index, bonus, marginPercentage }
        });
        document.dispatchEvent(calculatedEvent);
      }, 0);
    } else {
      setValue(fieldNames.total_price, 0);
      setValue(fieldNames.margin_percentage, 0);
      setValue(fieldNames.potential_bonus, 0);
    }

    // Проверка на ошибки
    if (tooMuch) {
      const available = selectedProduct?.quantity || 0;
      newErrors.push(`Вы пытаетесь заказать больше, чем доступно: ${available} шт.`);
    }
    if (priceTooLow) {
      newErrors.push(`Цена не может быть ниже базовой (${basePrice} ₸)!`);
    }

    setRowErrors(newErrors);
  }, [quantity, unitPrice, basePrice, tooMuch, priceTooLow, selectedProduct, setValue, fieldNames, index]);

  // Выбор продукта
  const handleSelectProduct = async (e) => {
    const productId = e.target.value;
    if (!productId) {
      resetFields();
      return;
    }

    // Проверка дубликатов
    const allItems = watch('items');
    const duplicate = allItems.find((it, i) => i !== index && it.productId === productId);
    if (duplicate) {
      alert('Этот товар уже добавлен!');
      return;
    }

    try {
      const resp = await fetcher(endpoints.product.details(productId));
      const prod = resp.data;
      if (prod) {
        setSelectedProduct(prod);
        setPriceEditable(true);

        // Используем базовую цену из продукта, если она есть
        const newBase = prod.base_price || Math.round(prod.price * 0.8);

        // Заполняем поля формы
        setValue(fieldNames.productId, productId);
        setValue(fieldNames.title, prod.name || '');
        setValue(fieldNames.service, prod.code || '');
        setValue(fieldNames.unit_price, prod.price || 0);
        setValue(fieldNames.base_price, newBase);
        setValue(fieldNames.quantity, 1);
        setQuantityValue('1');

        // Сразу рассчитываем итоговую цену, маржу и бонус
        setValue(fieldNames.total_price, prod.price || 0);
        const { bonus, marginPercentage } = calculateBonusAndMargin(newBase, prod.price, 1);
        setValue(fieldNames.margin_percentage, marginPercentage);
        setValue(fieldNames.potential_bonus, bonus);

        // Отправляем событие для обновления общего бонуса
        setTimeout(() => {
          const calculatedEvent = new CustomEvent('orderItemUpdated', {
            detail: { index, bonus, marginPercentage }
          });
          document.dispatchEvent(calculatedEvent);
        }, 0);
      }
    } catch (error) {
      console.error('Ошибка при загрузке товара:', error);
      setSelectedProduct(null);
      setPriceEditable(false);
    }
  };

  // Сброс полей
  const resetFields = () => {
    setSelectedProduct(null);
    setPriceEditable(false);
    setValue(fieldNames.productId, '');
    setValue(fieldNames.title, '');
    setValue(fieldNames.description, '');
    setValue(fieldNames.service, '');
    setValue(fieldNames.unit_price, 0);
    setValue(fieldNames.base_price, 0);
    setValue(fieldNames.quantity, 1);
    setQuantityValue('1');
    setValue(fieldNames.total_price, 0);
    setValue(fieldNames.margin_percentage, 0);
    setValue(fieldNames.potential_bonus, 0);
    
    // Отправляем событие для обновления общего бонуса
    setTimeout(() => {
      const calculatedEvent = new CustomEvent('orderItemUpdated', {
        detail: { index, bonus: 0, marginPercentage: 0 }
      });
      document.dispatchEvent(calculatedEvent);
    }, 0);
  };

  // Обработчик изменения цены
  const handlePriceChange = (e) => {
    const newPrice = parseFloat(e.target.value);
    if (isNaN(newPrice)) return;
    
    setValue(fieldNames.unit_price, newPrice);
    
    // Пересчитываем итоговую сумму
    const total = quantity * newPrice;
    setValue(fieldNames.total_price, total);
    
    // Пересчитываем маржу и бонус
    if (basePrice > 0) {
      const { bonus, marginPercentage } = calculateBonusAndMargin(basePrice, newPrice, quantity);
      setValue(fieldNames.margin_percentage, marginPercentage);
      setValue(fieldNames.potential_bonus, bonus);
      
      // Отправляем событие для обновления общего бонуса
      setTimeout(() => {
        const calculatedEvent = new CustomEvent('orderItemUpdated', {
          detail: { index, bonus, marginPercentage }
        });
        document.dispatchEvent(calculatedEvent);
      }, 0);
    }
  };

  // Обработчик изменения количества
  const handleQuantityChange = (e) => {
    const value = e.target.value;
    setQuantityValue(value);
    
    // Если поле пустое, не обновляем форму
    if (value === '') return;
    
    const newQuantity = parseInt(value, 10);
    if (isNaN(newQuantity) || newQuantity <= 0) return;
    
    setValue(fieldNames.quantity, newQuantity);
    
    // Пересчитываем итоговую сумму
    if (unitPrice > 0) {
      const total = newQuantity * unitPrice;
      setValue(fieldNames.total_price, total);
      
      // Пересчитываем маржу и бонус
      if (basePrice > 0) {
        const { bonus, marginPercentage } = calculateBonusAndMargin(basePrice, unitPrice, newQuantity);
        setValue(fieldNames.margin_percentage, marginPercentage);
        setValue(fieldNames.potential_bonus, bonus);
        
        // Отправляем событие для обновления общего бонуса
        setTimeout(() => {
          const calculatedEvent = new CustomEvent('orderItemUpdated', {
            detail: { index, bonus, marginPercentage }
          });
          document.dispatchEvent(calculatedEvent);
        }, 0);
      }
    }
  };

  // Обработчик потери фокуса полем количества
  const handleQuantityBlur = () => {
    if (quantityValue === '' || parseInt(quantityValue, 10) <= 0) {
      setValue(fieldNames.quantity, 1);
      setQuantityValue('1');
      
      // Пересчитываем итоговую сумму при сбросе на значение по умолчанию
      if (unitPrice > 0) {
        setValue(fieldNames.total_price, unitPrice);
        
        // Пересчитываем маржу и бонус
        if (basePrice > 0) {
          const { bonus, marginPercentage } = calculateBonusAndMargin(basePrice, unitPrice, 1);
          setValue(fieldNames.margin_percentage, marginPercentage);
          setValue(fieldNames.potential_bonus, bonus);
          
          // Отправляем событие для обновления общего бонуса
          setTimeout(() => {
            const calculatedEvent = new CustomEvent('orderItemUpdated', {
              detail: { index, bonus, marginPercentage }
            });
            document.dispatchEvent(calculatedEvent);
          }, 0);
        }
      }
    }
  };

  // Общие стили для полей ввода
  const commonFieldStyle = {
    '& .MuiOutlinedInput-root': {
      height: '40px'
    }
  };

  // Рендер селектора продукта
  const renderProductSelect = () => (
    <Field.Select
      name={fieldNames.productId}
      label="Выбрать продукт"
      onChange={handleSelectProduct}
      sx={{ flex: 1, ...commonFieldStyle }}
    >
      <MenuItem value=""><em>- Не выбрано -</em></MenuItem>
      {productList.map((p) => (
        <MenuItem key={p.id} value={p.id} disabled={p.quantity <= 0}>
          {p.name}{p.quantity <= 0 ? ' (нет в наличии)' : ''}
        </MenuItem>
      ))}
    </Field.Select>
  );

  // Рендер поля количества
  const renderQuantity = () => (
    <Box sx={{ width: 120, display: 'flex', flexDirection: 'column' }}>
      <TextField
        size="small"
        type="number"
        label="Кол-во"
        value={quantityValue}
        onChange={handleQuantityChange}
        onBlur={handleQuantityBlur}
        inputProps={{ min: 1 }}
        sx={{ width: '100%', ...commonFieldStyle }}
      />
      {selectedProduct && (
        <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5 }}>
          Доступно: {selectedProduct.quantity}
        </Typography>
      )}
    </Box>
  );

  // Рендер поля цены
  const renderPrice = () => (
    <Box sx={{ width: 150, display: 'flex', flexDirection: 'column' }}>
      <TextField
        size="small"
        type="number"
        label="Цена"
        value={unitPrice}
        onChange={handlePriceChange}
        disabled={!priceEditable}
        InputProps={{
          startAdornment: <InputAdornment position="start">₸</InputAdornment>,
        }}
        sx={{ width: '100%', ...commonFieldStyle }}
      />
      {basePrice > 0 && (
        <Tooltip title="Базовая цена, ниже которой устанавливать нельзя">
          <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', mt: 0.5 }}>
            Базовая: {basePrice.toLocaleString()} ₸
          </Typography>
        </Tooltip>
      )}
    </Box>
  );

  // Рендер поля кода
  const renderCode = () => (
    <TextField
      size="small"
      label="Номенклатурный номер"
      value={watch(fieldNames.service) || ''}
      disabled
      sx={{ width: 150, ...commonFieldStyle }}
    />
  );

  // Рендер поля итоговой суммы
  const renderTotal = () => (
    <TextField
      size="small"
      label="Итого"
      value={watch(fieldNames.total_price) || 0}
      disabled
      InputProps={{
        startAdornment: <InputAdornment position="start">₸</InputAdornment>,
        style: { fontWeight: 600, color: '#000' }
      }}
      inputProps={{
        style: { textAlign: 'right', fontWeight: 600, color: '#000' }
      }}
      sx={{ width: 150, ...commonFieldStyle }}
    />
  );

  // Получаем значения бонуса и маржи для отображения
  const bonusVal = watch(fieldNames.potential_bonus) || 0;
  const marginVal = watch(fieldNames.margin_percentage) || 0;
  const isNegativeMargin = marginVal < 0;

  return (
    <Box sx={{ mb: 3 }}>
      {/* Отображение ошибок */}
      {rowErrors.length > 0 && (
        <Alert severity="error" sx={{ mb: 1 }}>
          {rowErrors.map((errMsg, i) => (
            <Box key={i}>{errMsg}</Box>
          ))}
        </Alert>
      )}

      {/* Отображение информации о бонусе */}
      {bonusVal !== 0 && (
        <Alert severity={bonusVal > 0 ? "info" : "error"} sx={{ mb: 1 }}>
          Бонус: {bonusVal.toLocaleString()} ₸ &nbsp;/ Маржа: {marginVal.toFixed(1)}%
        </Alert>
      )}

      {/* Строка товара */}
      <Paper 
        variant="outlined" 
        sx={{ 
          p: 2, 
          borderRadius: 1, 
          borderColor: isNegativeMargin ? 'error.light' : bonusVal > 0 ? 'success.light' : 'divider'
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          flexWrap="wrap"
          alignItems="flex-start"
        >
          {/* Селектор продукта */}
          {renderProductSelect()}

          {/* Номенклатурный номер */}
          {renderCode()}

          {/* Количество */}
          {renderQuantity()}

          {/* Цена */}
          {renderPrice()}

          {/* Итоговая сумма */}
          {renderTotal()}

          {/* Кнопка удаления */}
          <Button
            size="small"
            color="error"
            onClick={onRemove}
            startIcon={<Iconify icon="eva:trash-2-outline" />}
            sx={{ height: 40 }}
          >
            Удалить
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}