import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/global-config';

import { EmployeeCreateView } from 'src/sections/employee/view';

// ----------------------------------------------------------------------

const metadata = { title: `Создать профиль сотрудника | Дашборд - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <EmployeeCreateView />
    </>
  );
}
