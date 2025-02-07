import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; 
import { z as zod } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { isValidPhoneNumber } from 'react-phone-number-input/input';

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

// ----------------------------------------------------------------------
// Схема валидации данных сотрудника
const NewEmployeeSchema = zod.object({
  avatarUrl: schemaHelper.file().or(zod.null()),
  fio: zod.string().min(1, { message: 'ФИО обязательно!' }),
  email: zod
    .string()
    .min(1, { message: 'Email обязателен!' })
    .email({ message: 'Неверный формат email!' }),
  phoneNumber: schemaHelper.phoneNumber({ isValid: isValidPhoneNumber }),
  department: zod.string().min(1, { message: 'Укажите отдел!' }),
  role: zod.string().min(1, { message: 'Укажите роль!' }),
  address: zod.string().optional(),
  status: zod.string().optional(),
  isVerified: zod.boolean().optional(),
  hireDate: zod.string().optional(),
  birthday: zod.string().optional(),
  country: zod.string().optional(),
  state: zod.string().optional(),
  city: zod.string().optional(),
  zipCode: zod.string().optional(),
  overall_performance: zod.number().or(zod.nan()).optional(),
  kpi: zod.number().or(zod.nan()).optional(),
  work_volume: zod.number().or(zod.nan()).optional(),
  activity: zod.number().or(zod.nan()).optional(),
  quality: zod.number().or(zod.nan()).optional(),
});

// ----------------------------------------------------------------------
//
// Единый компонент: если :id есть -> редактирование, иначе -> создание
//
export function EmployeeNewEditForm() {
  // 1) Параметр id из адреса (если используете react-router-dom v6)
  const { id } = useParams();

  // 2) Для переключения режимов
  const isEdit = Boolean(id);

  // 3) Состояния для загрузки/ошибок
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 4) Храним данные сотрудника (если режим редактирования)
  const [currentEmployee, setCurrentEmployee] = useState(null);

  // 5) Роутинг-хук для переходов
  const router = useRouter();

  // При первом рендере, если есть id, подгружаем данные
  useEffect(() => {
    const fetchEmployee = async () => {
      if (!isEdit) return; // Если нет id, значит "создание"
      try {
        setLoading(true);
        setError(null);
        const response = await axiosInstance.get(endpoints.employee.details(id));
        const data = response.data?.data;
        if (!data) {
          setError('Сотрудник не найден');
        } else {
          setCurrentEmployee(data);
        }
      } catch (err) {
        console.error('Ошибка при загрузке сотрудника:', err);
        setError('Не удалось загрузить данные сотрудника');
      } finally {
        setLoading(false);
      }
    };
    fetchEmployee();
  }, [id, isEdit]);

  // Стартовые значения формы, если сотрудник пуст
  const defaultValues = {
    avatarUrl: null,
    fio: '',
    email: '',
    phoneNumber: '',
    department: '',
    role: '',
    address: '',
    status: 'active',
    isVerified: true,
    hireDate: '',
    birthday: '',
    country: '',
    state: '',
    city: '',
    zipCode: '',
    overall_performance: 0,
    kpi: 0,
    work_volume: 0,
    activity: 0,
    quality: 0,
  };

  // Сама форма (react-hook-form)
  const methods = useForm({
    mode: 'onSubmit',
    resolver: zodResolver(NewEmployeeSchema),
    // Если currentEmployee есть, подставим его, иначе используем defaultValues
    defaultValues,
    values: currentEmployee || defaultValues,
  });

  const {
    reset,
    watch,
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  // При сабмите формы
  const onSubmit = handleSubmit(async (formData) => {
    try {
      if (isEdit) {
        // Режим редактирования
        await axiosInstance.put(endpoints.employee.update(id), formData);
        toast.success('Изменения сохранены!');
      } else {
        // Режим создания
        await axiosInstance.post(endpoints.employee.create, formData);
        toast.success('Сотрудник создан!');
      }
      // По завершении
      reset();
      router.push(paths.dashboard.employee.list);
    } catch (err) {
      console.error('Ошибка при сохранении сотрудника:', err);
      toast.error('Ошибка при сохранении сотрудника');
    }
  });

  // Если мы в режиме редактирования и идёт загрузка
  if (isEdit && loading) {
    return (
      <Box sx={{ textAlign: 'center', mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Если при редактировании возникла ошибка
  if (isEdit && error) {
    return (
      <Box sx={{ textAlign: 'center', mt: 5 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  // Если "isEdit" и "currentEmployee === null" после загрузки (значит не найден)
  if (isEdit && !loading && !currentEmployee && !error) {
    return (
      <Box sx={{ textAlign: 'center', mt: 5 }}>
        <Typography color="error">Сотрудник не найден</Typography>
      </Box>
    );
  }

  // Формируем JSX формы
  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        {/* Левая колонка: аватар + статус */}
        <Grid item xs={12} md={4}>
          <Card sx={{ pt: 10, pb: 5, px: 3, position: 'relative' }}>
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
                      color: 'text.disabled',
                    }}
                  >
                    Разрешены *.jpeg, *.jpg, *.png, *.gif
                    <br /> Максимальный размер {fData(3145728)}
                  </Typography>
                }
              />
            </Box>

            {/* Если редактируем, показываем переключатель "Заблокирован" */}
            {isEdit && (
              <FormControlLabel
                labelPlacement="start"
                control={(
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
                )}
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
                sx={{
                  mx: 0,
                  mb: 3,
                  width: 1,
                  justifyContent: 'space-between',
                }}
              />
            )}

            {/* Переключатель "Подтверждён ли email" */}
            <Field.Switch
              name="isVerified"
              labelPlacement="start"
              label={
                <>
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    Подтверждён ли email
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    При отключении, возможно, потребуется повторная верификация
                  </Typography>
                </>
              }
              sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
            />

            

            {/* Кнопка удаления (только в режиме редактирования) */}
            {isEdit && (
              <Stack sx={{ mt: 3, alignItems: 'center', justifyContent: 'center' }}>
                <Button variant="soft" color="error">
                  Удалить сотрудника
                </Button>
              </Stack>
            )}
          </Card>
        </Grid>

        {/* Правая колонка: поля формы */}
        <Grid item xs={12} md={8}>
          <Card sx={{ p: 3 }}>
            <Box
              sx={{
                rowGap: 3,
                columnGap: 2,
                display: 'grid',
                gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' },
              }}
            >
              <Field.Text name="fio" label="ФИО" />
              <Field.Text name="email" label="Email" />

              <Field.Phone
                name="phoneNumber"
                label="Телефон"
                country={!isEdit ? 'RU' : undefined}
              />
              
              <Field.Text name="department" label="Отдел" />
              <Field.Text name="role" label="Роль" />
              <Field.Text name="country" label="Страна" />
              <Field.Text name="state" label="Область/Регион" />
              <Field.Text name="city" label="Город" />
              <Field.Text name="address" label="Адрес" />
              <Field.Text name="zipCode" label="Индекс" />
              <Field.Text name="hireDate" label="Дата приёма на работу" type="date" />
              <Field.Text name="birthday" label="Дата рождения" type="date" />
            </Box>

            <Stack sx={{ mt: 3, alignItems: 'flex-end' }}>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                {isEdit ? 'Сохранить изменения' : 'Создать сотрудника'}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Form>
  );
}
