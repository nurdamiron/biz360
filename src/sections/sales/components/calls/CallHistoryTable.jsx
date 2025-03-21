// src/sections/sales/components/calls/CallHistoryTable.jsx
import PropTypes from 'prop-types';
import { useState } from 'react';
import {
  Box,
  Card,
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableContainer,
  TablePagination,
  Typography,
  Chip,
  IconButton,
  Button,
  Stack,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Rating,
  LinearProgress,
  alpha,
  useTheme,
  Menu,
  MenuItem,
  Tooltip,
  Grid
} from '@mui/material';
import { fToNow, fDateTime } from 'src/utils/format-time';

// Заглушки для иконок
const Icons = {
  Call: '📞',
  Email: '📧',
  Play: '▶️',
  More: '⋯',
  Info: 'ℹ️',
  Delete: '🗑️',
  Download: '📥',
  Robot: '🤖',
  Edit: '✏️',
  Add: '➕',
  Close: '✕',
  Success: '✓',
  Warning: '⚠️',
  Error: '❌',
  Filter: '🔍',
  Sort: '↕️',
  Clock: '⏱️',
};

/**
 * Форматирование продолжительности звонка
 * @param {number} seconds - Длительность в секундах
 * @returns {string} - Отформатированная строка
 */
const formatDuration = (seconds) => {
  if (seconds < 60) {
    return `${seconds} сек`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes} мин ${remainingSeconds > 0 ? `${remainingSeconds} сек` : ''}`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours} ч ${minutes > 0 ? `${minutes} мин` : ''}`;
  }
};

/**
 * Компонент для отображения диалога с детальной информацией о звонке
 */
const CallDetailsDialog = ({ call, open, onClose }) => {
  const theme = useTheme();
  
  if (!call) return null;
  
  // Определение цвета для оценки
  const getScoreColor = (score) => {
    if (score >= 80) return theme.palette.success.main;
    if (score >= 60) return theme.palette.warning.main;
    return theme.palette.error.main;
  };
  
  // Преобразование оценки 0-100 в рейтинг 0-5
  const scoreToRating = (score) => score / 20;
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        elevation: 5,
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Детали звонка</Typography>
          <IconButton onClick={onClose} size="small">
            {Icons.Close}
          </IconButton>
        </Stack>
      </DialogTitle>
      
      <DialogContent>
        <Grid container spacing={3}>
          {/* Основная информация о звонке */}
          <Grid item xs={12} sm={6}>
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Информация о звонке
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <Box component="span" sx={{ mr: 1 }}>{Icons.Call}</Box>
                  {call.type}, {formatDuration(call.duration)}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <Box component="span" sx={{ mr: 1 }}>{Icons.Clock}</Box>
                  {fDateTime(call.date)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <Box component="span" sx={{ mr: 1 }}>{Icons.Info}</Box>
                  Клиент: #{call.clientId}
                </Typography>
              </Box>
              
              <Divider />
              
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Результат
                </Typography>
                <Typography variant="body2">
                  {call.result}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Заметки
                </Typography>
                <Typography variant="body2">
                  {call.notes}
                </Typography>
              </Box>
              
              <Button
                variant="outlined"
                startIcon={Icons.Play}
                fullWidth
              >
                Прослушать запись
              </Button>
            </Stack>
          </Grid>
          
          {/* Анализ ИИ */}
          <Grid item xs={12} sm={6}>
            <Box sx={{ 
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              borderRadius: 2,
              p: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.03)
            }}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                <Box sx={{ 
                  width: 32, 
                  height: 32, 
                  borderRadius: '50%', 
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: theme.palette.primary.main,
                  fontSize: '1.25rem'
                }}>
                  {Icons.Robot}
                </Box>
                <Typography variant="subtitle1">
                  Анализ ИИ
                </Typography>
              </Stack>
              
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Общая оценка
                  </Typography>
                  <Typography 
                    variant="body2" 
                    fontWeight="bold"
                    color={getScoreColor(call.aiAnalysis.overallScore)}
                  >
                    {call.aiAnalysis.overallScore}/100
                  </Typography>
                </Box>
                <Rating 
                  value={scoreToRating(call.aiAnalysis.overallScore)} 
                  precision={0.5} 
                  readOnly 
                  sx={{ mb: 1 }}
                />
              </Box>
              
              <Typography variant="subtitle2" gutterBottom>
                Оценки по категориям
              </Typography>
              
              <Stack spacing={1.5} sx={{ mb: 3 }}>
                {Object.entries(call.aiAnalysis.categories).map(([category, score]) => {
                  // Форматирование названия категории
                  const formatCategoryName = (name) => {
                    switch (name) {
                      case 'greeting': return 'Приветствие';
                      case 'needsIdentification': return 'Выявление потребностей';
                      case 'productPresentation': return 'Презентация продукта';
                      case 'objectionHandling': return 'Работа с возражениями';
                      case 'closing': return 'Закрытие разговора';
                      default: return name;
                    }
                  };
                  
                  return (
                    <Box key={category}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                        <Typography variant="body2" color="text.secondary">
                          {formatCategoryName(category)}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          fontWeight="medium"
                          color={getScoreColor(score)}
                        >
                          {score}/100
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={score} 
                        sx={{ 
                          height: 6, 
                          borderRadius: 1,
                          bgcolor: alpha(getScoreColor(score), 0.1),
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 1,
                            bgcolor: getScoreColor(score)
                          }
                        }}
                      />
                    </Box>
                  );
                })}
              </Stack>
              
              <Typography variant="subtitle2" gutterBottom>
                Ключевые фразы
              </Typography>
              <Stack spacing={1} sx={{ mb: 3 }}>
                {call.aiAnalysis.keyPhrases.map((phrase, index) => (
                  <Box 
                    key={index}
                    sx={{ 
                      p: 1, 
                      borderRadius: 1, 
                      bgcolor: alpha(theme.palette.info.main, 0.05),
                      border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`
                    }}
                  >
                    <Typography variant="body2">
                    &quot;{phrase}&quot;
                    </Typography>
                  </Box>
                ))}
              </Stack>
              
              <Typography variant="subtitle2" gutterBottom>
                Рекомендации
              </Typography>
              <Stack spacing={1}>
                {call.aiAnalysis.recommendations.map((rec, index) => (
                  <Box 
                    key={index}
                    sx={{ 
                      p: 1, 
                      borderRadius: 1, 
                      bgcolor: alpha(theme.palette.warning.main, 0.05),
                      border: `1px solid ${alpha(theme.palette.warning.main, 0.1)}`
                    }}
                  >
                    <Typography variant="body2">
                      {rec}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit">
          Закрыть
        </Button>
        <Button variant="contained" startIcon={Icons.Download}>
          Скачать запись
        </Button>
      </DialogActions>
    </Dialog>
  );
};

CallDetailsDialog.propTypes = {
  call: PropTypes.object,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

/**
 * Основной компонент для отображения истории звонков
 */
const CallHistoryTable = ({ calls, isLoading }) => {
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selectedCall, setSelectedCall] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  
  // Обработчики пагинации
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Обработчик клика по кнопке действий
  const handleMenuClick = (event, call) => {
    setAnchorEl(event.currentTarget);
    setSelectedCall(call);
  };
  
  // Обработчик закрытия меню
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  // Обработчик открытия деталей звонка
  const handleOpenDetails = () => {
    setDetailsOpen(true);
    handleMenuClose();
  };
  
  // Обработчик закрытия деталей звонка
  const handleCloseDetails = () => {
    setDetailsOpen(false);
  };
  
  // Определение цвета для оценки ИИ
  const getScoreColor = (score) => {
    if (score >= 80) return theme.palette.success.main;
    if (score >= 60) return theme.palette.warning.main;
    return theme.palette.error.main;
  };
  
  // Разбивка по страницам
  const paginatedCalls = calls.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
  
  return (
    <Card sx={{ 
      boxShadow: theme.customShadows?.z8 || '0 8px 16px 0 rgba(145, 158, 171, 0.16)',
      borderRadius: 2
    }}>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">
          История звонков
        </Typography>
        
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={Icons.Filter}
            size="small"
          >
            Фильтры
          </Button>
          
          <Button
            variant="contained"
            startIcon={Icons.Add}
            size="small"
          >
            Добавить звонок
          </Button>
        </Stack>
      </Box>
      
      <Divider />
      
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Клиент</TableCell>
              <TableCell>Дата и время</TableCell>
              <TableCell>Тип</TableCell>
              <TableCell>Длительность</TableCell>
              <TableCell>Результат</TableCell>
              <TableCell align="center">Оценка ИИ</TableCell>
              <TableCell align="right">Действия</TableCell>
            </TableRow>
          </TableHead>
          
          <TableBody>
            {paginatedCalls.map((call) => (
              <TableRow 
                key={call.id}
                hover
                sx={{ '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) } }}
              >
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    #{call.clientId}
                  </Typography>
                </TableCell>
                
                <TableCell>
                  <Typography variant="body2">
                    {fDateTime(call.date)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {fToNow(call.date)}
                  </Typography>
                </TableCell>
                
                <TableCell>
                  <Chip
                    icon={<Box component="span">{Icons.Call}</Box>}
                    label={call.type}
                    size="small"
                    sx={{
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      color: theme.palette.primary.main,
                      '& .MuiChip-label': { px: 1 }
                    }}
                  />
                </TableCell>
                
                <TableCell>
                  <Typography variant="body2">
                    {formatDuration(call.duration)}
                  </Typography>
                </TableCell>
                
                <TableCell>
                  <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                    {call.result}
                  </Typography>
                </TableCell>
                
                <TableCell align="center">
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Tooltip title={`${call.aiAnalysis.overallScore}/100`} arrow>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          bgcolor: alpha(getScoreColor(call.aiAnalysis.overallScore), 0.1),
                          color: getScoreColor(call.aiAnalysis.overallScore),
                          fontWeight: 'bold'
                        }}
                      >
                        {call.aiAnalysis.overallScore}
                      </Box>
                    </Tooltip>
                  </Box>
                </TableCell>
                
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSelectedCall(call);
                        setDetailsOpen(true);
                      }}
                    >
                      {Icons.Info}
                    </IconButton>
                    
                    <IconButton
                      size="small"
                      onClick={(event) => handleMenuClick(event, call)}
                    >
                      {Icons.More}
                    </IconButton>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
            
            {paginatedCalls.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    {isLoading ? 'Загрузка данных...' : 'Нет записей о звонках'}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={calls.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Строк на странице:"
        labelDisplayedRows={({ from, to, count }) => `${from}–${to} из ${count}`}
      />
      
      {/* Меню действий */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 3,
          sx: { width: 200, mt: 1 }
        }}
      >
        <MenuItem onClick={handleOpenDetails}>
          <Box component="span" sx={{ mr: 1.5 }}>{Icons.Info}</Box>
          Детали
        </MenuItem>
        
        <MenuItem onClick={handleMenuClose}>
          <Box component="span" sx={{ mr: 1.5 }}>{Icons.Play}</Box>
          Прослушать запись
        </MenuItem>
        
        <MenuItem onClick={handleMenuClose}>
          <Box component="span" sx={{ mr: 1.5 }}>{Icons.Download}</Box>
          Скачать запись
        </MenuItem>
        
        <Divider />
        
        <MenuItem onClick={handleMenuClose} sx={{ color: theme.palette.error.main }}>
          <Box component="span" sx={{ mr: 1.5 }}>{Icons.Delete}</Box>
          Удалить
        </MenuItem>
      </Menu>
      
      {/* Диалог с деталями звонка */}
      <CallDetailsDialog
        call={selectedCall}
        open={detailsOpen}
        onClose={handleCloseDetails}
      />
    </Card>
  );
};

CallHistoryTable.propTypes = {
  calls: PropTypes.array.isRequired,
  isLoading: PropTypes.bool
};

CallHistoryTable.defaultProps = {
  isLoading: false
};

export default CallHistoryTable;