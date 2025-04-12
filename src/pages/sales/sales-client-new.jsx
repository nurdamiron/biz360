import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Container, Stack, Typography } from '@mui/material';
import { CustomerForm } from 'src/sections/sales/components/CustomerForm';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import NavigateNextIcon from '@mui/icons-material/NavigateNext'; // Заглушка

export default function SalesClientNew() {
  return (
    <>
      <Helmet>
        <title>Новый клиент | CRM Система</title>
      </Helmet>

      <Container maxWidth="lg">
        {/* Хлебные крошки */}
        <Breadcrumbs 
          separator={<NavigateNextIcon fontSize="small" />} 
          aria-label="breadcrumb"
          sx={{ mb: 2 }}
        >
          <Link color="inherit" href="/dashboard">
            Главная
          </Link>
          <Link color="inherit" href="/dashboard/clients">
            Клиенты
          </Link>
          <Typography color="text.primary">Новый клиент</Typography>
        </Breadcrumbs>
        
        <Stack spacing={3}>
          <Typography variant="h4">Создание нового клиента</Typography>
          <CustomerForm />
        </Stack>
      </Container>
    </>
  );
}
