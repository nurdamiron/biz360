// src/sections/orders/view/order-list-view.jsx

import { useState, useCallback, useEffect } from 'react';
import { useBoolean, useSetState } from 'minimal-shared/hooks';
import { paths } from 'src/routes/paths';
import { useGetOrders, getAllOrderStatuses, getStatusColor, getStatusLabel } from 'src/actions/order';

import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import TableBody from '@mui/material/TableBody';
import Checkbox from '@mui/material/Checkbox';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import axios from 'src/lib/axios';
import { fIsAfter, fIsBetween } from 'src/utils/format-time';

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
  TableNoData,
  getComparator,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';

import { OrderTableRow } from '../order-table-row';
import { OrderTableToolbar } from '../order-table-toolbar';
import { OrderTableFiltersResult } from '../order-table-filters-result';
import { RouterLink } from 'src/routes/components';
// ----------------------------------------------------------------------

// Получаем все статусы для отображения в табах
const allOrderStatuses = getAllOrderStatuses();
const STATUS_OPTIONS = [{ value: 'all', label: 'Все' }, ...allOrderStatuses];

const TABLE_HEAD = [
  { id: 'orderNumber', label: 'Заказ', width: 88 },
  { id: 'name', label: 'Клиент' },
  { id: 'createdAt', label: 'Дата', width: 140 },
  { id: 'totalQuantity', label: 'Позиции', width: 120, align: 'center' },
  { id: 'totalAmount', label: 'Сумма', width: 140 },
  { id: 'status', label: 'Статус', width: 110 },
  { id: '', width: 88 },
];

// ----------------------------------------------------------------------

export function OrderListView() {
  // Инициализация таблицы
  const table = useTable({ defaultOrderBy: 'createdAt', defaultOrder: 'desc' });

  // Диалог подтверждения удаления
  const confirmDialog = useBoolean();

  // Получение данных заказов
  const { orders, ordersLoading, ordersError, refetchOrders } = useGetOrders();
  
  // ID заказа для удаления
  const [deleteOrderId, setDeleteOrderId] = useState(null);

  // Фильтры
  const filters = useSetState({
    name: '',
    status: 'all',
    startDate: null,
    endDate: null,
  });
  
  const { state: currentFilters, setState: updateFilters } = filters;

  // Проверка: если дата окончания раньше даты начала -> ошибка
  const dateError = fIsAfter(currentFilters.startDate, currentFilters.endDate);

  // Функция фильтрации данных
  const dataFiltered = applyFilter({
    inputData: orders || [],
    comparator: getComparator(table.order, table.orderBy),
    filters: currentFilters,
    dateError,
  });

  // Определяем, какие строки показываются на данной странице
  const dataInPage = dataFiltered.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  // Определяем, можно ли сбросить фильтры
  const canReset =
    !!currentFilters.name ||
    currentFilters.status !== 'all' ||
    (!!currentFilters.startDate && !!currentFilters.endDate);

  // Проверка - не найдены ли данные
  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  // Обработчик удаления заказа
  const handleDeleteOrder = useCallback(async () => {
    try {
      // Здесь должен быть вызов API для удаления заказа
      await axios.delete(`/api/orders/${deleteOrderId}`);
      
      toast.success('Заказ успешно удален');
      
      // Обновляем список заказов
      refetchOrders();
      
      // Очищаем выбранные заказы
      table.onSelectAllRows(false, []);
    } catch (error) {
      console.error('Ошибка при удалении заказа:', error);
      toast.error('Не удалось удалить заказ');
    } finally {
      confirmDialog.onFalse(); // Закрываем диалог
      setDeleteOrderId(null); // Сбрасываем ID для удаления
    }
  }, [deleteOrderId, refetchOrders, confirmDialog, table]);

  // Открытие диалога удаления
  const handleOpenDeleteDialog = useCallback((id) => {
    setDeleteOrderId(id);
    confirmDialog.onTrue();
  }, [confirmDialog]);

  // Переключение табов статусов
  const handleFilterStatus = useCallback(
    (event, newValue) => {
      table.onResetPage();
      updateFilters({ status: newValue });
    },
    [updateFilters, table]
  );

  // Диалог подтверждения удаления
  const renderConfirmDialog = () => (
    <ConfirmDialog
      open={confirmDialog.value}
      onClose={confirmDialog.onFalse}
      title="Удаление заказа"
      content={
        <>
          Вы уверены, что хотите удалить этот заказ?
          <br />
          Это действие нельзя будет отменить.
        </>
      }
      action={
        <Button
          variant="contained"
          color="error"
          onClick={handleDeleteOrder}
        >
          Удалить
        </Button>
      }
    />
  );

  // Рендер состояния загрузки
  if (ordersLoading) {
    return (
      <DashboardContent>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </DashboardContent>
    );
  }

  // Рендер ошибки
  if (ordersError) {
    return (
      <DashboardContent>
        <Alert severity="error">
          Не удалось загрузить данные заказов. Пожалуйста, попробуйте позже.
        </Alert>
      </DashboardContent>
    );
  }

  return (
    <>
      <DashboardContent>
        <CustomBreadcrumbs
          heading="Список заказов"
          links={[
            { name: 'Главная', href: paths.dashboard.root },
            { name: 'Список заказов', href: paths.dashboard.order.root },
          ]}
          action={
            <Button
              component={RouterLink}
              variant="contained" 
              startIcon={<Iconify icon="eva:plus-fill" />}
              href={paths.dashboard.order.new}
            >
              Новый заказ
            </Button>
          }
          sx={{ mb: { xs: 3, md: 5 } }}
        />

        <Card>
          {/* Табы со статусами */}
          <Tabs
            value={currentFilters.status}
            onChange={handleFilterStatus}
            sx={{ px: 2.5, boxShadow: (theme) => `inset 0 -2px 0 0 ${theme.palette.divider}` }}
          >
            {STATUS_OPTIONS.map((tab) => {
              // Получаем количество заказов с данным статусом
              const count = tab.value === 'all' 
                ? orders.length 
                : orders.filter(order => order.status === tab.value).length;
                
              return (
                <Tab
                  key={tab.value}
                  iconPosition="end"
                  value={tab.value}
                  label={tab.label}
                  icon={
                    <Label
                      variant={
                        (tab.value === 'all' || tab.value === currentFilters.status) ? 'filled' : 'soft'
                      }
                      color={tab.color || 'default'}
                    >
                      {count}
                    </Label>
                  }
                />
              );
            })}
          </Tabs>

          {/* Панель инструментов (фильтры дат, поиск) */}
          <OrderTableToolbar
            filters={filters}
            onResetPage={table.onResetPage}
            dateError={dateError}
          />

          {/* Показываем чипы «фильтры» (результаты) */}
          {canReset && (
            <OrderTableFiltersResult
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
                <Tooltip title="Удалить выбранные">
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
                  {dataInPage.map((row) => (
                    <OrderTableRow
                      key={row.id}
                      row={{
                        id: row.id,
                        orderNumber: row.order_number,
                        customer: {
                          name: row.customer_name,
                          email: row.customer_email,
                          avatarUrl: null
                        },
                        createdAt: row.created_at,
                        totalQuantity: row.total_items || 0,
                        subtotal: row.total || 0,
                        status: row.status
                      }}
                      selected={table.selected.includes(row.id)}
                      onSelectRow={() => table.onSelectRow(row.id)}
                      onDeleteRow={() => handleOpenDeleteDialog(row.id)}
                      detailsHref={paths.dashboard.order.details(row.id)}
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

function applyFilter({ inputData, comparator, filters, dateError }) {
  const { status, name, startDate, endDate } = filters;

  // Сортировка
  const stabilizedThis = inputData.map((el, index) => [el, index]);
  
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  
  inputData = stabilizedThis.map((el) => el[0]);

  // Фильтр по имени/номеру заказа/клиенту
  if (name) {
    inputData = inputData.filter((order) =>
      (order.order_number?.toLowerCase().includes(name.toLowerCase())) ||
      (order.customer_name?.toLowerCase().includes(name.toLowerCase())) ||
      (order.customer_email?.toLowerCase().includes(name.toLowerCase()))
    );
    
  }

  // Фильтр по статусу
  if (status !== 'all') {
    inputData = inputData.filter((order) => order.status === status);
  }

  // Фильтр по дате, если нет ошибки в диапазоне
  if (!dateError && startDate && endDate) {
    inputData = inputData.filter((order) => 
      fIsBetween(order.created_at, startDate, endDate)
    );
  }

  return inputData;
}