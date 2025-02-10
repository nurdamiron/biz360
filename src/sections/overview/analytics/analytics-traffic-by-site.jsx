import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';

import { fShortenNumber } from 'src/utils/format-number';

import { StoreIcon, CorporateIcon, RetailIcon, MarketplaceIcon } from 'src/assets/icons';

// ----------------------------------------------------------------------

export function AnalyticsTrafficBySite({ 
  title = "销售渠道分析", 
  subheader = "各渠道销售数据对比",
  list, 
  sx, 
  ...other 
}) {
  return (
    <Card sx={sx} {...other}>
      <CardHeader title={title} subheader={subheader} />
      <Box
        sx={{
          p: 3,
          gap: 2,
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
        }}
      >
        {list.map((site) => (
          <Box
            key={site.label}
            sx={(theme) => ({
              py: 2.5,
              display: 'flex',
              borderRadius: 1.5,
              textAlign: 'center',
              alignItems: 'center',
              flexDirection: 'column',
              border: `solid 1px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.12)}`,
            })}
          >
            {site.value === 'store' && <StoreIcon sx={{ width: 32 }} />}
            {site.value === 'corporate' && <CorporateIcon sx={{ width: 32 }} />}
            {site.value === 'retail' && <RetailIcon sx={{ width: 32 }} />}
            {site.value === 'marketplace' && <MarketplaceIcon sx={{ width: 32 }} />}

            <Typography variant="h6" sx={{ mt: 1 }}>
              {fShortenNumber(site.total)}
            </Typography>

            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {site.label}
            </Typography>
          </Box>
        ))}
      </Box>
    </Card>
  );
}
