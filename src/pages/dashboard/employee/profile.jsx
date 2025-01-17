import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/global-config';

import { EmployeeProfileView } from 'src/sections/employee/view';

// ----------------------------------------------------------------------

const metadata = { title: `Employee profile | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <EmployeeProfileView />
    </>
  );
}
