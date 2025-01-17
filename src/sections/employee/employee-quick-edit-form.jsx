import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { isValidPhoneNumber } from 'react-phone-number-input/input';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { toast } from 'src/components/snackbar';
import { Form, Field, schemaHelper } from 'src/components/hook-form';

// Можете адаптировать статусы под сотрудников
const EMPLOYEE_STATUS_OPTIONS = [
  { value: 'active', label: 'Активен' },
  { value: 'pending', label: 'Ожидает' },
  { value: 'banned', label: 'Заблокирован' },
];

export const EmployeeQuickEditSchema = zod.object({
  fio: zod.string().min(1, { message: 'Необходимо ввести ФИО!' }),
  email: zod
    .string()
    .min(1, { message: 'Email обязателен!' })
    .email({ message: 'Неверный формат email!' }),
  phoneNumber: schemaHelper.phoneNumber({ isValid: isValidPhoneNumber }),
  department: zod.string().min(1, { message: 'Необходимо указать отдел!' }),
  role: zod.string().min(1, { message: 'Необходимо указать роль!' }),
  status: zod.string(),
  // Пример: если хотите менять метрики, можете добавить поля overall_performance, kpi и т.п.
});

export function EmployeeQuickEditForm({ currentEmployee, open, onClose }) {
  const defaultValues = {
    fio: '',
    email: '',
    phoneNumber: '',
    department: '',
    role: '',
    status: '',
  };

  const methods = useForm({
    mode: 'all',
    resolver: zodResolver(EmployeeQuickEditSchema),
    defaultValues,
    values: currentEmployee,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    const fakePromise = new Promise((resolve) => setTimeout(resolve, 1000));

    try {
      // Здесь будет реальный запрос на обновление
      reset();
      onClose();

      toast.promise(fakePromise, {
        loading: 'Сохраняем...',
        success: 'Успешно обновлено!',
        error: 'Ошибка при обновлении!',
      });

      await fakePromise;

      console.info('DATA', data);
    } catch (error) {
      console.error(error);
    }
  });

  return (
    <Dialog
      fullWidth
      maxWidth={false}
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { maxWidth: 720 } }}
    >
      <DialogTitle>Быстрое обновление</DialogTitle>

      <Form methods={methods} onSubmit={onSubmit}>
        <DialogContent>
          <Alert variant="outlined" severity="info" sx={{ mb: 3 }}>
            Быстрое изменение данных сотрудника
          </Alert>

          <Box
            sx={{
              rowGap: 3,
              columnGap: 2,
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' },
            }}
          >
            <Field.Select name="status" label="Статус">
              {EMPLOYEE_STATUS_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Field.Select>

            <Box sx={{ display: { xs: 'none', sm: 'block' } }} />

            <Field.Text name="fio" label="ФИО" />
            <Field.Text name="email" label="Email" />
            <Field.Phone name="phoneNumber" label="Телефон" />
            <Field.Text name="department" label="Отдел" />
            <Field.Text name="role" label="Роль" />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={onClose}>
            Отмена
          </Button>

          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            Обновить
          </LoadingButton>
        </DialogActions>
      </Form>
    </Dialog>
  );
}
