// src/sections/sales/components/client-history/ClientDetailsCard.jsx
import PropTypes from 'prop-types';
import { useState } from 'react';
import {
  Box,
  Card,
  Grid,
  Stack,
  Divider,
  Typography,
  Tab,
  Tabs,
  Table,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
  Chip,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  alpha,
  useTheme
} from '@mui/material';
import { fCurrency, fPercent } from 'src/utils/format-number';
import { fDate } from 'src/utils/format-time';

// Заглушки для иконок
const Icons = {
  VIP: '👑',
  New: '🆕',
  Regular: '🔄',
  Passive: '⏸️',
  Phone: '📞',
  Email: '📧',
  Calendar: '📅',
  Edit: '✏️',
  History: '📋',
  Money: '💰',
  Check: '✓',
  Close: '✕',
  Notes: '📝',
  Person: '👤',
  Building: '🏢',
  Info: 'ℹ️',
  Download: '📥',
};

/**
 * Компонент для отображения подробной информации о клиенте
 */
const ClientDetailsCard = ({ client, onClose, open }) => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  
  if (!client) {
    return null;
  }
  
  // Обработчик изменения вкладки
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Функция для получения цвета статуса клиента
  const getStatusColor = (status) => {
    switch (status) {
      case 'VIP':
        return theme.palette.error.main;
      case 'Новый':
        return theme.palette.info.main;
      case 'Постоянный':
        return theme.palette.success.main;
      case 'Пассивный':
        return theme.palette.warning.main;
      default:
        return theme.palette.grey[500];
    }
  };
  
  // Функция для получения иконки статуса
  const getStatusIcon = (status) => {
    switch (status) {
      case 'VIP':
        return Icons.VIP;
      case 'Новый':
        return Icons.New;
      case 'Постоянный':
        return Icons.Regular;
      case 'Пассивный':
        return Icons.Passive;
      default:
        return Icons.Info;
    }
  };
  
  // Получение процента оплаченных транзакций
  const paidTransactionsCount = client.transactions.filter(t => t.isPaid).length;
  const paidTransactionsPercent = (paidTransactionsCount / client.transactions.length) * 100 || 0;
  
  // Получение общей суммы оплаченных и неоплаченных транзакций
  const paidAmount = client.transactions
    .filter(t => t.isPaid)
    .reduce((sum, t) => sum + t.amount, 0);
    
  const unpaidAmount = client.transactions
    .filter(t => !t.isPaid)
    .reduce((sum, t) => sum + t.amount, 0);
  
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
          <Typography variant="h6">Информация о клиенте</Typography>
          <IconButton onClick={onClose} size="small">
            {Icons.Close}
          </IconButton>
        </Stack>
      </DialogTitle>
      
      <DialogContent sx={{ pb: 0 }}>
        <Grid container spacing={2}>
          {/* Основная информация о клиенте */}
          <Grid item xs={12}>
            <Card 
              sx={{ 
                p: 2, 
                borderRadius: 2,
                mb: 2,
                boxShadow: 'none',
                border: `1px solid ${theme.palette.divider}`
              }}
            >
              <Stack 
                direction={{ xs: 'column', sm: 'row' }} 
                justifyContent="space-between" 
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                spacing={2}
              >
                <Box>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                    <Typography variant="h5">
                      {client.name}
                    </Typography>
                    <Chip
                      icon={<Box component="span">{getStatusIcon(client.status)}</Box>}
                      label={client.status}
                      size="small"
                      sx={{
                        bgcolor: alpha(getStatusColor(client.status), 0.1),
                        color: getStatusColor(client.status),
                        fontWeight: 'bold',
                        '& .MuiChip-label': { px: 1 }
                      }}
                    />
                  </Stack>
                  
                  <Stack direction="row" spacing={3}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box component="span" sx={{ mr: 0.5, color: 'text.secondary' }}>
                        {Icons.Calendar}
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Клиент с: {fDate(client.firstContactDate)}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box component="span" sx={{ mr: 0.5, color: 'text.secondary' }}>
                        {Icons.Money}
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Выручка: {fCurrency(client.totalRevenue)}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
                
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={Icons.Phone}
                  >
                    Позвонить
                  </Button>
                  
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={Icons.Email}
                  >
                    Написать
                  </Button>
                  
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={Icons.Edit}
                  >
                    Редактировать
                  </Button>
                </Stack>
              </Stack>
            </Card>
          </Grid>
          
          {/* Вкладки с информацией */}
          <Grid item xs={12}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange}
              sx={{ mb: 2 }}
            >
              <Tab label="Финансы" />
              <Tab label="Транзакции" />
              <Tab label="Дополнительно" />
            </Tabs>
            
            {/* Вкладка "Финансы" */}
            {activeTab === 0 && (
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Card 
                    sx={{ 
                      p: 2, 
                      height: '100%',
                      borderRadius: 2,
                      boxShadow: 'none',
                      border: `1px solid ${theme.palette.divider}`
                    }}
                  >
                    <Typography variant="subtitle1" gutterBottom>
                      Финансовые показатели
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    <Stack spacing={2}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">
                          Общая выручка:
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {fCurrency(client.totalRevenue)}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">
                          Средний чек:
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {fCurrency(client.averageCheck)}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">
                          Прибыль:
                        </Typography>
                        <Typography variant="body2" fontWeight="bold" color="success.main">
                          {fCurrency(client.profit)}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">
                          Маржинальность:
                        </Typography>
                        <Typography 
                          variant="body2" 
                          fontWeight="bold" 
                          color={client.profitMargin >= 40 ? 'success.main' : 'warning.main'}
                        >
                          {fPercent(client.profitMargin / 100)}
                        </Typography>
                      </Box>
                      
                      <Divider />
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">
                          Оплаченные транзакции:
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {paidTransactionsCount} из {client.transactions.length} ({fPercent(paidTransactionsPercent / 100)})
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">
                          Оплаченная сумма:
                        </Typography>
                        <Typography variant="body2" fontWeight="bold" color="success.main">
                          {fCurrency(paidAmount)}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">
                          Ожидает оплаты:
                        </Typography>
                        <Typography variant="body2" fontWeight="bold" color="warning.main">
                          {fCurrency(unpaidAmount)}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">
                          Начисленные бонусы (5%):
                        </Typography>
                        <Typography variant="body2" fontWeight="bold" color="primary.main">
                          {fCurrency(paidAmount * 0.05)}
                        </Typography>
                      </Box>
                    </Stack>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card 
                    sx={{ 
                      p: 2, 
                      height: '100%',
                      borderRadius: 2,
                      boxShadow: 'none',
                      border: `1px solid ${theme.palette.divider}`
                    }}
                  >
                    <Typography variant="subtitle1" gutterBottom>
                      Бизнес-показатели
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    <Stack spacing={2}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">
                          Количество транзакций:
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {client.transactions.length}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">
                          Последняя транзакция:
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {fDate(client.transactions[client.transactions.length - 1]?.date || client.lastContact)}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">
                          Последний контакт:
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {fDate(client.lastContact)}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">
                          Следующий контакт:
                        </Typography>
                        <Typography variant="body2" fontWeight="bold" color="primary.main">
                          {fDate(client.nextContactScheduled)}
                        </Typography>
                      </Box>
                      
                      <Divider />
                      
                      <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Заметки:
                        </Typography>
                        <Typography variant="body2">
                          {client.notes || 'Нет заметок'}
                        </Typography>
                      </Box>
                      
                      <Button 
                        variant="outlined" 
                        fullWidth 
                        startIcon={Icons.Notes}
                        sx={{ mt: 2 }}
                      >
                        Добавить заметку
                      </Button>
                    </Stack>
                  </Card>
                </Grid>
              </Grid>
            )}
            
            {/* Вкладка "Транзакции" */}
            {activeTab === 1 && (
              <Card 
                sx={{ 
                  borderRadius: 2,
                  boxShadow: 'none',
                  border: `1px solid ${theme.palette.divider}`
                }}
              >
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Дата</TableCell>
                      <TableCell>Продукты</TableCell>
                      <TableCell align="right">Сумма</TableCell>
                      <TableCell align="right">Статус</TableCell>
                      <TableCell align="right">Бонус (5%)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {client.transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          <Typography variant="body2">
                            #{transaction.id}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {fDate(transaction.date)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {transaction.products.join(', ')}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="medium">
                            {fCurrency(transaction.amount)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Chip
                            label={transaction.isPaid ? 'Оплачен' : 'Ожидает оплаты'}
                            size="small"
                            color={transaction.isPaid ? 'success' : 'warning'}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography 
                            variant="body2" 
                            fontWeight="medium"
                            color={transaction.isPaid ? 'success.main' : 'text.disabled'}
                          >
                            {transaction.isPaid ? fCurrency(transaction.amount * 0.05) : '—'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            )}
            
            {/* Вкладка "Дополнительно" */}
            {activeTab === 2 && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Card 
                    sx={{ 
                      p: 2, 
                      borderRadius: 2,
                      boxShadow: 'none',
                      border: `1px solid ${theme.palette.divider}`
                    }}
                  >
                    <Typography variant="subtitle1" gutterBottom>
                      Дополнительная информация
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Здесь будет отображаться дополнительная информация о клиенте, 
                      включая контактные данные, история коммуникаций и т.д.
                    </Typography>
                    
                    <Typography variant="body2" paragraph>
                      <strong>Примечание:</strong> В этом разделе будет интегрирована 
                      история звонков и оценки ИИ, когда модуль будет полностью внедрен.
                    </Typography>
                    
                    <Button 
                      variant="outlined"
                      startIcon={Icons.History}
                      sx={{ mt: 1 }}
                    >
                      Показать историю звонков
                    </Button>
                  </Card>
                </Grid>
              </Grid>
            )}
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit">
          Закрыть
        </Button>
        <Button variant="contained" startIcon={Icons.Download}>
          Экспорт данных
        </Button>
      </DialogActions>
    </Dialog>
  );
};

ClientDetailsCard.propTypes = {
  client: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired
};

export default ClientDetailsCard;