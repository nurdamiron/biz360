// src/sections/sales/components/lead-interaction/AddInteractionDialog.jsx
import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  Typography,
  Stack,
  Rating,
  useTheme
} from '@mui/material';

/**
 * Компонент диалогового окна для добавления взаимодействия с лидом
 */
export default function AddInteractionDialog({ open, onClose, onSubmit }) {
  const theme = useTheme();
  
  // Состояние формы
  const [formData, setFormData] = useState({
    type: 'Звонок',
    date: new Date().toISOString().slice(0, 16),
    duration: 15,
    result: '',
    notes: '',
    lead_id: '',
    quality_score: 75
  });
  
  // Обработчик изменения полей формы
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Обработчик изменения рейтинга качества
  const handleQualityChange = (_, newValue) => {
    setFormData(prev => ({ ...prev, quality_score: newValue * 20 })); // 1-5 -> 20-100
  };
  
  // Обработчик отправки формы
  const handleSubmit = () => {
    onSubmit(formData);
    
    // Сброс формы после отправки
    setFormData({
      type: 'Звонок',
      date: new Date().toISOString().slice(0, 16),
      duration: 15,
      result: '',
      notes: '',
      lead_id: '',
      quality_score: 75
    });
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
      <DialogTitle>Добавить новое взаимодействие</DialogTitle>
      
      <DialogContent dividers>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="ID лида"
            name="lead_id"
            value={formData.lead_id}
            onChange={handleChange}
            fullWidth
            required
            helperText="Введите ID лида или имя клиента"
          />
          
          <TextField
            select
            label="Тип взаимодействия"
            name="type"
            value={formData.type}
            onChange={handleChange}
            fullWidth
            required
          >
            <MenuItem value="Звонок">Звонок</MenuItem>
            <MenuItem value="Email">Email</MenuItem>
            <MenuItem value="Встреча">Встреча</MenuItem>
            <MenuItem value="Сообщение">Сообщение</MenuItem>
          </TextField>
          
          <TextField
            label="Дата и время"
            name="date"
            type="datetime-local"
            value={formData.date}
            onChange={handleChange}
            fullWidth
            required
            InputLabelProps={{ shrink: true }}
          />
          
          <TextField
            label="Длительность (минуты)"
            name="duration"
            type="number"
            value={formData.duration}
            onChange={handleChange}
            fullWidth
            required
            inputProps={{ min: 1 }}
          />
          
          <TextField
            label="Результат взаимодействия"
            name="result"
            value={formData.result}
            onChange={handleChange}
            fullWidth
            required
            placeholder="Например: Клиент запросил КП, назначена презентация и т.д."
          />
          
          <TextField
            label="Заметки"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            multiline
            rows={3}
            fullWidth
            placeholder="Дополнительная информация о взаимодействии"
          />
          
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Оценка качества взаимодействия
            </Typography>
            <Rating
              name="quality_rating"
              value={formData.quality_score / 20}
              onChange={handleQualityChange}
              precision={0.5}
              size="large"
            />
            <Typography variant="caption" color="text.secondary">
              {formData.quality_score}% - {
                formData.quality_score >= 80 ? 'Отлично' : 
                formData.quality_score >= 60 ? 'Хорошо' : 
                formData.quality_score >= 40 ? 'Удовлетворительно' : 
                'Нуждается в улучшении'
              }
            </Typography>
          </Box>
        </Stack>
      </DialogContent>
      
      <DialogActions sx={{ p: 2 }}>
        <Button 
          onClick={onClose} 
          variant="outlined"
        >
          Отмена
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          disabled={!formData.lead_id || !formData.result}
        >
          Добавить
        </Button>
      </DialogActions>
    </Dialog>
  );
}

AddInteractionDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired
};