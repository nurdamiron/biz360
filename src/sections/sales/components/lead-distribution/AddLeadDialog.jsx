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
  InputAdornment
} from '@mui/material';

/**
 * Диалоговое окно для добавления нового лида
 */
export default function AddLeadDialog({ open, onClose, onAddLead }) {
  const initialFormData = {
    name: '',
    contact: '',
    status: 'Новый',
    priority: 'Средний',
    potential_amount: '',
    source: 'Сайт',
    contact_deadline: ''
  };
  
  const [formData, setFormData] = useState(initialFormData);
  
  useEffect(() => {
    if (open) {
      // Устанавливаем дату дедлайна по умолчанию (+2 дня от текущей даты)
      const today = new Date();
      const deadline = new Date(today);
      deadline.setDate(deadline.getDate() + 2);
      
      setFormData({
        ...initialFormData,
        contact_deadline: deadline.toLocaleDateString('ru-RU')
      });
    }
  }, [open]);
  
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = () => {
    onAddLead(formData);
    setFormData(initialFormData);
    onClose();
  };
  
  const isFormValid = () => (
    formData.name.trim() !== '' &&
    formData.contact.trim() !== '' &&
    formData.potential_amount > 0 &&
    formData.contact_deadline.trim() !== ''
  );
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle>
        Добавить нового лида
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Название организации"
            name="name"
            value={formData.name}
            onChange={handleChange}
            fullWidth
            required
          />
          
          <TextField
            label="Контактное лицо"
            name="contact"
            value={formData.contact}
            onChange={handleChange}
            fullWidth
            required
          />
          
          <FormControl fullWidth>
            <InputLabel>Приоритет</InputLabel>
            <Select
              name="priority"
              value={formData.priority}
              label="Приоритет"
              onChange={handleChange}
            >
              <MenuItem value="Высокий">Высокий</MenuItem>
              <MenuItem value="Средний">Средний</MenuItem>
              <MenuItem value="Низкий">Низкий</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            label="Потенциальная сумма"
            name="potential_amount"
            value={formData.potential_amount}
            onChange={handleChange}
            type="number"
            fullWidth
            required
            InputProps={{
              startAdornment: <InputAdornment position="start">₸</InputAdornment>,
            }}
          />
          
          <FormControl fullWidth>
            <InputLabel>Источник</InputLabel>
            <Select
              name="source"
              value={formData.source}
              label="Источник"
              onChange={handleChange}
            >
              <MenuItem value="Сайт">Сайт</MenuItem>
              <MenuItem value="Звонок">Звонок</MenuItem>
              <MenuItem value="Email-рассылка">Email-рассылка</MenuItem>
              <MenuItem value="Выставка">Выставка</MenuItem>
              <MenuItem value="Рекомендация">Рекомендация</MenuItem>
              <MenuItem value="Партнер">Партнер</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            label="Дедлайн первого контакта"
            name="contact_deadline"
            value={formData.contact_deadline}
            onChange={handleChange}
            fullWidth
            required
            helperText="Формат: дд.мм.гггг"
          />
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
          disabled={!isFormValid()}
        >
          Добавить
        </Button>
      </DialogActions>
    </Dialog>
  );
}

AddLeadDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onAddLead: PropTypes.func.isRequired
};