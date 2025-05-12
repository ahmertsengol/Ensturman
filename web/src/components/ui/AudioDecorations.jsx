import { Box, Flex, keyframes, HStack } from '@chakra-ui/react';

// Keyframes for equalizer bars
const equalizerBar1 = keyframes`
  0% { height: 8px; }
  50% { height: 32px; }
  100% { height: 8px; }
`;

const equalizerBar2 = keyframes`
  0% { height: 32px; }
  50% { height: 8px; }
  100% { height: 32px; }
`;

const equalizerBar3 = keyframes`
  0% { height: 16px; }
  50% { height: 24px; }
  100% { height: 16px; }
`;

// Keyframes for wave animation
const waveAnimation = keyframes`
  0% { transform: scaleY(1); }
  50% { transform: scaleY(1.8); }
  100% { transform: scaleY(1); }
`;

// Keyframes for circle pulse
const circlePulse = keyframes`
  0% { transform: scale(1); opacity: 0.7; }
  50% { transform: scale(1.2); opacity: 0.5; }
  100% { transform: scale(1); opacity: 0.7; }
`;

// Audio Equalizer component
export const AudioEqualizer = ({ 
  isActive = true, 
  barCount = 12, 
  height = '40px', 
  spacing = 1,
  primaryColor = 'brand.500',
  secondaryColor = 'accent.500',
  tertiaryColor = 'gray.500',
  ...props 
}) => {
  const bars = Array(barCount).fill(0);
  
  return (
    <HStack spacing={spacing} h={height} alignItems="flex-end" {...props}>
      {isActive && bars.map((_, index) => (
        <Box
          key={index}
          width="4px"
          height={`${8 + Math.random() * 8}px`}
          bg={index % 3 === 0 ? primaryColor : index % 3 === 1 ? secondaryColor : tertiaryColor}
          borderRadius="sm"
          animation={`${index % 3 === 0 ? equalizerBar1 : index % 3 === 1 ? equalizerBar2 : equalizerBar3} ${0.8 + (index * 0.1)}s infinite`}
          transition="height 0.2s ease"
        />
      ))}
      
      {!isActive && bars.map((_, index) => (
        <Box
          key={index}
          width="4px"
          height="8px"
          bg={tertiaryColor}
          borderRadius="sm"
          opacity={0.5}
        />
      ))}
    </HStack>
  );
};

// Audio Wave component
export const AudioWave = ({ 
  isActive = true, 
  waveCount = 5, 
  height = '60px',
  primaryColor = 'brand.500',
  secondaryColor = 'accent.500',
  ...props 
}) => {
  const waves = Array(waveCount).fill(0);
  
  return (
    <Flex justifyContent="center" h={height} alignItems="center" {...props}>
      {waves.map((_, i) => (
        <Box
          key={i}
          width="10px"
          height="60%"
          mx="2px"
          bg={i % 2 === 0 ? primaryColor : secondaryColor}
          borderRadius="md"
          animation={isActive ? `${waveAnimation} ${1 + (i * 0.2)}s infinite` : 'none'}
          style={{animationDelay: `${i * 0.1}s`}}
          opacity={isActive ? 1 : 0.4}
          transition="opacity 0.3s ease"
        />
      ))}
    </Flex>
  );
};

// Audio Visualizer component
export const AudioVisualizer = ({ 
  isActive = true, 
  dotCount = 30, 
  size = '200px',
  primaryColor = 'brand.500',
  secondaryColor = 'accent.500',
  ...props 
}) => {
  return (
    <Box 
      position="relative" 
      width={size} 
      height={size} 
      borderRadius="full" 
      {...props}
    >
      <Box
        position="absolute"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        width="40%"
        height="40%"
        borderRadius="full"
        bg={primaryColor}
        opacity={isActive ? 0.8 : 0.3}
        animation={isActive ? `${circlePulse} 2s infinite ease-in-out` : 'none'}
      />
      
      {isActive && Array(dotCount).fill(0).map((_, i) => {
        const angle = (i / dotCount) * Math.PI * 2;
        const x = Math.cos(angle);
        const y = Math.sin(angle);
        const distance = 45 + (Math.random() * 10);
        
        return (
          <Box
            key={i}
            position="absolute"
            top="50%"
            left="50%"
            transform={`translate(-50%, -50%) translate(${x * distance}px, ${y * distance}px)`}
            width="4px"
            height="4px"
            borderRadius="full"
            bg={i % 2 === 0 ? primaryColor : secondaryColor}
            opacity={0.8}
            animation={`${waveAnimation} ${1 + (i % 3) * 0.5}s infinite`}
            style={{animationDelay: `${(i / dotCount) * 2}s`}}
          />
        );
      })}
      
      {/* Static dots when inactive */}
      {!isActive && Array(dotCount).fill(0).map((_, i) => {
        const angle = (i / dotCount) * Math.PI * 2;
        const x = Math.cos(angle);
        const y = Math.sin(angle);
        const distance = 45;
        
        return (
          <Box
            key={i}
            position="absolute"
            top="50%"
            left="50%"
            transform={`translate(-50%, -50%) translate(${x * distance}px, ${y * distance}px)`}
            width="3px"
            height="3px"
            borderRadius="full"
            bg={"gray.500"}
            opacity={0.4}
          />
        );
      })}
    </Box>
  );
};

// Audio Bar Graph component
export const AudioBarGraph = ({ 
  isActive = true, 
  barCount = 15, 
  height = '80px',
  primaryColor = 'brand.500',
  secondaryColor = 'accent.500',
  ...props 
}) => {
  const bars = Array(barCount).fill(0).map(() => Math.random() * 100);
  
  return (
    <HStack h={height} spacing={1} alignItems="flex-end" {...props}>
      {bars.map((height, i) => (
        <Box
          key={i}
          width={`${100 / barCount}%`}
          height={isActive ? `${20 + height * 0.8}%` : '20%'}
          bg={i % 2 === 0 ? primaryColor : secondaryColor}
          borderTopRadius="sm"
          opacity={isActive ? (0.6 + (height / 100) * 0.4) : 0.3}
          transition="height 0.2s ease-out, opacity 0.3s ease"
        />
      ))}
    </HStack>
  );
};

// Combine all components into a default export
const AudioDecorations = {
  Equalizer: AudioEqualizer,
  Wave: AudioWave,
  Visualizer: AudioVisualizer,
  BarGraph: AudioBarGraph
};

export default AudioDecorations; 