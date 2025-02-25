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
import MenuItem from '@mui/material/MenuItem';

// Базовая схема валидации для обоих режимов
const baseSchema = {
  fio: zod.string().min(1, { message: 'ФИО обязательно!' }),
  // phoneNumber: schemaHelper.phoneNumber({ isValid: isValidPhoneNumber }).optional(),
  phoneNumber: zod.string().optional(),
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
  const [roleOptions, setRoleOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);

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

  const handleVerifyEmployee = async () => {
    try {
      const confirmData = { ...currentEmployee, isVerified: true, status: 'active' };
      const response = await axiosInstance.put(endpoints.employee.update(id), confirmData);
      toast.success('Сотрудник успешно подтверждён!');
      setCurrentEmployee(response.data.data);
      reset(response.data.data);
    } catch (err) {
      console.error('Ошибка при подтверждении сотрудника:', err);
      toast.error('Ошибка при подтверждении сотрудника');
    }
  };


  const handleDeleteEmployee = async () => {
    try {
      await axiosInstance.delete(endpoints.employee.delete(id));
      toast.success('Сотрудник удалён!');
      router.push(paths.dashboard.employee.list);
    } catch (err) {
      console.error('Ошибка при удалении сотрудника:', err);
      toast.error('Ошибка при удалении сотрудника');
    }
  };

  
  const handleVerifyEmail = async () => {
    try {
      const response = await axiosInstance.post(endpoints.employee.verify(id));
      
      if (response.data?.success) {
        toast.success('Email подтвержден');
        setCurrentEmployee(prev => ({
          ...prev,
          isVerified: true
        }));
      }
    } catch (err) {
      console.error('Error verifying email:', error);
      toast.error(error.message || 'Ошибка при подтверждении email');
    }
  };

  const handleStatusChange = async (isBlocked) => {
    try {
      const response = await axiosInstance.patch(
        endpoints.employee.updateStatus(id),
        {
          status: isBlocked ? 'blocked' : 'active',
          isBlocked
        }
      );

      if (response.data?.success) {
        toast.success('Статус обновлен');
        // Обновляем данные в форме
        setCurrentEmployee(prev => ({
          ...prev,
          status: isBlocked ? 'blocked' : 'active'
        }));
      }
    } catch (err) {
      console.error('Error updating status:', error);
      toast.error(error.message || 'Ошибка при обновлении статуса');
    }
  };

  // Загрузка данных сотрудника при редактировании
  // В useEffect для загрузки данных
  useEffect(() => {
  const fetchEmployee = async () => {
    if (!isEdit) return;
    
    try {
      setLoading(true);
      setError(null);

      const response = await axiosInstance.get(endpoints.employee.details(id));
      console.log('API Response:', response);

      // Проверяем успешность ответа
      if (!response.data?.success) {
        throw new Error(response.data?.error || 'Failed to load employee data');
      }

      // Получаем данные
      const data = response.data.data;

      // Проверяем наличие данных
      if (!data) {
        throw new Error('No employee data received');
      }

      // Форматируем данные
      const formattedData = {
        id: data.id,
        fio: data.fio || '',
        email: data.email || '',
        phoneNumber: data.phoneNumber || '',
        department: data.department || '',
        role: data.role || '',
        status: data.status || 'active',
        isVerified: Boolean(data.isVerified),
        hireDate: data.hireDate ? format(new Date(data.hireDate), 'yyyy-MM-dd') : '',
        birthday: data.birthday ? format(new Date(data.birthday), 'yyyy-MM-dd') : '',
        metrics: data.metrics || {
          overall_performance: 0,
          kpi: 0,
          work_volume: 0,
          activity: 0,
          quality: 0
        }
      };

      setCurrentEmployee(formattedData);
      reset(formattedData);

    } catch (err) {
      console.error('Error fetching employee:', err);
      setError(err.message || 'Failed to load employee data');
      toast.error(err.message || 'Failed to load employee data');
    } finally {
      setLoading(false);
    }
  };

  fetchEmployee();
}, [id, isEdit, reset]);

useEffect(() => {
  axiosInstance.get('/api/employees/dictionaries')
    .then(res => {
      setRoleOptions(res.data.data.roles || []);
      setDepartmentOptions(res.data.data.departments || []);
      // ...
    })
    .catch(err => console.error('Failed to load dictionaries', err));
}, []);


  const values = watch();

  const onSubmit = handleSubmit(async (formData) => {
    try {
      // Format the data before sending
      const preparedData = {
        fio: formData.fio?.trim() || '',
        email: formData.email?.trim()?.toLowerCase() || '',
        phoneNumber: formData.phoneNumber || '',
        department: formData.department || '',
        role: formData.role || 'employee', // Default role if none selected
        status: formData.status || 'active', // Default status
        hireDate: formData.hireDate || null,
        birthday: formData.birthday || null
      };
  
      // Remove any undefined or null values
      const cleanedData = Object.fromEntries(
        Object.entries(preparedData).filter(([_, value]) => value != null)
      );
  
      if (isEdit) {
        const response = await axiosInstance.put(
          endpoints.employee.update(id),
          cleanedData
        );
  
        if (!response.data?.success) {
          throw new Error(response.data?.error || 'Ошибка при обновлении');
        }
  
        toast.success('Изменения сохранены!');
        
        const updatedEmployee = response.data.data;
        setCurrentEmployee(updatedEmployee);
        reset(updatedEmployee);
      } else {
        // For new employee, email is required
        if (!cleanedData.email) {
          throw new Error('Email обязателен при создании сотрудника');
        }
  
        const response = await axiosInstance.post(
          endpoints.employee.create,
          cleanedData
        );
  
        if (!response.data?.success) {
          throw new Error(response.data?.error || 'Ошибка при создании');
        }
  
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
      
      // Более информативное сообщение об ошибке
      const errorMessage = err.response?.data?.error || err.message || 'Ошибка при сохранении сотрудника';
      toast.error(errorMessage);
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

  console.log(roleOptions);

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
                  <Switch
                    checked={values.status === 'blocked'}
                    onChange={(e) => handleStatusChange(e.target.checked)}
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

            {isEdit && !values.isVerified && (
              <Stack sx={{ mt: 3, alignItems: 'center' }}>
                <Button variant="contained" onClick={handleVerifyEmployee}>
                  Подтвердить сотрудника
                </Button>
              </Stack>
            )}

            {isEdit && (
              <Stack sx={{ mt: 3, alignItems: 'center' }}>
                <Button variant="soft" color="error" onClick={handleDeleteEmployee}>
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
{/* 
              <Field.Phone
                name="phoneNumber"
                label="Телефон"
                // country={!isEdit ? 'RU' : undefined}
              /> */}

              <Field.Select
                name="department"
                label="Отдел"
              >
                 {departmentOptions.map((item) => (
                  <MenuItem key={item.value} value={item.value}>
                    {item.label}
                  </MenuItem>
                  ))}

              </Field.Select>

              <Field.Select name="role" label="Роль">
                {roleOptions?.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
              </Field.Select>
              
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