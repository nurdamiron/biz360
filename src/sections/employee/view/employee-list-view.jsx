// employee-list-view.jsx
import { useState, useEffect, useCallback } from 'react';
import { varAlpha } from 'minimal-shared/utils';
import { useBoolean } from 'minimal-shared/hooks';

import axiosInstance, { endpoints } from 'src/lib/axios';
import { toast } from 'src/components/snackbar';
import Typography from '@mui/material/Typography';

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
import { LoadingScreen } from 'src/components/loading-screen';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import {
  useTable,
  emptyRows,
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

const ROLE_OPTIONS = ['manager', 'marketer', 'admin', 'developer'];

// ----------------------------------------------------------------------

export function EmployeeListView() {
  const table = useTable();
  const confirmDialog = useBoolean();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState({
    fio: '',
    role: [],
    status: 'all',
  });

  // Функция загрузки данных
  const loadEmployees = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axiosInstance.get(endpoints.employee.list, {
        params: {
          page: table.page + 1,
          limit: table.rowsPerPage,
          search: filters.fio,
          role: filters.role.join(','),
          status: filters.status !== 'all' ? filters.status : undefined,
          sort: table.orderBy,
          order: table.order,
        },
      });

      setEmployees(response.data.data);
      setTotalCount(response.data.pagination.total);
    } catch (err) {
      console.error('Error loading employees:', err);
      setError('Не удалось загрузить список сотрудников');
      toast.error(err.response?.data?.message || 'Ошибка при загрузке данных');
    } finally {
      setLoading(false);
    }
  }, [filters, table.page, table.rowsPerPage, table.orderBy, table.order]);

  // Загрузка при монтировании и изменении фильтров/пагинации
  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  // Обработчики фильтров
  const handleFilterChange = useCallback((newFilters) => {
    table.onResetPage();
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, [table]);

  const handleFilterReset = useCallback(() => {
    table.onResetPage();
    setFilters({
      fio: '',
      role: [],
      status: 'all',
    });
  }, [table]);

  // Удаление сотрудника
  const handleDeleteRow = useCallback(async (id) => {
    try {
      await axiosInstance.delete(endpoints.employee.delete(id));
      toast.success('Сотрудник успешно удален');
      loadEmployees();
  
      if (table.selected.includes(id)) {
        table.onSelectRow(id);
      }
    } catch (err) { // Изменено с error на err
      console.error('Error deleting employee:', err);
      toast.error('Ошибка при удалении сотрудника');
    }
  }, [loadEmployees, table]);
  

  // Массовое удаление
  const handleDeleteRows = useCallback(async () => {
    try {
      await Promise.all(
        table.selected.map(id => axiosInstance.delete(endpoints.employee.delete(id)))
      );
      
      toast.success('Выбранные сотрудники успешно удалены');
      table.onSelectAllRows(false);
      loadEmployees();
    } catch (err) { // Изменено с error на err
      console.error('Error deleting multiple employees:', err);
      toast.error('Ошибка при удалении сотрудников');
    }
  }, [table.selected, loadEmployees, table]);
  

  if (error) {
    return (
      <DashboardContent>
        <Box sx={{ textAlign: 'center', py: 3 }}>
          <Typography color="error">{error}</Typography>
          <Button onClick={loadEmployees} sx={{ mt: 1 }}>
            Попробовать снова
          </Button>
        </Box>
      </DashboardContent>
    );
  }

  return (
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
          value={filters.status}
          onChange={(_, value) => handleFilterChange({ status: value })}
          sx={{
            px: 2.5,
            boxShadow: (theme) => `inset 0 -2px 0 0 ${varAlpha(theme.palette.grey[500], 0.08)}`,
          }}
        >
          {STATUS_OPTIONS.map((tab) => (
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
                  {tab.value === 'all' ? totalCount : 
                    employees.filter(emp => emp.status === tab.value).length}
                </Label>
              }
            />
          ))}
        </Tabs>

        <EmployeeTableToolbar
          filters={filters}
          onFilters={handleFilterChange}
          roleOptions={ROLE_OPTIONS}
        />

        {(filters.fio || filters.role.length > 0 || filters.status !== 'all') && (
          <EmployeeTableFiltersResult
            filters={filters}
            onResetFilters={handleFilterReset}
            results={totalCount}
            sx={{ p: 2.5, pt: 0 }}
          />
        )}

        <Box sx={{ position: 'relative' }}>
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
                headLabel={TABLE_HEAD}
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
                {loading ? (
                  <TableEmptyRows height={76} emptyRows={table.rowsPerPage} />
                ) : (
                  <>
                    {employees.map((row) => (
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
                      height={76}
                      emptyRows={emptyRows(table.page, table.rowsPerPage, totalCount)}
                    />

                    <TableNoData notFound={!loading && !employees.length} />
                  </>
                )}
              </TableBody>
            </Table>
          </Scrollbar>
        </Box>

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
    </DashboardContent>
  );
}