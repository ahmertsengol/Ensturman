import { Box, Container } from '@chakra-ui/react';
import AuthComponent from '../components/auth/AuthPage';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthPage = () => {
  const { isAuthenticated, loading } = useAuth();
  const bgGradient = 'linear-gradient(to bottom, #191729, #1F1D36)';
  
  // If auth is still loading, don't redirect
  if (loading) {
    return null;
  }
  
  // Redirect to dashboard if already authenticated
  if (isAuthenticated()) {
    return <Navigate to="/dashboard" />;
  }
  
  return (
    <Box bgGradient={bgGradient} minH="100vh">
      <Container maxW="container.md" centerContent>
        <AuthComponent />
      </Container>
    </Box>
  );
};

export default AuthPage; 