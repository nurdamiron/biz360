import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Pagination from '@mui/material/Pagination';

import { EmployeeCard } from './employee-card';

// ----------------------------------------------------------------------

export function EmployeeCardList({ employees }) {
  const [page, setPage] = useState(1);

  const rowsPerPage = 12;

  const handleChangePage = useCallback((event, newPage) => {
    setPage(newPage);
  }, []);

  return (
    <>
      <Box
        sx={{
          gap: 3,
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
        }}
      >
        {employees
          .slice((page - 1) * rowsPerPage, (page - 1) * rowsPerPage + rowsPerPage)
          .map((employee) => (
            <EmployeeCard key={employee.id} employee={employee} />
          ))}
      </Box>

      <Pagination
        page={page}
        shape="circular"
        count={Math.ceil(employees.length / rowsPerPage)}
        onChange={handleChangePage}
        sx={{ mt: { xs: 5, md: 8 }, mx: 'auto' }}
      />
    </>
  );
}
