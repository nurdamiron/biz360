// src/sections/sales/components/lead-interaction/InteractionDetailsDialog.jsx
import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Divider,
  Paper,
  Stack,
  Grid,
  Chip,
  Alert,
  Rating,
  alpha,
  useTheme
} from '@mui/material';

// Заглушки для иконок
const Icons = {
  Call: '📞',
  Email: '📧',
  Meeting: '📅',
  Message: '💬',
  Robot: '🤖',
  Time: '⏱️',
  Star: '⭐',
  Info: 'ℹ️',
  Check: '✓',
  Warning: '⚠️',
  Success: '✅',
  Error: '❌',
  Calendar: '📅',
  Phone: '📱',
  Mail: '📨',
  Person: '👤',
  Note: '📝',
  Play: '▶️',
};

/**
 * Компонент диалогового окна для отображения деталей и анализа взаимодействия
 */
export default function InteractionDetailsDialog({ open, interaction, onClose }) {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  
  // Если взаимодействие не передано, не отображаем диалог
  if (!interaction) {
    return null;
  }
  
  // Получение цвета для оценки качества
  const getQualityColor = (score) => {
    if (score >= 80) return theme.palette.success.main;
    if (score >= 60) return theme.palette.warning.main;
    return theme.palette.error.main;
  };
  
  // Получение текстовой оценки качества
  const getQualityText = (score) => {
    if (score >= 80) return 'Отлично';
    if (score >= 60) return 'Хорошо';
    if (score >= 40) return 'Удовлетворительно';
    return 'Нуждается в улучшении';
  };
  
  // Получение стиля для типа взаимодействия
  const getInteractionTypeStyle = (type) => {
    const styles = {
      'Звонок': {
        icon: Icons.Call,
        color: theme.palette.primary.main,
        bgColor: alpha(theme.palette.primary.main, 0.1)
      },
      'Email': {
        icon: Icons.Email,
        color: theme.palette.info.main,
        bgColor: alpha(theme.palette.info.main, 0.1)
      },
      'Встреча': {
        icon: Icons.Meeting,
        color: theme.palette.success.main,
        bgColor: alpha(theme.palette.success.main, 0.1)
      },
      'Сообщение': {
        icon: Icons.Message,
        color: theme.palette.warning.main,
        bgColor: alpha(theme.palette.warning.main, 0.1)
      }
    };
    
    return styles[type] || {
      icon: Icons.Message,
      color: theme.palette.grey[600],
      bgColor: alpha(theme.palette.grey[600], 0.1)
    };
  };
  
  // Форматирование даты
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Получение типа и стиля взаимодействия
  const typeStyle = getInteractionTypeStyle(interaction.type);
  const qualityColor = getQualityColor(interaction.quality_score || 0);
  
  // Обработчик запроса анализа ИИ
  const handleRequestAnalysis = () => {
    setLoading(true);
    
    // Имитация запроса к API для анализа взаимодействия
    setTimeout(() => {
      setLoading(false);
      onClose(); // Закрываем диалог после "завершения" запроса
      
      // В реальном приложении здесь должен быть API запрос
      // и обновление данных взаимодействия
    }, 2000);
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
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: typeStyle.bgColor,
            color: typeStyle.color,
            fontSize: '1.25rem',
            mr: 1.5
          }}>
            {typeStyle.icon}
          </Box>
          <Typography variant="h6">
            {interaction.type} с лидом #{interaction.lead_id}
          </Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        <Grid container spacing={3}>
          {/* Основная информация о взаимодействии */}
          <Grid item xs={12} md={6}>
            <Paper 
              variant="outlined" 
              sx={{ 
                p: 2, 
                borderRadius: 2,
                borderColor: alpha(theme.palette.primary.main, 0.2),
                mb: { xs: 2, md: 0 }
              }}
            >
              <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                Информация о взаимодействии
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Stack spacing={1.5}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <Box sx={{ 
                    color: theme.palette.text.secondary,
                    fontSize: '1rem',
                    mt: 0.25,
                    mr: 1.5,
                    width: 20,
                    textAlign: 'center'
                  }}>
                    {Icons.Calendar}
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Дата и время
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {formatDate(interaction.date)}
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <Box sx={{ 
                    color: theme.palette.text.secondary,
                    fontSize: '1rem',
                    mt: 0.25,
                    mr: 1.5,
                    width: 20,
                    textAlign: 'center'
                  }}>
                    {Icons.Time}
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Длительность
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {interaction.duration} минут
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <Box sx={{ 
                    color: theme.palette.text.secondary,
                    fontSize: '1rem',
                    mt: 0.25,
                    mr: 1.5,
                    width: 20,
                    textAlign: 'center'
                  }}>
                    {Icons.Person}
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Сотрудник
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      ID: {interaction.created_by || 'Не указан'}
                    </Typography>
                  </Box>
                </Box>
                
                <Divider />
                
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <Box sx={{ 
                    color: theme.palette.text.secondary,
                    fontSize: '1rem',
                    mt: 0.25,
                    mr: 1.5,
                    width: 20,
                    textAlign: 'center'
                  }}>
                    {Icons.Check}
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Результат
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {interaction.result}
                    </Typography>
                  </Box>
                </Box>
                
                {interaction.notes && (
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <Box sx={{ 
                      color: theme.palette.text.secondary,
                      fontSize: '1rem',
                      mt: 0.25,
                      mr: 1.5,
                      width: 20,
                      textAlign: 'center'
                    }}>
                      {Icons.Note}
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Заметки
                      </Typography>
                      <Typography variant="body1">
                        {interaction.notes}
                      </Typography>
                    </Box>
                  </Box>
                )}
                
                <Divider />
                
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Оценка качества
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    <Rating
                      value={Math.round(interaction.quality_score / 20)}
                      readOnly
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    <Typography
                      variant="body2"
                      sx={{
                        color: qualityColor,
                        fontWeight: 'bold'
                      }}
                    >
                      {getQualityText(interaction.quality_score)}
                    </Typography>
                  </Box>
                  <Chip
                    label={`${interaction.quality_score}%`}
                    size="small"
                    sx={{
                      bgcolor: alpha(qualityColor, 0.1),
                      color: qualityColor,
                      fontWeight: 'bold'
                    }}
                  />
                </Box>
                
                {/* Дополнительная информация для звонков */}
                {interaction.type === 'Звонок' && interaction.recording_url && (
                  <Box sx={{ mt: 1 }}>
                    <Button
                      variant="outlined"
                      startIcon={Icons.Play}
                      size="small"
                      fullWidth
                    >
                      Прослушать запись
                    </Button>
                  </Box>
                )}
              </Stack>
            </Paper>
          </Grid>
          
          {/* Анализ ИИ */}
          <Grid item xs={12} md={6}>
            <Paper 
              variant="outlined" 
              sx={{ 
                p: 2, 
                borderRadius: 2,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderColor: interaction.ai_feedback 
                  ? alpha(theme.palette.success.main, 0.2)
                  : alpha(theme.palette.warning.main, 0.2),
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box sx={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: alpha(theme.palette.info.main, 0.1),
                  color: theme.palette.info.main,
                  fontSize: '1rem',
                  mr: 1
                }}>
                  {Icons.Robot}
                </Box>
                <Typography variant="subtitle1" fontWeight="bold">
                  ИИ анализ взаимодействия
                </Typography>
              </Box>
              
              <Divider sx={{ mb: 2 }} />
              
              {interaction.ai_feedback ? (
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" paragraph>
                    {interaction.ai_feedback}
                  </Typography>
                  
                  {/* Рекомендации */}
                  <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                    Рекомендации по улучшению:
                  </Typography>
                  
                  <Stack spacing={1} sx={{ mb: 2 }}>
                    <Alert severity="info" sx={{ py: 0.5 }}>
                      Уделяйте больше внимания выявлению потребностей клиента.
                    </Alert>
                    <Alert severity="success" sx={{ py: 0.5 }}>
                      Отлично отрабатываете возражения по цене.
                    </Alert>
                    <Alert severity="warning" sx={{ py: 0.5 }}>
                      Рекомендуется улучшить презентацию преимуществ продукта.
                    </Alert>
                  </Stack>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 'auto' }}>
                    Анализ выполнен: {formatDate(new Date().toISOString())}
                  </Typography>
                </Box>
              ) : (
                <Box 
                  sx={{ 
                    flex: 1, 
                    display: 'flex', 
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center',
                    py: 3
                  }}
                >
                  <Typography variant="body1" paragraph>
                    Для этого взаимодействия еще не выполнен ИИ анализ
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" paragraph>
                    ИИ может проанализировать качество взаимодействия, предложить рекомендации по улучшению и помочь повысить эффективность работы с клиентами.
                  </Typography>
                  
                  <Button
                    variant="contained"
                    onClick={handleRequestAnalysis}
                    disabled={loading}
                    sx={{ mt: 2 }}
                  >
                    {loading ? 'Выполняется анализ...' : 'Запросить анализ ИИ'}
                  </Button>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Закрыть
        </Button>
        <Button variant="contained" color="primary">
          Редактировать
        </Button>
      </DialogActions>
    </Dialog>
  );
}

InteractionDetailsDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  interaction: PropTypes.object,
  onClose: PropTypes.func.isRequired
};