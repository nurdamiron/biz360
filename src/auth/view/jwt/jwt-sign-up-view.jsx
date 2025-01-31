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
import MenuItem from '@mui/material/MenuItem';
import axios, { fetcher, endpoints } from 'src/lib/axios';

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
  registration_type: zod.enum(['company_owner', 'employee'], {
    required_error: 'Выберите тип регистрации!'
  }),
  company_data: zod.object({
    // For company owner
    name: zod.string().optional(),
    bin_iin: zod.string().optional(),
    code: zod.string().optional(),
    // For employee
    company_bin_iin: zod.string().optional()
  }).optional()
});

const BASE_API_URL = 'https://biz360-backend.onrender.com';

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
    registration_type: 'company_owner',
    company_data: {
      name: '',
      bin_iin: '',
      code: ''
    }
  };

  const methods = useForm({
    resolver: zodResolver(SignUpSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    watch,
    setValue,
    formState: { isSubmitting },
  } = methods;

  const registrationType = watch('registration_type');

  const handleRegistrationTypeChange = (event) => {
    const newType = event.target.value;
    setValue('registration_type', newType);
    
    // Reset company data when switching types
    if (newType === 'company_owner') {
      setValue('company_data', {
        name: '',
        bin_iin: '',
        code: ''
      });
    } else {
      setValue('company_data', {
        company_bin_iin: ''
      });
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      setErrorMessage('');
      setEmployeeEmail(data.email);
      
      const requestData = {
        email: data.email,
        password: data.password,
        first_name: data.firstName,
        last_name: data.lastName,
        registration_type: data.registration_type,
        company_data: data.registration_type === 'company_owner' 
          ? {
              name: data.company_data.name,
              bin_iin: data.company_data.bin_iin,
              code: data.company_data.code
            }
          : {
              company_bin_iin: data.company_data.company_bin_iin
            }
      };
  
      const response = await axios.post(`${BASE_API_URL}/api/auth/register`, requestData);
  
      if (response.data?.error) {
        throw new Error(response.data.error);
      }
  
      setIsSuccess(true);
      
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            router.push(paths.auth.jwt.login); // Обновлено с signIn на login
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
  
    } catch (error) {
      console.error('Registration error:', error);
      
      let errorMsg = 'Произошла ошибка при регистрации';
  
      if (error.response) {
        errorMsg = error.response.data?.error || 
                  error.response.data?.message || 
                  'Ошибка сервера';
      } else if (error.request) {
        errorMsg = 'Не удалось подключиться к серверу. Проверьте подключение к интернету.';
      } else {
        errorMsg = error.message;
      }
  
      if (errorMsg.includes('Email already registered')) {
        errorMsg = 'Этот email уже зарегистрирован';
      } else if (errorMsg.includes('Company with this BIN/IIN already exists')) {
        errorMsg = 'Компания с таким БИН/ИИН уже существует';
      }
  
      setErrorMessage(errorMsg);
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
      <Field.Select
        name="registration_type"
        label="Тип регистрации"
        value={registrationType}
        onChange={handleRegistrationTypeChange}
        slotProps={{ inputLabel: { shrink: true } }}
      >
        <MenuItem value="company_owner">Владелец</MenuItem>
        <MenuItem value="employee">Сотрудник</MenuItem>
      </Field.Select>

      {registrationType === 'company_owner' && (
        <Box sx={{ gap: 2, display: 'flex', flexDirection: 'column' }}>
          <Field.Text
            name="company_data.name"
            label="Название компании"
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <Field.Text
            name="company_data.bin_iin"
            label="БИН/ИИН компании"
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <Field.Text
            name="company_data.code"
            label="Код компании (опционально)"
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Box>
      )}

      {registrationType === 'employee' && (
        <Field.Text
          name="company_data.company_bin_iin"
          label="БИН/ИИН компании"
          slotProps={{ inputLabel: { shrink: true } }}
        />
      )}

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