import { useState, useEffect } from 'react';
import { 
  Box,
  Alert,
  AlertTitle,
  Button,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

const API_BASE_URL = 'https://biz360-backend.onrender.com/api';

export default function EmailVerificationView() {
  const router = useRouter();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Получаем токен из URL
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');

        if (!token) {
          setStatus('error');
          setMessage('Ссылка недействительна. Отсутствует токен верификации.');
          return;
        }

        const response = await fetch(`${API_BASE_URL}/auth/verify-email/${token}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });

        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage('Email успешно подтвержден! Теперь вы можете войти в систему.');
          
          // Запускаем отсчет для автоматического перехода на страницу входа
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
        } else {
          setStatus('error');
          setMessage(data.error || 'Произошла ошибка при подтверждении email.');
        }
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('error');
        setMessage('Не удалось подтвердить email. Пожалуйста, попробуйте позже.');
      }
    };

    verifyEmail();
  }, [router]);

  return (
    <Box
      sx={{
        maxWidth: 480,
        mx: 'auto',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        p: 2
      }}
    >
      <Box sx={{ width: '100%', textAlign: 'center' }}>
        {status === 'loading' && (
          <Alert severity="info" sx={{ mb: 3 }}>
            <AlertTitle>Подтверждение email</AlertTitle>
            Пожалуйста, подождите... Проверяем ваш email.
          </Alert>
        )}

        {status === 'success' && (
          <>
            <Alert severity="success" sx={{ mb: 3 }}>
              <AlertTitle>Email подтвержден!</AlertTitle>
              {message}
              <Box sx={{ mt: 1 }}>
                Автоматический переход на страницу входа через {countdown} сек...
              </Box>
            </Alert>

            <LoadingButton
              fullWidth
              size="large"
              variant="contained"
              onClick={() => router.push(paths.auth.jwt.signIn)}
            >
              Войти сейчас
            </LoadingButton>
          </>
        )}

        {status === 'error' && (
          <>
            <Alert severity="error" sx={{ mb: 3 }}>
              <AlertTitle>Ошибка подтверждения</AlertTitle>
              {message}
            </Alert>

            <Box sx={{ mt: 3, display: 'flex', gap: 2, flexDirection: 'column' }}>
              <Button
                fullWidth
                variant="contained"
                onClick={() => router.push(paths.auth.jwt.signIn)}
              >
                Перейти к входу
              </Button>

              <Button
                fullWidth
                variant="outlined"
                onClick={() => router.push(paths.auth.jwt.register)}
              >
                Зарегистрироваться заново
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
}