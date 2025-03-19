// src/sections/account/account-general.jsx

import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { isValidPhoneNumber } from 'react-phone-number-input/input';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid2';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { fData } from 'src/utils/format-number';
import { toast } from 'src/components/snackbar';
import { Form, Field, schemaHelper } from 'src/components/hook-form';
import { useAuthContext } from 'src/auth/hooks';
import { departmentToRussian, roleToRussian } from 'src/auth/utils';
import { useCallback } from 'react';

// ----------------------------------------------------------------------

// Схема "аккаунта"
export const UpdateEmployeeSchema = zod.object({
  displayName: zod.string().min(1, { message: 'ФИО обязательно!' }),
  email: zod
    .string()
    .min(1, { message: 'Эл. почта обязательна!' })
    .email({ message: 'Неверный формат эл. почты!' }),
  photoURL: schemaHelper.file({ message: 'Аватар обязателен!' }),
  phoneNumber: schemaHelper.phoneNumber({ isValid: isValidPhoneNumber }),
  country: schemaHelper.nullableInput(zod.string().min(1, { message: 'Страна обязательна!' }), {
    message: 'Страна обязательна!',
  }),
  address: zod.string().min(1, { message: 'Адрес обязателен!' }),
  state: zod.string().min(1, { message: 'Область/Регион обязателен!' }),
  city: zod.string().min(1, { message: 'Город обязателен!' }),
  zipCode: zod.string().min(1, { message: 'Индекс обязателен!' }),
  about: zod.string().min(1, { message: 'Информация о себе обязательна!' }),
  isPublic: zod.boolean(),
});

// ----------------------------------------------------------------------

export function AccountGeneral() {
  // Получаем данные пользователя из AuthContext
  const { employee, refreshUserData } = useAuthContext();

  // Маппинг данных пользователя для формы
  const currentEmployee = employee ? {
    displayName: employee.name || '',
    email: employee.email || '',
    photoURL: employee.photoURL || null,
    phoneNumber: employee.phoneNumber || '',
    country: employee.country || null,
    address: employee.address || '',
    state: employee.state || '',
    city: employee.city || '',
    zipCode: employee.zipCode || '',
    about: employee.about || '',
    isPublic: employee.isPublic || false,
    department: employee.department ? departmentToRussian(employee.department) : '',
    role: employee.role ? roleToRussian(employee.role) : '',
  } : null;

  const defaultValues = {
    displayName: '',
    email: '',
    photoURL: null,
    phoneNumber: '',
    country: null,
    address: '',
    state: '',
    city: '',
    zipCode: '',
    about: '',
    isPublic: false,
  };

  // useForm
  const methods = useForm({
    mode: 'all',
    resolver: zodResolver(UpdateEmployeeSchema),
    defaultValues,
    values: currentEmployee || defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  // Обработчик отправки формы
  const onSubmit = handleSubmit(async (data) => {
    try {
      console.log('Отправка данных на сервер:', data);
      
      // Здесь должен быть реальный запрос PUT/PATCH к серверу
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      // После успешного обновления обновляем данные пользователя
      if (refreshUserData) {
        await refreshUserData();
      }
      
      toast.success('Данные успешно обновлены!');
    } catch (error) {
      console.error('Ошибка при обновлении данных:', error);
      toast.error('Не удалось обновить данные. Пожалуйста, попробуйте позже.');
    }
  });

  // Если данные пользователя еще не загружены
  if (!employee) {
    return (
      <Card sx={{ p: 3 }}>
        <Typography variant="body1">Загрузка данных пользователя...</Typography>
      </Card>
    );
  }

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            sx={{
              pt: 10,
              pb: 5,
              px: 3,
              textAlign: 'center',
            }}
          >
            <Field.UploadAvatar
              name="photoURL"
              maxSize={3145728}
              helperText={
                <Typography
                  variant="caption"
                  sx={{
                    mt: 3,
                    mx: 'auto',
                    display: 'block',
                    textAlign: 'center',
                    color: 'text.disabled',
                  }}
                >
                  Разрешены форматы *.jpeg, *.jpg, *.png, *.gif
                  <br /> максимальный размер {fData(3145728)}
                </Typography>
              }
            />

            <Typography variant="subtitle1" sx={{ mt: 3 }}>
              {currentEmployee.role}
            </Typography>

            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
              {currentEmployee.department}
            </Typography>

            <Field.Switch
              name="isPublic"
              labelPlacement="start"
              label="Публичный профиль"
              sx={{ mt: 5 }}
            />

            {(employee.role === 'admin' || employee.role === 'owner') && (
              <Button variant="soft" color="error" sx={{ mt: 3 }}>
                Удалить сотрудника
              </Button>
            )}
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ p: 3 }}>
            <Box
              sx={{
                rowGap: 3,
                columnGap: 2,
                display: 'grid',
                gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' },
              }}
            >
              <Field.Text name="displayName" label="ФИО" />
              <Field.Text name="email" label="Эл. почта" />
              <Field.Phone name="phoneNumber" label="Номер телефона" />
              <Field.Text name="address" label="Адрес" />

              <Field.CountrySelect name="country" label="Страна" placeholder="Выберите страну" />

              <Field.Text name="state" label="Область/Регион" />
              <Field.Text name="city" label="Город" />
              <Field.Text name="zipCode" label="Индекс" />
            </Box>

            <Stack spacing={3} sx={{ mt: 3, alignItems: 'flex-end' }}>
              <Field.Text name="about" multiline rows={4} label="О себе" />

              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                Сохранить изменения
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Form>
  );
}