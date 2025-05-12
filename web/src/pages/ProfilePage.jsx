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
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaPlay, FaPause, FaMusic, FaHeadphones, FaMicrophone, FaWaveSquare, FaEdit, FaUserAlt } from 'react-icons/fa';

// Keyframes for wave animation
const waveAnimation = keyframes`
  0% { transform: scale(1) translateY(0); }
  25% { transform: scale(1.1) translateY(-5px); }
  50% { transform: scale(1) translateY(0); }
  75% { transform: scale(0.9) translateY(5px); }
  100% { transform: scale(1) translateY(0); }
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
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
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
      title: 'Profil güncellendi',
      description: 'Profil bilgileriniz başarıyla güncellendi.',
      status: 'success',
      duration: 3000,
      isClosable: true,
      position: 'top',
      variant: 'solid',
    });
    
    setIsEditing(false);
    onClose();
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
            >
              <FaHeadphones size="24px" />
            </Box>
            <Heading as="h1" size="xl" color={textColor}>Müzik Profili</Heading>
          </HStack>
          
          {/* Audio Equalizer - Only shows when playing */}
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
                <Box 
                  position="absolute"
                  bottom="0"
                  right="0"
                  bg={accentColor2}
                  p={1}
                  borderRadius="full"
                  onClick={handleEdit}
                  cursor="pointer"
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
                  <FaUserAlt style={{ marginRight: '8px' }} /> Hesap Bilgileri
                </Heading>
                <SimpleGrid columns={2} spacing={4} bg="dark.400" p={4} borderRadius="md">
                  <Stat>
                    <StatLabel color={mutedTextColor}>Kullanıcı ID</StatLabel>
                    <StatNumber fontSize="sm" color={textColor}>{currentUser.id}</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel color={mutedTextColor}>Kayıt Tarihi</StatLabel>
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
                Profili Düzenle
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
              Ses Kayıtları İstatistikleri
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
              <Stat bg="dark.400" p={4} borderRadius="md" textAlign="center">
                <StatLabel color={mutedTextColor}>Toplam Kayıt</StatLabel>
                <StatNumber fontSize="2xl" color={accentColor} fontWeight="bold">
                  {currentUser.recordingCount || 0}
                </StatNumber>
              </Stat>
              <Stat bg="dark.400" p={4} borderRadius="md" textAlign="center">
                <StatLabel color={mutedTextColor}>Toplam Süre</StatLabel>
                <StatNumber fontSize="2xl" color={accentColor2} fontWeight="bold">
                  {currentUser.totalRecordingTime || '0 dk'}
                </StatNumber>
              </Stat>
            </SimpleGrid>
            
            <Divider my={6} borderColor={borderColor} />
            
            <VStack spacing={4} align="stretch" bg="dark.400" p={4} borderRadius="md">
              <Text fontWeight="medium" color={textColor} display="flex" alignItems="center">
                <FaMicrophone style={{ marginRight: '8px' }} /> Son Aktiviteler
              </Text>
              {/* Here you could map through recent activities */}
              <HStack>
                <FaWaveSquare color={accentColor} />
                <Text color={mutedTextColor}>
                  {currentUser.lastActivity 
                    ? `Son aktivite: ${formatDate(currentUser.lastActivity)}`
                    : 'Henüz bir aktivite yok'
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
              <Text>Profil Bilgilerini Düzenle</Text>
            </HStack>
          </DrawerHeader>

          <DrawerBody>
            <form id="edit-profile-form" onSubmit={handleSubmit}>
              <VStack spacing={6} mt={4}>
                <FormControl id="username">
                  <FormLabel color={mutedTextColor}>Kullanıcı Adı</FormLabel>
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
                  <FormLabel color={mutedTextColor}>E-posta</FormLabel>
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
              İptal
            </Button>
            <Button 
              type="submit"
              form="edit-profile-form"
              colorScheme="green" 
              bg={accentColor}
              _hover={{ bg: `${accentColor}` }}
            >
              Kaydet
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </Container>
  );
};

export default ProfilePage; 