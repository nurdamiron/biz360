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
  InputAdornment
} from '@mui/material';

/**
 * Диалоговое окно фильтров
 */
export default function FilterDialog({ open, onClose, filters, onApplyFilters }) {
  const [localFilters, setLocalFilters] = useState(filters);
  
  useEffect(() => {
    setLocalFilters(filters);
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
      source: 'all'
    };
    setLocalFilters(resetFilters);
    onApplyFilters(resetFilters);
    onClose();
  };
  
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
      <DialogTitle>
        Фильтры и сортировка
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <FormControl fullWidth size="small">
            <InputLabel>Приоритет</InputLabel>
            <Select
              name="priority"
              value={localFilters.priority}
              label="Приоритет"
              onChange={handleChange}
            >
              <MenuItem value="all">Все приоритеты</MenuItem>
              <MenuItem value="Высокий">Высокий</MenuItem>
              <MenuItem value="Средний">Средний</MenuItem>
              <MenuItem value="Низкий">Низкий</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl fullWidth size="small">
            <InputLabel>Источник</InputLabel>
            <Select
              name="source"
              value={localFilters.source}
              label="Источник"
              onChange={handleChange}
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
          
          <TextField
            label="Мин. сумма сделки"
            name="minAmount"
            value={localFilters.minAmount}
            onChange={handleChange}
            type="number"
            size="small"
            fullWidth
            InputProps={{
              startAdornment: <InputAdornment position="start">₸</InputAdornment>,
            }}
          />
          
          <TextField
            label="Макс. сумма сделки"
            name="maxAmount"
            value={localFilters.maxAmount}
            onChange={handleChange}
            type="number"
            size="small"
            fullWidth
            InputProps={{
              startAdornment: <InputAdornment position="start">₸</InputAdornment>,
            }}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button variant="outlined" color="inherit" onClick={handleReset}>
          Сбросить
        </Button>
        <Button variant="contained" onClick={handleApply}>
          Применить
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