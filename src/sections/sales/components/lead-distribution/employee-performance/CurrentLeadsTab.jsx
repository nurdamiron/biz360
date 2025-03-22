// src/sections/sales/components/lead-distribution/employee-performance/CurrentLeadsTab.jsx
import PropTypes from 'prop-types';
import {
  Box,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  Button,
  Alert,
  Divider,
  Stack,
  alpha,
  Paper
} from '@mui/material';

// Material UI иконки (в комментариях показаны имена для импорта)
// import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
// import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
// import InfoIcon from '@mui/icons-material/Info';
// import PhoneIcon from '@mui/icons-material/Phone';
// import EmailIcon from '@mui/icons-material/Email';

/**
 * Компонент вкладки с текущими лидами сотрудника
 */
export default function CurrentLeadsTab({ theme, leads = [], formatCurrency }) {
  // Проверяем, предоставлена ли функция форматирования, если нет - используем стандартную
  const formatAmount = formatCurrency || ((amount) => 
    new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'KZT',
      maximumFractionDigits: 0
    }).format(amount)
  );
  
  // Функция для получения цвета приоритета
  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'Высокий':
        return theme.palette.error.main;
      case 'Средний':
        return theme.palette.warning.main;
      case 'Низкий':
        return theme.palette.success.main;
      default:
        return theme.palette.info.main;
    }
  };
  
  // Общая сумма потенциальных сделок
  const totalPotentialAmount = leads.reduce((sum, lead) => sum + lead.potential_amount, 0);
  
  // Сортировка лидов по приоритету и дедлайну
  const sortedLeads = [...leads].sort((a, b) => {
    // Сначала по приоритету
    const priorityOrder = { 'Высокий': 0, 'Средний': 1, 'Низкий': 2 };
    const priorityA = priorityOrder[a.priority] || 999;
    const priorityB = priorityOrder[b.priority] || 999;
    
    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }
    
    // Затем по дедлайну
    const dateA = new Date(a.contact_deadline.split('.').reverse().join('-'));
    const dateB = new Date(b.contact_deadline.split('.').reverse().join('-'));
    return dateA - dateB;
  });
  
  return (
    <Box>
      {/* Сводка по лидам */}
      <Card sx={{ 
        mb: 3, 
        borderRadius: 2,
        boxShadow: 'none',
        border: `1px solid ${theme.palette.divider}`
      }}>
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Сводка по текущим лидам
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ 
                p: 2, 
                borderRadius: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.05),
                height: '100%'
              }}>
                <Typography variant="caption" color="text.secondary">
                  Всего назначено лидов
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="primary.main">
                  {leads.length}
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ 
                p: 2, 
                borderRadius: 2,
                bgcolor: alpha(theme.palette.error.main, 0.05),
                height: '100%'
              }}>
                <Typography variant="caption" color="text.secondary">
                  Высокий приоритет
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="error.main">
                  {leads.filter(l => l.priority === 'Высокий').length}
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ 
                p: 2, 
                borderRadius: 2,
                bgcolor: alpha(theme.palette.warning.main, 0.05),
                height: '100%'
              }}>
                <Typography variant="caption" color="text.secondary">
                  Дедлайн сегодня
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="warning.main">
                  {leads.filter(l => {
                    const today = new Date().toLocaleDateString('ru-RU');
                    return l.contact_deadline === today;
                  }).length}
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ 
                p: 2, 
                borderRadius: 2,
                bgcolor: alpha(theme.palette.success.main, 0.05),
                height: '100%'
              }}>
                <Typography variant="caption" color="text.secondary">
                  Потенциальная сумма
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="success.main">
                  {formatAmount(totalPotentialAmount)}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Card>
      
      {/* Таблица с лидами */}
      <TableContainer component={Card} sx={{ 
        borderRadius: 2,
        boxShadow: 'none',
        border: `1px solid ${theme.palette.divider}`
      }}>
        <Box sx={{ p: 2, pb: 0 }}>
          <Typography variant="subtitle1">
            Список текущих лидов ({leads.length})
          </Typography>
        </Box>
        
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Название</TableCell>
              <TableCell>Контакт</TableCell>
              <TableCell>Приоритет</TableCell>
              <TableCell>Дедлайн</TableCell>
              <TableCell align="right">Сумма</TableCell>
              <TableCell align="right">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedLeads.map((lead) => (
              <TableRow key={lead.id} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {lead.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {lead.source}
                  </Typography>
                </TableCell>
                
                <TableCell>
                  <Typography variant="body2">
                    {lead.contact}
                  </Typography>
                </TableCell>
                
                <TableCell>
                  <Chip
                    label={lead.priority}
                    size="small"
                    sx={{ 
                      bgcolor: alpha(getPriorityColor(lead.priority), 0.1),
                      color: getPriorityColor(lead.priority),
                      fontWeight: 'medium',
                      height: 24
                    }}
                  />
                </TableCell>
                
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ 
                      mr: 0.5, 
                      color: theme.palette.warning.main,
                      display: 'flex'
                    }}>
                      📅
                    </Box>
                    <Typography variant="body2">
                      {lead.contact_deadline}
                    </Typography>
                  </Box>
                </TableCell>
                
                <TableCell align="right">
                  <Typography variant="body2" fontWeight="bold" color="success.main">
                    {formatAmount(lead.potential_amount)}
                  </Typography>
                </TableCell>
                
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button
                      size="small"
                      variant="outlined"
                      sx={{ minWidth: 'auto', p: '4px' }}
                    >
                      📞
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      sx={{ minWidth: 'auto', p: '4px' }}
                    >
                      ✉️
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      sx={{ minWidth: 'auto', p: '4px' }}
                    >
                      ℹ️
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
            
            {leads.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} sx={{ py: 3 }}>
                  <Alert severity="info" sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body2">
                      На данный момент сотруднику не назначено ни одного лида
                    </Typography>
                  </Alert>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

// Необходимый элемент для сетки в верхней части компонента
const Grid = ({ container, item, xs, sm, md, spacing, children, ...props }) => {
  if (container) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          margin: spacing ? -spacing/2 : 0,
          ...props?.sx
        }}
        {...props}
      >
        {children}
      </Box>
    );
  }
  
  if (item) {
    return (
      <Box 
        sx={{ 
          flexBasis: {
            xs: xs === 12 ? '100%' : `${(xs / 12) * 100}%`,
            sm: sm && `${(sm / 12) * 100}%`,
            md: md && `${(md / 12) * 100}%`,
          },
          maxWidth: {
            xs: xs === 12 ? '100%' : `${(xs / 12) * 100}%`,
            sm: sm && `${(sm / 12) * 100}%`,
            md: md && `${(md / 12) * 100}%`,
          },
          padding: spacing ? spacing/2 : 0,
          ...props?.sx
        }}
        {...props}
      >
        {children}
      </Box>
    );
  }
  
  return <Box {...props}>{children}</Box>;
};

Grid.propTypes = {
  container: PropTypes.bool,
  item: PropTypes.bool,
  xs: PropTypes.number,
  sm: PropTypes.number,
  md: PropTypes.number,
  spacing: PropTypes.number,
  children: PropTypes.node,
  sx: PropTypes.object
};

CurrentLeadsTab.propTypes = {
  theme: PropTypes.object.isRequired,
  leads: PropTypes.array,
  formatCurrency: PropTypes.func
};