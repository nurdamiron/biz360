// src/sections/sales/components/lead-distribution/AddLeadDialog.jsx
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  FormHelperText,
  Typography,
  Box,
  Chip,
  alpha,
  CircularProgress
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

// Material UI иконки
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import SourceIcon from '@mui/icons-material/Source';
import EventIcon from '@mui/icons-material/Event';
import CategoryIcon from '@mui/icons-material/Category';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import AddCircleIcon from '@mui/icons-material/AddCircle';

/**
 * Диалоговое окно для добавления нового лида
 */
export default function AddLeadDialog({ 
  open, 
  onClose, 
  onAddLead,
  isAdding = false 
}) {
  const theme = useTheme();
  
  // Начальное состояние формы
  const initialFormData = {
    name: '',
    contact: '',
    status: 'Новый',
    priority: 'Средний',
    potential_amount: '',
    source: 'Сайт',
    industry: '',
    business_size: 'Средний',
    contact_deadline: ''
  };
  
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  
  // Сброс формы при открытии диалога
  useEffect(() => {
    if (open) {
      // Устанавливаем дату дедлайна по умолчанию (+2 дня от текущей даты)
      const today = new Date();
      const deadline = new Date(today);
      deadline.setDate(deadline.getDate() + 2);
      
      const formattedDeadline = deadline.toLocaleDateString('ru-RU');
      
      setFormData({
        ...initialFormData,
        contact_deadline: formattedDeadline
      });
      setErrors({});
    }
  }, [open]);
  
  // Обработчик изменения полей формы
  const handleChange = (event) => {
    const { name, value } = event.target;
    
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Очищаем ошибку для измененного поля
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };
  
  // Валидация данных формы
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Название организации обязательно';
    }
    
    if (!formData.contact.trim()) {
      newErrors.contact = 'Контактное лицо обязательно';
    }
    
    if (!formData.potential_amount) {
      newErrors.potential_amount = 'Потенциальная сумма обязательна';
    } else if (Number(formData.potential_amount) <= 0) {
      newErrors.potential_amount = 'Сумма должна быть больше нуля';
    }
    
    if (!formData.contact_deadline) {
      newErrors.contact_deadline = 'Дедлайн контакта обязателен';
    } else {
      // Проверка формата даты (дд.мм.гггг)
      const datePattern = /^\d{2}\.\d{2}\.\d{4}$/;
      if (!datePattern.test(formData.contact_deadline)) {
        newErrors.contact_deadline = 'Неверный формат даты (дд.мм.гггг)';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Обработчик отправки формы
  const handleSubmit = () => {
    if (validateForm()) {
      // Подготавливаем данные для отправки (преобразуем типы данных)
      const leadData = {
        ...formData,
        potential_amount: Number(formData.potential_amount)
      };
      
      onAddLead(leadData);
    }
  };
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <AddCircleIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6">
            Добавить нового лида
          </Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {/* Основная информация */}
          <Stack spacing={2}>
            <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center' }}>
              <BusinessIcon fontSize="small" sx={{ mr: 1, color: theme.palette.primary.main }} />
              Информация о компании
            </Typography>
            
            <TextField
              label="Название организации"
              name="name"
              value={formData.name}
              onChange={handleChange}
              fullWidth
              required
              error={!!errors.name}
              helperText={errors.name || ''}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <BusinessIcon color="action" fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
            
            <TextField
              label="Контактное лицо"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              fullWidth
              required
              error={!!errors.contact}
              helperText={errors.contact || ''}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon color="action" fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Отрасль</InputLabel>
                <Select
                  name="industry"
                  value={formData.industry}
                  label="Отрасль"
                  onChange={handleChange}
                  startAdornment={
                    <InputAdornment position="start">
                      <CategoryIcon color="action" fontSize="small" />
                    </InputAdornment>
                  }
                >
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
              
              <FormControl fullWidth>
                <InputLabel>Размер бизнеса</InputLabel>
                <Select
                  name="business_size"
                  value={formData.business_size}
                  label="Размер бизнеса"
                  onChange={handleChange}
                  startAdornment={
                    <InputAdornment position="start">
                      <BusinessCenterIcon color="action" fontSize="small" />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="Малый">Малый</MenuItem>
                  <MenuItem value="Средний">Средний</MenuItem>
                  <MenuItem value="Крупный">Крупный</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Stack>
          
          {/* Информация о лиде */}
          <Stack spacing={2} sx={{ mt: 3 }}>
            <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center' }}>
              <SourceIcon fontSize="small" sx={{ mr: 1, color: theme.palette.primary.main }} />
              Информация о лиде
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Приоритет</InputLabel>
                <Select
                  name="priority"
                  value={formData.priority}
                  label="Приоритет"
                  onChange={handleChange}
                  startAdornment={
                    <InputAdornment position="start">
                      <PriorityHighIcon color="action" fontSize="small" />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="Высокий">
                    <Chip 
                      label="Высокий" 
                      color="error" 
                      size="small" 
                      sx={{ height: 24 }}
                    />
                  </MenuItem>
                  <MenuItem value="Средний">
                    <Chip 
                      label="Средний" 
                      color="warning" 
                      size="small"
                      sx={{ height: 24 }}
                    />
                  </MenuItem>
                  <MenuItem value="Низкий">
                    <Chip 
                      label="Низкий" 
                      color="success" 
                      size="small"
                      sx={{ height: 24 }}
                    />
                  </MenuItem>
                </Select>
              </FormControl>
              
              <FormControl fullWidth>
                <InputLabel>Источник</InputLabel>
                <Select
                  name="source"
                  value={formData.source}
                  label="Источник"
                  onChange={handleChange}
                  startAdornment={
                    <InputAdornment position="start">
                      <SourceIcon color="action" fontSize="small" />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="Сайт">Сайт</MenuItem>
                  <MenuItem value="Звонок">Звонок</MenuItem>
                  <MenuItem value="Email-рассылка">Email-рассылка</MenuItem>
                  <MenuItem value="Выставка">Выставка</MenuItem>
                  <MenuItem value="Рекомендация">Рекомендация</MenuItem>
                  <MenuItem value="Партнер">Партнер</MenuItem>
                </Select>
              </FormControl>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Потенциальная сумма"
                name="potential_amount"
                value={formData.potential_amount}
                onChange={handleChange}
                type="number"
                fullWidth
                required
                error={!!errors.potential_amount}
                helperText={errors.potential_amount || ''}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₸</InputAdornment>,
                }}
              />
              
              <TextField
                label="Дедлайн первого контакта"
                name="contact_deadline"
                value={formData.contact_deadline}
                onChange={handleChange}
                fullWidth
                required
                error={!!errors.contact_deadline}
                helperText={errors.contact_deadline || 'Формат: дд.мм.гггг'}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EventIcon color="action" fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          </Stack>
        </Stack>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button variant="outlined" color="inherit" onClick={onClose}>
          Отмена
        </Button>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleSubmit}
          disabled={isAdding}
          startIcon={isAdding ? <CircularProgress size={20} /> : <AddCircleIcon />}
        >
          {isAdding ? 'Добавление...' : 'Добавить лид'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

AddLeadDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onAddLead: PropTypes.func.isRequired,
  isAdding: PropTypes.bool
};