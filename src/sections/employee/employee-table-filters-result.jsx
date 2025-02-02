import PropTypes from 'prop-types';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { Iconify } from 'src/components/iconify';
import Typography from '@mui/material/Typography';

/**
 * Component to display active filters and total results for the employee table
 */
export function EmployeeTableFiltersResult({ filters, onResetFilters, results, sx }) {
  const showRoleFilter = filters.role && filters.role.length > 0;
  const showFioFilter = filters.fio && filters.fio.length > 0;
  const showStatusFilter = filters.status && filters.status !== 'all';

  if (!showRoleFilter && !showFioFilter && !showStatusFilter) {
    return null;
  }

  return (
    <Stack
      spacing={1.5}
      sx={{
        flexGrow: 1,
        ...sx,
      }}
    >
      <Stack flexGrow={1} spacing={1} direction="row" flexWrap="wrap" alignItems="center">
        {showFioFilter && (
          <Chip
            label={`ФИО: ${filters.fio}`}
            size="small"
            onDelete={() => {
              const newFilters = {
                ...filters,
                fio: '',
              };
              onResetFilters(newFilters);
            }}
          />
        )}

        {showRoleFilter &&
          filters.role.map((role) => (
            <Chip
              key={role}
              label={`Роль: ${role}`}
              size="small"
              onDelete={() => {
                const newFilters = {
                  ...filters,
                  role: filters.role.filter((item) => item !== role),
                };
                onResetFilters(newFilters);
              }}
            />
          ))}

        {showStatusFilter && (
          <Chip
            label={`Статус: ${filters.status}`}
            size="small"
            onDelete={() => {
              const newFilters = {
                ...filters,
                status: 'all',
              };
              onResetFilters(newFilters);
            }}
          />
        )}

        <Button
          color="error"
          onClick={() => onResetFilters()}
          startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
        >
          Очистить
        </Button>

        <Stack direction="row" spacing={0.5} alignItems="center">
          <Typography variant="body2" sx={{ color: 'text.disabled' }}>
            Найдено:
          </Typography>
          <Typography variant="subtitle2">{results} сотрудников</Typography>
        </Stack>
      </Stack>
    </Stack>
  );
}

EmployeeTableFiltersResult.propTypes = {
  filters: PropTypes.shape({
    fio: PropTypes.string,
    role: PropTypes.arrayOf(PropTypes.string),
    status: PropTypes.string,
  }),
  onResetFilters: PropTypes.func,
  results: PropTypes.number,
  sx: PropTypes.object,
};

EmployeeTableFiltersResult.defaultProps = {
  filters: {
    fio: '',
    role: [],
    status: 'all',
  },
  results: 0,
  sx: {},
};