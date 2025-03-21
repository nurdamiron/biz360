// src/components/snackbar/use-snackbar.js
import { toast } from 'sonner';

export function useSnackbar() {
  const enqueueSnackbar = (message, options = {}) => {
    const { variant = 'default', ...other } = options;
    
    return toast[variant]?.(message, other) || toast(message, other);
  };

  return { enqueueSnackbar };
}