import React from 'react';
import { Box, Typography } from '@mui/material';
import { LocalHospital } from '@mui/icons-material';

function MedicalLogo({ size = 'medium', showText = true, animated = true }) {
  const sizes = {
    small: { icon: 24, fontSize: '1rem' },
    medium: { icon: 40, fontSize: '1.5rem' },
    large: { icon: 64, fontSize: '2.5rem' },
  };

  const { icon, fontSize } = sizes[size] || sizes.medium;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        ...(animated && {
          animation: 'pulse 2s ease-in-out infinite',
          '@keyframes pulse': {
            '0%, 100%': {
              opacity: 1,
            },
            '50%': {
              opacity: 0.8,
            },
          },
        }),
      }}
    >
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...(animated && {
            '&::before': {
              content: '""',
              position: 'absolute',
              width: icon + 16,
              height: icon + 16,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              opacity: 0.2,
              animation: 'ripple 2s ease-out infinite',
              '@keyframes ripple': {
                '0%': {
                  transform: 'scale(0.8)',
                  opacity: 0.3,
                },
                '100%': {
                  transform: 'scale(1.4)',
                  opacity: 0,
                },
              },
            },
          }),
        }}
      >
        <LocalHospital
          sx={{
            fontSize: icon,
            color: 'primary.main',
            position: 'relative',
            zIndex: 1,
            filter: 'drop-shadow(0 2px 4px rgba(102, 126, 234, 0.3))',
          }}
        />
      </Box>
      {showText && (
        <Typography
          variant="h6"
          sx={{
            fontSize,
            fontWeight: 700,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '-0.02em',
          }}
        >
          Medicare
        </Typography>
      )}
    </Box>
  );
}

export default MedicalLogo;

