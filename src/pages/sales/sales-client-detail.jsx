// src/pages/sales/sales-client-detail.jsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Alert, 
  CircularProgress, 
  Grid, 
  Card, 
  CardHeader, 
  CardContent,
  Divider,
  Tabs,
  Tab,
  Button,
  Stack,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import { Navigate, useNavigate } from 'react-router-dom';
import { paths } from 'src/routes/paths';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useAuth } from 'src/auth/hooks/use-auth';
import useCustomers from 'src/hooks/useCustomers';
import { fCurrency } from 'src/utils/format-number';
import { fDate } from 'src/utils/format-time';

// ----------------------------------------------------------------------
export default function SalesClientDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  
  // Используем хук для работы с клиентами
  const {
    selectedCustomer,
    customerHistory,
    customerDeals,
    loading,
    error,
    fetchCustomerById,
    fetchCustomerHistory,
    fetchCustomerDeals,
    updateCustomer,
    deleteCustomer,
    successMessage
  } = useCustomers({
    fetchOnMount: false
  });
  
  // Загружаем данные клиента при монтировании компонента
  useEffect(() => {
    if (id) {
      fetchCustomerById(id);
      fetchCustomerHistory(id);
      fetchCustomerDeals(id);
    }
  }, [id, fetchCustomerById, fetchCustomerHistory, fetchCustomerDeals]);
  
  // Обработчик изменения вкладки
  const handleTabChange = (_, newValue) => {
    setTabValue(newValue);
  };
  
  // Обработчик удаления клиента
  const handleDeleteClient = async () => {
    if (window.confirm('Вы уверены, что хотите удалить этого клиента?')) {
      const success = await deleteCustomer(id);
      if (success) {
        // Перенаправляем на страницу списка клиентов
        navigate(paths.dashboard.sales.clients);
      }
    }
  };
  
  // Обработчик редактирования клиента
  const handleEditClient = () => {
    navigate(paths.dashboard.sales.client.edit(id));
  };
  
  // Если пользователь не аутентифицирован, перенаправляем на страницу входа
  if (!user) {
    return <Navigate to={paths.auth.login} replace />;
  }
  
  // Проверяем принадлежность к отделу продаж или наличие прав админа
  const isSalesEmployee = user.department === 'sales' || user.role === 'admin' || user.role === 'owner' || user.role === 'head';
  if (!isSalesEmployee) {
    return <Navigate to={paths.dashboard.root} replace />;
  }
  
  return (
    <>
      <Helmet>
        <title>
          {selectedCustomer ? `${selectedCustomer.name} | Клиент` : 'Информация о клиенте'} | Отдел продаж
        </title>
      </Helmet>
      
      <Container maxWidth="xl">
        <CustomBreadcrumbs
          heading={selectedCustomer ? selectedCustomer.name : 'Информация о клиенте'}
          links={[
            { name: 'Главная', href: paths.dashboard.root },
            { name: 'Мой дашборд', href: paths.dashboard.sales.root },
            { name: 'Мои клиенты', href: paths.dashboard.sales.clients },
            { name: selectedCustomer ? selectedCustomer.name : 'Детали клиента' }
          ]}
          action={
            <Stack direction="row" spacing={1}>
              <Button 
                variant="outlined"
                color="primary"
                onClick={handleEditClient}
                disabled={loading || !selectedCustomer}
              >
                Редактировать
              </Button>
              <Button 
                variant="outlined"
                color="error"
                onClick={handleDeleteClient}
                disabled={loading || !selectedCustomer}
              >
                Удалить
              </Button>
            </Stack>
          }
          sx={{ mb: { xs: 3, md: 5 } }}
        />
        
        {/* Показываем сообщение об успехе */}
        {successMessage && (
          <Alert 
            severity="success" 
            sx={{ mb: 3 }}
            onClose={() => {}}
          >
            {successMessage}
          </Alert>
        )}
        
        {/* Показываем ошибку */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 3 }}
            onClose={() => {}}
          >
            {error}
          </Alert>
        )}
        
        {loading && !selectedCustomer ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
            <CircularProgress />
          </Box>
        ) : !selectedCustomer ? (
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Alert severity="error">
              Клиент с ID: {id} не найден. Возможно, он был удален или у вас недостаточно прав для просмотра.
            </Alert>
            <Button 
              variant="contained" 
              color="primary" 
              sx={{ mt: 2 }}
              onClick={() => navigate(paths.dashboard.sales.clients)}
            >
              Вернуться к списку клиентов
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {/* Основная информация о клиенте */}
            <Grid item xs={12} md={4}>
              <Card>
                <CardHeader title="Информация о клиенте" />
                <Divider />
                <CardContent>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Компания
                      </Typography>
                      <Typography variant="body1">
                        {selectedCustomer.name}
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Статус
                      </Typography>
                      <Chip 
                        label={selectedCustomer.status} 
                        color={
                          selectedCustomer.status === 'Переговоры' ? 'info' :
                          selectedCustomer.status === 'Первичный контакт' ? 'warning' :
                          selectedCustomer.status === 'Согласование КП' ? 'success' :
                          'default'
                        }
                        size="small"
                      />
                    </Box>
                    
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Потенциальная сумма
                      </Typography>
                      <Typography variant="body1">
                        {fCurrency(selectedCustomer.potential_amount)}
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Вероятность
                      </Typography>
                      <Typography variant="body1">
                        {selectedCustomer.probability}%
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Срочность
                      </Typography>
                      <Typography variant="body1">
                        {selectedCustomer.urgency}
                      </Typography>
                    </Box>
                    
                    {/* Дополнительные поля, если они есть в данных */}
                    {selectedCustomer.firstContactDate && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Первый контакт
                        </Typography>
                        <Typography variant="body1">
                          {selectedCustomer.firstContactDate}
                        </Typography>
                      </Box>
                    )}
                    
                    {selectedCustomer.lastContact && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Последний контакт
                        </Typography>
                        <Typography variant="body1">
                          {selectedCustomer.lastContact}
                        </Typography>
                      </Box>
                    )}
                    
                    {selectedCustomer.nextContactScheduled && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Следующий контакт
                        </Typography>
                        <Typography variant="body1">
                          {selectedCustomer.nextContactScheduled}
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Детальная информация */}
            <Grid item xs={12} md={8}>
              <Card sx={{ mb: 3 }}>
                <Tabs
                  value={tabValue}
                  onChange={handleTabChange}
                  sx={{ px: 2, pt: 2 }}
                >
                  <Tab label="Обзор" />
                  <Tab label="История" />
                  <Tab label="Сделки" />
                  <Tab label="Звонки" />
                </Tabs>
                
                <Divider />
                
                <CardContent>
                  {/* Вкладка "Обзор" */}
                  {tabValue === 0 && (
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        Общая информация
                      </Typography>
                      
                      {/* Если есть данные истории клиента */}
                      {customerHistory ? (
                        <Grid container spacing={3}>
                          <Grid item xs={12} sm={6} md={3}>
                            <Paper sx={{ p: 2, textAlign: 'center' }}>
                              <Typography variant="subtitle1" color="text.secondary">
                                Общая выручка
                              </Typography>
                              <Typography variant="h5" color="primary.main" sx={{ mt: 1 }}>
                                {fCurrency(customerHistory.totalRevenue || 0)}
                              </Typography>
                            </Paper>
                          </Grid>
                          
                          <Grid item xs={12} sm={6} md={3}>
                            <Paper sx={{ p: 2, textAlign: 'center' }}>
                              <Typography variant="subtitle1" color="text.secondary">
                                Прибыль
                              </Typography>
                              <Typography variant="h5" color="success.main" sx={{ mt: 1 }}>
                                {fCurrency(customerHistory.profit || 0)}
                              </Typography>
                            </Paper>
                          </Grid>
                          
                          <Grid item xs={12} sm={6} md={3}>
                            <Paper sx={{ p: 2, textAlign: 'center' }}>
                              <Typography variant="subtitle1" color="text.secondary">
                                Маржа
                              </Typography>
                              <Typography variant="h5" sx={{ mt: 1 }}>
                                {customerHistory.profitMargin || 0}%
                              </Typography>
                            </Paper>
                          </Grid>
                          
                          <Grid item xs={12} sm={6} md={3}>
                            <Paper sx={{ p: 2, textAlign: 'center' }}>
                              <Typography variant="subtitle1" color="text.secondary">
                                Средний чек
                              </Typography>
                              <Typography variant="h5" sx={{ mt: 1 }}>
                                {fCurrency(customerHistory.averageCheck || 0)}
                              </Typography>
                            </Paper>
                          </Grid>
                        </Grid>
                      ) : (
                        <Alert severity="info" sx={{ mt: 2 }}>
                          Нет данных по истории клиента.
                        </Alert>
                      )}
                      
                      {/* Примечания о клиенте */}
                      <Box sx={{ mt: 3 }}>
                        <Typography variant="h6" gutterBottom>
                          Примечания
                        </Typography>
                        
                        <Paper sx={{ p: 2 }}>
                          <Typography variant="body1">
                            {customerHistory?.notes || selectedCustomer?.notes || 'Нет примечаний о клиенте.'}
                          </Typography>
                        </Paper>
                      </Box>
                    </Box>
                  )}
                  
                  {/* Вкладка "История" */}
                  {tabValue === 1 && (
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        История транзакций
                      </Typography>
                      
                      {customerHistory && customerHistory.transactions && customerHistory.transactions.length > 0 ? (
                        <List>
                          {customerHistory.transactions.map((transaction) => (
                            <ListItem 
                              key={transaction.id}
                              divider
                              secondaryAction={
                                <Chip 
                                  label={transaction.isPaid ? 'Оплачено' : 'Не оплачено'} 
                                  color={transaction.isPaid ? 'success' : 'warning'}
                                  size="small"
                                />
                              }
                            >
                              <ListItemText
                                primary={`${fDate(transaction.date)} - ${fCurrency(transaction.amount)}`}
                                secondary={
                                  <>
                                    {transaction.products.join(', ')}
                                  </>
                                }
                              />
                            </ListItem>
                          ))}
                        </List>
                      ) : (
                        <Alert severity="info">
                          Нет данных по транзакциям клиента.
                        </Alert>
                      )}
                    </Box>
                  )}
                  
                  {/* Вкладка "Сделки" */}
                  {tabValue === 2 && (
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        Сделки
                      </Typography>
                      
                      {customerDeals && customerDeals.length > 0 ? (
                        <List>
                          {customerDeals.map((deal) => (
                            <ListItem 
                              key={deal.id}
                              divider
                              button
                              onClick={() => navigate(`/dashboard/deal/${deal.id}`)}
                            >
                              <ListItemText
                                primary={`Сделка от ${deal.close_date}`}
                                secondary={
                                  <>
                                    <Typography variant="body2" component="span">
                                      Сумма: {fCurrency(deal.amount)}
                                    </Typography>
                                    <br />
                                    <Typography variant="body2" component="span" color="success.main">
                                      Бонус: {fCurrency(deal.bonus)}
                                    </Typography>
                                  </>
                                }
                              />
                            </ListItem>
                          ))}
                        </List>
                      ) : (
                        <Alert severity="info">
                          Нет данных по сделкам клиента.
                        </Alert>
                      )}
                    </Box>
                  )}
                  
                  {/* Вкладка "Звонки" */}
                  {tabValue === 3 && (
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        История звонков
                      </Typography>
                      
                      <Alert severity="info">
                        Функционал истории звонков находится в разработке и будет доступен в ближайшее время.
                      </Alert>
                    </Box>
                  )}
                </CardContent>
              </Card>
              
              {/* Кнопки действий */}
              <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                <Button 
                  variant="contained" 
                  color="primary"
                  fullWidth
                >
                  Новый звонок
                </Button>
                
                <Button 
                  variant="outlined"
                  color="primary"
                  fullWidth
                >
                  Запланировать встречу
                </Button>
                
                <Button 
                  variant="outlined"
                  color="primary"
                  fullWidth
                >
                  Отправить КП
                </Button>
              </Stack>
            </Grid>
          </Grid>
        )}
      </Container>
    </>
  );
}