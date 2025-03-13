// src/sections/orders/order-table-filters-result.jsx
import { useCallback } from 'react';

import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { fDateRangeShortLabel } from 'src/utils/format-time';
import { getStatusLabel } from 'src/actions/order';

// ----------------------------------------------------------------------

// Дефолтные пропсы для чипа фильтра
const chipProps = {
  variant: 'soft',
  size: 'small',
  sx: { mt: 0.5 }
};

export function OrderTableFiltersResult({ filters, totalResults, onResetPage, sx }) {
  const { state: currentFilters, setState: updateFilters, resetState: resetFilters } = filters;

  // Сброс фильтра по имени
  const handleRemoveKeyword = useCallback(() => {
    onResetPage();
    updateFilters({ name: '' });
  }, [onResetPage, updateFilters]);

  // Сброс фильтра по статусу
  const handleRemoveStatus = useCallback(() => {
    onResetPage();
    updateFilters({ status: 'all' });
  }, [onResetPage, updateFilters]);

  // Сброс фильтра по дате
  const handleRemoveDate = useCallback(() => {
    onResetPage();
    updateFilters({ startDate: null, endDate: null });
  }, [onResetPage, updateFilters]);

  // Полный сброс всех фильтров
  const handleReset = useCallback(() => {
    onResetPage();
    resetFilters();
  }, [onResetPage, resetFilters]);

  return (
    <Stack
      spacing={1.5}
      alignItems="center"
      direction={{ xs: 'column', md: 'row' }}
      sx={{ px: 2.5, pb: 2, ...sx }}
    >
      <Typography variant="body2" sx={{ color: 'text.disabled' }}>
        Найдено: <strong>{totalResults}</strong>
        {totalResults > 0 && (
          <Typography component="span" variant="body2">
            &nbsp;заказов
          </Typography>
        )}
      </Typography>

      <Stack direction="row" spacing={1} flexWrap="wrap" flex={1}>
        {/* Показываем чип с фильтром по статусу, если он активен */}
        {currentFilters.status !== 'all' && (
          <Chip
            {...chipProps}
            label={getStatusLabel(currentFilters.status)}
            onDelete={handleRemoveStatus}
          />
        )}

        {/* Показываем чип с диапазоном дат, если он активен */}
        {currentFilters.startDate && currentFilters.endDate && (
          <Chip
            {...chipProps}
            label={fDateRangeShortLabel(currentFilters.startDate, currentFilters.endDate)}
            onDelete={handleRemoveDate}
          />
        )}

        {/* Показываем чип с текстом поиска, если он активен */}
        {currentFilters.name && (
          <Chip
            {...chipProps}
            label={`Поиск: ${currentFilters.name}`}
            onDelete={handleRemoveKeyword}
          />
        )}
      </Stack>

      <Button
        color="error"
        onClick={handleReset}
        variant="outlined"
        size="small"
        startIcon={<span className="material-icons-round">refresh</span>}
      >
        Сбросить
      </Button>
    </Stack>
  );
}