// employee-list-view.jsx
/// done
import { useState, useEffect, useCallback } from 'react';
import { varAlpha } from 'minimal-shared/utils';
import { useBoolean, useSetState } from 'minimal-shared/hooks';

import axiosInstance, { endpoints } from 'src/lib/axios'; // <-- Подключаем axios
import { toast } from 'src/components/snackbar';            // <-- Для уведомлений

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

const STATUS_OPTIONS = [
  { value: 'all', label: 'Все' },
  { value: 'active', label: 'Активен' },
  { value: 'pending', label: 'Ожидает' },
  { value: 'banned', label: 'Заблокирован' },
];

const TABLE_HEAD = [
  { id: 'fio', label: 'ФИО', width: 240 },
  { id: 'department', label: 'Отдел', width: 180 },
  { id: 'overall_performance', label: 'Эффективность', width: 140 },
  { id: 'kpi', label: 'KPI', width: 80 },
  { id: 'work_volume', label: 'Объём работ', width: 120 },
  { id: 'activity', label: 'Активность', width: 100 },
  { id: 'quality', label: 'Качество', width: 100 },
  { id: 'status', label: 'Доступ', width: 100 },
  { id: '', width: 88 },
];

// ----------------------------------------------------------------------

export function EmployeeListView() {
  // 1) Инициализация таблицы и диалога
  const table = useTable();
  const confirmDialog = useBoolean();

  // 2) Изначально пустой массив сотрудников
  const [tableData, setTableData] = useState([]);

  // 3) Фильтры
  const filters = useSetState({
    fio: '',
    role: [],
    status: 'all',
  });
  const { state: currentFilters, setState: updateFilters } = filters;

  // 4) ЗАГРУЗКА сотрудников при монтировании
  useEffect(() => {
    axiosInstance
      .get(endpoints.employee.list) 
      //   -> 'https://biz360-backend.onrender.com/api/employees'
      .then((res) => {
        setTableData(res.data);
      })
      .catch((err) => {
        console.error('Ошибка при загрузке сотрудников:', err);
        toast.error('Не удалось загрузить сотрудников');
      });
  }, []);

  // 5) Логика удаления одного сотрудника
  const handleDeleteRow = useCallback(
    async (id) => {
      try {
        // Удаляем на сервере
        await axiosInstance.delete(endpoints.employee.delete(id));
        toast.success('Успешно удалено!');

        // Удаляем из локального state
        const newData = tableData.filter((row) => row.id !== id);
        setTableData(newData);
        table.onUpdatePageDeleteRow(newData.length);
      } catch (error) {
        console.error('Ошибка удаления сотрудника:', error);
        toast.error('Ошибка при удалении');
      }
    },
    [table, tableData]
  );

  // 6) Логика массового удаления
  const handleDeleteRows = useCallback(async () => {
    try {
      const idsToDelete = table.selected; // Массив id
      await Promise.all(
        idsToDelete.map((id) =>
          axiosInstance.delete(endpoints.employee.delete(id))
        )
      );

      toast.success('Успешно удалено!');
      const newData = tableData.filter((row) => !idsToDelete.includes(row.id));
      setTableData(newData);

      table.onUpdatePageDeleteRows(newData.length, newData.length);
    } catch (error) {
      console.error('Ошибка при массовом удалении сотрудников:', error);
      toast.error('Ошибка при удалении');
    }
  }, [table, tableData]);

  // 7) Фильтры и сортировка
  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters: currentFilters,
  });

  const dataInPage = rowInPage(dataFiltered, table.page, table.rowsPerPage);
  const canReset =
    !!currentFilters.fio ||
    currentFilters.role.length > 0 ||
    currentFilters.status !== 'all';

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  // 8) Переключение вкладок статусов
  const handleFilterStatus = useCallback(
    (event, newValue) => {
      table.onResetPage();
      updateFilters({ status: newValue });
    },
    [updateFilters, table]
  );

  // 9) Диалог подтверждения удаления
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

  // 10) Рендер
  return (
    <>
      <DashboardContent>
        <CustomBreadcrumbs
          heading="Сотрудники"
          links={[
            { name: 'Дэшборд', href: paths.dashboard.general.file },
            { name: 'Сотрудники' },
          ]}
          action={
            <Button
              component={RouterLink}
              href={paths.dashboard.employee.new}
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
                    variant={
                      tab.value === 'all' || tab.value === currentFilters.status
                        ? 'filled'
                        : 'soft'
                    }
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
    inputData = inputData.filter((emp) =>
      emp.fio?.toLowerCase().includes(fio.toLowerCase())
    );
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
