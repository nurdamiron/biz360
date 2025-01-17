import { z as zod } from 'zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { 
  Box,
  Link,
  Alert,
  AlertTitle,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';
import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';

// Schema validation
export const SignUpSchema = zod.object({
  firstName: zod.string().min(1, { message: 'Имя обязательно!' }),
  lastName: zod.string().min(1, { message: 'Фамилия обязательна!' }),
  email: zod
    .string()
    .min(1, { message: 'Email обязателен!' })
    .email({ message: 'Email должен быть действительным!' }),
  password: zod
    .string()
    .min(1, { message: 'Пароль обязателен!' })
    .min(6, { message: 'Пароль должен содержать минимум 6 символов!' }),
});

const API_BASE_URL = 'https://biz360-backend.onrender.com/api';

export function JwtSignUpView() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [employeeEmail, setEmployeeEmail] = useState('');
  const [countdown, setCountdown] = useState(5);

  const defaultValues = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  };

  const methods = useForm({
    resolver: zodResolver(SignUpSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      setErrorMessage('');
      setEmployeeEmail(data.email);
      
      const response = await fetch(`${API_BASE_URL}/auth/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          first_name: data.firstName,
          last_name: data.lastName
        }),
        mode: 'cors',
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData?.message || 'Ошибка регистрации');
      }

      setIsSuccess(true);

      // Запускаем таймер для редиректа
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            router.push(paths.auth.jwt.signIn);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

    } catch (error) {
      console.error('Registration error:', error);
      
      if (error.message === 'Failed to fetch') {
        setErrorMessage('Не удалось подключиться к серверу. Проверьте подключение к интернету.');
      } else if (error.message.includes('NetworkError')) {
        setErrorMessage('Ошибка сети. Попробуйте позже.');
      } else if (error.message === 'Email already registered') {
        setErrorMessage('Этот email уже зарегистрирован.');
      } else {
        setErrorMessage(error.message || 'Произошла ошибка при регистрации');
      }
    }
  });

  if (isSuccess) {
    return (
      <Box sx={{ maxWidth: 480, mx: 'auto', textAlign: 'center' }}>
        <Alert 
          severity="success"
          sx={{ mb: 3 }}
        >
          <AlertTitle>Регистрация успешна!</AlertTitle>
          <Box sx={{ mt: 2 }}>
            На ваш email <strong>{employeeEmail}</strong> было отправлено письмо со ссылкой для подтверждения.
            <Box sx={{ mt: 1 }}>
              Перенаправление на страницу входа через {countdown} сек...
            </Box>
          </Box>
        </Alert>
        
        <Box sx={{ mt: 3 }}>
          <Link 
            component={RouterLink} 
            href={paths.auth.jwt.signIn}
            sx={{ textDecoration: 'none' }}
          >
            <LoadingButton
              fullWidth
              size="large"
              variant="contained"
            >
              Перейти к входу
            </LoadingButton>
          </Link>
        </Box>
      </Box>
    );
  }

  const renderForm = () => (
    <Box sx={{ gap: 3, display: 'flex', flexDirection: 'column' }}>
      <Box
        sx={{
          display: 'flex',
          gap: { xs: 3, sm: 2 },
          flexDirection: { xs: 'column', sm: 'row' }
        }}
      >
        <Field.Text
          name="firstName"
          label="Имя"
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <Field.Text
          name="lastName"
          label="Фамилия"
          slotProps={{ inputLabel: { shrink: true } }}
        />
      </Box>

      <Field.Text 
        name="email"
        label="Email"
        slotProps={{ inputLabel: { shrink: true } }}
      />

      <Field.Text
        name="password"
        label="Пароль"
        type={showPassword ? 'text' : 'password'}
        slotProps={{
          inputLabel: { shrink: true },
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  <Iconify icon={showPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />

      <LoadingButton
        fullWidth
        color="inherit"
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
        loadingIndicator="Создание аккаунта..."
      >
        Создать аккаунт
      </LoadingButton>
    </Box>
  );

  return (
    <>
      <Box sx={{ mb: 3, textAlign: { xs: 'center', md: 'left' } }}>
        <h2>Начните работу абсолютно бесплатно</h2>
        <Box sx={{ mt: 1 }}>
          У вас уже есть учетная запись?{' '}
          <Link component={RouterLink} href={paths.auth.jwt.signIn} variant="subtitle2">
            Войдите
          </Link>
        </Box>
      </Box>

      {errorMessage && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          action={
            <IconButton
              color="inherit"
              size="small"
              onClick={() => setErrorMessage('')}
            >
              <Iconify icon="mingcute:close-line" />
            </IconButton>
          }
        >
          {errorMessage}
        </Alert>
      )}

      <Form methods={methods} onSubmit={onSubmit}>
        {renderForm()}
      </Form>

      <Box sx={{ mt: 3, textAlign: 'center', typography: 'caption' }}>
        Создавая аккаунт, вы соглашаетесь с нашими{' '}
        <Link href="#" underline="always" color="text.primary">
          Условиями использования
        </Link>
        {' '}и{' '}
        <Link href="#" underline="always" color="text.primary">
          Политикой конфиденциальности
        </Link>
        .
      </Box>
    </>
  );
}