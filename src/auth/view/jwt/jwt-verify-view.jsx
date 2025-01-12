import { useState, useEffect, useCallback } from 'react';
import { 
  Box,
  Alert,
  AlertTitle,
  Button,
  CircularProgress,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

const API_BASE_URL = 'https://biz360-backend.onrender.com/api';

export default function VerifyView() {
  const router = useRouter();
  const [verificationState, setVerificationState] = useState({
    status: 'loading',
    message: '',
    countdown: 5
  });

  const { status, message, countdown } = verificationState;

  const handleNavigation = (path) => {
    router.push(path);
  };

  const startCountdown = useCallback(() => {
    const timer = setInterval(() => {
      setVerificationState((prev) => {
        const newCountdown = prev.countdown - 1;
        if (newCountdown <= 0) {
          clearInterval(timer);
          handleNavigation(paths.auth.jwt.signIn);
        }
        return { ...prev, countdown: Math.max(0, newCountdown) };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const verifyEmail = useCallback(async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');

      if (!token) {
        setVerificationState({
          status: 'error',
          message: 'Ссылка недействительна. Отсутствует токен верификации.',
          countdown: 5
        });
        return;
      }

      const response = await fetch(`${API_BASE_URL}/auth/verify/${token}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        setVerificationState({
          status: 'success',
          message: 'Email успешно подтвержден! Теперь вы можете войти в систему.',
          countdown: 5
        });
      } else {
        setVerificationState({
          status: 'error',
          message: data.error || 'Произошла ошибка при подтверждении email.',
          countdown: 5
        });
      }
    } catch (error) {
      console.error('Verification error:', error);
      setVerificationState({
        status: 'error',
        message: 'Не удалось подтвердить email. Пожалуйста, попробуйте позже.',
        countdown: 5
      });
    }
  }, []);

  useEffect(() => {
    verifyEmail();
  }, [verifyEmail]);

  useEffect(() => {
    let cleanup;
    if (status === 'success') {
      cleanup = startCountdown();
    }
    return cleanup;
  }, [status, startCountdown]);

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress sx={{ mb: 2 }} />
            <Alert severity="info" sx={{ mb: 3 }}>
              <AlertTitle>Подтверждение email</AlertTitle>
              Пожалуйста, подождите... Проверяем ваш email.
            </Alert>
          </Box>
        );

      case 'success':
        return (
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
              onClick={() => handleNavigation(paths.auth.jwt.signIn)}
            >
              Войти сейчас
            </LoadingButton>
          </>
        );

      case 'error':
        return (
          <>
            <Alert severity="error" sx={{ mb: 3 }}>
              <AlertTitle>Ошибка подтверждения</AlertTitle>
              {message}
            </Alert>

            <Box sx={{ mt: 3, display: 'flex', gap: 2, flexDirection: 'column' }}>
              <Button
                fullWidth
                variant="contained"
                onClick={() => handleNavigation(paths.auth.jwt.signIn)}
              >
                Перейти к входу
              </Button>

              <Button
                fullWidth
                variant="outlined"
                onClick={() => handleNavigation(paths.auth.jwt.register)}
              >
                Зарегистрироваться заново
              </Button>
            </Box>
          </>
        );

      default:
        return null;
    }
  };

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
        {renderContent()}
      </Box>
    </Box>
  );
}