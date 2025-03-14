// src/sections/order/price-input.jsx
import React, { useCallback } from 'react';
import { TextField, Typography, Tooltip, InputAdornment, Box } from '@mui/material';
import { useFormContext, Controller } from 'react-hook-form';

// Компонент поля ввода с управляемым состоянием
// Выделен в отдельный компонент для соблюдения правил хуков React
const PriceField = React.memo(({ field, basePrice, disabled, onChange }) => {
  // Функция форматирования значения
  const formatValue = (value) => {
    if (value === undefined || value === null) return '';
    if (typeof value === 'number' && !isNaN(value)) {
      if (value === Math.floor(value)) return value.toString();
      return value.toFixed(2);
    }
    return '';
  };

  // Хуки состояния на верхнем уровне компонента (не внутри callback!)
  const [displayValue, setDisplayValue] = React.useState(() => formatValue(field.value));
  const [priceTooLow, setPriceTooLow] = React.useState(false);
  
  // Обновление состояния при изменении значения поля
  React.useEffect(() => {
    setDisplayValue(formatValue(field.value));
    if (typeof field.value === 'number' && !isNaN(field.value) && basePrice > 0 && field.value < basePrice) {
      setPriceTooLow(true);
    } else {
      setPriceTooLow(false);
    }
  }, [field.value, basePrice]);
  
  // Обработчик изменения значения
  const handleChange = (e) => {
    const raw = e.target.value;
    const regex = /^\d*\.?\d*$/;
    if (regex.test(raw) || raw === '') {
      setDisplayValue(raw);
      if (raw !== '' && raw !== '.') {
        const num = parseFloat(raw);
        if (basePrice > 0 && num < basePrice) setPriceTooLow(true);
        else setPriceTooLow(false);
        if (!isNaN(num)) {
          field.onChange(num);
          if (onChange) onChange(num);
        }
      } else {
        field.onChange(0);
        setPriceTooLow(false);
        if (onChange) onChange(0);
      }
    }
  };
  
  // Обработчик потери фокуса
  const handleBlur = () => {
    if (displayValue === '' || displayValue === '.') {
      setDisplayValue('0');
      field.onChange(0);
      setPriceTooLow(false);
      return;
    }
    const numValue = parseFloat(displayValue);
    if (!isNaN(numValue)) {
      setDisplayValue(formatValue(numValue));
      field.onChange(parseFloat(numValue.toFixed(2)));
    }
  };
  
  return (
    <>
      <TextField
        size="small"
        label="Цена"
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        // disabled={disabled}
        error={priceTooLow}
        helperText=""
        InputProps={{
          startAdornment: <InputAdornment position="start">₸</InputAdornment>,
        }}
        sx={{ width: '100%' }}
      />
      {basePrice > 0 && (
        <Tooltip title="Фиксированная цена, ниже которой устанавливать нельзя">
          <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', mt: 0.5 }}>
            Базовая: {basePrice.toLocaleString()} ₸
          </Typography>
        </Tooltip>
      )}
    </>
  );
});

export function PriceInput({
  name,
  label = 'Цена',
  disabled = false,
  basePrice = 0,
  onChange,
  size = 'small',
  sx = {},
}) {
  const { control } = useFormContext();

  return (
    <Box sx={{ position: 'relative', ...sx }}>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <PriceField
            field={field}
            basePrice={basePrice}
            // disabled={disabled}
            onChange={onChange}
          />
        )}
      />
    </Box>
  );
}