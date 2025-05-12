import { useState } from 'react';
import { Box, Tabs, TabList, TabPanels, Tab, TabPanel, VStack, Container } from '@chakra-ui/react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AuthPage = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const { isAuthenticated } = useAuth();
  const bgGradient = 'linear-gradient(to bottom, #191729, #1F1D36)';
  
  // Redirect if user is already authenticated
  if (isAuthenticated()) {
    return <Navigate to="/dashboard" />;
  }
  
  return (
    <Box bgGradient={bgGradient} minH="100vh" py={{ base: 10, md: 20 }}>
      <Container maxW="container.md">
        <VStack spacing={6} align="center">
          <Box
            w="full"
            maxW="md"
            mx="auto"
            borderRadius="lg"
            overflow="hidden"
          >
            <Tabs isFitted variant="enclosed" index={tabIndex} onChange={setTabIndex}>
              <TabList mb="1em">
                <Tab
                  fontWeight="semibold"
                  _selected={{ color: 'white', bg: 'brand.500' }}
                >
                  Giriş
                </Tab>
                <Tab
                  fontWeight="semibold"
                  _selected={{ color: 'white', bg: 'accent.500' }}
                >
                  Kaydol
                </Tab>
              </TabList>
              <TabPanels>
                <TabPanel p={0}>
                  <LoginForm />
                </TabPanel>
                <TabPanel p={0}>
                  <RegisterForm />
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};

export default AuthPage; 