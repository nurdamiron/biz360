// src/sections/account/account-billing-address.jsx

import { useState, useCallback } from 'react';
import { useBoolean, usePopover } from 'minimal-shared/hooks';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import CardHeader from '@mui/material/CardHeader';

import { Iconify } from 'src/components/iconify';
import { CustomPopover } from 'src/components/custom-popover';

import { AddressItem, AddressNewForm } from '../address';
import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

export function AccountBillingAddress({ addressBook }) {
  const menuActions = usePopover();
  const newAddressForm = useBoolean();
  const { employee } = useAuthContext();

  // Выбираем адреса пользователя, если они есть, или используем переданные параметры
  const userAddresses = employee?.addresses || addressBook || [];

  const [addressId, setAddressId] = useState('');

  const handleAddNewAddress = useCallback((address) => {
    console.info('Новый адрес:', address);
    // Здесь должен быть запрос на сервер для добавления адреса
  }, []);

  const handleSelectedId = useCallback(
    (event, id) => {
      menuActions.onOpen(event);
      setAddressId(id);
    },
    [menuActions]
  );

  const handleClose = useCallback(() => {
    menuActions.onClose();
    setAddressId('');
  }, [menuActions]);

  const renderMenuActions = () => (
    <CustomPopover open={menuActions.open} anchorEl={menuActions.anchorEl} onClose={handleClose}>
      <MenuList>
        <MenuItem
          onClick={() => {
            handleClose();
            console.info('Установить как основной', addressId);
          }}
        >
          <Iconify icon="eva:star-fill" />
          Сделать основным
        </MenuItem>

        <MenuItem
          onClick={() => {
            handleClose();
            console.info('Редактировать', addressId);
          }}
        >
          <Iconify icon="solar:pen-bold" />
          Редактировать
        </MenuItem>

        <MenuItem
          onClick={() => {
            handleClose();
            console.info('Удалить', addressId);
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" />
          Удалить
        </MenuItem>
      </MenuList>
    </CustomPopover>
  );

  const renderNewAddressForm = () => (
    <AddressNewForm
      open={newAddressForm.value}
      onClose={newAddressForm.onFalse}
      onCreate={handleAddNewAddress}
    />
  );

  return (
    <>
      <Card>
        <CardHeader
          title="Адресная книга"
          action={
            <Button
              size="small"
              color="primary"
              startIcon={<Iconify icon="mingcute:add-line" />}
              onClick={newAddressForm.onTrue}
            >
              Адрес
            </Button>
          }
        />

        <Stack spacing={2.5} sx={{ p: 3 }}>
          {userAddresses.map((address) => (
            <AddressItem
              variant="outlined"
              key={address.id}
              address={address}
              action={
                <IconButton
                  onClick={(event) => {
                    handleSelectedId(event, `${address.id}`);
                  }}
                  sx={{ position: 'absolute', top: 8, right: 8 }}
                >
                  <Iconify icon="eva:more-vertical-fill" />
                </IconButton>
              }
              sx={{ p: 2.5, borderRadius: 1 }}
            />
          ))}
        </Stack>
      </Card>

      {renderMenuActions()}
      {renderNewAddressForm()}
    </>
  );
}