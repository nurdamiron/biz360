// файл: src/components/ConfirmationDialog.jsx
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
} from '@mui/material';

export function ConfirmationDialog({
  open,
  title,
  description,
  confirmText = 'Удалить',
  cancelText = 'Отмена',
  onConfirm,
  onClose,
}) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{title || 'Подтверждение'}</DialogTitle>

      <DialogContent>
        <Typography>{description || 'Вы уверены?'}</Typography>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="inherit">
          {cancelText}
        </Button>
        <Button variant="contained" color="error" onClick={onConfirm}>
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
