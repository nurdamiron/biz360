// src/sections/sales/components/client-history/ClientHistoryTable.jsx
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
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
  Stack,
  IconButton,
  Menu,
  MenuItem,
  Button,
  Tooltip,
  alpha,
  Divider,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { fCurrency, fPercent } from 'src/utils/format-number';
import { fDate } from 'src/utils/format-time';

// Заглушки для иконок
const Icons = {
  More: '⋯',
  Phone: '📞',
  Email: '📧',
  Info: 'ℹ️',
  Edit: '✏️',
  Delete: '🗑️',
  History: '📋',
  Filter: '🔍',
  Sort: '↕️',
  Add: '➕',
  Star: '⭐',
  VIP: '👑',
  New: '🆕',
  Regular: '🔄',
  Passive: '⏸️',
};

/**
 * Компонент для отображения истории клиентов с сортировкой
 */
const ClientHistoryTable = ({ clients, onViewDetails, onCallClient, onEmailClient, onEditClient }) => {
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [sortBy, setSortBy] = useState('totalRevenue');
  const [sortOrder, setSortOrder] = useState('desc');
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Функция для получения иконки статуса клиента
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
  
  // Обработчик клика по меню действий
  const handleActionMenuClick = (event, client) => {
    setActionMenuAnchor(event.currentTarget);
    setSelectedClient(client);
  };
  
  // Обработчик закрытия меню действий
  const handleActionMenuClose = () => {
    setActionMenuAnchor(null);
  };
  
  // Обработчики для кнопок в меню действий
  const handleViewDetails = () => {
    if (selectedClient && onViewDetails) {
      onViewDetails(selectedClient.id);
    }
    handleActionMenuClose();
  };
  
  const handleCallClient = () => {
    if (selectedClient && onCallClient) {
      onCallClient(selectedClient.id);
    }
    handleActionMenuClose();
  };
  
  const handleEmailClient = () => {
    if (selectedClient && onEmailClient) {
      onEmailClient(selectedClient.id);
    }
    handleActionMenuClose();
  };
  
  const handleEditClient = () => {
    if (selectedClient && onEditClient) {
      onEditClient(selectedClient.id);
    }
    handleActionMenuClose();
  };
  
  // Обработчики пагинации
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Обработчик изменения сортировки
  const handleSortChange = (event) => {
    setSortBy(event.target.value);
  };
  
  // Обработчик изменения порядка сортировки
  const handleSortOrderChange = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };
  
  // Обработчик изменения фильтра по статусу
  const handleStatusFilterChange = (event) => {
    setFilterStatus(event.target.value);
  };
  
  // Фильтрация и сортировка клиентов
  const filteredAndSortedClients = [...clients]
    .filter(client => filterStatus === 'all' || client.status === filterStatus)
    .sort((a, b) => {
      let comparison = 0;
      
      // Выбор поля для сортировки
      switch (sortBy) {
        case 'totalRevenue':
          comparison = a.totalRevenue - b.totalRevenue;
          break;
        case 'averageCheck':
          comparison = a.averageCheck - b.averageCheck;
          break;
        case 'profit':
          comparison = a.profit - b.profit;
          break;
        case 'profitMargin':
          comparison = a.profitMargin - b.profitMargin;
          break;
        case 'transactions':
          comparison = a.transactions.length - b.transactions.length;
          break;
        case 'lastContact':
          comparison = new Date(a.lastContact) - new Date(b.lastContact);
          break;
        default:
          comparison = a.totalRevenue - b.totalRevenue;
      }
      
      // Применение порядка сортировки
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  
  // Разбивка по страницам
  const paginatedClients = filteredAndSortedClients.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
  
  return (
    <Card sx={{ 
      boxShadow: theme.customShadows?.z8 || '0 8px 16px 0 rgba(145, 158, 171, 0.16)',
      borderRadius: 2
    }}>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h6">
          История клиентов
        </Typography>
        
        <Stack direction="row" spacing={2}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="status-filter-label">Статус</InputLabel>
            <Select
              labelId="status-filter-label"
              value={filterStatus}
              label="Статус"
              onChange={handleStatusFilterChange}
            >
              <MenuItem value="all">Все статусы</MenuItem>
              <MenuItem value="Новый">Новые</MenuItem>
              <MenuItem value="Постоянный">Постоянные</MenuItem>
              <MenuItem value="Пассивный">Пассивные</MenuItem>
              <MenuItem value="VIP">VIP</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel id="sort-by-label">Сортировать по</InputLabel>
            <Select
              labelId="sort-by-label"
              value={sortBy}
              label="Сортировать по"
              onChange={handleSortChange}
              endAdornment={
                <IconButton 
                  size="small" 
                  onClick={handleSortOrderChange}
                  sx={{ mr: 1 }}
                >
                  {Icons.Sort}
                </IconButton>
              }
            >
              <MenuItem value="totalRevenue">Общая выручка</MenuItem>
              <MenuItem value="averageCheck">Средний чек</MenuItem>
              <MenuItem value="profit">Прибыль</MenuItem>
              <MenuItem value="profitMargin">Маржинальность</MenuItem>
              <MenuItem value="transactions">Количество сделок</MenuItem>
              <MenuItem value="lastContact">Последний контакт</MenuItem>
            </Select>
          </FormControl>
          
          <Button 
            variant="contained" 
            startIcon={Icons.Add}
            size="small"
          >
            Добавить клиента
          </Button>
        </Stack>
      </Box>
      
      <Divider />
      
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Клиент</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell align="right">Средний чек</TableCell>
              <TableCell align="right">Общая выручка</TableCell>
              <TableCell align="right">Прибыль</TableCell>
              <TableCell align="right">Маржа</TableCell>
              <TableCell align="right">Последний контакт</TableCell>
              <TableCell align="right">Действия</TableCell>
            </TableRow>
          </TableHead>
          
          <TableBody>
            {paginatedClients.map((client) => (
              <TableRow 
                key={client.id}
                hover
                sx={{ '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) } }}
              >
                <TableCell>
                  <Typography variant="subtitle2" noWrap>
                    {client.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {client.transactions.length} {client.transactions.length === 1 ? 'транзакция' : 'транзакции'}
                  </Typography>
                </TableCell>
                
                <TableCell>
                  <Chip
                    icon={<Box component="span">{getStatusIcon(client.status)}</Box>}
                    label={client.status}
                    size="small"
                    sx={{
                      bgcolor: alpha(getStatusColor(client.status), 0.1),
                      color: getStatusColor(client.status),
                      '& .MuiChip-label': { px: 1 }
                    }}
                  />
                </TableCell>
                
                <TableCell align="right">
                  <Typography variant="body2" fontWeight="medium">
                    {fCurrency(client.averageCheck)}
                  </Typography>
                </TableCell>
                
                <TableCell align="right">
                  <Typography variant="body2" fontWeight="medium">
                    {fCurrency(client.totalRevenue)}
                  </Typography>
                </TableCell>
                
                <TableCell align="right">
                  <Typography variant="body2" fontWeight="medium" color="success.main">
                    {fCurrency(client.profit)}
                  </Typography>
                </TableCell>
                
                <TableCell align="right">
                  <Typography 
                    variant="body2" 
                    fontWeight="medium"
                    color={client.profitMargin >= 40 ? 'success.main' : 'warning.main'}
                  >
                    {fPercent(client.profitMargin / 100)}
                  </Typography>
                </TableCell>
                
                <TableCell align="right">
                  <Typography variant="body2">
                    {fDate(client.lastContact)}
                  </Typography>
                </TableCell>
                
                <TableCell align="right">
                  <IconButton 
                    size="small" 
                    onClick={(event) => handleActionMenuClick(event, client)}
                  >
                    {Icons.More}
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            
            {paginatedClients.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    Клиенты не найдены
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
        count={filteredAndSortedClients.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Строк на странице:"
        labelDisplayedRows={({ from, to, count }) => `${from}–${to} из ${count}`}
      />
      
      {/* Меню действий */}
      <Menu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor)}
        onClose={handleActionMenuClose}
        PaperProps={{
          elevation: 3,
          sx: { width: 200, mt: 1 }
        }}
      >
        <MenuItem onClick={handleViewDetails}>
          <Box component="span" sx={{ mr: 1.5 }}>{Icons.Info}</Box>
          Детали
        </MenuItem>
        
        <MenuItem onClick={handleCallClient}>
          <Box component="span" sx={{ mr: 1.5 }}>{Icons.Phone}</Box>
          Позвонить
        </MenuItem>
        
        <MenuItem onClick={handleEmailClient}>
          <Box component="span" sx={{ mr: 1.5 }}>{Icons.Email}</Box>
          Написать
        </MenuItem>
        
        <MenuItem onClick={handleEditClient}>
          <Box component="span" sx={{ mr: 1.5 }}>{Icons.Edit}</Box>
          Редактировать
        </MenuItem>
        
        <Divider />
        
        <MenuItem onClick={handleActionMenuClose} sx={{ color: theme.palette.error.main }}>
          <Box component="span" sx={{ mr: 1.5 }}>{Icons.Delete}</Box>
          Удалить
        </MenuItem>
      </Menu>
    </Card>
  );
};

ClientHistoryTable.propTypes = {
  clients: PropTypes.array.isRequired,
  onViewDetails: PropTypes.func,
  onCallClient: PropTypes.func,
  onEmailClient: PropTypes.func,
  onEditClient: PropTypes.func
};

export default ClientHistoryTable;