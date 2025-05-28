import { useState, useRef } from 'react';
import { 
  Container, 
  Box, 
  Heading, 
  Text, 
  VStack, 
  HStack,
  SimpleGrid,
  FormControl, 
  FormLabel, 
  Input, 
  Button, 
  useToast,
  Avatar,
  Card, 
  CardHeader, 
  CardBody,
  Divider,
  Badge,
  Stat,
  StatLabel,
  StatNumber,
  keyframes,
  IconButton,
  Flex,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  InputGroup,
  InputRightElement,
  Progress,
  Alert,
  AlertIcon,
  AlertDescription,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { changePassword } from '../api/api';
import TwoFactorAuth from '../components/TwoFactorAuth';
import { FaPlay, FaPause, FaMusic, FaHeadphones, FaMicrophone, FaWaveSquare, FaEdit, FaUserAlt, FaLock, FaEye, FaEyeSlash, FaKey } from 'react-icons/fa';

// Keyframes for wave animation
const waveAnimation = keyframes`
  0% { transform: scale(1) translateY(0); }
  25% { transform: scale(1.1) translateY(-5px); }
  50% { transform: scale(1) translateY(0); }
  75% { transform: scale(0.9) translateY(5px); }
  100% { transform: scale(1) translateY(0); }
`;

// Enhanced keyframes for larger sound waves

const mediumSoundWave = keyframes`
  0% { height: 15px; transform: scaleX(1); }
  30% { height: 45px; transform: scaleX(1.05); }
  60% { height: 25px; transform: scaleX(1); }
  90% { height: 55px; transform: scaleX(0.95); }
  100% { height: 15px; transform: scaleX(1); }
`;

const smallSoundWave = keyframes`
  0% { height: 10px; transform: scaleX(1); }
  40% { height: 30px; transform: scaleX(1.03); }
  80% { height: 18px; transform: scaleX(1); }
  100% { height: 10px; transform: scaleX(1); }
`;

// Floating sound wave animation
const floatingSoundWave = keyframes`
  0% { 
    transform: translateY(0) rotate(0deg); 
    opacity: 0.6; 
  }
  25% { 
    transform: translateY(-10px) rotate(2deg); 
    opacity: 0.8; 
  }
  50% { 
    transform: translateY(-20px) rotate(0deg); 
    opacity: 1; 
  }
  75% { 
    transform: translateY(-10px) rotate(-2deg); 
    opacity: 0.8; 
  }
  100% { 
    transform: translateY(0) rotate(0deg); 
    opacity: 0.6; 
  }
`;

// Pulsing border animation
const pulsingBorder = keyframes`
  0% { 
    box-shadow: 0 0 0 0px rgba(29, 185, 84, 0.4);
  }
  70% { 
    box-shadow: 0 0 0 10px rgba(29, 185, 84, 0);
  }
  100% { 
    box-shadow: 0 0 0 0px rgba(29, 185, 84, 0);
  }
`;

// Keyframes for equalizer animation
const equalizerAnimation1 = keyframes`
  0% { height: 10px; }
  50% { height: 40px; }
  100% { height: 10px; }
`;

const equalizerAnimation2 = keyframes`
  0% { height: 40px; }
  50% { height: 10px; }
  100% { height: 40px; }
`;

const equalizerAnimation3 = keyframes`
  0% { height: 25px; }
  50% { height: 55px; }
  100% { height: 25px; }
`;

// Use motion.create instead of motion()
const MotionBox = motion.create(Box);
const MotionCard = motion.create(Card);

const ProfilePage = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: ''
  });
  
  // Password change states
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  
  // 2FA states
  const [is2FAOpen, setIs2FAOpen] = useState(false);
  const [pendingPasswordData, setPendingPasswordData] = useState(null);
  
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { 
    isOpen: isPasswordOpen, 
    onOpen: onPasswordOpen, 
    onClose: onPasswordClose 
  } = useDisclosure();
  const btnRef = useRef();
  
  // Dark theme colors
  const bgGradient = 'linear-gradient(to bottom, #191729, #1F1D36)';
  const cardBg = 'dark.300';
  const accentColor = 'brand.500'; // Spotify green
  const accentColor2 = 'accent.500'; // Pink
  const textColor = 'white';
  const mutedTextColor = 'gray.400';
  const borderColor = 'dark.400';
  
  // Audio visualizer effect
  const visualizerBars = Array(12).fill(0);
  
  // Toggle play state and visualizer animation
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };
  
  // Redirect if not authenticated
  if (!isAuthenticated()) {
    return <Navigate to="/auth" />;
  }
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  // Handle edit mode
  const handleEdit = () => {
    setFormData({
      username: currentUser.username || '',
      email: currentUser.email || '',
    });
    setIsEditing(true);
    onOpen();
  };
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Here you would typically make an API call to update the user profile
    // For now, we'll just show a success toast
    
    toast({
      title: 'Profile Updated',
      description: 'Your profile information has been updated successfully.',
      status: 'success',
      duration: 3000,
      isClosable: true,
      position: 'top',
      variant: 'solid',
    });
    
    setIsEditing(false);
    onClose();
  };

  // Calculate password strength
  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[^A-Za-z0-9]/.test(password)) strength += 10;
    return Math.min(strength, 100);
  };

  // Handle password form input changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value
    });
    
    if (name === 'newPassword') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };

  // Handle password change
  const handlePasswordChangeOpen = () => {
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setPasswordStrength(0);
    onPasswordOpen();
  };

  // Handle password form submission
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: 'Error',
        description: 'New passwords do not match.',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast({
        title: 'Error',
        description: 'Password must be at least 8 characters long.',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
      return;
    }

    // Store password data and open 2FA modal
    setPendingPasswordData({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    });
    setIs2FAOpen(true);
  };

  // Handle 2FA verification success
  const handle2FASuccess = async (verificationCode) => {
    if (!pendingPasswordData) return;
    
    setIsChangingPassword(true);
    
    try {
      await changePassword({
        currentPassword: pendingPasswordData.currentPassword,
        newPassword: pendingPasswordData.newPassword,
        verificationCode: verificationCode // Use the actual verification code
      });
      
      toast({
        title: 'Password Updated',
        description: 'Your password has been updated successfully with 2FA verification.',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
      
      onPasswordClose();
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setPendingPasswordData(null);
    } catch (error) {
      console.error('Password change error:', error);
      toast({
        title: 'Password Change Failed',
        description: error.response?.data?.error || 'Failed to update password. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Handle 2FA modal close
  const handle2FAClose = () => {
    setIs2FAOpen(false);
    setPendingPasswordData(null);
  };

  return (
    <Container 
      maxW="container.lg" 
      py={10} 
      mt={10} 
      bgGradient={bgGradient}
      color={textColor}
      borderRadius="md"
      position="relative"
      overflow="hidden"
      boxShadow="lg"
    >
      {/* Background audio waves */}
      <Box
        position="absolute"
        top="0"
        left="0"
        width="100%"
        height="100%"
        opacity="0.1"
        zIndex={0}
        bgImage="url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgIDxwYXRoIGQ9Ik0wLDUwIEMxNSw1MCAzMCw3MCA1MCw1MCBDNzAsMzAgODUsNTAgMTAwLDUwIEwxMDAsMTAwIEwwLDEwMCBaIiBmaWxsPSIjMUFBRjVDIiBmaWxsLW9wYWNpdHk9IjAuMiIvPgogICAgPHBhdGggZD0iTTAsNDAgQzIwLDYwIDQwLDIwIDYwLDQwIEM4MCw2MCAxMDAsNDAgMTAwLDQwIEwxMDAsMTAwIEwwLDEwMCBaIiBmaWxsPSIjMUFBRjVDIiBmaWxsLW9wYWNpdHk9IjAuMiIvPgogICAgPHBhdGggZD0iTTAsNzAgQzMwLDMwIDQ1LDkwIDYwLDcwIEM4MCw0MCAxMDAsNzAgMTAwLDcwIEwxMDAsMTAwIEwwLDEwMCBaIiBmaWxsPSIjMUFBRjVDIiBmaWxsLW9wYWNpdHk9IjAuMiIvPgo8L3N2Zz4=')"
        bgSize="cover"
      />
      
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        zIndex={1}
      >
        <Flex justifyContent="space-between" alignItems="center" mb={6}>
          <HStack spacing={4} alignItems="center">
            <Box 
              p={2} 
              bg={accentColor} 
              color="white" 
              borderRadius="full"
              animation={isPlaying ? `${pulsingBorder} 2s infinite` : 'none'}
            >
              <FaHeadphones size="24px" />
            </Box>
            <Heading as="h1" size="xl" color={textColor}>Music Profile</Heading>
            
           
          </HStack>
          
          {/* Enhanced Audio Equalizer */}
          <HStack spacing={1} h="40px" alignItems="flex-end">
            {isPlaying && visualizerBars.map((_, index) => (
              <Box
                key={index}
                width="4px"
                height="20px"
                bg={index % 3 === 0 ? accentColor : index % 3 === 1 ? accentColor2 : "gray.500"}
                borderRadius="sm"
                animation={`${index % 3 === 0 ? equalizerAnimation1 : index % 3 === 1 ? equalizerAnimation2 : equalizerAnimation3} ${0.5 + (index * 0.1)}s infinite`}
              />
            ))}
            
            <IconButton
              aria-label={isPlaying ? "Pause" : "Play"}
              icon={isPlaying ? <FaPause /> : <FaPlay />}
              onClick={togglePlay}
              size="md"
              colorScheme={isPlaying ? "pink" : "green"}
              ml={2}
              borderRadius="full"
              animation={isPlaying ? `${pulsingBorder} 2s infinite` : 'none'}
            />
          </HStack>
        </Flex>
      </MotionBox>
      
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8} zIndex={1} position="relative">
        {/* Profile card */}
        <MotionCard 
          bg={cardBg} 
          border="1px" 
          borderColor={borderColor} 
          shadow="lg"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          _hover={{ transform: "translateY(-5px)", transition: "transform 0.3s ease" }}
        >
          <CardHeader pb={0}>
            <VStack spacing={4} align="center">
              <Box position="relative">
                <Avatar 
                  size="2xl" 
                  name={currentUser.username} 
                  src={currentUser.avatar || undefined}
                  background={accentColor}
                  border="4px solid"
                  borderColor={borderColor}
                />
                
                {/* Floating Sound Waves around Avatar */}
                {isPlaying && Array(6).fill(0).map((_, index) => (
                  <Box
                    key={`floating-wave-${index}`}
                    position="absolute"
                    width="8px"
                    height="20px"
                    bg={index % 2 === 0 ? accentColor : accentColor2}
                    borderRadius="full"
                    top={`${20 + (index * 15)}%`}
                    left={`${index % 2 === 0 ? '-15px' : 'calc(100% + 8px)'}`}
                    animation={`${floatingSoundWave} ${2 + (index * 0.3)}s infinite`}
                    opacity="0.7"
                  />
                ))}
                
                <Box 
                  position="absolute"
                  bottom="0"
                  right="0"
                  bg={accentColor2}
                  p={1}
                  borderRadius="full"
                  onClick={handleEdit}
                  cursor="pointer"
                  animation={isPlaying ? `${pulsingBorder} 1.5s infinite` : 'none'}
                >
                  <FaEdit color="white" />
                </Box>
              </Box>
              
              <VStack align="center" spacing={1}>
                <Heading size="lg" color={textColor}>{currentUser.username}</Heading>
                <Text color={mutedTextColor}>{currentUser.email}</Text>
                {currentUser.role && (
                  <Badge colorScheme="green" variant="solid" px={3} py={1} borderRadius="full">
                    {currentUser.role}
                  </Badge>
                )}
              </VStack>
            </VStack>
          </CardHeader>
          
          <CardBody>
            <VStack spacing={6} align="stretch">
              <Box>
                <Heading size="sm" mb={4} color={textColor} display="flex" alignItems="center">
                  <FaUserAlt style={{ marginRight: '8px' }} /> Account Information
                </Heading>
                <SimpleGrid columns={2} spacing={4} bg="dark.400" p={4} borderRadius="md">
                  <Stat>
                    <StatLabel color={mutedTextColor}>User ID</StatLabel>
                    <StatNumber fontSize="sm" color={textColor}>{currentUser.id}</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel color={mutedTextColor}>Registration Date</StatLabel>
                    <StatNumber fontSize="sm" color={textColor}>{formatDate(currentUser.created_at)}</StatNumber>
                  </Stat>
                </SimpleGrid>
              </Box>
              
              <Divider borderColor={borderColor} />
              
              <Button 
                leftIcon={<FaEdit />}
                colorScheme="green" 
                onClick={handleEdit} 
                isDisabled={isEditing}
                _hover={{ bg: accentColor, transform: "scale(1.02)" }}
                transition="all 0.2s ease"
              >
                Edit Profile
              </Button>
              
              <Button 
                leftIcon={<FaLock />}
                colorScheme="blue" 
                onClick={handlePasswordChangeOpen} 
                _hover={{ bg: "blue.600", transform: "scale(1.02)" }}
                transition="all 0.2s ease"
              >
                Change Password
              </Button>
            </VStack>
          </CardBody>
        </MotionCard>
        
        {/* Stats Card */}
        <MotionCard 
          bg={cardBg} 
          border="1px" 
          borderColor={borderColor} 
          shadow="lg"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          _hover={{ transform: "translateY(-5px)", transition: "transform 0.3s ease" }}
        >
          <CardHeader>
            <Heading size="md" color={textColor} display="flex" alignItems="center">
              <FaMusic style={{ marginRight: '8px' }} />
              Recording Statistics
            </Heading>
          </CardHeader>
          
          <CardBody>
            {/* Sound Waves Animation */}
            <Flex justify="center" my={4}>
              {Array(5).fill(0).map((_, i) => (
                <Box
                  key={i}
                  width="12px"
                  height="80px"
                  mx="2px"
                  bg={i % 2 === 0 ? accentColor : accentColor2}
                  borderRadius="md"
                  animation={`${waveAnimation} ${1 + (i * 0.2)}s infinite`}
                  style={{ animationDelay: `${i * 0.1}s` }}
                  opacity={isPlaying ? 1 : 0.4}
                  transition="opacity 0.3s ease"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                />
              ))}
            </Flex>
            
            <SimpleGrid columns={2} spacing={6} my={4}>
              <Stat 
                bg="dark.400" 
                p={4} 
                borderRadius="md" 
                textAlign="center"
                position="relative"
                overflow="hidden"
                border="2px solid"
                borderColor={isPlaying ? accentColor : "transparent"}
                animation={isPlaying ? `${pulsingBorder} 3s infinite` : 'none'}
              >
                {/* Left side sound waves */}
                <VStack 
                  position="absolute" 
                  left="4px" 
                  top="50%" 
                  transform="translateY(-50%)"
                  spacing={1}
                >
                  {Array(4).fill(0).map((_, i) => (
                    <Box
                      key={`left-wave-${i}`}
                      width="3px"
                      height="8px"
                      bg={accentColor}
                      borderRadius="sm"
                      animation={isPlaying ? `${smallSoundWave} ${1.2 + (i * 0.2)}s infinite` : 'none'}
                      opacity={isPlaying ? 0.8 : 0.3}
                    />
                  ))}
                </VStack>
                
                <StatLabel color={mutedTextColor}>Total Recordings</StatLabel>
                <StatNumber fontSize="2xl" color={accentColor} fontWeight="bold">
                  {currentUser.recordingCount || 0}
                </StatNumber>
              </Stat>
              
              <Stat 
                bg="dark.400" 
                p={4} 
                borderRadius="md" 
                textAlign="center"
                position="relative"
                overflow="hidden"
                border="2px solid"
                borderColor={isPlaying ? accentColor2 : "transparent"}
                animation={isPlaying ? `${pulsingBorder} 3.5s infinite` : 'none'}
              >
                {/* Right side sound waves */}
                <VStack 
                  position="absolute" 
                  right="4px" 
                  top="50%" 
                  transform="translateY(-50%)"
                  spacing={1}
                >
                  {Array(4).fill(0).map((_, i) => (
                    <Box
                      key={`right-wave-${i}`}
                      width="3px"
                      height="8px"
                      bg={accentColor2}
                      borderRadius="sm"
                      animation={isPlaying ? `${mediumSoundWave} ${1.5 + (i * 0.25)}s infinite` : 'none'}
                      opacity={isPlaying ? 0.8 : 0.3}
                    />
                  ))}
                </VStack>
                
                <StatLabel color={mutedTextColor}>Total Duration</StatLabel>
                <StatNumber fontSize="2xl" color={accentColor2} fontWeight="bold">
                  {currentUser.totalRecordingTime || '0 min'}
                </StatNumber>
              </Stat>
            </SimpleGrid>
            
            <Divider my={6} borderColor={borderColor} />
            
            <VStack 
              spacing={4} 
              align="stretch" 
              bg="dark.400" 
              p={4} 
              borderRadius="md"
              position="relative"
              overflow="hidden"
              border="1px solid"
              borderColor={isPlaying ? accentColor : borderColor}
            >
              {/* Background Sound Wave Pattern */}
              <Box
                position="absolute"
                top="0"
                left="0"
                right="0"
                bottom="0"
                opacity="0.1"
                zIndex={0}
              >
                <HStack justify="space-between" h="100%" align="center" px={2}>
                  {Array(12).fill(0).map((_, index) => (
                    <Box
                      key={`bg-wave-${index}`}
                      width="2px"
                      height={`${20 + (index % 4) * 10}px`}
                      bg={index % 2 === 0 ? accentColor : accentColor2}
                      borderRadius="sm"
                      animation={isPlaying ? `${smallSoundWave} ${1 + (index * 0.1)}s infinite` : 'none'}
                    />
                  ))}
                </HStack>
              </Box>
              
              <HStack spacing={3} position="relative" zIndex={1}>
                <Box
                  p={2}
                  bg={accentColor}
                  borderRadius="full"
                  animation={isPlaying ? `${pulsingBorder} 2.5s infinite` : 'none'}
                >
                  <FaMicrophone color="white" />
                </Box>
                <Text fontWeight="medium" color={textColor}>
                  Recent Activities
                </Text>
                
                {/* Side mini equalizer */}
                <HStack spacing={1} ml="auto">
                  {Array(5).fill(0).map((_, i) => (
                    <Box
                      key={`mini-eq-${i}`}
                      width="2px"
                      height="12px"
                      bg={i % 2 === 0 ? accentColor : accentColor2}
                      borderRadius="sm"
                      animation={isPlaying ? `${smallSoundWave} ${0.8 + (i * 0.15)}s infinite` : 'none'}
                      opacity={isPlaying ? 0.9 : 0.4}
                    />
                  ))}
                </HStack>
              </HStack>
              
              {/* Here you could map through recent activities */}
              <HStack position="relative" zIndex={1}>
                <Box
                  animation={isPlaying ? `${floatingSoundWave} 3s infinite` : 'none'}
                >
                  <FaWaveSquare color={accentColor} />
                </Box>
                <Text color={mutedTextColor}>
                  {currentUser.lastActivity 
                    ? `Last activity: ${formatDate(currentUser.lastActivity)}`
                    : 'No activities yet'
                  }
                </Text>
              </HStack>
            </VStack>
          </CardBody>
        </MotionCard>
      </SimpleGrid>
      
      {/* Edit Profile Drawer */}
      <Drawer
        isOpen={isOpen}
        placement="right"
        onClose={onClose}
        finalFocusRef={btnRef}
        size="md"
      >
        <DrawerOverlay />
        <DrawerContent bg={cardBg} color={textColor}>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px" borderColor={borderColor}>
            <HStack>
              <FaEdit style={{ marginRight: '8px' }} />
              <Text>Edit Profile Information</Text>
            </HStack>
          </DrawerHeader>

          <DrawerBody>
            <form id="edit-profile-form" onSubmit={handleSubmit}>
              <VStack spacing={6} mt={4}>
                <FormControl id="username">
                  <FormLabel color={mutedTextColor}>Username</FormLabel>
                  <Input 
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    bg="dark.400"
                    border="1px solid"
                    borderColor={borderColor}
                    _focus={{
                      borderColor: accentColor,
                      boxShadow: `0 0 0 1px ${accentColor}`,
                    }}
                  />
                </FormControl>
                
                <FormControl id="email">
                  <FormLabel color={mutedTextColor}>Email</FormLabel>
                  <Input 
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    bg="dark.400"
                    border="1px solid"
                    borderColor={borderColor}
                    _focus={{
                      borderColor: accentColor,
                      boxShadow: `0 0 0 1px ${accentColor}`,
                    }}
                  />
                </FormControl>
              </VStack>
            </form>
          </DrawerBody>

          <DrawerFooter borderTopWidth="1px" borderColor={borderColor}>
            <Button 
              variant="outline" 
              mr={3} 
              onClick={onClose}
              borderColor={borderColor}
              color={textColor}
              _hover={{ bg: 'rgba(255,255,255,0.1)' }}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              form="edit-profile-form"
              colorScheme="green" 
              bg={accentColor}
              _hover={{ bg: `${accentColor}` }}
            >
              Save
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Change Password Drawer */}
      <Drawer
        isOpen={isPasswordOpen}
        placement="right"
        onClose={onPasswordClose}
        size="md"
      >
        <DrawerOverlay />
        <DrawerContent bg={cardBg} color={textColor}>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px" borderColor={borderColor}>
            <HStack>
              <FaKey style={{ marginRight: '8px' }} />
              <Text>Change Password</Text>
            </HStack>
          </DrawerHeader>

          <DrawerBody>
            <form id="password-change-form" onSubmit={handlePasswordSubmit}>
              <VStack spacing={6} mt={4}>
                <FormControl id="currentPassword" isRequired>
                  <FormLabel color={mutedTextColor}>Current Password</FormLabel>
                  <InputGroup>
                    <Input 
                      name="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      bg="dark.400"
                      border="1px solid"
                      borderColor={borderColor}
                      _focus={{
                        borderColor: accentColor,
                        boxShadow: `0 0 0 1px ${accentColor}`,
                      }}
                    />
                    <InputRightElement>
                      <IconButton
                        aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                        icon={showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      />
                    </InputRightElement>
                  </InputGroup>
                </FormControl>
                
                <FormControl id="newPassword" isRequired>
                  <FormLabel color={mutedTextColor}>New Password</FormLabel>
                  <InputGroup>
                    <Input 
                      name="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      bg="dark.400"
                      border="1px solid"
                      borderColor={borderColor}
                      _focus={{
                        borderColor: accentColor,
                        boxShadow: `0 0 0 1px ${accentColor}`,
                      }}
                    />
                    <InputRightElement>
                      <IconButton
                        aria-label={showNewPassword ? "Hide password" : "Show password"}
                        icon={showNewPassword ? <FaEyeSlash /> : <FaEye />}
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      />
                    </InputRightElement>
                  </InputGroup>
                  
                  {passwordData.newPassword && (
                    <Box mt={2}>
                      <Text fontSize="sm" color={mutedTextColor} mb={1}>
                        Password Strength: {passwordStrength}%
                      </Text>
                      <Progress 
                        value={passwordStrength} 
                        colorScheme={passwordStrength < 50 ? "red" : passwordStrength < 80 ? "yellow" : "green"}
                        size="sm"
                        borderRadius="md"
                      />
                    </Box>
                  )}
                </FormControl>

                <FormControl id="confirmPassword" isRequired>
                  <FormLabel color={mutedTextColor}>Confirm New Password</FormLabel>
                  <InputGroup>
                    <Input 
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      bg="dark.400"
                      border="1px solid"
                      borderColor={borderColor}
                      _focus={{
                        borderColor: accentColor,
                        boxShadow: `0 0 0 1px ${accentColor}`,
                      }}
                    />
                    <InputRightElement>
                      <IconButton
                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                        icon={showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      />
                    </InputRightElement>
                  </InputGroup>
                  
                  {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                    <Alert status="error" mt={2} borderRadius="md">
                      <AlertIcon />
                      <AlertDescription fontSize="sm">
                        Passwords do not match
                      </AlertDescription>
                    </Alert>
                  )}
                </FormControl>
              </VStack>
            </form>
          </DrawerBody>

          <DrawerFooter borderTopWidth="1px" borderColor={borderColor}>
            <Button 
              variant="outline" 
              mr={3} 
              onClick={onPasswordClose}
              borderColor={borderColor}
              color={textColor}
              _hover={{ bg: 'rgba(255,255,255,0.1)' }}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              form="password-change-form"
              colorScheme="blue" 
              isLoading={isChangingPassword}
              loadingText="Updating..."
              _hover={{ bg: "blue.600" }}
            >
              Update Password
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
      
      {/* Two-Factor Authentication Modal */}
      <TwoFactorAuth
        isOpen={is2FAOpen}
        onClose={handle2FAClose}
        onVerificationSuccess={handle2FASuccess}
      />
    </Container>
  );
};

export default ProfilePage; 