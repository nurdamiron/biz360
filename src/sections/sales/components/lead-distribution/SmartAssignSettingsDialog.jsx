// src/sections/sales/components/lead-distribution/SmartAssignSettingsDialog.jsx
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
  TextField,
  Typography,
  Box,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  alpha,
  IconButton,
  Alert,
  CircularProgress
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

// Material UI иконки
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InfoIcon from '@mui/icons-material/Info';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import BalanceIcon from '@mui/icons-material/Balance';
import WorkIcon from '@mui/icons-material/Work';
import CategoryIcon from '@mui/icons-material/Category';
import HistoryIcon from '@mui/icons-material/History';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import HelpIcon from '@mui/icons-material/Help';

/**
 * Диалоговое окно настроек интеллектуального распределения
 */
export default function SmartAssignSettingsDialog({ 
  open, 
  onClose, 
  settings, 
  onApplySettings, 
  onSmartAssign,
  isAssigning = false 
}) {
  const theme = useTheme();
  const [localSettings, setLocalSettings] = useState(settings);
  const [expanded, setExpanded] = useState('basic');
  
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);
  
  const handleChange = (event) => {
    const { name, checked, value, type } = event.target;
    
    setLocalSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };
  
  const handleApply = () => {
    onApplySettings(localSettings);
    onClose();
  };
  
  const handleSmartAssign = () => {
    onSmartAssign(localSettings);
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
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AutorenewIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6">
              Настройки интеллектуального распределения
            </Typography>
          </Box>
          <Tooltip title="Информация о принципах интеллектуального распределения">
            <IconButton size="small">
              <HelpIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </DialogTitle>
      
      <Alert severity="info" sx={{ mx: 3, mt: 1 }}>
        Интеллектуальное распределение учитывает множество факторов для оптимального назначения лидов сотрудникам, включая историю взаимодействий, специализацию, опыт и текущую нагрузку.
      </Alert>
      
      <DialogContent dividers>
        <Stack spacing={2}>
          {/* Основные настройки */}
          <Accordion 
            expanded={expanded === 'basic'} 
            onChange={handleAccordionChange('basic')}
            sx={{ 
              boxShadow: 'none',
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              '&:before': { display: 'none' },
              borderRadius: '4px !important',
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}
            >
              <Typography variant="subtitle1" fontWeight="medium">
                Основные настройки
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={localSettings.priorityFirst}
                      onChange={handleChange}
                      name="priorityFirst"
                      color="primary"
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PriorityHighIcon sx={{ mr: 1, color: theme.palette.error.main }} />
                      <Box>
                        <Typography variant="body2">Приоритизировать высокоприоритетные лиды</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Сначала распределять лиды с высоким приоритетом
                        </Typography>
                      </Box>
                    </Box>
                  }
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={localSettings.balanceLoad}
                      onChange={handleChange}
                      name="balanceLoad"
                      color="primary"
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <BalanceIcon sx={{ mr: 1, color: theme.palette.warning.main }} />
                      <Box>
                        <Typography variant="body2">Балансировать нагрузку</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Равномерно распределять нагрузку между сотрудниками
                        </Typography>
                      </Box>
                    </Box>
                  }
                />
                
                <TextField
                  label="Максимум лидов на сотрудника"
                  name="maxLeadsPerEmployee"
                  value={localSettings.maxLeadsPerEmployee || ''}
                  onChange={handleChange}
                  type="number"
                  size="small"
                  fullWidth
                  helperText="Оставьте пустым для использования значения из профиля сотрудника"
                  InputProps={{
                    endAdornment: (
                      <Tooltip title="Ограничивает количество лидов, которое можно назначить одному сотруднику">
                        <InfoIcon fontSize="small" color="action" sx={{ ml: 1 }} />
                      </Tooltip>
                    )
                  }}
                />
              </Stack>
            </AccordionDetails>
          </Accordion>
          
          {/* Расширенные настройки */}
          <Accordion 
            expanded={expanded === 'advanced'} 
            onChange={handleAccordionChange('advanced')}
            sx={{ 
              boxShadow: 'none',
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              '&:before': { display: 'none' },
              borderRadius: '4px !important',
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}
            >
              <Typography variant="subtitle1" fontWeight="medium">
                Расширенные настройки
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={localSettings.considerExperience}
                      onChange={handleChange}
                      name="considerExperience"
                      color="primary"
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <WorkIcon sx={{ mr: 1, color: theme.palette.info.main }} />
                      <Box>
                        <Typography variant="body2">Учитывать опыт сотрудников</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Назначать сложные/крупные лиды опытным сотрудникам
                        </Typography>
                      </Box>
                    </Box>
                  }
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={localSettings.considerSpecialization}
                      onChange={handleChange}
                      name="considerSpecialization"
                      color="primary"
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CategoryIcon sx={{ mr: 1, color: theme.palette.secondary.main }} />
                      <Box>
                        <Typography variant="body2">Учитывать специализацию</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Назначать лиды сотрудникам со специализацией в соответствующей отрасли
                        </Typography>
                      </Box>
                    </Box>
                  }
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={localSettings.preserveHistory}
                      onChange={handleChange}
                      name="preserveHistory"
                      color="primary"
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <HistoryIcon sx={{ mr: 1, color: theme.palette.error.main }} />
                      <Box>
                        <Typography variant="body2">Сохранять историю взаимодействий</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Назначать лиды сотрудникам, которые ранее взаимодействовали с этим клиентом
                        </Typography>
                      </Box>
                    </Box>
                  }
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={localSettings.considerPerformance}
                      onChange={handleChange}
                      name="considerPerformance"
                      color="primary"
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <ShowChartIcon sx={{ mr: 1, color: theme.palette.success.main }} />
                      <Box>
                        <Typography variant="body2">Учитывать KPI сотрудников</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Назначать больше лидов сотрудникам с высоким KPI
                        </Typography>
                      </Box>
                    </Box>
                  }
                />
              </Stack>
            </AccordionDetails>
          </Accordion>
          
          {/* Предупреждение о распределении */}
          <Alert 
            severity="warning"
            sx={{ mt: 2 }}
            icon={<AutorenewIcon />}
          >
            Интеллектуальное распределение может изменить текущие назначения лидов. Изменения можно отменить, вручную перетащив лиды обратно.
          </Alert>
        </Stack>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button variant="outlined" color="inherit" onClick={onClose}>
          Отмена
        </Button>
        <Button variant="outlined" color="primary" onClick={handleApply}>
          Сохранить настройки
        </Button>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleSmartAssign}
          disabled={isAssigning}
          startIcon={isAssigning ? <CircularProgress size={20} /> : <AutorenewIcon />}
        >
          {isAssigning ? 'Распределение...' : 'Распределить сейчас'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

SmartAssignSettingsDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  settings: PropTypes.object.isRequired,
  onApplySettings: PropTypes.func.isRequired,
  onSmartAssign: PropTypes.func.isRequired,
  isAssigning: PropTypes.bool
};