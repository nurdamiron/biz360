import { useEffect, useRef, useState } from 'react';
import { Markdown } from 'src/components/markdown';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Alert from '@mui/material/Alert';
import axios from 'axios';

const WS_URL = import.meta.env ? import.meta.env.VITE_WS_URL : 'wss://biz360-backend.onrender.com/ws';

export function ProductDetailsDescription({ productId, initialDescription = '', sx }) {
  const theme = useTheme();
  const [description, setDescription] = useState(initialDescription);
  const [loading, setLoading] = useState(!initialDescription);
  const [error, setError] = useState(null);
  const ws = useRef(null);

  useEffect(() => {
    const fetchDescription = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`https://biz360-backend.onrender.com/api/product/details/${productId}`);
        
        if (response.data.success) {
          setDescription(response.data.data.description || 'No description available.');
        } else {
          setError('Failed to fetch product description');
        }
      } catch (fetchError) {
        setError(fetchError.message || 'An error occurred while fetching the description');
      } finally {
        setLoading(false);
      }
    };

    if (productId && !initialDescription) {
      fetchDescription();
    }
  }, [productId, initialDescription]);

  useEffect(() => {
    if (!productId) {
      return undefined;
    }

    const handleWebSocketMessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.id === productId && data.description !== undefined) {
          setDescription(data.description || 'No description available.');
        }
      } catch (wsError) {
        console.error('WebSocket message processing error:', wsError);
      }
    };

    const handleWebSocketError = (wsError) => {
      console.error('WebSocket error:', wsError);
    };

    ws.current = new WebSocket(`${WS_URL}?productId=${productId}`);
    ws.current.onmessage = handleWebSocketMessage;
    ws.current.onerror = handleWebSocketError;

    return () => {
      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.close();
      }
    };
  }, [productId]);

  const getMarkdownStyles = () => ({
    p: 3,
    '& p, & li, & ol': {
      typography: 'body2',
      color: theme.palette.text.primary,
      lineHeight: 1.6,
      mb: 2,
    },
    '& table': {
      width: '100%',
      maxWidth: 640,
      mt: 2,
      mb: 3,
      borderCollapse: 'collapse',
      '& th': {
        typography: 'subtitle2',
        backgroundColor: theme.palette.background.neutral,
        padding: theme.spacing(1.5),
        borderBottom: `1px solid ${theme.palette.divider}`,
      },
      '& td': {
        typography: 'body2',
        padding: theme.spacing(2),
        borderBottom: `1px solid ${theme.palette.divider}`,
        '&:first-of-type': {
          color: theme.palette.text.secondary,
          whiteSpace: 'nowrap',
        },
      },
      '& tbody tr': {
        '&:nth-of-type(odd)': {
          backgroundColor: 'transparent',
        },
        '&:hover': {
          backgroundColor: theme.palette.action.hover,
        },
      },
    },
  });

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="text" sx={{ mb: 1 }} />
        <Skeleton variant="text" sx={{ mb: 1 }} />
        <Skeleton variant="text" width="80%" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ width: 1 }}>
      <Markdown
        children={description}
        sx={[
          getMarkdownStyles,
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      />
    </Box>
  );
}