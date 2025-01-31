import { useBoolean } from 'minimal-shared/hooks';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Rating from '@mui/material/Rating';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import { Iconify } from 'src/components/iconify';

export function ProductDetailsReview({ 
  totalRatings = 0,
  totalReviews = 0,
  ratings = [],
  reviews = []
}) {
  const reviewForm = useBoolean();

  // Calculate total number of ratings
  const total = ratings.reduce((acc, curr) => acc + (curr.starCount || 0), 0);

  const renderSummary = () => (
    <Stack spacing={1} sx={{ alignItems: 'center', justifyContent: 'center' }}>
      <Typography variant="subtitle2">Average rating</Typography>

      <Typography variant="h2">
        {Number(totalRatings).toFixed(1)}/5
      </Typography>

      <Rating 
        readOnly 
        value={Number(totalRatings)} 
        precision={0.1} 
        sx={{ color: 'warning.main' }}
      />

      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        ({totalReviews} reviews)
      </Typography>
    </Stack>
  );

  const renderProgress = () => (
    <Stack
      spacing={1.5}
      sx={{
        py: 5,
        px: { xs: 3, md: 5 },
        borderLeft: { md: '1px dashed', borderColor: 'divider' },
        borderRight: { md: '1px dashed', borderColor: 'divider' }
      }}
    >
      {ratings
        .slice(0)
        .reverse()
        .map((rating) => (
          <Box key={rating.name} sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="subtitle2" sx={{ width: 42 }}>
              {rating.name}
            </Typography>

            <LinearProgress
              variant="determinate"
              value={(rating.starCount / Math.max(total, 1)) * 100}
              sx={{
                mx: 2,
                flexGrow: 1,
                bgcolor: 'warning.lighter',
                '& .MuiLinearProgress-bar': {
                  bgcolor: 'warning.main',
                },
              }}
            />

            <Typography
              variant="body2"
              sx={{ minWidth: 48, color: 'text.secondary' }}
            >
              {rating.reviewCount}
            </Typography>
          </Box>
        ))}
    </Stack>
  );

  const renderReviewButton = () => (
    <Stack sx={{ alignItems: 'center', justifyContent: 'center' }}>
      <Button
        size="large"
        variant="soft"
        color="warning"
        onClick={reviewForm.onTrue}
        startIcon={<Iconify icon="solar:pen-bold" />}
      >
        Write Review
      </Button>
    </Stack>
  );

  const renderReviewList = () => (
    <Stack spacing={3}>
      {reviews.map((item) => (
        <Stack key={item.id} spacing={2}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
              {item.name}
            </Typography>
            <Rating value={item.rating} size="small" readOnly />
          </Box>
          <Typography variant="body2">{item.content}</Typography>
        </Stack>
      ))}
    </Stack>
  );

  return (
    <Box sx={{ pt: 3, pb: 5 }}>
      <Box
        sx={{
          display: 'grid',
          py: { xs: 5, md: 0 },
          gridTemplateColumns: {
            xs: 'repeat(1, 1fr)',
            md: 'repeat(3, 1fr)',
          },
        }}
      >
        {renderSummary()}
        {renderProgress()}
        {renderReviewButton()}
      </Box>

      <Divider sx={{ borderStyle: 'dashed', my: 3 }} />
      
      {reviews.length > 0 ? renderReviewList() : (
        <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 3 }}>
          No reviews yet
        </Typography>
      )}
    </Box>
  );
}