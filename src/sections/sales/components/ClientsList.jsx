// src/sections/sales/components/ClientsList.jsx
import PropTypes from 'prop-types';
import { useState } from 'react';
import {
  Box,
  Card,
  Table,
  Stack,
  Button,
  Divider,
  MenuItem,
  TableRow,
  TableBody,
  TableCell,
  CardHeader,
  Typography,
  TableContainer,
  TablePagination,
  Alert,
  Paper,
  IconButton,
  Menu,
  ListItemIcon,
  ListItemText,
  Chip,
  alpha,
  Tab,
  Tabs,
  Link
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { fCurrency } from 'src/utils/format-number';
import { fDate } from 'src/utils/format-time';
import { paths } from 'src/routes/paths';

// Заглушки для иконок, в реальном проекте заменить на компонент Iconify или IconButton
const Icons = {
  MoreVert: '⋮',
  Phone: '📱',
  Email: '✉️',
  Meeting: '📅',
  Edit: '✏️',
  Delete: '🗑️',
  Add: '➕',
  Check: '✓',
  Star: '⭐',
  Filter: '🔍',
  Calendar: '📅',
  Sort: '↕️',
  Export: '📤',
  Import: '📥',
  Refresh: '🔄',
};

// Компонент для цветового индикатора срочности
const UrgencyIndicator = ({ urgency }) => {
  const theme = useTheme();
  
  let color;
  switch (urgency) {
    case 'Высокая':
      color = theme.palette.error.main;
      break;
    case 'Средняя':
      color = theme.palette.warning.main;
      break;
    case 'Низкая':
      color = theme.palette.success.main;
      break;
    default:
      color = theme.palette.info.main;
  }
  
  return (
    <Box
      sx={{
        width: 12,
        height: 12,
        borderRadius: '50%',
        bgcolor: color,
        display: 'inline-block',
        mr: 1
      }}
    />
  );
};

UrgencyIndicator.propTypes = {
  urgency: PropTypes.string.isRequired
};

// Компонент для отображения статуса
const StatusChip = ({ status }) => {
  const theme = useTheme();
  
  let color;
  switch (status) {
    case 'Переговоры':
      color = theme.palette.info.main;
      break;
    case 'Первичный контакт':
      color = theme.palette.warning.main;
      break;
    case 'Согласование КП':
      color = theme.palette.success.main;
      break;
    case 'Новый клиент':
      color = theme.palette.primary.main;
      break;
    default:
      color = theme.palette.grey[500];
  }
  
  return (
    <Chip
      label={status}
      size="small"
      sx={{
        bgcolor: alpha(color, 0.1),
        color: color,
        borderColor: alpha(color, 0.2),
        '& .MuiChip-label': {
          px: 1
        }
      }}
    />
  );
};

StatusChip.propTypes = {
  status: PropTypes.string.isRequired
};

// Компонент для отображения рейтинга в виде звезд
const RatingStars = ({ rating }) => {
  const stars = [];
  
  for (let i = 0; i < 5; i++) {
    stars.push(
      <Box 
        key={i}
        component="span" 
        sx={{ 
          color: i < rating ? 'warning.main' : 'text.disabled',
          fontSize: '1rem'
        }}
      >
        {Icons.Star}
      </Box>
    );
  }
  
  return <Box sx={{ display: 'flex' }}>{stars}</Box>;
};

RatingStars.propTypes = {
  rating: PropTypes.number.isRequired
};

// Компонент для отображения меню действий
const ActionsMenu = ({ onEdit, onDelete, onCall, onEmail, onMeeting }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  return (
    <>
      <IconButton size="small" onClick={handleClick}>
        {Icons.MoreVert}
      </IconButton>
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: { width: 200 }
        }}
      >
        <MenuItem onClick={() => { onCall(); handleClose(); }}>
          <ListItemIcon>{Icons.Phone}</ListItemIcon>
          <ListItemText>Позвонить</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={() => { onEmail(); handleClose(); }}>
          <ListItemIcon>{Icons.Email}</ListItemIcon>
          <ListItemText>Написать</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={() => { onMeeting(); handleClose(); }}>
          <ListItemIcon>{Icons.Meeting}</ListItemIcon>
          <ListItemText>Встреча</ListItemText>
        </MenuItem>
        
        <Divider />
        
        <MenuItem onClick={() => { onEdit(); handleClose(); }}>
          <ListItemIcon>{Icons.Edit}</ListItemIcon>
          <ListItemText>Редактировать</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={() => { onDelete(); handleClose(); }}>
          <ListItemIcon sx={{ color: 'error.main' }}>{Icons.Delete}</ListItemIcon>
          <ListItemText sx={{ color: 'error.main' }}>Удалить</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

ActionsMenu.propTypes = {
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onCall: PropTypes.func.isRequired,
  onEmail: PropTypes.func.isRequired,
  onMeeting: PropTypes.func.isRequired
};

// Отображение вкладки "Новое назначение"
const NewAssignmentCard = ({ assignment, onAccept }) => {
  const theme = useTheme();
  
  return (
    <Paper
      sx={{
        p: 3,
        mb: 3,
        borderRadius: 2,
        boxShadow: theme.customShadows?.z8 || '0 8px 16px 0 rgba(145, 158, 171, 0.16)',
        bgcolor: alpha(theme.palette.primary.main, 0.05),
        border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
        <Typography variant="h5" gutterBottom>
          Вам назначен новый клиент!
        </Typography>
        
        <Chip
          label="Новый"
          color="primary"
          size="small"
          sx={{ 
            fontWeight: 'bold',
            fontSize: '0.75rem',
            height: 24,
            px: 0.5
          }}
        />
      </Box>
      
      <Typography variant="h6" sx={{ mb: 2 }}>
        {assignment.name}
      </Typography>
      
      <Stack spacing={1} sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex' }}>
          <Typography variant="body2" sx={{ color: 'text.secondary', width: 180 }}>
            Потенциальная сумма:
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            {fCurrency(assignment.potential_amount)}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex' }}>
          <Typography variant="body2" sx={{ color: 'text.secondary', width: 180 }}>
            Приоритет:
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <UrgencyIndicator urgency={assignment.priority} />
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              {assignment.priority}
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex' }}>
          <Typography variant="body2" sx={{ color: 'text.secondary', width: 180 }}>
            Потенциальный бонус:
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'success.main' }}>
            до {fCurrency(assignment.potential_bonus)}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex' }}>
          <Typography variant="body2" sx={{ color: 'text.secondary', width: 180 }}>
            Требуется контакт до:
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'error.main' }}>
            {assignment.contact_deadline} (24 часа)
          </Typography>
        </Box>
      </Stack>
      
      <Button 
        variant="contained" 
        color="primary" 
        fullWidth
        onClick={onAccept}
      >
        Принять клиента
      </Button>
    </Paper>
  );
};

NewAssignmentCard.propTypes = {
  assignment: PropTypes.object.isRequired,
  onAccept: PropTypes.func.isRequired
};

// Основной компонент списка клиентов
function ClientsList({ activeClients, completedDeals, newAssignments = [] }) {
    const theme = useTheme();
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [tabValue, setTabValue] = useState(0);
  
  // Функции-обработчики для действий
  const handleEdit = (id) => {
    console.log('Edit client', id);
    // navigate(`/dashboard/client/${id}/edit`);
  };
  
  const handleDelete = (id) => {
    console.log('Delete client', id);
  };
  
  const handleCall = (id) => {
    console.log('Call client', id);
  };
  
  const handleEmail = (id) => {
    console.log('Email client', id);
  };
  
  const handleMeeting = (id) => {
    console.log('Schedule meeting with client', id);
  };
  
  const handleAcceptAssignment = (id) => {
    console.log('Accept assignment', id);
  };
  
  const handlePageChange = (_, newPage) => {
    setPage(newPage);
  };
  
  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const handleTabChange = (_, newValue) => {
    setTabValue(newValue);
  };
  
  // Выводим соответствующую таблицу в зависимости от выбранной вкладки
  return (
    <Card sx={{ borderRadius: 2, boxShadow: theme.customShadows?.z8 }}>
      {newAssignments.length > 0 && (
        <Box sx={{ px: 3, pt: 3 }}>
          <NewAssignmentCard 
            assignment={newAssignments[0]} 
            onAccept={() => handleAcceptAssignment(newAssignments[0].id)} 
          />
        </Box>
      )}
      
      <CardHeader
        title="Мои клиенты"
        action={
          <Stack direction="row" spacing={1}>
            <Button 
              size="small" 
              variant="outlined" 
              startIcon={Icons.Filter}
            >
              Фильтр
            </Button>
            
            <Button 
              size="small" 
              variant="contained" 
              startIcon={Icons.Add}
              onClick={() => navigate(paths.dashboard.client?.new || '/dashboard/client/new')}
            >
              Новый клиент
            </Button>
          </Stack>
        }
      />
      
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        sx={{
          px: 3,
          mb: 1,
          '& .MuiTab-root': {
            minWidth: 80
          }
        }}
      >
        <Tab label="Активные" />
        <Tab label="Завершенные" />
      </Tabs>
      
      <Divider />
      
      {/* Активные клиенты */}
      {tabValue === 0 && (
        <>
          <TableContainer>
            <Table>
              <TableBody>
                {activeClients.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((client) => (
                  <TableRow 
                    key={client.id} 
                    hover
                    sx={{ 
                      '&:hover': { bgcolor: 'background.neutral' },
                      cursor: 'pointer'
                    }}
                    onClick={() => navigate(`/dashboard/client/${client.id}`)}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Link 
                          component="button"
                          variant="subtitle2"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/dashboard/client/${client.id}`);
                          }}
                          sx={{ 
                            textAlign: 'left',
                            color: 'text.primary',
                            mb: 0.5
                          }}
                        >
                          {client.name}
                        </Link>
                        
                        <StatusChip status={client.status} />
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <UrgencyIndicator urgency={client.urgency} />
                        <Typography variant="body2">{client.urgency}</Typography>
                      </Box>
                    </TableCell>
                    
                    <TableCell align="right">
                      <Typography variant="subtitle2">
                        {fCurrency(client.potential_amount)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Вероятность: {client.probability}%
                      </Typography>
                    </TableCell>
                    
                    <TableCell align="right">
                      <ActionsMenu
                        onEdit={() => handleEdit(client.id)}
                        onDelete={() => handleDelete(client.id)}
                        onCall={() => handleCall(client.id)}
                        onEmail={() => handleEmail(client.id)}
                        onMeeting={() => handleMeeting(client.id)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
                
                {activeClients.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                      <Typography variant="body2" color="text.secondary">
                        У вас пока нет активных клиентов
                      </Typography>
                      <Button 
                        variant="outlined" 
                        size="small" 
                        startIcon={Icons.Add}
                        sx={{ mt: 1 }}
                        onClick={() => navigate(paths.dashboard.client?.new || '/dashboard/client/new')}
                      >
                        Добавить клиента
                      </Button>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          <TablePagination
            component="div"
            count={activeClients.length}
            page={page}
            onPageChange={handlePageChange}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleRowsPerPageChange}
            rowsPerPageOptions={[5, 10, 25]}
            labelRowsPerPage="Строк на странице:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} из ${count}`}
          />
        </>
      )}
      
      {/* Завершенные сделки */}
      {tabValue === 1 && (
        <>
          <TableContainer>
            <Table>
              <TableBody>
                {completedDeals.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((deal) => (
                  <TableRow 
                    key={deal.id}
                    hover
                    sx={{ 
                      '&:hover': { bgcolor: 'background.neutral' },
                      cursor: 'pointer'
                    }}
                    onClick={() => navigate(`/dashboard/deal/${deal.id}`)}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Link 
                          component="button"
                          variant="subtitle2"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/dashboard/deal/${deal.id}`);
                          }}
                          sx={{ 
                            textAlign: 'left',
                            color: 'text.primary',
                            mb: 0.5
                          }}
                        >
                          {deal.client}
                        </Link>
                        
                        <Typography variant="caption" color="text.secondary">
                          Закрыта: {deal.close_date}
                        </Typography>
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="body2">
                        Срок: {deal.days} дней
                      </Typography>
                    </TableCell>
                    
                    <TableCell align="right">
                      <Typography variant="subtitle2">
                        {fCurrency(deal.amount)}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'success.main' }}>
                        Бонус: {fCurrency(deal.bonus)}
                      </Typography>
                    </TableCell>
                    
                    <TableCell align="right">
                      <RatingStars rating={deal.rating} />
                    </TableCell>
                  </TableRow>
                ))}
                
                {completedDeals.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                      <Typography variant="body2" color="text.secondary">
                        У вас пока нет завершенных сделок
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          <TablePagination
            component="div"
            count={completedDeals.length}
            page={page}
            onPageChange={handlePageChange}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleRowsPerPageChange}
            rowsPerPageOptions={[5, 10, 25]}
            labelRowsPerPage="Строк на странице:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} из ${count}`}
          />
        </>
      )}
    </Card>
  );
}

ClientsList.propTypes = {
  activeClients: PropTypes.array.isRequired,
  completedDeals: PropTypes.array.isRequired,
  newAssignments: PropTypes.array
};

export default ClientsList;