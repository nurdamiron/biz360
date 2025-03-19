// src/sections/account/account-notifications.jsx

import { useForm, Controller } from 'react-hook-form';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid2';
import Switch from '@mui/material/Switch';
import LoadingButton from '@mui/lab/LoadingButton';
import ListItemText from '@mui/material/ListItemText';
import FormControlLabel from '@mui/material/FormControlLabel';

import { toast } from 'src/components/snackbar';
import { Form } from 'src/components/hook-form';
import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

const NOTIFICATIONS = [
  {
    subheader: 'Активность',
    caption: 'Настройте уведомления о действиях в системе',
    items: [
      { id: 'activity_comments', label: 'Уведомлять по email, когда кто-то комментирует мою статью' },
      { id: 'activity_answers', label: 'Уведомлять по email, когда кто-то отвечает на мою форму' },
      { id: 'activity_follows', label: 'Уведомлять по email, когда кто-то подписывается на меня' },
    ],
  },
  {
    subheader: 'Приложение',
    caption: 'Настройте уведомления о системных событиях',
    items: [
      { id: 'application_news', label: 'Новости и анонсы' },
      { id: 'application_product', label: 'Еженедельные обновления продуктов' },
      { id: 'application_blog', label: 'Еженедельная рассылка блога' },
      { id: 'application_metrics', label: 'Обновления показателей эффективности' },
      { id: 'application_orders', label: 'Уведомления о новых заказах' },
    ],
  },
];

// ----------------------------------------------------------------------

export function AccountNotifications({ sx, ...other }) {
  const { employee } = useAuthContext();
  
  // Получаем предпочтения уведомлений из данных пользователя или используем значения по умолчанию
  const userNotifications = employee?.notifications || ['activity_comments', 'application_product', 'application_metrics'];
  
  const methods = useForm({
    defaultValues: { selected: userNotifications },
  });

  const {
    watch,
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  const onSubmit = handleSubmit(async (data) => {
    try {
      console.log('Сохранение настроек уведомлений:', data);
      
      // Здесь должен быть реальный запрос на обновление настроек уведомлений
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      toast.success('Настройки уведомлений обновлены!');
    } catch (error) {
      console.error('Ошибка при обновлении настроек уведомлений:', error);
      toast.error('Не удалось обновить настройки. Пожалуйста, попробуйте позже.');
    }
  });

  const getSelected = (selectedItems, item) =>
    selectedItems.includes(item)
      ? selectedItems.filter((value) => value !== item)
      : [...selectedItems, item];

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Card
        sx={[
          {
            p: 3,
            gap: 3,
            display: 'flex',
            flexDirection: 'column',
          },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
        {...other}
      >
        {NOTIFICATIONS.map((notification) => (
          <Grid key={notification.subheader} container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <ListItemText
                primary={notification.subheader}
                secondary={notification.caption}
                slotProps={{
                  primary: { sx: { typography: 'h6' } },
                  secondary: { sx: { mt: 0.5 } },
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 8 }}>
              <Box
                sx={{
                  p: 3,
                  gap: 1,
                  borderRadius: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  bgcolor: 'background.neutral',
                }}
              >
                <Controller
                  name="selected"
                  control={control}
                  render={({ field }) => (
                    <>
                      {notification.items.map((item) => (
                        <FormControlLabel
                          key={item.id}
                          label={item.label}
                          labelPlacement="start"
                          control={
                            <Switch
                              checked={field.value.includes(item.id)}
                              onChange={() => field.onChange(getSelected(values.selected, item.id))}
                              inputProps={{
                                id: `${item.label}-switch`,
                                'aria-label': `${item.label} switch`,
                              }}
                            />
                          }
                          sx={{ m: 0, width: 1, justifyContent: 'space-between' }}
                        />
                      ))}
                    </>
                  )}
                />
              </Box>
            </Grid>
          </Grid>
        ))}

        <LoadingButton type="submit" variant="contained" loading={isSubmitting} sx={{ ml: 'auto' }}>
          Сохранить изменения
        </LoadingButton>
      </Card>
    </Form>
  );
}