// pages/employee/edit.jsx (или любой другой путь)
// Пример для React Router / Next.js - адаптируйте под свой роутинг

import { Helmet } from 'react-helmet-async';
import { useParams } from 'src/routes/hooks';

import { CONFIG } from 'src/global-config';
import { _employeeList } from 'src/_mock/_employee';

import { EmployeeEditView } from 'src/sections/employee/view';

// ----------------------------------------------------------------------

const metadata = {
  title: `Изменить профиль сотрудника | Дашборд - ${CONFIG.appName}`,
};

export default function Page() {
  const { id = '' } = useParams();

  // Ищем сотрудника в mock
  // В реальном проекте здесь делаем запрос: axios.get(...)
  const currentEmployee = _employeeList.find((employee) => employee.id === id);

  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      {/* Передаем сотрудника во "вьюху" редактирования */}
      <EmployeeEditView employee={currentEmployee} />
    </>
  );
}
