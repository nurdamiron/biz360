// src/components/form/NumericField.jsx
import React from 'react';
import { TextField, InputAdornment, Box } from '@mui/material';
import { useFormContext, Controller } from 'react-hook-form';

// Компонент поля с числовым вводом
// Выделен в отдельный компонент для соблюдения правил хуков React
const NumericFieldInput = React.memo(({
  field,
  label,
  prefix,
  suffix,
  disabled,
  min,
  max,
  decimals,
  onChange,
  size,
  helperText,
  error,
  ...restProps
}) => {
  // Форматирование значения
  const formatValue = (val) => {
    if (val === undefined || val === null) return '';
    if (typeof val === 'number' && !isNaN(val)) {
      if (decimals === 0 || val === Math.floor(val)) return val.toString();
      return val.toFixed(decimals);
    }
    return '';
  };

  // Хуки состояния на верхнем уровне компонента
  const [displayValue, setDisplayValue] = React.useState(() => formatValue(field.value));
  
  // Обновление отображаемого значения при изменении значения поля
  React.useEffect(() => {
    setDisplayValue(formatValue(field.value));
  }, [field.value, decimals]);
  
  // Обработчик изменения значения
  const handleChange = (e) => {
    const raw = e.target.value;
    const regex = min < 0 ? /^-?\d*\.?\d*$/ : /^\d*\.?\d*$/;
    
    if (regex.test(raw) || raw === '') {
      setDisplayValue(raw);
      if (raw !== '' && raw !== '-' && raw !== '.') {
        const numVal = parseFloat(raw);
        if (!isNaN(numVal)) {
          const constrainedValue = 
            max !== undefined && numVal > max ? max :
            min !== undefined && numVal < min ? min :
            numVal;
          
          field.onChange(constrainedValue);
          if (onChange) onChange(constrainedValue);
        }
      } else {
        const def = min !== undefined && min > 0 ? min : 0;
        field.onChange(def);
        if (onChange) onChange(def);
      }
    }
  };
  
  // Обработчик потери фокуса
  const handleBlur = () => {
    if (displayValue === '' || displayValue === '-' || displayValue === '.') {
      const def = min !== undefined && min > 0 ? min : 0;
      setDisplayValue(formatValue(def));
      field.onChange(def);
      return;
    }
    
    const numVal = parseFloat(displayValue);
    if (!isNaN(numVal)) {
      let validated = numVal;
      if (min !== undefined && numVal < min) validated = min;
      else if (max !== undefined && numVal > max) validated = max;
      
      setDisplayValue(formatValue(validated));
      field.onChange(parseFloat(validated.toFixed(decimals)));
    }
  };
  
  return (
    <TextField
      {...restProps}
      size={size}
      label={label}
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
      disabled={disabled}
      error={error}
      helperText={helperText}
      InputProps={{
        startAdornment: prefix ? <InputAdornment position="start">{prefix}</InputAdornment> : null,
        endAdornment: suffix ? <InputAdornment position="end">{suffix}</InputAdornment> : null,
      }}
    />
  );
});

export function NumericField({
  name,
  label,
  prefix,
  suffix,
  disabled = false,
  min,
  max,
  decimals = 2,
  onChange,
  size = 'small',
  helperText,
  sx = {},
  ...restProps
}) {
  const { control, formState: { errors } } = useFormContext();
  
  return (
    <Box sx={{ ...sx }}>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <NumericFieldInput
            field={field}
            label={label}
            prefix={prefix}
            suffix={suffix}
            disabled={disabled}
            min={min}
            max={max}
            decimals={decimals}
            onChange={onChange}
            size={size}
            error={!!errors[name]}
            helperText={errors[name]?.message || helperText || ''}
            {...restProps}
            sx={{ width: '100%' }}
          />
        )}
      />
    </Box>
  );
}