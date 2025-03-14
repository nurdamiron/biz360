// OrderItemRow.jsx
import React, { useState, useEffect, useMemo } from 'react';
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
import { 
  calculateItemBonusAndMargin, 
  safeNumber, 
  BASE_BONUS_PERCENTAGE 
} from 'src/utils/bonusCalculator';

// Helper to get field names for consistent access
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

export default function OrderItemRow({ index, onRemove, productList }) {
  const { watch, setValue, getValues } = useFormContext();
  const fieldNames = getFieldNames(index);

  // Component state
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [priceEditable, setPriceEditable] = useState(false);
  const [rowErrors, setRowErrors] = useState([]);
  const [quantityValue, setQuantityValue] = useState('1');

  // Watch for form fields
  const quantity = watch(fieldNames.quantity) || 1;
  const unitPrice = watch(fieldNames.unit_price) || 0;
  const basePrice = watch(fieldNames.base_price) || 0;

  // Sync local quantity state with form
  useEffect(() => {
    setQuantityValue(quantity.toString());
  }, [quantity]);

  // Error checks
  const tooMuch = selectedProduct && quantity > (selectedProduct.quantity || 0);
  const priceTooLow = basePrice > 0 && unitPrice > 0 && unitPrice < basePrice;

  // Calculate bonus and margin when relevant values change
  useEffect(() => {
    // Clear previous errors
    const newErrors = [];

    // Calculate final values if all required data is present
    if (basePrice > 0 && unitPrice > 0 && quantity > 0) {
      // Total price for this line
      const total = quantity * unitPrice;
      setValue(fieldNames.total_price, total);

      // Calculate bonus and margin using the new formula
      const { bonus, marginPercentage } = calculateItemBonusAndMargin(basePrice, unitPrice, quantity);
      setValue(fieldNames.margin_percentage, marginPercentage);
      setValue(fieldNames.potential_bonus, bonus);

      // Dispatch event to notify parent components
      setTimeout(() => {
        const calculatedEvent = new CustomEvent('orderItemUpdated', {
          detail: { index, bonus, marginPercentage }
        });
        document.dispatchEvent(calculatedEvent);
      }, 0);
    } else {
      // Set default values if data is incomplete
      setValue(fieldNames.total_price, 0);
      setValue(fieldNames.margin_percentage, 0);
      setValue(fieldNames.potential_bonus, 0);
    }

    // Add any applicable errors
    if (tooMuch) {
      const available = selectedProduct?.quantity || 0;
      newErrors.push(`Вы пытаетесь заказать больше, чем доступно: ${available} шт.`);
    }
    if (priceTooLow) {
      newErrors.push(`Цена не может быть ниже базовой (${basePrice} ₸)!`);
    }

    setRowErrors(newErrors);
  }, [quantity, unitPrice, basePrice, tooMuch, priceTooLow, selectedProduct, setValue, fieldNames, index]);

  // Product selection handler
  const handleSelectProduct = async (e) => {
    const productId = e.target.value;
    if (!productId) {
      resetFields();
      return;
    }

    // Check for duplicates
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

        // Use base price from product
        const newBase = prod.base_price || prod.price;

        // Fill form fields
        setValue(fieldNames.productId, productId);
        setValue(fieldNames.title, prod.name || '');
        setValue(fieldNames.service, prod.code || '');
        setValue(fieldNames.unit_price, prod.price || 0);
        setValue(fieldNames.base_price, newBase);
        setValue(fieldNames.quantity, 1);
        setQuantityValue('1');

        // Calculate total price, margin and bonus
        setValue(fieldNames.total_price, prod.price || 0);
        
        // Calculate bonus using the new formula
        const { bonus, marginPercentage } = calculateItemBonusAndMargin(newBase, prod.price, 1);
        setValue(fieldNames.margin_percentage, marginPercentage);
        setValue(fieldNames.potential_bonus, bonus);

        // Dispatch event to notify parent components
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

  // Reset all fields
  const resetFields = () => {
    setSelectedProduct(null);
    setPriceEditable(false);
    
    // Reset all form values
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
    
    // Notify parent about changes
    setTimeout(() => {
      const calculatedEvent = new CustomEvent('orderItemUpdated', {
        detail: { index, bonus: 0, marginPercentage: 0 }
      });
      document.dispatchEvent(calculatedEvent);
    }, 0);
  };

  // Handle price change
  const handlePriceChange = (e) => {
    const newPrice = parseFloat(e.target.value);
    if (isNaN(newPrice)) return;
    
    setValue(fieldNames.unit_price, newPrice);
    
    // Recalculate total price
    const total = quantity * newPrice;
    setValue(fieldNames.total_price, total);
    
    // Recalculate margin and bonus
    if (basePrice > 0) {
      const { bonus, marginPercentage } = calculateItemBonusAndMargin(basePrice, newPrice, quantity);
      setValue(fieldNames.margin_percentage, marginPercentage);
      setValue(fieldNames.potential_bonus, bonus);
      
      // Notify parent about changes
      setTimeout(() => {
        const calculatedEvent = new CustomEvent('orderItemUpdated', {
          detail: { index, bonus, marginPercentage }
        });
        document.dispatchEvent(calculatedEvent);
      }, 0);
    }
  };

  // Handle quantity change
  const handleQuantityChange = (e) => {
    const value = e.target.value;
    setQuantityValue(value);
    
    // Skip updates if field is empty
    if (value === '') return;
    
    const newQuantity = parseInt(value, 10);
    if (isNaN(newQuantity) || newQuantity <= 0) return;
    
    setValue(fieldNames.quantity, newQuantity);
    
    // Recalculate if unit price exists
    if (unitPrice > 0) {
      const total = newQuantity * unitPrice;
      setValue(fieldNames.total_price, total);
      
      // Recalculate margin and bonus
      if (basePrice > 0) {
        const { bonus, marginPercentage } = calculateItemBonusAndMargin(basePrice, unitPrice, newQuantity);
        setValue(fieldNames.margin_percentage, marginPercentage);
        setValue(fieldNames.potential_bonus, bonus);
        
        // Notify parent about changes
        setTimeout(() => {
          const calculatedEvent = new CustomEvent('orderItemUpdated', {
            detail: { index, bonus, marginPercentage }
          });
          document.dispatchEvent(calculatedEvent);
        }, 0);
      }
    }
  };

  // Handle quantity field blur
  const handleQuantityBlur = () => {
    if (quantityValue === '' || parseInt(quantityValue, 10) <= 0) {
      setValue(fieldNames.quantity, 1);
      setQuantityValue('1');
      
      // Recalculate with default quantity
      if (unitPrice > 0) {
        setValue(fieldNames.total_price, unitPrice);
        
        // Recalculate margin and bonus
        if (basePrice > 0) {
          const { bonus, marginPercentage } = calculateItemBonusAndMargin(basePrice, unitPrice, 1);
          setValue(fieldNames.margin_percentage, marginPercentage);
          setValue(fieldNames.potential_bonus, bonus);
          
          // Notify parent about changes
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

  // Common field styles
  const commonFieldStyle = {
    '& .MuiOutlinedInput-root': {
      height: '40px'
    }
  };

  // Get bonus and margin values for display
  const bonusVal = watch(fieldNames.potential_bonus) || 0;
  const marginVal = watch(fieldNames.margin_percentage) || 0;
  const isNegativeMargin = marginVal < 0;

  // Memorize bonus message for display
  const bonusMessage = useMemo(() => {
    if (bonusVal === 0) return null;
    
    return (
      <Alert severity={bonusVal > 0 ? "info" : "error"} sx={{ mb: 1 }}>
        Бонус: {bonusVal.toLocaleString()} ₸ &nbsp;/ Маржа: {marginVal.toFixed(1)}%
      </Alert>
    );
  }, [bonusVal, marginVal]);

  return (
    <Box sx={{ mb: 3 }}>
      {/* Display errors if any */}
      {rowErrors.length > 0 && (
        <Alert severity="error" sx={{ mb: 1 }}>
          {rowErrors.map((errMsg, i) => (
            <Box key={i}>{errMsg}</Box>
          ))}
        </Alert>
      )}

      {/* Display bonus information */}
      {bonusMessage}

      {/* Item row */}
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
          {/* Product selector */}
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

          {/* Product code */}
          <TextField
            size="small"
            label="Номенклатурный номер"
            value={watch(fieldNames.service) || ''}
            disabled
            sx={{ width: 150, ...commonFieldStyle }}
          />

          {/* Quantity */}
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

          {/* Price */}
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

          {/* Total */}
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

          {/* Remove button */}
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