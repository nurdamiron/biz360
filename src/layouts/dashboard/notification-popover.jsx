// src/layouts/dashboard/notification-popover.jsx
import { useState, useEffect } from 'react';
import { usePopover } from 'minimal-shared/hooks';
import {
  Box,
  List,
  Badge,
  Avatar,
  Popover,
  IconButton,
  Typography,
  ListItemText,
  ListItemButton,
  ListItemAvatar,
  Button,
  CircularProgress
} from '@mui/material';
import { Iconify } from 'src/components/iconify';
import axiosInstance from 'src/lib/axios';
import { fToNow } from 'src/utils/format-time';

export function NotificationPopover() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const popover = usePopover();

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/notifications');
      const { data } = response.data;
      setNotifications(data);
      setUnreadCount(data.filter(notification => !notification.read_at).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Периодически проверяем наличие новых уведомлений
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Проверка каждую минуту
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await axiosInstance.post(`/api/notifications/${id}/read`);
      
      setNotifications(prevNotifications =>
        prevNotifications.map(notification =>
          notification.id === id
            ? { ...notification, read_at: new Date().toISOString() }
            : notification
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await Promise.all(
        notifications
          .filter(notification => !notification.read_at)
          .map(notification => axiosInstance.post(`/api/notifications/${notification.id}/read`))
      );
      
      setNotifications(prevNotifications =>
        prevNotifications.map(notification => ({
          ...notification,
          read_at: notification.read_at || new Date().toISOString(),
        }))
      );
      
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
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

  return (
    <>
      <IconButton
        color={popover.open ? 'primary' : 'default'}
        onClick={popover.onOpen}
        sx={{ width: 40, height: 40 }}
      >
        <Badge badgeContent={unreadCount} color="error">
          <Iconify icon="solar:bell-bing-bold-duotone" width={24} />
        </Badge>
      </IconButton>

      <Popover
        open={popover.open}
        anchorEl={popover.anchorEl}
        onClose={popover.onClose}
        anchorOrigin={{ vertical: 'bottom',
            horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            PaperProps={{
              sx: { width: 360, p: 0, mt: 1.5, ml: 0.75 },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', py: 2, px: 2.5 }}>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle1">Уведомления</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {unreadCount > 0 ? `У вас ${unreadCount} непрочитанных уведомлений` : 'Нет новых уведомлений'}
                </Typography>
              </Box>
    
              {unreadCount > 0 && (
                <IconButton color="primary" onClick={handleMarkAllAsRead}>
                  <Iconify icon="eva:done-all-fill" width={20} height={20} />
                </IconButton>
              )}
            </Box>
    
            <List sx={{ p: 0, maxHeight: 340, overflowY: 'auto' }}>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : notifications.length === 0 ? (
                <Typography variant="subtitle1" sx={{ p: 2, textAlign: 'center' }}>
                  Нет уведомлений
                </Typography>
              ) : (
                notifications.map((notification) => (
                  <ListItemButton
                    key={notification.id}
                    sx={{
                      py: 1.5,
                      px: 2.5,
                      mt: '1px',
                      ...(notification.read_at && {
                        bgcolor: 'action.hover',
                      }),
                    }}
                    onClick={() => handleMarkAsRead(notification.id)}
                  >
                    <ListItemAvatar>{getNotificationIcon(notification.type)}</ListItemAvatar>
                    <ListItemText
                      primary={notification.title}
                      secondary={
                        <Box component="span">
                          <Typography
                            variant="body2"
                            sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                            }}
                          >
                            {notification.message}
                          </Typography>
    
                          <Typography
                            variant="caption"
                            sx={{ mt: 0.5, display: 'flex', alignItems: 'center', color: 'text.disabled' }}
                          >
                            <Iconify icon="eva:clock-fill" sx={{ mr: 0.5, width: 16, height: 16 }} />
                            {fToNow(notification.created_at)}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItemButton>
                ))
              )}
            </List>
    
            <Box sx={{ p: 1 }}>
              <Button fullWidth disableRipple>
                Посмотреть все
              </Button>
            </Box>
          </Popover>
        </>
      );
    }