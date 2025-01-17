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

import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

import { fData } from 'src/utils/format-number';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Field, Form, schemaHelper } from 'src/components/hook-form';


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
  country: zod.string().optional(),
  state: zod.string().optional(),
  city: zod.string().optional(),
  zipCode: zod.string().optional(),
  status: zod.string().optional(),
  isVerified: zod.boolean().optional(),
  // Пример: поля для метрик
  overall_performance: zod.number().or(zod.nan()).optional(),
  kpi: zod.number().or(zod.nan()).optional(),
  work_volume: zod.number().or(zod.nan()).optional(),
  activity: zod.number().or(zod.nan()).optional(),
  quality: zod.number().or(zod.nan()).optional(),
});

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
    country: '',
    state: '',
    city: '',
    zipCode: '',
    status: 'active',
    isVerified: true,
    // Примерные значения для метрик
    overall_performance: 0,
    kpi: 0,
    work_volume: 0,
    activity: 0,
    quality: 0,
  };

  const methods = useForm({
    mode: 'onSubmit',
    resolver: zodResolver(NewEmployeeSchema),
    defaultValues,
    values: currentEmployee,
  });

  const {
    reset,
    watch,
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  const onSubmit = handleSubmit(async (data) => {
    try {
      // Пример имитации запроса
      await new Promise((resolve) => setTimeout(resolve, 500));

      reset();
      toast.success(currentEmployee ? 'Изменения сохранены!' : 'Сотрудник создан!');

      // Перенаправляем после сохранения
      router.push(paths.dashboard.employee.list);

      console.info('DATA', data);
    } catch (error) {
      console.error(error);
    }
  });

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        {/* Левая колонка с аватаром и статусами */}
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
                      Применить отключение учётной записи сотрудника
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
                    При отключении функция отправит письмо для повторного подтверждения
                  </Typography>
                </>
              }
              sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
            />

            {/* Пример кнопки удаления */}
            {currentEmployee && (
              <Stack sx={{ mt: 3, alignItems: 'center', justifyContent: 'center' }}>
                <Button variant="soft" color="error">
                  Удалить сотрудника
                </Button>
              </Stack>
            )}
          </Card>
        </Grid>

        {/* Правая колонка с полями ввода */}
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

              {/* Примерные поля для метрик */}
              <Field.Number name="overall_performance" label="Общая эффективность" />
              <Field.Number name="kpi" label="KPI" />
              <Field.Number name="work_volume" label="Объём работ" />
              <Field.Number name="activity" label="Активность" />
              <Field.Number name="quality" label="Качество" />
            </Box>

            <Stack sx={{ mt: 3, alignItems: 'flex-end' }}>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                {!currentEmployee ? 'Создать сотрудника' : 'Сохранить изменения'}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Form>
  );
}
