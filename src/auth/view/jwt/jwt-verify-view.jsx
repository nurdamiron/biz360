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
import { axiosInstance, endpoints } from 'src/lib/axios';

export function VerifyView() {
  const router = useRouter();
  const [verificationState, setVerificationState] = useState({
    status: 'loading',
    message: '',
    countdown: 5
  });

  const { status, message, countdown } = verificationState;

  const handleNavigation = useCallback((path) => {
    router.push(path);
  }, [router]);

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
  }, [handleNavigation]);

  const verifyEmail = useCallback(async () => {
    try {
        const pathParts = window.location.pathname.split('/');
        const token = pathParts[pathParts.length - 1];
        console.log('Token for verification:', token);

        const response = await axiosInstance({
            method: 'GET',
            url: endpoints.auth.verifyEmail(token),
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            validateStatus: (responseStatus) => true // Переименовали параметр
        });

        console.log('Verification response:', response);

        if (response.status === 200 && response.data.success) {
            setVerificationState({
                status: 'success',
                message: response.data.message || 'Email успешно подтвержден!',
                countdown: 5
            });
        } else {
            // Обработка ошибок с сервера
            const errorMessage = response.data?.error || 'Не удалось подтвердить email';
            throw new Error(errorMessage);
        }
    } catch (error) {
        console.error('Verification error:', error);
        setVerificationState({
            status: 'error',
            message: error.message || 'Не удалось подтвердить email. Пожалуйста, попробуйте позже.',
            countdown: 5
        });
    }
}, []);

  // Запускаем верификацию при монтировании компонента
  useEffect(() => {
    verifyEmail();
  }, [verifyEmail]);

  // Запускаем обратный отсчет после успешной верификации
  useEffect(() => {
    let cleanup;
    if (status === 'success') {
      cleanup = startCountdown();
    }
    return cleanup;
  }, [status, startCountdown]);

  const renderLoading = () => (
    <Box sx={{ textAlign: 'center' }}>
      <CircularProgress sx={{ mb: 2 }} />
      <Alert severity="info" sx={{ mb: 3 }}>
        <AlertTitle>Подтверждение email</AlertTitle>
        Пожалуйста, подождите... Проверяем ваш email.
      </Alert>
    </Box>
  );

  const renderSuccess = () => (
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

  const renderError = () => (
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

  const renderContent = () => {
    const contentMap = {
      loading: renderLoading,
      success: renderSuccess,
      error: renderError
    };

    return contentMap[status]?.() || null;
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