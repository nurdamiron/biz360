// src/sections/account/account-layout.jsx
import { removeLastSlash } from 'minimal-shared/utils';

import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';

import { paths } from 'src/routes/paths';
import { usePathname } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useAuthContext } from 'src/auth/hooks';
import { roleToRussian, departmentToRussian } from 'src/auth/utils';

// ----------------------------------------------------------------------

const NAV_ITEMS = [
  {
    label: 'Общие',
    icon: <Iconify width={24} icon="solar:employee-id-bold" />,
    href: paths.dashboard.employee.account,
  },
  {
    label: 'Оплата',
    icon: <Iconify width={24} icon="solar:bill-list-bold" />,
    href: `${paths.dashboard.employee.account}/billing`,
  },
  {
    label: 'Уведомления',
    icon: <Iconify width={24} icon="solar:bell-bing-bold" />,
    href: `${paths.dashboard.employee.account}/notifications`,
  },
  {
    label: 'Соцсети',
    icon: <Iconify width={24} icon="solar:share-bold" />,
    href: `${paths.dashboard.employee.account}/socials`,
  },
  {
    label: 'Безопасность',
    icon: <Iconify width={24} icon="ic:round-vpn-key" />,
    href: `${paths.dashboard.employee.account}/change-password`,
  },
];

// ----------------------------------------------------------------------

export function AccountLayout({ children, ...other }) {
  const pathname = usePathname();
  const { employee } = useAuthContext();

  // Заголовок с именем и должностью пользователя, если доступны
  const pageTitle = employee 
    ? `Аккаунт: ${employee.name || ''} ${employee.role ? `(${roleToRussian(employee.role)})` : ''}`
    : 'Аккаунт';

  return (
    <DashboardContent {...other}>
      <CustomBreadcrumbs
        heading={pageTitle}
        links={[
          { name: 'Главная', href: paths.dashboard.root },
          { name: 'Сотрудник', href: paths.dashboard.employee.root },
          { name: 'Аккаунт' },
        ]}
        sx={{ mb: 3 }}
        action={
          employee && employee.department && (
            <Tab 
              label={departmentToRussian(employee.department)} 
              disabled 
              icon={<Iconify icon="mdi:office-building" />}
              sx={{ 
                opacity: 0.8,
                borderRadius: 1,
                px: 1.5,
                bgcolor: 'action.selected' 
              }}
            />
          )
        }
      />

      <Tabs value={removeLastSlash(pathname)} sx={{ mb: { xs: 3, md: 5 } }}>
        {NAV_ITEMS.map((tab) => (
          <Tab
            component={RouterLink}
            key={tab.href}
            label={tab.label}
            icon={tab.icon}
            value={tab.href}
            href={tab.href}
          />
        ))}
      </Tabs>

      {children}
    </DashboardContent>
  );
}