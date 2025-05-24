import { Box, Flex, Text, Button, Stack, useDisclosure, IconButton, Container, Collapse } from '@chakra-ui/react';
import { HamburgerIcon, CloseIcon } from '@chakra-ui/icons';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaHeadphones, FaMicrophone, FaUser, FaSignOutAlt, FaMusic, FaHome, FaBrain } from 'react-icons/fa';

const Header = () => {
  const { isOpen, onToggle } = useDisclosure();
  const { logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Force dark mode colors
  const bgColor = 'rgba(25, 23, 41, 0.9)';
  const borderColor = 'dark.300';
  const textColor = 'white';
  const hoverBg = 'dark.300';
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  return (
    <Box
      as="header"
      position="fixed"
      top="0"
      w="100%"
      bg={bgColor}
      borderBottom={1}
      borderStyle="solid"
      borderColor={borderColor}
      zIndex="sticky"
      backdropFilter="blur(10px)"
      boxShadow="0 4px 6px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)"
    >
      <Container maxW="container.xl">
        <Flex
          minH={'60px'}
          py={{ base: 2 }}
          align={'center'}
          justify="space-between"
        >
          <Flex flex={{ base: 1 }} justify={{ base: 'start', md: 'start' }}>
            <Flex align="center">
              <Box 
                bg="linear-gradient(45deg, #1DB954, #E91E63)" 
                borderRadius="full" 
                p={1.5} 
                color="white" 
                mr={2}
                boxShadow="md"
              >
                <FaHeadphones size="18px" />
              </Box>
            <Text
              fontFamily={'heading'}
              as={RouterLink}
              to="/"
              fontWeight="bold"
              fontSize="xl"
                letterSpacing="tight"
                bgGradient="linear(to-r, brand.500, accent.500)"
                bgClip="text"
                _hover={{
                  transform: "scale(1.05)",
                  transition: "transform 0.3s ease"
                }}
            >
                EnsAI
            </Text>
            </Flex>
          </Flex>

          <Flex display={{ base: 'none', md: 'flex' }} ml={10}>
            <Stack direction={'row'} spacing={1}>
              {isAuthenticated() ? (
                <>
                  <Button 
                    as={RouterLink} 
                    to="/" 
                    variant="ghost" 
                    size="md" 
                    leftIcon={<FaHome />}
                    color={textColor}
                    _hover={{ bg: hoverBg }}
                  >
                    Home
                  </Button>
                  <Button 
                    as={RouterLink} 
                    to="/dashboard" 
                    variant="ghost" 
                    size="md" 
                    leftIcon={<FaMusic />}
                    color={textColor}
                    _hover={{ bg: hoverBg }}
                  >
                    My Recordings
                  </Button>
                  <Button 
                    as={RouterLink} 
                    to="/record" 
                    variant="ghost" 
                    size="md" 
                    leftIcon={<FaMicrophone />}
                    color={textColor}
                    _hover={{ bg: hoverBg }}
                  >
                    Record
                  </Button>
                  <Button 
                    as={RouterLink} 
                    to="/training" 
                    variant="ghost" 
                    size="md" 
                    leftIcon={<FaBrain />}
                    color={textColor}
                    _hover={{ bg: hoverBg }}
                  >
                    AI Training
                  </Button>
                  <Button 
                    as={RouterLink} 
                    to="/profile" 
                    variant="ghost" 
                    size="md" 
                    leftIcon={<FaUser />}
                    color={textColor}
                    _hover={{ bg: hoverBg }}
                  >
                    Profile
                  </Button>
                  <Button 
                    onClick={handleLogout} 
                    variant="ghost" 
                    size="md" 
                    leftIcon={<FaSignOutAlt />}
                    color={textColor}
                    _hover={{ bg: hoverBg }}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <Button 
                  as={RouterLink} 
                  to="/auth" 
                  colorScheme="green" 
                  variant="solid"
                  size="md"
                  bgGradient="linear(to-r, brand.500, brand.600)"
                  _hover={{
                    bgGradient: "linear(to-r, brand.600, brand.700)",
                  }}
                >
                  Login / Register
                </Button>
              )}
            </Stack>
          </Flex>

          <Flex
            flex={{ base: 1, md: 'auto' }}
            display={{ base: 'flex', md: 'none' }}
            justify="flex-end"
          >
            <IconButton
              onClick={onToggle}
              icon={isOpen ? <CloseIcon w={3} h={3} /> : <HamburgerIcon w={5} h={5} />}
              variant={'ghost'}
              aria-label={'Toggle Navigation'}
              color={textColor}
            />
          </Flex>
        </Flex>

        <Collapse in={isOpen} animateOpacity>
          <Box py={4} display={{ md: 'none' }} borderTop={1} borderStyle="solid" borderColor={borderColor}>
            <Stack as={'nav'} spacing={1}>
              {isAuthenticated() ? (
                <>
                  <Button
                    as={RouterLink}
                    to="/"
                    w="full"
                    variant="ghost"
                    justifyContent="flex-start"
                    onClick={onToggle}
                    leftIcon={<FaHome />}
                    color={textColor}
                  >
                    Home
                  </Button>
                  <Button
                    as={RouterLink}
                    to="/dashboard"
                    w="full"
                    variant="ghost"
                    justifyContent="flex-start"
                    onClick={onToggle}
                    leftIcon={<FaMusic />}
                    color={textColor}
                  >
                    My Recordings
                  </Button>
                  <Button
                    as={RouterLink}
                    to="/record"
                    w="full"
                    variant="ghost"
                    justifyContent="flex-start"
                    onClick={onToggle}
                    leftIcon={<FaMicrophone />}
                    color={textColor}
                  >
                    Record
                  </Button>
                  <Button
                    as={RouterLink}
                    to="/training"
                    w="full"
                    variant="ghost"
                    justifyContent="flex-start"
                    onClick={onToggle}
                    leftIcon={<FaBrain />}
                    color={textColor}
                  >
                    AI Training
                  </Button>
                  <Button
                    as={RouterLink}
                    to="/profile"
                    w="full"
                    variant="ghost"
                    justifyContent="flex-start"
                    onClick={onToggle}
                    leftIcon={<FaUser />}
                    color={textColor}
                  >
                    Profile
                  </Button>
                  <Button
                    w="full"
                    variant="ghost"
                    justifyContent="flex-start"
                    leftIcon={<FaSignOutAlt />}
                    color={textColor}
                    onClick={() => {
                      handleLogout();
                      onToggle();
                    }}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <Button
                  as={RouterLink}
                  to="/auth"
                  w="full"
                  colorScheme="green"
                  bgGradient="linear(to-r, brand.500, brand.600)"
                  _hover={{
                    bgGradient: "linear(to-r, brand.600, brand.700)",
                  }}
                  onClick={onToggle}
                >
                  Login / Register
                </Button>
              )}
            </Stack>
          </Box>
        </Collapse>
      </Container>
    </Box>
  );
};

export default Header; 