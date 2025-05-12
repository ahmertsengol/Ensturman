import { Box, Button, Heading, Text, VStack, useColorModeValue } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

const NotFoundPage = () => {
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  
  return (
    <Box
      bg={bgColor}
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      py={10}
      px={6}
    >
      <VStack spacing={6} textAlign="center">
        <Heading
          display="inline-block"
          as="h1"
          size="4xl"
          color={useColorModeValue('blue.500', 'blue.300')}
        >
          404
        </Heading>
        <Heading as="h2" size="xl" mt={6} mb={2}>
          Page Not Found
        </Heading>
        <Text fontSize="lg" color={useColorModeValue('gray.600', 'gray.400')}>
          The page you're looking for doesn't seem to exist.
        </Text>
        <Button
          as={RouterLink}
          to="/"
          colorScheme="blue"
          size="lg"
          mt={4}
        >
          Go to Home
        </Button>
      </VStack>
    </Box>
  );
};

export default NotFoundPage; 