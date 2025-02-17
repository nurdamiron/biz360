import { Box, Button, Stack, Typography, Iconify } from '@mui/material';
import { PDFViewer } from '@react-pdf/renderer';

export function InvoiceDocumentPreview({ invoice, onEdit }) {
  return (
    <Box sx={{ mt: 3 }}>
      <Stack direction="row" justifyContent="space-between" mb={2}>
        <Typography variant="h6">Документ</Typography>
        <Button 
          startIcon={<Iconify icon="solar:pen-bold" />}
          onClick={onEdit}
        >
          Редактировать
        </Button>
      </Stack>

      {invoice.fileId ? (
        <PDFViewer 
          width="100%" 
          height={600}
          url={`/api/documents/${invoice.fileId}`}
        />
      ) : (
        <Typography color="text.secondary">
          Документ будет создан после сохранения
        </Typography>
      )}
    </Box>
  );
}