import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/global-config';

import { EmployeeCardsView } from 'src/sections/employee/view';

// ----------------------------------------------------------------------

const metadata = { title: `Карточки сотрудников | ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <EmployeeCardsView />
    </>
  );
}
