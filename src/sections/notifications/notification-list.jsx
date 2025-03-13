// src/sections/notifications/notification-list.jsx
import { useState, useEffect } from 'react';
import {
  Box,
  List,
  Badge,
  Card,
  Avatar,
  Button,
  ListItem,
  Typography,
  CardHeader,
  ListItemText,
  ListItemAvatar,
  CircularProgress,
} from '@mui/material';
import { Iconify } from 'src/components/iconify';
import axiosInstance from 'src/lib/axios';
import { fToNow } from 'src/utils/format-time';

export function NotificationList() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/notifications');
      setNotifications(response.data.data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Не удалось загрузить уведомления');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await axiosInstance.post(`/api/notifications/${id}/read`);
      // Обновляем список уведомлений
      setNotifications(prevNotifications =>
        prevNotifications.map(notif =>
          notif.id === id ? { ...notif, read_at: new Date().toISOString() } : notif
        )
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter(n => !n.read_at).map(n => n.id);
      await Promise.all(unreadIds.map(id => axiosInstance.post(`/api/notifications/${id}/read`)));
      
      // Обновляем список уведомлений
      setNotifications(prevNotifications =>
        prevNotifications.map(notif => 
          notif.read_at ? notif : { ...notif, read_at: new Date().toISOString() }
        )
      );
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'kpi':
        return <Avatar sx={{ bgcolor: 'primary.main' }}><Iconify icon="mdi:chart-line" /></Avatar>;
      case 'bonus':
        return <Avatar sx={{ bgcolor: 'success.main' }}><Iconify icon="mdi:cash" /></Avatar>;
      case 'bonus_confirmed':
        return <Avatar sx={{ bgcolor: 'info.main' }}><Iconify icon="mdi:cash-check" /></Avatar>;
      default:
        return <Avatar><Iconify icon="mdi:bell" /></Avatar>;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  const unreadCount = notifications.filter(n => !n.read_at).length;

  return (
    <Card>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>Уведомления</Typography>
            <Badge badgeContent={unreadCount} color="error" sx={{ mr: 1 }} />
          </Box>
        }
        action={
          <Button 
            size="small" 
            color="inherit" 
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
          >
            Отметить все как прочитанные
          </Button>
        }
      />

      {notifications.length === 0 ? (
        <Box p={3} textAlign="center">
          <Typography color="text.secondary">Нет уведомлений</Typography>
        </Box>
      ) : (
        <List disablePadding>
          {notifications.map((notification) => (
            <ListItem
              key={notification.id}
              sx={{ 
                py: 1.5, 
                px: 2.5, 
                bgcolor: notification.read_at ? 'transparent' : 'action.hover',
                '&:hover': { bgcolor: 'background.neutral' },
              }}
              secondaryAction={
                !notification.read_at && (
                  <Button
                    size="small"
                    color="primary"
                    onClick={() => handleMarkAsRead(notification.id)}
                  >
                    Отметить как прочитанное
                  </Button>
                )
              }
            >
              <ListItemAvatar>
                {getNotificationIcon(notification.type)}
              </ListItemAvatar>
              <ListItemText
                primary={notification.title}
                secondary={
                  <Box component="span" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {notification.message}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                      {fToNow(notification.created_at)}
                    </Typography>
                  </Box>
                }
                primaryTypographyProps={{ typography: 'subtitle2', gutterBottom: true }}
                secondaryTypographyProps={{ component: 'div' }}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Card>
  );
}