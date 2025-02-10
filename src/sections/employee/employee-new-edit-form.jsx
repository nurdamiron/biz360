import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { z as zod } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { isValidPhoneNumber } from 'react-phone-number-input/input';
import { format } from 'date-fns';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import FormControlLabel from '@mui/material/FormControlLabel';
import CircularProgress from '@mui/material/CircularProgress';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { fData } from 'src/utils/format-number';
import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Field, Form, schemaHelper } from 'src/components/hook-form';
import axiosInstance, { endpoints } from 'src/lib/axios';

// Базовая схема валидации для обоих режимов
const baseSchema = {
  fio: zod.string().min(1, { message: 'ФИО обязательно!' }),
  phoneNumber: schemaHelper.phoneNumber({ isValid: isValidPhoneNumber }).optional(),
  department: zod.string().optional(),
  role: zod.string().optional(),
  avatarUrl: schemaHelper.file().or(zod.null()).optional(),
  hireDate: zod.string().optional(),
  birthday: zod.string().optional()
};

// Схема для создания (с обязательным email)
const NewEmployeeSchema = zod.object({
  ...baseSchema,
  email: zod
    .string()
    .min(1, { message: 'Email обязателен!' })
    .email({ message: 'Неверный формат email!' })
});

// Схема для обновления (без email)
const EmployeeUpdateSchema = zod.object(baseSchema);

export function EmployeeNewEditForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const router = useRouter();

  const roleOptions = [
    { value: 'owner', label: 'Владелец' },
    { value: 'admin', label: 'Администратор' },
    { value: 'manager', label: 'Менеджер' },
    { value: 'employee', label: 'Сотрудник' }
  ];

  const departmentOptions = [
    { value: 'sales', label: 'Отдел продаж' },
    { value: 'development', label: 'Отдел разработки' },
    { value: 'marketing', label: 'Отдел маркетинга' },
    { value: 'hr', label: 'Отдел кадров' }
  ];

  // Загрузка данных сотрудника при редактировании
  useEffect(() => {
    const fetchEmployee = async () => {
      if (!isEdit) return;
      try {
        setLoading(true);
        setError(null);
        const response = await axiosInstance.get(endpoints.employee.details(id));
        const data = response.data?.data;
        
        if (!data) {
          setError('Сотрудник не найден');
          return;
        }

        // Форматируем даты для input type="date"
        const formattedData = {
          ...data,
          hireDate: data.hireDate ? format(new Date(data.hireDate), 'yyyy-MM-dd') : '',
          birthday: data.birthday ? format(new Date(data.birthday), 'yyyy-MM-dd') : ''
        };
        
        setCurrentEmployee(formattedData);
      } catch (err) {
        console.error('Ошибка при загрузке сотрудника:', {
          error: err,
          employeeId: id,
          context: 'EmployeeNewEditForm.fetchEmployee'
        });
        setError('Не удалось загрузить данные сотрудника');
      } finally {
        setLoading(false);
      }
    };
    fetchEmployee();
  }, [id, isEdit]);

  const defaultValues = {
    fio: '',
    email: '',
    phoneNumber: '',
    department: '',
    role: '',
    avatarUrl: null,
    hireDate: '',
    birthday: ''
  };

  const schema = isEdit ? EmployeeUpdateSchema : NewEmployeeSchema;
  
  const methods = useForm({
    mode: 'onSubmit',
    resolver: zodResolver(schema),
    defaultValues,
    values: currentEmployee || defaultValues
  });

  const {
    reset,
    watch,
    control,
    handleSubmit,
    formState: { isSubmitting }
  } = methods;

  const values = watch();

  const onSubmit = handleSubmit(async (formData) => {
    try {
      if (isEdit) {
        // Для обновления запрещаем изменение email
        const dataToUpdate = { ...formData, email: currentEmployee.email };
        const response = await axiosInstance.put(endpoints.employee.update(id), dataToUpdate);
        toast.success('Изменения сохранены!');
        
        const updatedEmployee = response.data.data;
        setCurrentEmployee(updatedEmployee);
        reset(updatedEmployee);
      } else {
        const response = await axiosInstance.post(endpoints.employee.create, formData);
        toast.success('Сотрудник создан!');
        reset();
        router.push(paths.dashboard.employee.list);
      }
    } catch (err) {
      console.error('Ошибка при сохранении сотрудника:', {
        error: err,
        formData,
        mode: isEdit ? 'update' : 'create',
        context: 'EmployeeNewEditForm.onSubmit'
      });
      toast.error('Ошибка при сохранении сотрудника');
    }
  });

  if (isEdit && loading) {
    return (
      <Box sx={{ textAlign: 'center', mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isEdit && error) {
    return (
      <Box sx={{ textAlign: 'center', mt: 5 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        {/* Левая колонка */}
        <Grid item xs={12} md={4}>
          <Card sx={{ pt: 10, pb: 5, px: 3 }}>
            {isEdit && (
              <Label
                color={
                  (values.status === 'active' && 'success') ||
                  (values.status === 'banned' && 'error') ||
                  'warning'
                }
                sx={{ position: 'absolute', top: 24, right: 24 }}
              >
                {values.status}
              </Label>
            )}
            
            <Box sx={{ mb: 5 }}>
              <Field.UploadAvatar
                name="avatarUrl"
                maxSize={3145728}
                helperText={
                  <Typography
                    variant="caption"
                    sx={{
                      mt: 3,
                      mx: 'auto',
                      display: 'block',
                      textAlign: 'center',
                      color: 'text.disabled'
                    }}
                  >
                    Разрешены *.jpeg, *.jpg, *.png, *.gif
                    <br /> Максимальный размер {fData(3145728)}
                  </Typography>
                }
              />
            </Box>

            {isEdit && (
              <FormControlLabel
                labelPlacement="start"
                control={
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        {...field}
                        checked={field.value !== 'active'}
                        onChange={(event) =>
                          field.onChange(event.target.checked ? 'banned' : 'active')
                        }
                      />
                    )}
                  />
                }
                label={
                  <>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                      Заблокирован
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      При включении сотрудник теряет доступ к системе
                    </Typography>
                  </>
                }
                sx={{ mx: 0, mb: 3, width: 1, justifyContent: 'space-between' }}
              />
            )}

            <Field.Switch
              name="isVerified"
              labelPlacement="start"
              label={
                <>
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    Подтверждён ли email
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    При отключении потребуется повторная верификация
                  </Typography>
                </>
              }
              sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
            />

            {isEdit && !values.isVerified && (
              <Stack sx={{ mt: 3, alignItems: 'center' }}>
                <Button
                  variant="contained"
                  onClick={async () => {
                    try {
                      const confirmData = { ...currentEmployee, isVerified: true };
                      const response = await axiosInstance.put(
                        endpoints.employee.update(id),
                        confirmData
                      );
                      toast.success('Сотрудник успешно подтверждён!');
                      setCurrentEmployee(response.data.data);
                      reset(response.data.data);
                    } catch (err) {
                      console.error('Ошибка при подтверждении сотрудника:', {
                        error: err,
                        employeeId: id,
                        context: 'EmployeeNewEditForm.confirmEmployee'
                      });
                      toast.error('Ошибка при подтверждении сотрудника');
                    }
                  }}
                >
                  Подтвердить сотрудника
                </Button>
              </Stack>
            )}

            {isEdit && (
              <Stack sx={{ mt: 3, alignItems: 'center' }}>
                <Button
                  variant="soft"
                  color="error"
                  onClick={async () => {
                    try {
                      await axiosInstance.delete(endpoints.employee.delete(id));
                      toast.success('Сотрудник удалён!');
                      router.push(paths.dashboard.employee.list);
                    } catch (err) {
                      console.error('Ошибка при удалении сотрудника:', {
                        error: err,
                        employeeId: id,
                        context: 'EmployeeNewEditForm.deleteEmployee'
                      });
                      toast.error('Ошибка при удалении сотрудника');
                    }
                  }}
                >
                  Удалить сотрудника
                </Button>
              </Stack>
            )}
          </Card>
        </Grid>

        {/* Правая колонка */}
        <Grid item xs={12} md={8}>
          <Card sx={{ p: 3 }}>
            <Box
              sx={{
                rowGap: 3,
                columnGap: 2,
                display: 'grid',
                gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' }
              }}
            >
              <Field.Text
                name="fio"
                label="ФИО"
                required
              />

              <Field.Text
                name="email"
                label="Email"
                disabled={isEdit}
                required={!isEdit}
              />

              <Field.Phone
                name="phoneNumber"
                label="Телефон"
                country={!isEdit ? 'RU' : undefined}
              />

              <Field.Select
                name="department"
                label="Отдел"
                options={departmentOptions}
              />

              <Field.Select
                name="role"
                label="Роль"
                options={roleOptions}
              />

              <Field.Text
                name="country"
                label="Страна"
              />

              <Field.Text
                name="state"
                label="Область/Регион"
              />

              <Field.Text
                name="city"
                label="Город"
              />

              <Field.Text
                name="address"
                label="Адрес"
              />

              <Field.Text
                name="zipCode"
                label="Индекс"
              />

              <Field.Text
                name="hireDate"
                label="Дата приёма на работу"
                type="date"
                InputLabelProps={{ shrink: true }}
              />

              <Field.Text
                name="birthday"
                label="Дата рождения"
                type="date"
                InputLabelProps={{ shrink: true }}
              />
            </Box>

            <Stack sx={{ mt: 3, alignItems: 'flex-end' }}>
              <LoadingButton
                type="submit"
                variant="contained"
                loading={isSubmitting}
              >
                {isEdit ? 'Сохранить изменения' : 'Создать сотрудника'}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Form>
  );
}