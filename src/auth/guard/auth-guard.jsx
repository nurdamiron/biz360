// Модификация в src/auth/guard/auth-guard.jsx
import { useState, useEffect } from 'react';
import { paths } from 'src/routes/paths';
import { useRouter, usePathname } from 'src/routes/hooks';
import { CONFIG } from 'src/global-config';
import { SplashScreen } from 'src/components/loading-screen';
import { useAuthContext } from '../hooks';

export function AuthGuard({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { authenticated, loading, employee } = useAuthContext();
  const [isChecking, setIsChecking] = useState(true);

  const createRedirectPath = (currentPath) => {
    const queryString = new URLSearchParams({ returnTo: pathname }).toString();
    return `${currentPath}?${queryString}`;
  };

  const checkPermissions = async () => {
    if (loading) {
      return;
    }

    // Измененная проверка - считаем пользователя аутентифицированным, если есть сотрудник
    if (!authenticated && !employee) {
      const { method } = CONFIG.auth;
      const signInPath = paths.auth.jwt.signIn;
      const redirectPath = createRedirectPath(signInPath);
      router.replace(redirectPath);
      return;
    }

    setIsChecking(false);
  };

  useEffect(() => {
    checkPermissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticated, loading, employee]);

  if (isChecking) {
    return <SplashScreen />;
  }

  return <>{children}</>;
}