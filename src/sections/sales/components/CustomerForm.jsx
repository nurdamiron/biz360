import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { z as zod } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import CircularProgress from '@mui/material/CircularProgress';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { toast } from 'src/components/snackbar';
import { Field, Form } from 'src/components/hook-form';
import { NumericField } from 'src/components/form/NumericField';
import MenuItem from '@mui/material/MenuItem';
import useCustomers from 'src/hooks/useCustomers';
import { CLIENT_STATUSES } from 'src/services/customerService';

// Схема валидации
const CustomerSchema = zod.object({
  name: zod.string().min(1, { message: 'Название клиента обязательно!' }),
  status: zod.string().optional(),
  contact_person: zod.string().optional(),
  phone: zod.string().optional(),
  email: zod.string().email({ message: 'Неверный формат email!' }).optional(),
  address: zod.string().optional(),
  potential_amount: zod.number().nonnegative().optional(),
  probability: zod.number().min(0).max(100).optional(),
  urgency: zod.string().optional(),
  notes: zod.string().optional()
});

export function CustomerForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  
  // Используем хук для работы с клиентами
  const {
    selectedCustomer,
    fetchCustomerById,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    loading: customerLoading,
    error: customerError,
    successMessage,
    resetSuccessMessage
  } = useCustomers({
    fetchOnMount: false
  });

  // Начальные значения полей формы
  const defaultValues = {
    name: '',
    status: 'Новый клиент',
    contact_person: '',
    phone: '',
    email: '',
    address: '',
    potential_amount: 0,
    probability: 20,
    urgency: 'Средняя',
    notes: ''
  };

  // Инициализация формы
  const methods = useForm({
    mode: 'onSubmit',
    resolver: zodResolver(CustomerSchema),
    defaultValues
  });

  const {
    reset,
    watch,
    handleSubmit,
    formState: { isSubmitting },
    setValue
  } = methods;

  // Загрузка данных клиента при редактировании
  useEffect(() => {
    const loadCustomer = async () => {
      if (!isEdit) return;
      
      try {
        setLoading(true);
        setError(null);

        // Получаем данные клиента
        const customer = await fetchCustomerById(id);
        
        if (customer) {
          // Форматируем данные для формы
          const formattedData = {
            name: customer.name || '',
            status: customer.status || 'Новый клиент',
            contact_person: customer.contact_person || '',
            phone: customer.phone || '',
            email: customer.email || '',
            address: customer.address || '',
            potential_amount: customer.potential_amount || 0,
            probability: customer.probability || 20,
            urgency: customer.urgency || 'Средняя',
            notes: customer.notes || ''
          };
          
          // Обновляем форму данными
          reset(formattedData);
        }
      } catch (err) {
        console.error('Ошибка при загрузке данных клиента:', err);
        setError(err.message || 'Не удалось загрузить данные клиента');
      } finally {
        setLoading(false);
      }
    };

    loadCustomer();
  }, [id, isEdit, fetchCustomerById, reset]);

  // Обработка отправки формы
  const onSubmit = handleSubmit(async (formData) => {
    try {
      // Подготовка данных
      const customerData = {
        name: formData.name.trim(),
        status: formData.status,
        contact_person: formData.contact_person?.trim() || '',
        phone: formData.phone || '',
        email: formData.email?.trim()?.toLowerCase() || '',
        address: formData.address?.trim() || '',
        potential_amount: Number(formData.potential_amount) || 0,
        probability: Number(formData.probability) || 20,
        urgency: formData.urgency || 'Средняя',
        notes: formData.notes?.trim() || ''
      };

      if (isEdit) {
        // Обновление существующего клиента
        await updateCustomer(id, customerData);
        toast.success('Клиент успешно обновлен!');
      } else {
        // Создание нового клиента
        const newCustomer = await createCustomer(customerData);
        toast.success('Клиент успешно создан!');
        router.push(paths.dashboard.sales.client.details(newCustomer.id));
      }
    } catch (err) {
      console.error('Ошибка при сохранении клиента:', err);
      toast.error(err.message || 'Ошибка при сохранении клиента');
    }
  });

  // Обработка удаления клиента
  const handleDelete = async () => {
    if (window.confirm('Вы уверены, что хотите удалить этого клиента?')) {
      try {
        await deleteCustomer(id);
        toast.success('Клиент успешно удален!');
        router.push(paths.dashboard.sales.clients);
      } catch (err) {
        console.error('Ошибка при удалении клиента:', err);
        toast.error(err.message || 'Ошибка при удалении клиента');
      }
    }
  };

  // Отображение загрузки при получении данных
  if (isEdit && loading) {
    return (
      <Box sx={{ textAlign: 'center', mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Отображение ошибки при получении данных
  if (isEdit && error) {
    return (
      <Box sx={{ textAlign: 'center', mt: 5 }}>
        <Typography color="error">{error}</Typography>
        <Button 
          variant="contained" 
          sx={{ mt: 2 }}
          onClick={() => router.push(paths.dashboard.sales.clients)}
        >
          Вернуться к списку клиентов
        </Button>
      </Box>
    );
  }

  const values = watch();

  // Варианты срочности
  const urgencyOptions = [
    { value: 'Низкая', label: 'Низкая' },
    { value: 'Средняя', label: 'Средняя' },
    { value: 'Высокая', label: 'Высокая' }
  ];

  // Варианты статусов
  const statusOptions = Object.entries(CLIENT_STATUSES).map(([key, value]) => ({
    value,
    label: value
  }));

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        {/* Основная карточка с формой */}
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
                name="name"
                label="Название клиента"
                required
              />

              <Field.Select
                name="status"
                label="Статус"
              >
                {statusOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Field.Select>

              <Field.Text
                name="contact_person"
                label="Контактное лицо"
              />

              <Field.Text
                name="phone"
                label="Телефон"
              />

              <Field.Text
                name="email"
                label="Email"
                type="email"
              />

              <Field.Text
                name="address"
                label="Адрес"
              />

              <NumericField
                name="potential_amount"
                label="Потенциальная сумма сделки"
                helperText="В тенге"
                min={0}
                suffix="₸"
              />

              <NumericField
                name="probability"
                label="Вероятность закрытия (%)"
                helperText="От 0 до 100 %"
                min={0}
                max={100}
                suffix="%"
              />

              <Field.Select
                name="urgency"
                label="Срочность"
              >
                {urgencyOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Field.Select>

              <Field.Text
                name="notes"
                label="Примечания"
                multiline
                rows={4}
                sx={{ gridColumn: { xs: '1', sm: '1 / 3' } }}
              />
            </Box>

            <Stack sx={{ mt: 3, alignItems: 'flex-end' }}>
              <LoadingButton
                type="submit"
                variant="contained"
                loading={isSubmitting || customerLoading}
              >
                {isEdit ? 'Сохранить изменения' : 'Создать клиента'}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>

        {/* Дополнительная карточка справа */}
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3 }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                {isEdit ? 'Информация о клиенте' : 'Создание нового клиента'}
              </Typography>
              
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {isEdit 
                  ? 'Здесь вы можете изменить данные клиента, обновить контактную информацию и параметры сделки.' 
                  : 'Заполните необходимые поля для создания нового клиента в системе. Обязательные поля отмечены звездочкой (*).'
                }
              </Typography>
            </Box>

            {isEdit && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>ID клиента:</strong> {id}
                </Typography>
                
                {selectedCustomer?.firstContactDate && (
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Первый контакт:</strong> {selectedCustomer.firstContactDate}
                  </Typography>
                )}
                
                {selectedCustomer?.lastContact && (
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Последний контакт:</strong> {selectedCustomer.lastContact}
                  </Typography>
                )}
              </Box>
            )}

            {/* Кнопка удаления клиента (только при редактировании) */}
            {isEdit && (
              <Stack sx={{ mt: 3 }}>
                <Button 
                  variant="soft" 
                  color="error" 
                  onClick={handleDelete}
                >
                  Удалить клиента
                </Button>
              </Stack>
            )}

            {/* Кнопка возврата к списку клиентов */}
            <Stack sx={{ mt: 2 }}>
              <Button 
                variant="outlined" 
                onClick={() => router.push(paths.dashboard.sales.clients)}
              >
                Вернуться к списку клиентов
              </Button>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Form>
  );
}

export default CustomerForm;