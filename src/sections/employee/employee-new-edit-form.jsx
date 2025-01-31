import { z as zod } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { isValidPhoneNumber } from 'react-phone-number-input/input';

import axiosInstance, { endpoints } from 'src/lib/axios';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import FormControlLabel from '@mui/material/FormControlLabel';

import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

import { fData } from 'src/utils/format-number';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Field, Form, schemaHelper } from 'src/components/hook-form';

// ----------------------------------------------------------------------
// Схема валидации данных сотрудника (Zod)
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

export function EmployeeNewEditForm({ currentEmployee }) {
  const router = useRouter();

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

  // Инициализация формы
  const methods = useForm({
    mode: 'onSubmit',
    resolver: zodResolver(NewEmployeeSchema),
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

  const onSubmit = handleSubmit(async (formData) => {
    try {
      if (currentEmployee?.id) {
        // Режим редактирования
        await axiosInstance.put(endpoints.employee.update(currentEmployee.id), formData);
        toast.success('Изменения сохранены!');
      } else {
        // Режим создания
        await axiosInstance.post(endpoints.employee.create, formData);
        toast.success('Сотрудник создан!');
      }

      reset();
      router.push(paths.dashboard.employee.list);
    } catch (error) {
      console.error('Ошибка при сохранении сотрудника:', error);
      toast.error('Ошибка при сохранении сотрудника');
    }
  });

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        {/* Левая колонка: аватар + статус */}
        <Grid item xs={12} md={4}>
          <Card sx={{ pt: 10, pb: 5, px: 3, position: 'relative' }}>
            {currentEmployee && (
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

            {currentEmployee && (
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

            {currentEmployee && (
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
                country={!currentEmployee ? 'RU' : undefined}
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

              {/* Поля для метрик, если нужны */}
              <Field.Text name="overall_performance" label="Общая эффективность (%)" type="number" />
              <Field.Text name="kpi" label="KPI" type="number" />
              <Field.Text name="work_volume" label="Объём работ" type="number" />
              <Field.Text name="activity" label="Активность" type="number" />
              <Field.Text name="quality" label="Качество" type="number" />
            </Box>

            <Stack sx={{ mt: 3, alignItems: 'flex-end' }}>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                {currentEmployee ? 'Сохранить изменения' : 'Создать сотрудника'}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Form>
  );
}
