// employee-quick-edit-form.jsx

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

// Подключаем axiosInstance и endpoints
import axiosInstance, { endpoints } from 'src/lib/axios';

// Можно адаптировать статусы под вашу бизнес-логику
const EMPLOYEE_STATUS_OPTIONS = [
  { value: 'active', label: 'Активен' },
  { value: 'pending', label: 'Ожидает' },
  { value: 'banned', label: 'Заблокирован' },
];

// Схема валидации
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
});

/**
 * Компонент для "быстрого" (частичного) редактирования сотрудника.
 *
 * @param {Object} props
 * @param {Object} props.currentEmployee - текущий сотрудник (ожидается, что у него есть поле id)
 * @param {boolean} props.open - флаг, открыта ли модалка
 * @param {Function} props.onClose - колбэк для закрытия модалки
 * @param {Function} [props.onUpdateSuccess] - опциональный колбэк, если нужно обновить список в родительском компоненте
 */
export function EmployeeQuickEditForm({ currentEmployee, open, onClose, onUpdateSuccess }) {
  // Значения по умолчанию (если currentEmployee пустой)
  const defaultValues = {
    fio: '',
    email: '',
    phoneNumber: '',
    department: '',
    role: '',
    status: 'active',
  };

  // Инициализируем форму
  const methods = useForm({
    mode: 'all',
    resolver: zodResolver(EmployeeQuickEditSchema),
    defaultValues,
    // values: когда есть currentEmployee, берем оттуда поля
    values: currentEmployee,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  /**
   * Обработка сабмита: отправляем PUT-запрос для обновления
   */
  const onSubmit = handleSubmit(async (data) => {
    try {
      // Проверяем, есть ли у сотрудника id
      if (!currentEmployee?.id) {
        toast.error('Неизвестный сотрудник!');
        return;
      }

      // Отправляем PUT-запрос на бэкенд ( partial/полное обновление )
      const res = await axiosInstance.put(endpoints.employee.update(currentEmployee.id), data);

      toast.success('Успешно обновлено!');
      reset();
      onClose();

      // Если нужно обновить данные в родительском компоненте
      if (onUpdateSuccess) {
        onUpdateSuccess(res.data);
      }
    } catch (error) {
      console.error('Ошибка при обновлении сотрудника:', error);
      toast.error('Ошибка при обновлении!');
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
