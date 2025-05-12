import { Container, Box } from '@chakra-ui/react';
import AudioList from '../components/audio/AudioList';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DashboardPage = () => {
  const { isAuthenticated, loading } = useAuth();
  
  // If auth is still loading, don't redirect
  if (loading) {
    return null;
  }
  
  // Redirect to auth page if not authenticated
  if (!isAuthenticated()) {
    return <Navigate to="/auth" />;
  }
  
  return (
    <Box 
      as="section" 
      bgGradient="linear-gradient(to bottom, #191729, #1F1D36)"
      minH="100vh" 
      py={10}
    >
      <Container maxW="container.xl">
        <AudioList />
      </Container>
    </Box>
  );
};

export default DashboardPage; 