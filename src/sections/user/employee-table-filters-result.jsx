import { useCallback } from 'react';

import Chip from '@mui/material/Chip';

import { chipProps, FiltersBlock, FiltersResult } from 'src/components/filters-result';

export function EmployeeTableFiltersResult({ filters, onResetPage, totalResults, sx }) {
  const { state: currentFilters, setState: updateFilters, resetState: resetFilters } = filters;

  const handleRemoveFio = useCallback(() => {
    onResetPage();
    updateFilters({ fio: '' });
  }, [onResetPage, updateFilters]);

  const handleRemoveStatus = useCallback(() => {
    onResetPage();
    updateFilters({ status: 'all' });
  }, [onResetPage, updateFilters]);

  const handleRemoveRole = useCallback(
    (inputValue) => {
      const newValue = currentFilters.role.filter((item) => item !== inputValue);
      onResetPage();
      updateFilters({ role: newValue });
    },
    [onResetPage, updateFilters, currentFilters.role]
  );

  const handleReset = useCallback(() => {
    onResetPage();
    resetFilters();
  }, [onResetPage, resetFilters]);

  return (
    <FiltersResult totalResults={totalResults} onReset={handleReset} sx={sx}>
      <FiltersBlock label="Статус:" isShow={currentFilters.status !== 'all'}>
        <Chip {...chipProps} label={currentFilters.status} onDelete={handleRemoveStatus} />
      </FiltersBlock>

      <FiltersBlock label="Роль:" isShow={!!currentFilters.role.length}>
        {currentFilters.role.map((item) => (
          <Chip {...chipProps} key={item} label={item} onDelete={() => handleRemoveRole(item)} />
        ))}
      </FiltersBlock>

      <FiltersBlock label="ФИО:" isShow={!!currentFilters.fio}>
        <Chip {...chipProps} label={currentFilters.fio} onDelete={handleRemoveFio} />
      </FiltersBlock>
    </FiltersResult>
  );
}
