// src/pages/dashboard/index.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuthContext } from 'src/auth/hooks';
import { CONFIG } from 'src/global-config';
import { OverviewAppView } from 'src/sections/overview/app/view';

// Маппинг отделов к соответствующим дашбордам
const DEPARTMENT_DASHBOARDS = {
  sales: '/dashboard/ecommerce',
  logistics: '/dashboard/course',
  accounting: '/dashboard/banking',
  manufacture: '/dashboard/file', // Added missing manufacture department
};

export default function Page() {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  
  useEffect(() => {
    if (!user) return; // Ждем загрузки данных пользователя
    
    const role = user.employee?.role;
    const department = user.employee?.department;

    // Для админов и владельцев показываем общий дашборд
    if (['owner', 'admin'].includes(role)) {
      return;
    }
    
    // Для остальных ролей редиректим на дашборд соответствующего отдела
    if (department && DEPARTMENT_DASHBOARDS[department]) {
      navigate(DEPARTMENT_DASHBOARDS[department], { replace: true });
    }
  }, [user, navigate]);

  // Показываем основной дашборд по умолчанию
  return (
    <>
      <Helmet>
        <title>{`Dashboard - ${CONFIG.appName}`}</title>
      </Helmet>
      <OverviewAppView />
    </>
  );
}