// src/sections/sales/components/lead-distribution/employee-performance/DealsHistoryTab.jsx
import PropTypes from 'prop-types';
import { useState } from 'react';
import {
  Box,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  Chip,
  Divider,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Paper,
  alpha,
  Rating
} from '@mui/material';

// Material UI иконки (в комментариях показаны имена для импорта)
// import CheckCircleIcon from '@mui/icons-material/CheckCircle';
// import CancelIcon from '@mui/icons-material/Cancel';
// import FilterListIcon from '@mui/icons-material/FilterList';
// import SortIcon from '@mui/icons-material/Sort';
// import StarIcon from '@mui/icons-material/Star';
// import TrendingUpIcon from '@mui/icons-material/TrendingUp';
// import TimelineIcon from '@mui/icons-material/Timeline';
// import DataUsageIcon from '@mui/icons-material/DataUsage';

/**
 * Компонент вкладки с историей сделок сотрудника
 */
export default function DealsHistoryTab({ theme, formatCurrency, stats }) {
  // Состояние пагинации
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  
  // Состояние фильтрации и сортировки
  const [period, setPeriod] = useState('all');
  const [status, setStatus] = useState('all');
  
  // Форматирование суммы, если функция не предоставлена
  const formatAmount = formatCurrency || ((amount) => 
    new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'KZT',
      maximumFractionDigits: 0
    }).format(amount)
  );
  
  // Тестовые данные для истории сделок
  const deals = [
    {
      id: 1001,
      client: 'ООО "ТехноПром"',
      amount: 850000,
      status: 'Успешная',
      date: '15.03.2025',
      closingDays: 14,
      rating: 5
    },
    {
      id: 1002,
      client: 'ИП Смирнова',
      amount: 120000,
      status: 'Успешная',
      date: '28.02.2025',
      closingDays: 7,
      rating: 4
    },
    {
      id: 1003,
      client: 'АО "СтройМастер"',
      amount: 1200000,
      status: 'Успешная',
      date: '15.02.2025',
      closingDays: 22,
      rating: 4.5
    },
    {
      id: 1004,
      client: 'ООО "ЭкоФерма"',
      amount: 350000,
      status: 'Отмененная',
      date: '05.02.2025',
      closingDays: 30,
      rating: 2
    },
    {
      id: 1005,
      client: 'ООО "Логистик Плюс"',
      amount: 720000,
      status: 'Успешная',
      date: '20.01.2025',
      closingDays: 12,
      rating: 5
    },
    {
      id: 1006,
      client: 'ИП Кузнецов',
      amount: 180000,
      status: 'Отмененная',
      date: '10.01.2025',
      closingDays: 18,
      rating: 3
    },
    {
      id: 1007,
      client: 'ЗАО "МедТехника"',
      amount: 950000,
      status: 'Успешная',
      date: '28.12.2024',
      closingDays: 16,
      rating: 4
    }
  ];
  
  // Рассчет статистики по сделкам
  const calculateStats = () => {
    const totalDeals = deals.length;
    const successfulDeals = deals.filter(deal => deal.status === 'Успешная').length;
    const totalAmount = deals.reduce((sum, deal) => deal.status === 'Успешная' ? sum + deal.amount : sum, 0);
    const avgClosingDays = deals.length > 0 
      ? Math.round(deals.reduce((sum, deal) => sum + deal.closingDays, 0) / deals.length) 
      : 0;
    const avgRating = deals.length > 0 
      ? (deals.reduce((sum, deal) => sum + deal.rating, 0) / deals.length).toFixed(1) 
      : 0;
    const successRate = totalDeals > 0 ? Math.round((successfulDeals / totalDeals) * 100) : 0;
    
    return {
      totalDeals,
      successfulDeals,
      totalAmount,
      avgClosingDays,
      avgRating,
      successRate
    };
  };
  
  // Получение статистики
  const dealsStats = calculateStats();
  
  // Фильтрация сделок
  const filteredDeals = deals.filter(deal => {
    // Фильтр по статусу
    if (status !== 'all' && deal.status !== status) {
      return false;
    }
    
    // Фильтр по периоду
    if (period !== 'all') {
      const dealDate = new Date(deal.date.split('.').reverse().join('-'));
      const now = new Date();
      
      switch (period) {
        case 'month': {
            const monthAgo = new Date();
            monthAgo.setMonth(now.getMonth() - 1);
            if (dealDate < monthAgo) return false;
            break;
        }
        case 'quarter': {
          const quarterAgo = new Date();
          quarterAgo.setMonth(now.getMonth() - 3);
          if (dealDate < quarterAgo) return false;
          break;
        }
        case 'year': {
          const yearAgo = new Date();
          yearAgo.setFullYear(now.getFullYear() - 1);
          if (dealDate < yearAgo) return false;
          break;
        }
        default:
          break;
      }
    }
    
    return true;
  });
  
  // Пагинация
  const paginatedDeals = filteredDeals.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
  
  // Обработчики изменения пагинации
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  return (
    <Box>
      {/* Карточки со статистикой */}
      <Card sx={{ 
        mb: 3, 
        borderRadius: 2,
        boxShadow: 'none',
        border: `1px solid ${theme.palette.divider}`
      }}>
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Общая статистика по сделкам
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', margin: -1 }}>
            <Box sx={{ flexBasis: '33.33%', maxWidth: '33.33%', padding: 1 }}>
              <Paper sx={{ 
                p: 2, 
                borderRadius: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.05),
                display: 'flex',
                alignItems: 'center'
              }}>
                <Box sx={{ mr: 1.5, color: theme.palette.primary.main }}>📊</Box>
                <Box>
                  <Typography variant="h5" fontWeight="bold" color="primary.main">
                    {dealsStats.totalDeals}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Всего сделок
                  </Typography>
                </Box>
              </Paper>
            </Box>
            
            <Box sx={{ flexBasis: '33.33%', maxWidth: '33.33%', padding: 1 }}>
              <Paper sx={{ 
                p: 2, 
                borderRadius: 2,
                bgcolor: alpha(theme.palette.success.main, 0.05),
                display: 'flex',
                alignItems: 'center'
              }}>
                <Box sx={{ mr: 1.5, color: theme.palette.success.main }}>✓</Box>
                <Box>
                  <Typography variant="h5" fontWeight="bold" color="success.main">
                    {dealsStats.successRate}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Успешных сделок
                  </Typography>
                </Box>
              </Paper>
            </Box>
            
            <Box sx={{ flexBasis: '33.33%', maxWidth: '33.33%', padding: 1 }}>
              <Paper sx={{ 
                p: 2, 
                borderRadius: 2,
                bgcolor: alpha(theme.palette.info.main, 0.05),
                display: 'flex',
                alignItems: 'center'
              }}>
                <Box sx={{ mr: 1.5, color: theme.palette.info.main }}>💰</Box>
                <Box>
                  <Typography variant="h5" fontWeight="bold" color="info.main">
                    {formatAmount(dealsStats.totalAmount)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Общая сумма
                  </Typography>
                </Box>
              </Paper>
            </Box>
            
            <Box sx={{ flexBasis: '33.33%', maxWidth: '33.33%', padding: 1 }}>
              <Paper sx={{ 
                p: 2, 
                borderRadius: 2,
                bgcolor: alpha(theme.palette.warning.main, 0.05),
                display: 'flex',
                alignItems: 'center'
              }}>
                <Box sx={{ mr: 1.5, color: theme.palette.warning.main }}>⏱️</Box>
                <Box>
                  <Typography variant="h5" fontWeight="bold" color="warning.main">
                    {dealsStats.avgClosingDays}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Среднее время закрытия
                  </Typography>
                </Box>
              </Paper>
            </Box>
            
            <Box sx={{ flexBasis: '33.33%', maxWidth: '33.33%', padding: 1 }}>
              <Paper sx={{ 
                p: 2, 
                borderRadius: 2,
                bgcolor: alpha(theme.palette.secondary.main, 0.05),
                display: 'flex',
                alignItems: 'center'
              }}>
                <Box sx={{ mr: 1.5, color: theme.palette.secondary.main }}>⭐</Box>
                <Box>
                  <Typography variant="h5" fontWeight="bold" color="secondary.main">
                    {dealsStats.avgRating}/5
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Средний рейтинг
                  </Typography>
                </Box>
              </Paper>
            </Box>
            
            <Box sx={{ flexBasis: '33.33%', maxWidth: '33.33%', padding: 1 }}>
              <Paper sx={{ 
                p: 2, 
                borderRadius: 2,
                bgcolor: alpha(theme.palette.error.main, 0.05),
                display: 'flex',
                alignItems: 'center'
              }}>
                <Box sx={{ mr: 1.5, color: theme.palette.error.main }}>📈</Box>
                <Box>
                  <Typography variant="h5" fontWeight="bold" color="error.main">
                    +12%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Рост за квартал
                  </Typography>
                </Box>
              </Paper>
            </Box>
          </Box>
        </Box>
      </Card>
      
      {/* Таблица сделок */}
      <Card sx={{ 
        borderRadius: 2,
        boxShadow: 'none',
        border: `1px solid ${theme.palette.divider}`
      }}>
        <Box sx={{ 
          p: 2, 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1
        }}>
          <Typography variant="subtitle1">
            История сделок
          </Typography>
          
          <Stack direction="row" spacing={2}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Период</InputLabel>
              <Select
                value={period}
                label="Период"
                onChange={(e) => setPeriod(e.target.value)}
              >
                <MenuItem value="all">Все время</MenuItem>
                <MenuItem value="month">Последний месяц</MenuItem>
                <MenuItem value="quarter">Последний квартал</MenuItem>
                <MenuItem value="year">Последний год</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Статус</InputLabel>
              <Select
                value={status}
                label="Статус"
                onChange={(e) => setStatus(e.target.value)}
              >
                <MenuItem value="all">Все статусы</MenuItem>
                <MenuItem value="Успешная">Успешные</MenuItem>
                <MenuItem value="Отмененная">Отмененные</MenuItem>
              </Select>
            </FormControl>
            
            <Button
              variant="outlined"
              startIcon="🔍"
              size="small"
            >
              Фильтры
            </Button>
          </Stack>
        </Box>
        
        <Divider />
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Клиент</TableCell>
                <TableCell>Дата</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell align="right">Сумма</TableCell>
                <TableCell align="right">Время закрытия</TableCell>
                <TableCell align="center">Рейтинг</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedDeals.map((deal) => (
                <TableRow key={deal.id} hover>
                  <TableCell>{deal.id}</TableCell>
                  
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {deal.client}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>{deal.date}</TableCell>
                  
                  <TableCell>
                    <Chip
                      label={deal.status}
                      size="small"
                      color={deal.status === 'Успешная' ? 'success' : 'error'}
                      sx={{ height: 24 }}
                    />
                  </TableCell>
                  
                  <TableCell align="right">
                    <Typography 
                      variant="body2" 
                      fontWeight="bold" 
                      color={deal.status === 'Успешная' ? 'success.main' : 'text.primary'}
                    >
                      {formatAmount(deal.amount)}
                    </Typography>
                  </TableCell>
                  
                  <TableCell align="right">
                    <Typography variant="body2">
                      {deal.closingDays} дн.
                    </Typography>
                  </TableCell>
                  
                  <TableCell align="center">
                    <Rating 
                      value={deal.rating} 
                      precision={0.5} 
                      readOnly 
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
              
              {filteredDeals.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} sx={{ py: 3, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Нет данных о сделках для текущего фильтра
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          component="div"
          count={filteredDeals.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
          labelRowsPerPage="Строк на странице:"
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} из ${count}`}
        />
      </Card>
    </Box>
  );
}

DealsHistoryTab.propTypes = {
  theme: PropTypes.object.isRequired,
  formatCurrency: PropTypes.func,
  stats: PropTypes.object
};