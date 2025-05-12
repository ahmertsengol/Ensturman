import { Box } from '@chakra-ui/react';
import { keyframes } from '@chakra-ui/react';
import Header from './Header';
import Footer from './Footer';

// Animation for subtle wave movement
const waveMove = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

// Animation for subtle pulsating glow
const glowPulse = keyframes`
  0% { opacity: 0.4; }
  50% { opacity: 0.6; }
  100% { opacity: 0.4; }
`;

// Animation for gradual color shift
const colorShift = keyframes`
  0% { filter: hue-rotate(0deg); }
  50% { filter: hue-rotate(10deg); }
  100% { filter: hue-rotate(0deg); }
`;

const Layout = ({ children }) => {
  // Always use dark colors for forced dark mode
  const bgColor = 'dark.500';
  const bgGradient = 'linear-gradient(180deg, #191729 0%, #1F1D36 100%)';
  
  return (
    <Box minH="100vh" bg={bgColor} bgGradient={bgGradient} position="relative" overflow="hidden">
      {/* Animated background gradient with depth effect */}
      <Box
        position="fixed"
        top="0"
        left="0"
        right="0"
        bottom="0"
        zIndex="0"
        bgGradient="radial-gradient(circle at 15% 85%, rgba(29, 185, 84, 0.08), transparent 40%), radial-gradient(circle at 85% 15%, rgba(233, 30, 99, 0.08), transparent 40%)"
        animation={`${glowPulse} 10s infinite ease-in-out`}
        pointerEvents="none"
      />
      
      {/* Animated music-themed background pattern */}
      <Box
        position="fixed"
        top="0"
        left="0"
        right="0"
        bottom="0"
        zIndex="0"
        backgroundImage={`
          ${bgGradient},
          url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%231DB954' fill-opacity='0.03' fill-rule='evenodd'/%3E%3C/svg%3E"),
          url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23E91E63' fill-opacity='0.02'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")
        `}
        backgroundSize="auto, 200px, 120px"
        opacity="0.7"
        animation={`${waveMove} 30s ease infinite, ${colorShift} 60s ease infinite`}
        pointerEvents="none"
      />
      
      {/* Noise texture overlay for depth */}
      <Box
        position="fixed"
        top="0"
        left="0"
        right="0"
        bottom="0"
        zIndex="0"
        bgImage="url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')"
        pointerEvents="none"
      />
      
      {/* Sound wave accent at the top */}
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        height="4px"
        bgGradient="linear(to-r, brand.500, accent.500, brand.500)"
        zIndex="10"
        boxShadow="0 0 10px rgba(29, 185, 84, 0.4), 0 0 20px rgba(29, 185, 84, 0.2)"
      />
      
      <Header />
      <Box 
        as="main" 
        position="relative" 
        zIndex="1" 
        pb="80px" // To ensure footer doesn't cover content
        pt="80px" // To account for fixed header
      >
        {children}
      </Box>
      <Footer />
    </Box>
  );
};

export default Layout; 