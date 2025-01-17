import { useState, useCallback } from 'react';
import { varAlpha } from 'minimal-shared/utils';
import { useBoolean, useSetState } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { DashboardContent } from 'src/layouts/dashboard';
import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import {
  useTable,
  emptyRows,
  rowInPage,
  TableNoData,
  getComparator,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';

import { EmployeeTableRow } from '../employee-table-row';
import { EmployeeTableToolbar } from '../employee-table-toolbar';
import { EmployeeTableFiltersResult } from '../employee-table-filters-result';

// ----------------------------------------------------------------------

// Пример статичных данных (пока нет API)
const _employeeList = [
  {
    id: 1,
    fio: 'Иванов Иван Иванович',
    phoneNumber: '+7 999 123-45-67',
    department: 'Отдел продаж',
    role: 'manager',
    status: 'active',
    avatarUrl: null,
    // Метрики
    overall_performance: 85.5,
    kpi: 90.0,
    work_volume: 75.0,
    activity: 80.0,
    quality: 88.0,
  },
  {
    id: 2,
    fio: 'Петров Пётр Петрович',
    phoneNumber: '+7 912 345-67-89',
    department: 'Отдел маркетинга',
    role: 'marketer',
    status: 'banned',
    avatarUrl: null,
    overall_performance: 70.0,
    kpi: 65.0,
    work_volume: 80.0,
    activity: 50.0,
    quality: 90.0,
  },
];

// Вы можете сформировать список статусов самостоятельно,
// либо использовать те же, что и были у «юзеров».
const STATUS_OPTIONS = [
  { value: 'all', label: 'Все' },
  { value: 'active', label: 'Активен' },
  { value: 'pending', label: 'Ожидает' },
  { value: 'banned', label: 'Заблокирован' },
];

// Таблица: какие колонки показываем
// Добавлены поля для метрик (KPI, Объём работ и т.д.)
// Пример нового TABLE_HEAD
const TABLE_HEAD = [
  { id: 'fio', label: 'ФИО', width: 240 },
  // Телефон будет отображаться под ФИО, так что убираем отдельный столбец
  { id: 'department', label: 'Отдел', width: 180 },
  { id: 'overall_performance', label: 'Общая эффективность', width: 140 },
  { id: 'kpi', label: 'KPI', width: 80 },
  { id: 'work_volume', label: 'Объём работ', width: 120 },
  { id: 'activity', label: 'Активность', width: 100 },
  { id: 'quality', label: 'Качество', width: 100 },
  { id: 'status', label: 'Доступ', width: 100 },
  { id: '', width: 88 }, // Столбец для меню действий
];


// ----------------------------------------------------------------------

export function EmployeeListView() {
  const table = useTable();

  const confirmDialog = useBoolean();

  const [tableData, setTableData] = useState(_employeeList);

  const filters = useSetState({
    fio: '',
    role: [],
    status: 'all',
  });

  const { state: currentFilters, setState: updateFilters } = filters;

  // Применяем фильтры и сортировку
  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters: currentFilters,
  });

  const dataInPage = rowInPage(dataFiltered, table.page, table.rowsPerPage);
  const canReset = !!currentFilters.fio || currentFilters.role.length > 0 || currentFilters.status !== 'all';
  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  // Удаление одной строки
  const handleDeleteRow = useCallback(
    (id) => {
      const deleteRow = tableData.filter((row) => row.id !== id);
      toast.success('Успешно удалено!');
      setTableData(deleteRow);
      table.onUpdatePageDeleteRow(dataInPage.length);
    },
    [dataInPage.length, table, tableData]
  );

  // Удаление сразу нескольких строк
  const handleDeleteRows = useCallback(() => {
    const deleteRows = tableData.filter((row) => !table.selected.includes(row.id));
    toast.success('Успешно удалено!');
    setTableData(deleteRows);
    table.onUpdatePageDeleteRows(dataInPage.length, dataFiltered.length);
  }, [dataFiltered.length, dataInPage.length, table, tableData]);

  // Переключение табов статусов
  const handleFilterStatus = useCallback(
    (event, newValue) => {
      table.onResetPage();
      updateFilters({ status: newValue });
    },
    [updateFilters, table]
  );

  // Модалка подтверждения удаления
  const renderConfirmDialog = () => (
    <ConfirmDialog
      open={confirmDialog.value}
      onClose={confirmDialog.onFalse}
      title="Удалить"
      content={
        <>
          Вы уверены, что хотите удалить <strong>{table.selected.length}</strong> сотрудников?
        </>
      }
      action={
        <Button
          variant="contained"
          color="error"
          onClick={() => {
            handleDeleteRows();
            confirmDialog.onFalse();
          }}
        >
          Удалить
        </Button>
      }
    />
  );

  return (
    <>
      <DashboardContent>
        <CustomBreadcrumbs
          heading="Сотрудники"
          links={[
            { name: 'Дэшборд', href: paths.dashboard.root },
            { name: 'Сотрудники' },
          ]}
          action={
            <Button
              component={RouterLink}
              href={paths.dashboard.employee.new} 
              // Здесь вы можете поменять paths.dashboard.employee.new на свой route (employee/new и т.п.)
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              Новый сотрудник
            </Button>
          }
          sx={{ mb: { xs: 3, md: 5 } }}
        />

        <Card>
          <Tabs
            value={currentFilters.status}
            onChange={handleFilterStatus}
            sx={[(theme) => ({
              px: 2.5,
              boxShadow: `inset 0 -2px 0 0 ${varAlpha(theme.vars.palette.grey['500Channel'], 0.08)}`,
            })]}
          >
            {STATUS_OPTIONS.map((tab) => (
              <Tab
                key={tab.value}
                iconPosition="end"
                value={tab.value}
                label={tab.label}
                icon={
                  <Label
                    variant={(tab.value === 'all' || tab.value === currentFilters.status) ? 'filled' : 'soft'}
                    color={
                      (tab.value === 'active' && 'success') ||
                      (tab.value === 'pending' && 'warning') ||
                      (tab.value === 'banned' && 'error') ||
                      'default'
                    }
                  >
                    {['active', 'pending', 'banned'].includes(tab.value)
                      ? tableData.filter((emp) => emp.status === tab.value).length
                      : tableData.length}
                  </Label>
                }
              />
            ))}
          </Tabs>

          <EmployeeTableToolbar
            filters={filters}
            onResetPage={table.onResetPage}
            options={{ roles: ['manager', 'marketer', 'admin', 'developer'] }}
          />

          {canReset && (
            <EmployeeTableFiltersResult
              filters={filters}
              totalResults={dataFiltered.length}
              onResetPage={table.onResetPage}
              sx={{ p: 2.5, pt: 0 }}
            />
          )}

          <Box sx={{ position: 'relative' }}>
            <TableSelectedAction
              dense={table.dense}
              numSelected={table.selected.length}
              rowCount={dataFiltered.length}
              onSelectAllRows={(checked) =>
                table.onSelectAllRows(
                  checked,
                  dataFiltered.map((row) => row.id)
                )
              }
              action={
                <Tooltip title="Удалить">
                  <IconButton color="primary" onClick={confirmDialog.onTrue}>
                    <Iconify icon="solar:trash-bin-trash-bold" />
                  </IconButton>
                </Tooltip>
              }
            />

            <Scrollbar>
              <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
                <TableHeadCustom
                  order={table.order}
                  orderBy={table.orderBy}
                  headCells={TABLE_HEAD}
                  rowCount={dataFiltered.length}
                  numSelected={table.selected.length}
                  onSort={table.onSort}
                  onSelectAllRows={(checked) =>
                    table.onSelectAllRows(
                      checked,
                      dataFiltered.map((row) => row.id)
                    )
                  }
                />

                <TableBody>
                  {dataFiltered
                    .slice(table.page * table.rowsPerPage, table.page * table.rowsPerPage + table.rowsPerPage)
                    .map((row) => (
                      <EmployeeTableRow
                        key={row.id}
                        row={row}
                        selected={table.selected.includes(row.id)}
                        onSelectRow={() => table.onSelectRow(row.id)}
                        onDeleteRow={() => handleDeleteRow(row.id)}
                        // editHref (для кнопки "Edit") можете менять под свои роуты
                        editHref={paths.dashboard.employee.edit(row.id)}
                      />
                    ))}

                  <TableEmptyRows
                    height={table.dense ? 56 : 76}
                    emptyRows={emptyRows(table.page, table.rowsPerPage, dataFiltered.length)}
                  />

                  <TableNoData notFound={notFound} />
                </TableBody>
              </Table>
            </Scrollbar>
          </Box>

          <TablePaginationCustom
            page={table.page}
            dense={table.dense}
            count={dataFiltered.length}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            onChangeDense={table.onChangeDense}
            onRowsPerPageChange={table.onChangeRowsPerPage}
          />
        </Card>
      </DashboardContent>

      {renderConfirmDialog()}
    </>
  );
}

// ----------------------------------------------------------------------

function applyFilter({ inputData, comparator, filters }) {
  const { fio, status, role } = filters;

  // Сортировка
  const stabilizedThis = inputData.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  inputData = stabilizedThis.map((el) => el[0]);

  // Фильтр по ФИО
  if (fio) {
    inputData = inputData.filter((emp) => emp.fio.toLowerCase().includes(fio.toLowerCase()));
  }

  // Фильтр по статусу
  if (status !== 'all') {
    inputData = inputData.filter((emp) => emp.status === status);
  }

  // Фильтр по роли
  if (role.length) {
    inputData = inputData.filter((emp) => role.includes(emp.role));
  }

  return inputData;
}
