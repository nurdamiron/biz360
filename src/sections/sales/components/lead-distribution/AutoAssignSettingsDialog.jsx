// src/sections/sales/components/lead-distribution/AutoAssignSettingsDialog.jsx
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  FormControlLabel,
  Switch,
  TextField
} from '@mui/material';

/**
 * Диалоговое окно настроек автоматического распределения
 */
export default function AutoAssignSettingsDialog({ open, onClose, settings, onApplySettings, onAutoAssign }) {
  const [localSettings, setLocalSettings] = useState(settings);
  
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);
  
  const handleChange = (event) => {
    const { name, checked, value } = event.target;
    
    setLocalSettings(prev => ({
      ...prev,
      [name]: event.target.type === 'checkbox' ? checked : value
    }));
  };
  
  const handleApply = () => {
    onApplySettings(localSettings);
    onClose();
  };
  
  const handleAutoAssign = () => {
    onAutoAssign(localSettings);
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
        Настройки автоматического распределения
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <FormControlLabel
            control={
              <Switch
                checked={localSettings.priorityFirst}
                onChange={handleChange}
                name="priorityFirst"
              />
            }
            label="Сначала распределять лиды с высоким приоритетом"
          />
          
          <FormControlLabel
            control={
              <Switch
                checked={localSettings.balanceLoad}
                onChange={handleChange}
                name="balanceLoad"
              />
            }
            label="Балансировать нагрузку между сотрудниками"
          />
          
          <FormControlLabel
            control={
              <Switch
                checked={localSettings.considerExperience}
                onChange={handleChange}
                name="considerExperience"
              />
            }
            label="Учитывать опыт сотрудников"
          />
          
          <TextField
            label="Макс. лидов на сотрудника"
            name="maxLeadsPerEmployee"
            value={localSettings.maxLeadsPerEmployee || ''}
            onChange={handleChange}
            type="number"
            size="small"
            fullWidth
            helperText="Оставьте пустым для использования значения из профиля сотрудника"
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button variant="outlined" color="inherit" onClick={onClose}>
          Отмена
        </Button>
        <Button variant="outlined" color="primary" onClick={handleApply}>
          Сохранить настройки
        </Button>
        <Button variant="contained" color="primary" onClick={handleAutoAssign}>
          Распределить
        </Button>
      </DialogActions>
    </Dialog>
  );
}

AutoAssignSettingsDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  settings: PropTypes.object.isRequired,
  onApplySettings: PropTypes.func.isRequired,
  onAutoAssign: PropTypes.func.isRequired
};