import { useCallback } from 'react';
import { usePopover } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Select from '@mui/material/Select';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import IconButton from '@mui/material/IconButton';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';

import { Iconify } from 'src/components/iconify';
import { CustomPopover } from 'src/components/custom-popover';

/**
 * Компонент панели инструментов для фильтрации и дополнительных действий в таблице сотрудников.
 *
 * @param {Object} props
 * @param {Object} props.filters - объект вида { state, setState }, где:
 *   - state: текущее состояние фильтров (fio, role и т.д.)
 *   - setState: функция для обновления фильтров
 * @param {Array<string>} props.roleOptions - массив допустимых ролей для фильтра
 * @param {Function} props.onResetPage - колбэк, который сбрасывает пагинацию при изменении фильтров
 */
export function EmployeeTableToolbar({ filters, roleOptions, onResetPage }) {
  const menuActions = usePopover();

  // Деструктурируем текущее состояние фильтров и функцию его обновления
  const { state: currentFilters, setState: updateFilters } = filters;

  // Фильтр по ФИО
  const handleFilterFio = useCallback(
    (event) => {
      onResetPage();
      updateFilters({ fio: event.target.value });
    },
    [onResetPage, updateFilters]
  );

  // Фильтр по роли
  const handleFilterRole = useCallback(
    (event) => {
      const newValue =
        typeof event.target.value === 'string'
          ? event.target.value.split(',')
          : event.target.value;

      onResetPage();
      updateFilters({ role: newValue });
    },
    [onResetPage, updateFilters]
  );

  // Рендер всплывающего меню (печать, импорт, экспорт)
  const renderMenuActions = () => (
    <CustomPopover
      open={menuActions.open}
      anchorEl={menuActions.anchorEl}
      onClose={menuActions.onClose}
      slotProps={{ arrow: { placement: 'right-top' } }}
    >
      <MenuList>
        <MenuItem onClick={() => menuActions.onClose()}>
          <Iconify icon="solar:printer-minimalistic-bold" />
          Печать
        </MenuItem>

        <MenuItem onClick={() => menuActions.onClose()}>
          <Iconify icon="solar:import-bold" />
          Импорт
        </MenuItem>

        <MenuItem onClick={() => menuActions.onClose()}>
          <Iconify icon="solar:export-bold" />
          Экспорт
        </MenuItem>
      </MenuList>
    </CustomPopover>
  );

  return (
    <>
      <Box
        sx={{
          p: 2.5,
          gap: 2,
          display: 'flex',
          pr: { xs: 2.5, md: 1 },
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'flex-end', md: 'center' },
        }}
      >
        {/* Выбор роли (множественный Select) */}
        <FormControl sx={{ flexShrink: 0, width: { xs: 1, md: 200 } }}>
          <InputLabel htmlFor="filter-role-select">Роль</InputLabel>
          <Select
            multiple
            value={currentFilters.role}
            onChange={handleFilterRole}
            input={<OutlinedInput label="Роль" />}
            renderValue={(selected) => selected.join(', ')}
            inputProps={{ id: 'filter-role-select' }}
            MenuProps={{ PaperProps: { sx: { maxHeight: 240 } } }}
          >
            {roleOptions.map((option) => (
              <MenuItem key={option} value={option}>
                <Checkbox disableRipple size="small" checked={currentFilters.role.includes(option)} />
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Поиск по ФИО */}
        <Box
          sx={{
            gap: 2,
            width: 1,
            flexGrow: 1,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <TextField
            fullWidth
            value={currentFilters.fio}
            onChange={handleFilterFio}
            placeholder="Поиск по ФИО..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
            }}
          />

          {/* Кнопка "Ещё" для меню (печать, импорт, экспорт) */}
          <IconButton onClick={menuActions.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </Box>
      </Box>

      {renderMenuActions()}
    </>
  );
}
