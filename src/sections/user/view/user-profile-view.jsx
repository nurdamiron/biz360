// src/sections/user/view/user-profile-view.jsx
import { useParams } from 'react-router-dom';
import { Container } from '@mui/material';
import { paths } from 'src/routes/paths';
import { useSettingsContext } from 'src/components/settings';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import UserProfile from '../user-profile';
import { useAuthContext } from 'src/auth/hooks';
import { departmentToRussian, roleToRussian } from 'src/auth/utils';

// ----------------------------------------------------------------------

export default function UserProfileView() {
  const settings = useSettingsContext();
  const { id } = useParams();
  const { employee } = useAuthContext();

  // Заголовок с именем пользователя, если это текущий пользователь
  const isCurrentUser = !id || id === 'me';
  const userInfo = isCurrentUser && employee ? employee : null;
  const pageTitle = userInfo 
    ? `Профиль: ${userInfo.name || ''} ${userInfo.role ? `(${roleToRussian(userInfo.role)})` : ''}`
    : 'Профиль пользователя';

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading={pageTitle}
        links={[
          { name: 'Главная', href: paths.dashboard.root },
          { name: 'Сотрудники', href: paths.dashboard.employee.list },
          { name: 'Профиль' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
        action={
          userInfo && userInfo.department && (
            <div>
              {departmentToRussian(userInfo.department)}
            </div>
          )
        }
      />

      <UserProfile />
    </Container>
  );
}