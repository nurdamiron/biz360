// src/sections/sales/components/lead-interaction/InteractionFilters.jsx
import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Stack,
  Chip,
  useTheme
} from '@mui/material';

// Заглушки для иконок
const Icons = {
  Call: '📞',
  Email: '📧',
  Meeting: '📅',
  Message: '💬',
};

/**
 * Компонент фильтров для взаимодействий с лидами
 */
export default function InteractionFilters({ 
  filterType, 
  sortOrder, 
  onTypeFilterChange, 
  onSortOrderChange 
}) {
  const theme = useTheme();
  
  return (
    <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      {/* Фильтры по типу взаимодействия */}
      <Stack direction="row" spacing={1}>
        <Chip
          label="Все"
          onClick={() => onTypeFilterChange('all')}
          variant={filterType === 'all' ? 'filled' : 'outlined'}
          color={filterType === 'all' ? 'primary' : 'default'}
        />
        <Chip
          label="Звонки"
          onClick={() => onTypeFilterChange('Звонок')}
          variant={filterType === 'Звонок' ? 'filled' : 'outlined'}
          color={filterType === 'Звонок' ? 'primary' : 'default'}
          icon={<Box component="span">{Icons.Call}</Box>}
        />
        <Chip
          label="Встречи"
          onClick={() => onTypeFilterChange('Встреча')}
          variant={filterType === 'Встреча' ? 'filled' : 'outlined'}
          color={filterType === 'Встреча' ? 'primary' : 'default'}
          icon={<Box component="span">{Icons.Meeting}</Box>}
        />
        <Chip
          label="Email"
          onClick={() => onTypeFilterChange('Email')}
          variant={filterType === 'Email' ? 'filled' : 'outlined'}
          color={filterType === 'Email' ? 'primary' : 'default'}
          icon={<Box component="span">{Icons.Email}</Box>}
        />
      </Stack>
      
      {/* Сортировка по дате */}
      <Stack direction="row" spacing={1}>
        <Chip
          label="Новые сначала"
          onClick={() => onSortOrderChange('newest')}
          variant={sortOrder === 'newest' ? 'filled' : 'outlined'}
          color={sortOrder === 'newest' ? 'primary' : 'default'}
          size="small"
        />
        <Chip
          label="Старые сначала"
          onClick={() => onSortOrderChange('oldest')}
          variant={sortOrder === 'oldest' ? 'filled' : 'outlined'}
          color={sortOrder === 'oldest' ? 'primary' : 'default'}
          size="small"
        />
      </Stack>
    </Box>
  );
}

InteractionFilters.propTypes = {
  filterType: PropTypes.string.isRequired,
  sortOrder: PropTypes.string.isRequired,
  onTypeFilterChange: PropTypes.func.isRequired,
  onSortOrderChange: PropTypes.func.isRequired
};