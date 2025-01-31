import { useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Typography from '@mui/material/Typography';

import { Image } from 'src/components/image';
import { Iconify } from 'src/components/iconify';
import {
  Carousel,
  useCarousel,
  CarouselThumb,
  CarouselThumbs,
  CarouselArrowNumberButtons,
} from 'src/components/carousel';

const WS_URL = import.meta.env ? import.meta.env.VITE_WS_URL : 'wss://biz360-backend.onrender.com/ws';

export function ProductDetailsCarousel({ productId, initialImages = [] }) {
  const [images, setImages] = useState(initialImages);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const ws = useRef(null);

  const carousel = useCarousel({
    initialSlide: selectedImage,
    thumbs: { 
      slidesToShow: 'auto',
      spacing: 8
    }
  });

  const slides = images.map((img) => ({ src: img }));

  const handleWebSocketMessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.id === productId && data.images) {
        setImages(data.images);
      }
    } catch (error) {
      console.error('WebSocket message processing error:', error);
    }
  };

  const handleWebSocketError = (error) => {
    console.error('WebSocket connection error:', error);
  };

  const setupWebSocket = () => {
    if (!productId) {
      return;
    }

    ws.current = new WebSocket(`${WS_URL}?productId=${productId}`);
    ws.current.onmessage = handleWebSocketMessage;
    ws.current.onerror = handleWebSocketError;
  };

  const cleanupWebSocket = () => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.close();
    }
    ws.current = null;
  };

  useEffect(() => {
    setupWebSocket();
    // eslint-disable-next-line consistent-return
    return () => {
      cleanupWebSocket();
    };
  }, [productId]);

  useEffect(() => {
    if (carousel.mainApi && lightboxOpen) {
      carousel.mainApi.scrollTo(selectedImage);
    }
  }, [carousel.mainApi, lightboxOpen, selectedImage]);

  const handleOpenLightbox = (imageIndex) => {
    setSelectedImage(imageIndex);
    setLightboxOpen(true);
  };

  const handleCloseLightbox = () => {
    setLightboxOpen(false);
  };

  const handlePrevImage = () => {
    setSelectedImage((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNextImage = () => {
    setSelectedImage((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  if (!images.length) {
    return (
      <Box
        sx={{
          height: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.neutral',
          borderRadius: 2,
        }}
      >
        <Typography variant="subtitle2">No images available</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ position: 'relative' }}>
        <Box sx={{ mb: 3, position: 'relative' }}>
          <CarouselArrowNumberButtons
            spacing={2}
            {...carousel.arrows}
            options={carousel.options}
            totalSlides={carousel.dots.dotCount}
            selectedIndex={carousel.dots.selectedIndex + 1}
            sx={{ right: 16, bottom: 16, position: 'absolute', zIndex: 9 }}
          />

          <Carousel carousel={carousel} sx={{ borderRadius: 2 }}>
            {slides.map((slide, index) => (
              <Image
                key={slide.src}
                alt={`Product ${index + 1}`}
                src={slide.src}
                ratio="1/1"
                onClick={() => handleOpenLightbox(index)}
                sx={{ cursor: 'zoom-in', minWidth: 320 }}
              />
            ))}
          </Carousel>
        </Box>

        <CarouselThumbs
          ref={carousel.thumbs.thumbsRef}
          options={carousel.options?.thumbs}
          slotProps={{ disableMask: true }}
          sx={{ maxWidth: 360, mx: 'auto' }}
        >
          {slides.map((thumb, index) => (
            <CarouselThumb
              key={thumb.src}
              src={thumb.src}
              index={index}
              selected={index === carousel.thumbs.selectedIndex}
              onClick={() => carousel.thumbs.onClickThumb(index)}
            />
          ))}
        </CarouselThumbs>
      </Box>

      <Dialog
        fullScreen
        open={lightboxOpen}
        onClose={handleCloseLightbox}
        PaperProps={{
          sx: { bgcolor: 'background.neutral' }
        }}
      >
        <Box sx={{ position: 'relative', height: 1 }}>
          <IconButton
            onClick={handleCloseLightbox}
            sx={{
              top: 16,
              right: 16,
              position: 'absolute',
              zIndex: 9,
            }}
          >
            <Iconify icon="eva:close-fill" />
          </IconButton>

          <Box
            sx={{
              height: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Image
              alt={`Product ${selectedImage + 1}`}
              src={images[selectedImage]}
              sx={{ maxWidth: 1, maxHeight: 1 }}
            />
          </Box>

          <IconButton
            onClick={handlePrevImage}
            sx={{
              left: 16,
              top: '50%',
              position: 'absolute',
              transform: 'translateY(-50%)',
            }}
          >
            <Iconify icon="eva:arrow-ios-back-fill" />
          </IconButton>

          <IconButton
            onClick={handleNextImage}
            sx={{
              right: 16,
              top: '50%',
              position: 'absolute',
              transform: 'translateY(-50%)',
            }}
          >
            <Iconify icon="eva:arrow-ios-forward-fill" />
          </IconButton>
        </Box>
      </Dialog>
    </Box>
  );
}