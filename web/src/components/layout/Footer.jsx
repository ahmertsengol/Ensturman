import { Box, Container, Stack, Text, HStack, Icon, Flex } from '@chakra-ui/react';
import { FaHeadphones, FaMusic, FaMicrophone, FaInstagram, FaTwitter, FaFacebook } from 'react-icons/fa';

const Footer = () => {
  // Force dark mode colors
  const bgColor = 'dark.400';
  const borderColor = 'dark.300';
  const textColor = 'gray.400';
  const accentColor = 'brand.400';
  const hoverColor = 'accent.400';
  
  // Wave animation for footer top border
  const wavePattern = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='12' fill='none' %3E%3Cpath d='M0 10C166.667 4 333.333 1 500 1c166.667 0 333.333 3 500 9 166.667 6 333.333 6 500 0v2H0v-2Z' fill='%231DB954' fill-opacity='.3'/%3E%3Cpath d='M0 10C200 2 400 7 600 10c200 3 400 -4 600 5v2H0v-7Z' fill='%23E91E63' fill-opacity='.4'/%3E%3C/svg%3E")`;
  
  // Current year for copyright
  const currentYear = new Date().getFullYear();

  return (
    <Box
      as="footer"
      position="relative"
      bg={bgColor}
      color={textColor}
      borderTop="1px"
      borderColor={borderColor}
      py={4}
      mt="auto"
    >
      {/* Top decorative wave */}
      <Box
        position="absolute"
        top="-12px"
        left="0"
        right="0"
        height="12px"
        backgroundImage={wavePattern}
        backgroundRepeat="repeat-x"
        backgroundSize="100% 12px"
      />
      
      <Container maxW="container.xl">
        <Flex 
        direction={{ base: 'column', md: 'row' }}
          justify="space-between"
          align={{ base: 'center', md: 'center' }}
          gap={4}
        >
          {/* Logo and copyright */}
          <Stack direction="row" spacing={2} align="center">
            <Box
              bg="linear-gradient(45deg, #1DB954, #E91E63)"
              borderRadius="full"
              p={1.5}
              color="white"
              boxShadow="md"
            >
              <FaHeadphones size="16px" />
            </Box>
            <Text fontWeight="bold">
              Audio Recorder
            </Text>
            <Text fontSize="sm">
              &copy; {currentYear} Tüm hakları saklıdır
            </Text>
          </Stack>
          
          {/* Audio icons */}
          <HStack 
            display={{ base: 'none', md: 'flex' }} 
        spacing={4}
            color={accentColor}
          >
            <Icon as={FaMusic} boxSize={5} />
            <Box 
              width="2px" 
              height="20px" 
              bg="linear-gradient(to bottom, #1DB954, #E91E63)"
              borderRadius="full"
            />
            <Icon as={FaMicrophone} boxSize={5} />
            <Box 
              width="2px" 
              height="20px" 
              bg="linear-gradient(to bottom, #1DB954, #E91E63)"
              borderRadius="full"
            />
            <Icon as={FaHeadphones} boxSize={5} />
          </HStack>
          
          {/* Social media */}
          <HStack spacing={4}>
            <Box 
              as="a" 
              href="#" 
              color={textColor}
              _hover={{ color: hoverColor }}
              transition="color 0.2s ease"
            >
              <Icon as={FaTwitter} boxSize={5} />
          </Box>
            <Box 
              as="a" 
              href="#" 
              color={textColor}
              _hover={{ color: hoverColor }}
              transition="color 0.2s ease"
            >
              <Icon as={FaFacebook} boxSize={5} />
          </Box>
            <Box 
              as="a" 
              href="#" 
              color={textColor}
              _hover={{ color: hoverColor }}
              transition="color 0.2s ease"
            >
              <Icon as={FaInstagram} boxSize={5} />
          </Box>
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
};

export default Footer; 