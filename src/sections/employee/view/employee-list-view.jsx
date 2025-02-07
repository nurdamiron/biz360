import { useState, useEffect, useCallback } from 'react';
import axiosInstance, { endpoints } from 'src/lib/axios';
import { useTable, TableNoData, TableHeadCustom, TableEmptyRows, TablePaginationCustom, TableSelectedAction, emptyRows } from 'src/components/table';
import { toast } from 'src/components/snackbar';
import { DashboardContent } from 'src/layouts/dashboard';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { RouterLink } from 'src/routes/components';
import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { Scrollbar } from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { EmployeeTableToolbar } from '../employee-table-toolbar';
import { EmployeeTableFiltersResult } from '../employee-table-filters-result';
import { EmployeeTableRow } from '../employee-table-row';

import {
  Box,
  Card,
  Table,
  Tabs,
  Tab,
  Tooltip,
  IconButton,
  Button,
  Typography,
  TableBody
} from '@mui/material';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'fio', label: 'ФИО', width: 240 },
  { id: 'department', label: 'Отдел', width: 180 },
  { id: 'overall_performance', label: 'Эффективность', width: 140 },
  { id: 'kpi', label: 'KPI', width: 80 },
  { id: 'work_volume', label: 'Объём работ', width: 120 },
  { id: 'activity', label: 'Активность', width: 100 },
  { id: 'quality', label: 'Качество', width: 100 },
  { id: 'status', label: 'Доступ', width: 100 },
  { id: '', width: 88 }, // для кнопок
];

// ----------------------------------------------------------------------

export function EmployeeListView() {
  const table = useTable();
  const [employees, setEmployees] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    fio: '',
    role: [],
    status: 'all',
  });

  const [dialogOpen, setDialogOpen] = useState(false);

  const STATUS_OPTIONS = [
    { value: 'all', label: 'Все' },
    { value: 'active', label: 'Активен' },
    { value: 'pending', label: 'Ожидает' },
    { value: 'blocked', label: 'Заблокирован' },
  ];
  
  // Загрузка сотрудников
  const loadEmployees = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: table.page + 1,
        limit: table.rowsPerPage,
        search: filters.fio,
        role: filters.role.join(','),
        status: filters.status !== 'all' ? filters.status : undefined,
        sort: table.orderBy,
        order: table.order,
      };

      const response = await axiosInstance.get(endpoints.employee.list, { params });

      if (!response.data || !Array.isArray(response.data.data)) {
        throw new Error('Invalid response format from API');
      }

      setEmployees(response.data.data);
      setTotalCount(response.data.pagination?.total || 0);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Ошибка при загрузке данных');
      toast.error(err.response?.data?.message || 'Ошибка при загрузке данных');
    } finally {
      setLoading(false);
    }
  }, [filters, table.page, table.rowsPerPage, table.orderBy, table.order]);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  // Удаление одного
  const handleDeleteRow = async (id) => {
    try {
      await axiosInstance.delete(endpoints.employee.delete(id));
      toast.success('Сотрудник удалён');
      loadEmployees();
      if (table.selected.includes(id)) {
        table.onSelectRow(id);
      }
    } catch (err) {
      console.error(err);
      toast.error('Ошибка при удалении');
    }
  };

  // Удаление нескольких
  const handleDeleteRows = async () => {
    try {
      await Promise.all(table.selected.map((id) => axiosInstance.delete(endpoints.employee.delete(id))));
      toast.success('Выбранные сотрудники удалены');
      table.onSelectAllRows(false);
      loadEmployees();
    } catch (err) {
      console.error(err);
      toast.error('Ошибка при удалении');
    }
  };

  // Смена фильтра статуса
  const handleChangeStatus = (event, newValue) => {
    table.onResetPage();
    setFilters((prev) => ({ ...prev, status: newValue }));
  };

  const handleFilterChange = (newFilters) => {
    table.onResetPage();
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleFilterReset = (newFilters) => {
    table.onResetPage();
    setFilters({
      fio: '',
      role: [],
      status: 'all',
    });
  };

  if (error) {
    return (
      <DashboardContent>
        <Box sx={{ textAlign: 'center', py: 3 }}>
          <Typography color="error">{error}</Typography>
          <Button variant="outlined" onClick={loadEmployees} sx={{ mt: 1 }}>
            Повторить
          </Button>
        </Box>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Сотрудники"
        links={[{ name: 'Дашборд', href: '/dashboard' }, { name: 'Сотрудники' }]}
        action={
          <Button
            component={RouterLink}
            href="/dashboard/employee/new"
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
          >
            Новый сотрудник
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card>
        {/* Вкладки статусов */}
        <Tabs value={filters.status} onChange={handleChangeStatus}>
          {STATUS_OPTIONS.map((tab) => {
            const count = tab.value === 'all'
              ? totalCount
              : employees.filter((emp) => emp.status === tab.value).length;

            return (
              <Tab
                key={tab.value}
                value={tab.value}
                label={tab.label}
                icon={
                  <Label
                    variant={tab.value === filters.status ? 'filled' : 'soft'}
                    color={
                      (tab.value === 'active' && 'success') ||
                      (tab.value === 'pending' && 'warning') ||
                      (tab.value === 'banned' && 'error') ||
                      'default'
                    }
                  >
                    {count}
                  </Label>
                }
              />
            );
          })}
        </Tabs>

        {/* Панель фильтрации */}
        <EmployeeTableToolbar
          filters={{ state: filters, setState: setFilters }}
          onResetPage={table.onResetPage}
          roleOptions={['admin', 'owner', 'manager', 'employee']}
        />

        {/* Плашка вывода текущих фильтров */}
        {(filters.fio || filters.role.length > 0 || filters.status !== 'all') && (
          <EmployeeTableFiltersResult
            filters={filters}
            onResetFilters={handleFilterReset}
            results={totalCount}
            sx={{ px: 2.5, pb: 2 }}
          />
        )}

        <Box sx={{ position: 'relative' }}>
          {/* Действие при множественном выделении */}
          <TableSelectedAction
            dense={table.dense}
            numSelected={table.selected.length}
            rowCount={employees.length}
            onSelectAllRows={(checked) =>
              table.onSelectAllRows(
                checked,
                employees.map((row) => row.id)
              )
            }
            action={
              <Tooltip title="Удалить">
                <IconButton color="primary" onClick={() => setDialogOpen(true)}>
                  <Iconify icon="solar:trash-bin-trash-bold" />
                </IconButton>
              </Tooltip>
            }
          />

          {/* Собственно таблица */}
          <Scrollbar>
            <Table size={table.dense ? 'small' : 'medium'}>
              <TableHeadCustom
                order={table.order}
                orderBy={table.orderBy}
                headCells={TABLE_HEAD}
                rowCount={employees.length}
                numSelected={table.selected.length}
                onSort={table.onSort}
                onSelectAllRows={(checked) =>
                  table.onSelectAllRows(
                    checked,
                    employees.map((row) => row.id)
                  )
                }
              />

              <TableBody>
                {/* Если идёт загрузка */}
                {loading && <TableEmptyRows emptyRows={table.rowsPerPage} height={80} />}

                {/* Данные */}
                {!loading && employees.map((row) => (
                  <EmployeeTableRow
                    key={row.id}
                    row={row}
                    selected={table.selected.includes(row.id)}
                    onSelectRow={() => table.onSelectRow(row.id)}
                    onDeleteRow={() => handleDeleteRow(row.id)}
                    editHref={`/dashboard/employee/${row.id}/edit`}
                    />
                ))}

                {/* Пустые строки внизу (для визуального заполнения) */}
                <TableEmptyRows
                  emptyRows={emptyRows(table.page, table.rowsPerPage, totalCount)}
                  height={80}
                />

                {/* Если совсем нет данных */}
                <TableNoData notFound={!loading && !employees.length} />
              </TableBody>
            </Table>
          </Scrollbar>
        </Box>

        {/* Пагинация */}
        <TablePaginationCustom
          count={totalCount}
          page={table.page}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          onRowsPerPageChange={table.onChangeRowsPerPage}
          dense={table.dense}
          onChangeDense={table.onChangeDense}
        />
      </Card>

      {/* Диалог подтверждения удаления выбранных */}
      <ConfirmDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="Удалить"
        content={
          <>
            Удалить <strong>{table.selected.length}</strong> сотрудников?
          </>
        }
        action={
          <Button variant="contained" color="error" onClick={() => {
            setDialogOpen(false);
            handleDeleteRows();
          }}>
            Удалить
          </Button>
        }
      />
    </DashboardContent>
  );
}
