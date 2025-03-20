// src/sections/sales/components/lead-interaction/InteractionTable.jsx
import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  IconButton,
  Button,
  Tooltip,
  Badge,
  alpha,
  useTheme
} from '@mui/material';

// Заглушки для иконок
const Icons = {
  Call: '📞',
  Email: '📧',
  Meeting: '📅',
  Message: '💬',
  More: '⋯',
  Play: '▶️',
  Robot: '🤖',
  Time: '⏱️',
  Add: '➕',
};

/**
 * Компонент таблицы взаимодействий с лидами
 */
export default function InteractionTable({ 
  interactions = [],
  isLoading = false,
  onOpenDetails,
  onOpenActionMenu,
  onPlayRecording,
  onAddClick
}) {
  const theme = useTheme();
  
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
  
  // Получение цвета для оценки качества
  const getQualityColor = (score) => {
    if (score >= 80) return theme.palette.success.main;
    if (score >= 60) return theme.palette.warning.main;
    return theme.palette.error.main;
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
  
  // Если данные загружаются или их нет - показываем соответствующее сообщение
  if (isLoading) {
    return (
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Тип</TableCell>
              <TableCell>Лид</TableCell>
              <TableCell>Дата</TableCell>
              <TableCell>Длительность</TableCell>
              <TableCell>Результат</TableCell>
              <TableCell align="center">Качество</TableCell>
              <TableCell>ИИ оценка</TableCell>
              <TableCell align="right">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                <Typography variant="body1">Загрузка данных...</Typography>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    );
  }
  
  if (interactions.length === 0) {
    return (
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Тип</TableCell>
              <TableCell>Лид</TableCell>
              <TableCell>Дата</TableCell>
              <TableCell>Длительность</TableCell>
              <TableCell>Результат</TableCell>
              <TableCell align="center">Качество</TableCell>
              <TableCell>ИИ оценка</TableCell>
              <TableCell align="right">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                <Typography variant="body1">Нет данных для отображения</Typography>
                <Button 
                  variant="text" 
                  onClick={onAddClick} 
                  startIcon={Icons.Add}
                  sx={{ mt: 1 }}
                >
                  Добавить взаимодействие
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    );
  }
  
  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Тип</TableCell>
            <TableCell>Лид</TableCell>
            <TableCell>Дата</TableCell>
            <TableCell>Длительность</TableCell>
            <TableCell>Результат</TableCell>
            <TableCell align="center">Качество</TableCell>
            <TableCell>ИИ оценка</TableCell>
            <TableCell align="right">Действия</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {interactions.map((interaction) => {
            const typeStyle = getInteractionTypeStyle(interaction.type);
            const qualityColor = getQualityColor(interaction.quality_score);
            
            return (
              <TableRow 
                key={interaction.id}
                sx={{ '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) } }}
              >
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{
                      width: 36,
                      height: 36,
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
                    <Typography variant="body2">
                      {interaction.type}
                    </Typography>
                  </Box>
                </TableCell>
                
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    ID: {interaction.lead_id}
                  </Typography>
                </TableCell>
                
                <TableCell>
                  <Tooltip title={formatDate(interaction.date)} arrow>
                    <Typography variant="body2">
                      {formatDate(interaction.date)}
                    </Typography>
                  </Tooltip>
                </TableCell>
                
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box component="span" sx={{ mr: 0.5 }}>{Icons.Time}</Box>
                    <Typography variant="body2">
                      {interaction.duration} мин
                    </Typography>
                  </Box>
                </TableCell>
                
                <TableCell>
                  <Tooltip title={interaction.notes || 'Нет заметок'} arrow>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        maxWidth: 200,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {interaction.result}
                    </Typography>
                  </Tooltip>
                </TableCell>
                
                <TableCell align="center">
                  <Chip
                    label={`${interaction.quality_score}%`}
                    size="small"
                    sx={{
                      bgcolor: alpha(qualityColor, 0.1),
                      color: qualityColor,
                      fontWeight: 'bold',
                      minWidth: 60
                    }}
                  />
                </TableCell>
                
                <TableCell>
                  <Badge
                    badgeContent={Icons.Robot}
                    color="primary"
                    anchorOrigin={{
                      vertical: 'top',
                      horizontal: 'left',
                    }}
                    sx={{ '& .MuiBadge-badge': { fontSize: '0.8rem', p: 0 } }}
                  >
                    <Button 
                      variant="text" 
                      size="small"
                      onClick={() => onOpenDetails(interaction)}
                      sx={{ textTransform: 'none', fontSize: '0.75rem' }}
                    >
                      {interaction.ai_feedback ? 'Посмотреть анализ' : 'Запросить анализ'}
                    </Button>
                  </Badge>
                </TableCell>
                
                <TableCell align="right">
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    {interaction.type === 'Звонок' && interaction.recording_url && (
                      <Tooltip title="Прослушать запись" arrow>
                        <IconButton 
                          size="small" 
                          onClick={() => onPlayRecording && onPlayRecording(interaction.recording_url)}
                          sx={{ color: theme.palette.primary.main }}
                        >
                          {Icons.Play}
                        </IconButton>
                      </Tooltip>
                    )}
                    
                    <Tooltip title="Действия" arrow>
                      <IconButton 
                        size="small"
                        onClick={(e) => onOpenActionMenu(e, interaction)}
                      >
                        {Icons.More}
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

InteractionTable.propTypes = {
  interactions: PropTypes.array,
  isLoading: PropTypes.bool,
  onOpenDetails: PropTypes.func.isRequired,
  onOpenActionMenu: PropTypes.func.isRequired,
  onPlayRecording: PropTypes.func,
  onAddClick: PropTypes.func.isRequired
};