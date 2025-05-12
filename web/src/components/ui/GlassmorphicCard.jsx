import { Box, useToken } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import AnimatedElement from './AnimatedElement';

// Use motion.create instead of motion()
const MotionBox = motion.create(Box);

const GlassmorphicCard = ({
  children,
  animate = true,
  hoverEffect = true,
  glowEffect = false,
  borderEffect = true,
  backdropBlur = '8px',
  opacity = 0.7,
  borderRadius = 'xl',
  animationType = 'fadeIn',
  bg = 'rgba(42, 36, 56, 0.7)',
  ...props
}) => {
  // Get token colors for gradients
  const [brandColor, accentColor] = useToken('colors', ['brand.500', 'accent.500']);
  
  // Base styles
  const baseStyles = {
    position: 'relative',
    borderRadius: borderRadius,
    overflow: 'hidden',
    backdropFilter: `blur(${backdropBlur})`,
    backgroundColor: bg,
    opacity: opacity,
    transition: 'all 0.3s ease',
  };
  
  // Hover effect styles
  const hoverStyles = hoverEffect ? {
    _hover: {
      transform: 'translateY(-5px)',
      boxShadow: 'lg',
      backgroundColor: 'rgba(42, 36, 56, 0.8)',
    }
  } : {};
  
  // Combine all styles
  const cardStyles = {
    ...baseStyles,
    ...hoverStyles,
  };
  
  // Render with or without animation
  if (animate) {
    return (
      <AnimatedElement
        animationType={animationType}
        {...cardStyles}
        {...props}
      >
        {/* Border gradient effect */}
        {borderEffect && (
          <Box
            position="absolute"
            top="0"
            left="0"
            right="0"
            bottom="0"
            borderRadius="inherit"
            pointerEvents="none"
            background={`linear-gradient(45deg, ${brandColor}20, transparent 40%, transparent 60%, ${accentColor}20)`}
            opacity="0.6"
          />
        )}
        
        {/* Glow effect */}
        {glowEffect && (
          <Box
            position="absolute"
            top="-20px"
            left="-20px"
            right="-20px"
            bottom="-20px"
            background={`radial-gradient(circle at 30% 30%, ${brandColor}30, transparent 70%)`}
            opacity="0.4"
            pointerEvents="none"
            filter="blur(10px)"
          />
        )}
        
        {/* Border edge highlight */}
        {borderEffect && (
          <Box
            position="absolute"
            top="0"
            left="0"
            right="0"
            height="1px"
            background={`linear-gradient(to right, transparent, ${brandColor}40, ${accentColor}40, transparent)`}
            opacity="0.8"
            pointerEvents="none"
          />
        )}
        
        {/* Content container */}
        <Box position="relative" zIndex="1" borderRadius="inherit">
          {children}
        </Box>
      </AnimatedElement>
    );
  }
  
  // Non-animated version
  return (
    <Box {...cardStyles} {...props}>
      {/* Border gradient effect */}
      {borderEffect && (
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          borderRadius="inherit"
          pointerEvents="none"
          background={`linear-gradient(45deg, ${brandColor}20, transparent 40%, transparent 60%, ${accentColor}20)`}
          opacity="0.6"
        />
      )}
      
      {/* Glow effect */}
      {glowEffect && (
        <Box
          position="absolute"
          top="-20px"
          left="-20px"
          right="-20px"
          bottom="-20px"
          background={`radial-gradient(circle at 30% 30%, ${brandColor}30, transparent 70%)`}
          opacity="0.4"
          pointerEvents="none"
          filter="blur(10px)"
        />
      )}
      
      {/* Border edge highlight */}
      {borderEffect && (
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          height="1px"
          background={`linear-gradient(to right, transparent, ${brandColor}40, ${accentColor}40, transparent)`}
          opacity="0.8"
          pointerEvents="none"
        />
      )}
      
      {/* Content container */}
      <Box position="relative" zIndex="1" borderRadius="inherit">
        {children}
      </Box>
    </Box>
  );
};

export default GlassmorphicCard; 