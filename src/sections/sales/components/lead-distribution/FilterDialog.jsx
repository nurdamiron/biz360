// src/sections/sales/components/lead-distribution/FilterDialog.jsx
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Typography,
  Box,
  Divider,
  Chip,
  IconButton,
  Tooltip,
  alpha
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

// Material UI иконки
import FilterListIcon from '@mui/icons-material/FilterList';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import MoneyIcon from '@mui/icons-material/Money';
import BusinessIcon from '@mui/icons-material/Business';
import SourceIcon from '@mui/icons-material/Source';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import InfoIcon from '@mui/icons-material/Info';

/**
 * Диалоговое окно фильтров
 */
export default function FilterDialog({ open, onClose, filters, onApplyFilters }) {
  const theme = useTheme();
  const [localFilters, setLocalFilters] = useState(filters);
  const [appliedCount, setAppliedCount] = useState(0);
  
  useEffect(() => {
    setLocalFilters(filters);
    
    // Подсчет примененных фильтров
    let count = 0;
    if (filters.priority !== 'all') count++;
    if (filters.source !== 'all') count++;
    if (filters.industry !== 'all') count++;
    if (filters.minAmount) count++;
    if (filters.maxAmount) count++;
    setAppliedCount(count);
  }, [filters]);
  
  const handleChange = (event) => {
    const { name, value } = event.target;
    setLocalFilters(prev => ({ ...prev, [name]: value }));
  };
  
  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };
  
  const handleReset = () => {
    const resetFilters = {
      priority: 'all',
      minAmount: '',
      maxAmount: '',
      source: 'all',
      industry: 'all'
    };
    setLocalFilters(resetFilters);
    onApplyFilters(resetFilters);
    onClose();
  };
  
  const getActiveFiltersCount = () => {
    let count = 0;
    if (localFilters.priority !== 'all') count++;
    if (localFilters.source !== 'all') count++;
    if (localFilters.industry !== 'all') count++;
    if (localFilters.minAmount) count++;
    if (localFilters.maxAmount) count++;
    return count;
  };
  
  const activeFiltersCount = getActiveFiltersCount();
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
            <FilterListIcon sx={{ mr: 1 }} />
            Фильтры и сортировка
            {appliedCount > 0 && (
              <Chip 
                label={appliedCount} 
                color="primary" 
                size="small"
                sx={{ ml: 1, height: 20, minWidth: 20 }}
              />
            )}
          </Typography>
          <Tooltip title="Сбросить все фильтры">
            <IconButton size="small" onClick={handleReset} disabled={activeFiltersCount === 0}>
              <RestartAltIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        <Stack spacing={3}>
          <Box>
            <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <PriorityHighIcon fontSize="small" sx={{ mr: 0.5, color: theme.palette.error.main }} />
              Приоритет
            </Typography>
            <FormControl fullWidth size="small">
              <Select
                name="priority"
                value={localFilters.priority}
                onChange={handleChange}
                displayEmpty
              >
                <MenuItem value="all">Все приоритеты</MenuItem>
                <MenuItem value="Высокий">Высокий</MenuItem>
                <MenuItem value="Средний">Средний</MenuItem>
                <MenuItem value="Низкий">Низкий</MenuItem>
              </Select>
            </FormControl>
          </Box>
          
          <Box>
            <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <SourceIcon fontSize="small" sx={{ mr: 0.5, color: theme.palette.primary.main }} />
              Источник
            </Typography>
            <FormControl fullWidth size="small">
              <Select
                name="source"
                value={localFilters.source}
                onChange={handleChange}
                displayEmpty
              >
                <MenuItem value="all">Все источники</MenuItem>
                <MenuItem value="Сайт">Сайт</MenuItem>
                <MenuItem value="Звонок">Звонок</MenuItem>
                <MenuItem value="Email-рассылка">Email-рассылка</MenuItem>
                <MenuItem value="Выставка">Выставка</MenuItem>
                <MenuItem value="Рекомендация">Рекомендация</MenuItem>
                <MenuItem value="Партнер">Партнер</MenuItem>
              </Select>
            </FormControl>
          </Box>
          
          <Box>
            <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <BusinessIcon fontSize="small" sx={{ mr: 0.5, color: theme.palette.info.main }} />
              Отрасль
            </Typography>
            <FormControl fullWidth size="small">
              <Select
                name="industry"
                value={localFilters.industry}
                onChange={handleChange}
                displayEmpty
              >
                <MenuItem value="all">Все отрасли</MenuItem>
                <MenuItem value="IT">IT</MenuItem>
                <MenuItem value="Финансы">Финансы</MenuItem>
                <MenuItem value="Телекоммуникации">Телекоммуникации</MenuItem>
                <MenuItem value="Розничная торговля">Розничная торговля</MenuItem>
                <MenuItem value="Производство">Производство</MenuItem>
                <MenuItem value="Строительство">Строительство</MenuItem>
                <MenuItem value="Логистика">Логистика</MenuItem>
                <MenuItem value="Образование">Образование</MenuItem>
                <MenuItem value="Здравоохранение">Здравоохранение</MenuItem>
                <MenuItem value="Другое">Другое</MenuItem>
              </Select>
            </FormControl>
          </Box>
          
          <Divider>
            <Chip 
              label="Потенциальная сумма" 
              size="small" 
              icon={<MoneyIcon />}
            />
          </Divider>
          
          <Stack direction="row" spacing={2}>
            <TextField
              label="Мин. сумма"
              name="minAmount"
              value={localFilters.minAmount}
              onChange={handleChange}
              type="number"
              size="small"
              fullWidth
              InputProps={{
                startAdornment: <InputAdornment position="start">₸</InputAdornment>,
                inputProps: { min: 0 }
              }}
            />
            
            <TextField
              label="Макс. сумма"
              name="maxAmount"
              value={localFilters.maxAmount}
              onChange={handleChange}
              type="number"
              size="small"
              fullWidth
              InputProps={{
                startAdornment: <InputAdornment position="start">₸</InputAdornment>,
                inputProps: { min: 0 }
              }}
            />
          </Stack>
          
          {localFilters.minAmount && localFilters.maxAmount && 
           parseInt(localFilters.minAmount) > parseInt(localFilters.maxAmount) && (
            <Typography variant="caption" color="error">
              Минимальная сумма не может быть больше максимальной
            </Typography>
          )}
          
          <Box sx={{ 
            p: 2, 
            bgcolor: alpha(theme.palette.info.main, 0.05), 
            borderRadius: 1,
            border: `1px dashed ${alpha(theme.palette.info.main, 0.2)}` 
          }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
              <InfoIcon fontSize="small" sx={{ mt: 0.5, mr: 1, color: theme.palette.info.main }} />
              <Typography variant="caption" color="text.secondary">
                Фильтрация поможет сосредоточиться на наиболее важных лидах. 
                Используйте комбинацию фильтров для более точного результата.
              </Typography>
            </Box>
          </Box>
        </Stack>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button 
          variant="outlined" 
          color="inherit" 
          onClick={onClose}
          startIcon={<RestartAltIcon />}
        >
          Отмена
        </Button>
        <Button 
          variant="contained" 
          onClick={handleApply}
          startIcon={<FilterListIcon />}
          disabled={
            localFilters.minAmount && 
            localFilters.maxAmount && 
            parseInt(localFilters.minAmount) > parseInt(localFilters.maxAmount)
          }
        >
          Применить {activeFiltersCount > 0 && `(${activeFiltersCount})`}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

FilterDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  filters: PropTypes.object.isRequired,
  onApplyFilters: PropTypes.func.isRequired
};