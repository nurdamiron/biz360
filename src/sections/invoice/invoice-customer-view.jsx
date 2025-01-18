import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { 
  Box, 
  Stack,
  Dialog,
  Button,
  TextField,
  DialogTitle,
  DialogActions,
  DialogContent,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import axiosInstance, { endpoints } from 'src/lib/axios';
import { toast } from 'src/components/snackbar';

export function InvoiceCustomer({ open, onClose, onSave }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      phone_number: '',
      address: ''
    }
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await axiosInstance.post(endpoints.customer.create, data);
      toast.success('Клиент успешно создан');
      onSave(response.data);
      reset();
      onClose();
    } catch (error) {
      console.error('Error creating customer:', error);
      toast.error(error.message || 'Не удалось создать клиента');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Создать клиента</DialogTitle>

      <DialogContent>
        <Box component="form" noValidate sx={{ mt: 2 }}>
          <Stack spacing={3}>
            <Controller
              name="name"
              control={control}
              rules={{ required: 'Имя обязательно для заполнения' }}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Имя"
                  error={!!error}
                  helperText={error?.message}
                />
              )}
            />

            <Controller
              name="email"
              control={control}
              rules={{
                required: 'Email обязателен для заполнения',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Некорректный email адрес',
                },
              }}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Email"
                  error={!!error}
                  helperText={error?.message}
                />
              )}
            />

            <Controller
              name="phone_number"
              control={control}
              rules={{
                required: 'Телефон обязателен для заполнения',
                pattern: {
                  value: /^[0-9+()\s-]+$/,
                  message: 'Некорректный формат телефона',
                },
              }}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Телефон"
                  error={!!error}
                  helperText={error?.message}
                />
              )}
            />

            <Controller
              name="address"
              control={control}
              rules={{ required: 'Адрес обязателен для заполнения' }}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  {...field}
                  fullWidth
                  multiline
                  rows={3}
                  label="Адрес"
                  error={!!error}
                  helperText={error?.message}
                />
              )}
            />
          </Stack>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Отмена
        </Button>

        <LoadingButton
          loading={isSubmitting}
          variant="contained"
          onClick={handleSubmit(onSubmit)}
        >
          Создать
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}