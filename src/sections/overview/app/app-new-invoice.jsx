import { usePopover } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';
import { useState } from 'react';
import TableSortLabel from '@mui/material/TableSortLabel';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import { useTable, TablePaginationCustom } from 'src/components/table';

import { 
  CircularProgress,
  Alert,
  Typography,
  Chip
} from '@mui/material';

import { fCurrency } from 'src/utils/format-number';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { TableHeadCustom } from 'src/components/table';
import { CustomPopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

export function AppNewInvoice({ 
  title, 
  subheader,
  tableData, 
  headCells, 
  isLoading, 
  error,
  renderStatus,
  renderActions,
  emptyMessage,
  ...other 
}) {
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('id');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (isLoading) {
    return (
      <Card {...other}>
        <CardHeader title={title} subheader={subheader} />
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <CircularProgress />
        </Box>
      </Card>
    );
  }

  if (error) {
    return (
      <Card {...other}>
        <CardHeader title={title} subheader={subheader} />
        <Box sx={{ p: 3 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      </Card>
    );
  }

  if (!tableData.length) {
    return (
      <Card {...other}>
        <CardHeader title={title} subheader={subheader} />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
          <Typography variant="body1" color="text.secondary">
            {emptyMessage || 'Нет данных для отображения'}
          </Typography>
        </Box>
      </Card>
    );
  }

  return (
    <Card {...other}>
      <CardHeader title={title} subheader={subheader} sx={{ mb: 3 }} />

      <TableContainer>
        <Scrollbar>
          <Table size="small">
            <TableHead>
              <TableRow>
                {headCells.map((cell) => (
                  <TableCell
                    key={cell.id}
                    align={cell.align || 'left'}
                    sortDirection={orderBy === cell.id ? order : false}
                  >
                    <TableSortLabel
                      active={orderBy === cell.id}
                      direction={orderBy === cell.id ? order : 'asc'}
                      onClick={() => handleRequestSort(cell.id)}
                    >
                      {cell.label}
                    </TableSortLabel>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {tableData
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.id}</TableCell>

                    {headCells.map((cell) => {
                      if (cell.id === 'id' || cell.id === '') return null; // Первую и последнюю колонки обрабатываем отдельно
                      
                      if (cell.id === 'status' && renderStatus) {
                        return (
                          <TableCell key={cell.id}>
                            {renderStatus(row.status, row.statusLabel, row.statusColor)}
                          </TableCell>
                        );
                      }
                      
                      if (cell.id === 'status' && !renderStatus) {
                        return (
                          <TableCell key={cell.id}>
                            <Label
                              variant="soft"
                              color={
                                (row.status === 'completed' && 'success') ||
                                (row.status === 'in_processing' && 'warning') ||
                                (row.status === 'cancelled' && 'error') ||
                                (row.status === 'rejected' && 'error') ||
                                (row.status === 'new' && 'primary') ||
                                (row.status === 'paid' && 'success') ||
                                'default'
                              }
                            >
                              {row.statusLabel || row.status}
                            </Label>
                          </TableCell>
                        );
                      }
                      
                      if (cell.id === 'price') {
                        return (
                          <TableCell key={cell.id}>
                            {fCurrency(row[cell.id])}
                          </TableCell>
                        );
                      }
                      
                      return (
                        <TableCell key={cell.id}>
                          {row[cell.id]}
                        </TableCell>
                      );
                    })}

                    <TableCell align="right">
                      {renderActions ? renderActions(row.orderId) : (
                        <IconButton>
                          <Iconify icon="eva:more-vertical-fill" />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </Scrollbar>
      </TableContainer>

      <TablePaginationCustom
        component="div"
        count={tableData.length}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
        onPageChange={(e, newPage) => handleChangePage(newPage)}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Строк на странице:"
        labelDisplayedRows={({ from, to, count }) => 
          `${from}-${to} из ${count !== -1 ? count : `более чем ${to}`}`
        }
      />

      <Divider sx={{ borderStyle: 'dashed' }} />

      <Box sx={{ p: 2, textAlign: 'right' }}>
        <Button size="small" color="inherit">
          Все заказы
        </Button>
      </Box>
    </Card>
  );
}

// ----------------------------------------------------------------------

AppNewInvoice.defaultProps = {
  tableData: [],
  headCells: [
    { id: 'id', label: 'Номер заказа' },
    { id: 'category', label: 'Категория' },
    { id: 'price', label: 'Сумма' },
    { id: 'status', label: 'Статус' },
    { id: '', label: 'Действия' },
  ],
};