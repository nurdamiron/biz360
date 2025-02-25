import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuthContext } from 'src/auth/hooks';
import { CONFIG } from 'src/global-config';
import { SalesDashboard } from 'src/sections/overview/e-commerce/view/overview-ecommerce-view';

// ----------------------------------------------------------------------

const metadata = { title: `Аналитика - ${CONFIG.appName}` };

export default function Page() {
  const navigate = useNavigate();
  const { user } = useAuthContext();

  useEffect(() => {
    // Проверяем доступ
    const hasAccess = 
      ['owner', 'admin'].includes(user?.role) || 
      (user?.department === 'sales' && ['head', 'manager', 'employee'].includes(user?.role));

    if (!hasAccess) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <SalesDashboard />
    </>
  );
}
