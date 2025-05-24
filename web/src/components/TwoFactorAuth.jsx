import { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  HStack,
  Text,
  PinInput,
  PinInputField,
  useToast,
  Progress,
  Alert,
  AlertIcon,
  AlertDescription,
  Box,
  keyframes,
  Spinner,
  Icon,
  Divider
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FaShieldAlt, FaEnvelope, FaClock, FaCheckCircle } from 'react-icons/fa';
import { 
  requestPasswordChangeVerification, 
  verifyPasswordChangeCode,
  getPasswordChangeVerificationStatus 
} from '../api/api';

// Animation keyframes
const pulseAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const MotionBox = motion.create(Box);

const TwoFactorAuth = ({ 
  isOpen, 
  onClose, 
  onVerificationSuccess 
}) => {
  const [step, setStep] = useState('request'); // 'request', 'verify', 'success'
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [maskedEmail, setMaskedEmail] = useState('');
  
  const toast = useToast();

  // Dark theme colors
  const bgColor = 'dark.300';
  const textColor = 'white';
  const mutedTextColor = 'gray.400';
  const accentColor = 'brand.500'; // Spotify green
  const accentColor2 = 'accent.500'; // Pink
  const borderColor = 'dark.400';

  // Timer effect
  useEffect(() => {
    let interval;
    if (timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timeLeft]);

  // Format time display
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Mask email for security display
  const maskEmail = (email) => {
    if (!email) return '';
    const [username, domain] = email.split('@');
    const maskedUsername = username.length > 2 
      ? username.substring(0, 2) + '*'.repeat(username.length - 2)
      : username;
    return `${maskedUsername}@${domain}`;
  };

  // Check initial verification status
  useEffect(() => {
    if (isOpen) {
      checkVerificationStatus();
    }
  }, [isOpen]);

  const checkVerificationStatus = async () => {
    try {
      const response = await getPasswordChangeVerificationStatus();
      const { hasActiveVerification, isVerified, timeLeftMinutes } = response.data;
      
      if (hasActiveVerification) {
        if (isVerified) {
          setStep('success');
        } else {
          setStep('verify');
          setTimeLeft(timeLeftMinutes * 60);
        }
      } else {
        setStep('request');
      }
    } catch (error) {
      console.error('Failed to check verification status:', error);
      setStep('request');
    }
  };

  const handleRequestVerification = async () => {
    setIsLoading(true);
    try {
      const response = await requestPasswordChangeVerification();
      const { email, expiresAt } = response.data;
      
      setMaskedEmail(maskEmail(email));
      setStep('verify');
      
      // Calculate time left
      const expirationTime = new Date(expiresAt);
      const now = new Date();
      const timeLeftSeconds = Math.max(0, Math.floor((expirationTime - now) / 1000));
      setTimeLeft(timeLeftSeconds);
      
      toast({
        title: 'Verification Code Sent',
        description: `A verification code has been sent to ${maskEmail(email)}`,
        status: 'success',
        duration: 4000,
        isClosable: true,
        position: 'top',
      });
    } catch (error) {
      console.error('Failed to request verification:', error);
      toast({
        title: 'Failed to Send Code',
        description: error.response?.data?.error || 'Failed to send verification code. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (code) => {
    if (code.length !== 6) return;
    
    setIsVerifying(true);
    try {
      await verifyPasswordChangeCode(code);
      
      setStep('success');
      
      toast({
        title: 'Verification Successful',
        description: 'You can now proceed with changing your password.',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
      
      // Auto close after 2 seconds and trigger success callback with the verified code
      setTimeout(() => {
        onVerificationSuccess(code); // Pass the verified code to parent
        onClose();
      }, 2000);
      
    } catch (error) {
      console.error('Verification failed:', error);
      toast({
        title: 'Verification Failed',
        description: error.response?.data?.error || 'Invalid verification code. Please try again.',
        status: 'error',
        duration: 4000,
        isClosable: true,
        position: 'top',
      });
      
      // Clear the PIN input
      setVerificationCode('');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = () => {
    setVerificationCode('');
    handleRequestVerification();
  };

  const handleClose = () => {
    setStep('request');
    setVerificationCode('');
    setTimeLeft(0);
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose}
      closeOnOverlayClick={false}
      closeOnEsc={step !== 'verify'}
      size="md"
    >
      <ModalOverlay bg="blackAlpha.800" />
      <ModalContent bg={bgColor} color={textColor} border="1px solid" borderColor={borderColor}>
        <ModalHeader>
          <HStack spacing={3}>
            <Icon as={FaShieldAlt} color={accentColor} boxSize={6} />
            <Text>Two-Factor Authentication</Text>
          </HStack>
        </ModalHeader>
        
        {step !== 'success' && <ModalCloseButton />}
        
        <ModalBody>
          {step === 'request' && (
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <VStack spacing={6} textAlign="center">
                <Box
                  p={4}
                  bg={accentColor}
                  borderRadius="full"
                  animation={`${pulseAnimation} 2s infinite`}
                >
                  <Icon as={FaEnvelope} boxSize={8} color="white" />
                </Box>
                
                <VStack spacing={3}>
                  <Text fontSize="lg" fontWeight="bold">Secure Your Password Change</Text>
                  <Text color={mutedTextColor} textAlign="center">
                    For your security, we need to verify your identity before allowing a password change.
                  </Text>
                </VStack>

                <Alert status="info" bg="blue.900" border="1px solid" borderColor="blue.700">
                  <AlertIcon color="blue.300" />
                  <AlertDescription color="blue.100">
                    A 6-digit verification code will be sent to your registered email address.
                  </AlertDescription>
                </Alert>
              </VStack>
            </MotionBox>
          )}

          {step === 'verify' && (
            <MotionBox
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <VStack spacing={6} textAlign="center">
                <VStack spacing={2}>
                  <Text fontSize="lg" fontWeight="bold">Enter Verification Code</Text>
                  <Text color={mutedTextColor}>
                    We've sent a 6-digit code to {maskedEmail}
                  </Text>
                </VStack>

                <VStack spacing={4}>
                  <HStack spacing={4}>
                    <PinInput
                      value={verificationCode}
                      onChange={(value) => {
                        setVerificationCode(value);
                        if (value.length === 6) {
                          handleVerifyCode(value);
                        }
                      }}
                      size="lg"
                      placeholder="0"
                      focusBorderColor={accentColor}
                      errorBorderColor="red.500"
                    >
                      {Array.from({ length: 6 }).map((_, index) => (
                        <PinInputField
                          key={index}
                          bg="dark.400"
                          border="2px solid"
                          borderColor={borderColor}
                          color={textColor}
                          fontSize="xl"
                          fontWeight="bold"
                          textAlign="center"
                          _focus={{
                            borderColor: accentColor,
                            boxShadow: `0 0 0 1px ${accentColor}`,
                          }}
                          _invalid={{
                            borderColor: 'red.500',
                          }}
                        />
                      ))}
                    </PinInput>
                  </HStack>

                  {isVerifying && (
                    <HStack spacing={2}>
                      <Spinner size="sm" color={accentColor} />
                      <Text fontSize="sm" color={mutedTextColor}>Verifying...</Text>
                    </HStack>
                  )}
                </VStack>

                {timeLeft > 0 && (
                  <VStack spacing={2}>
                    <HStack spacing={2}>
                      <Icon as={FaClock} color={accentColor2} />
                      <Text fontSize="sm" color={mutedTextColor}>
                        Code expires in {formatTime(timeLeft)}
                      </Text>
                    </HStack>
                    <Progress 
                      value={(timeLeft / 600) * 100} 
                      colorScheme="pink" 
                      size="sm" 
                      width="100%"
                      borderRadius="md"
                    />
                  </VStack>
                )}

                <Divider borderColor={borderColor} />

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResendCode}
                  isDisabled={timeLeft > 540} // Disable for first 1 minute
                  isLoading={isLoading}
                  loadingText="Sending..."
                  color={accentColor}
                  _hover={{ bg: 'rgba(29, 185, 84, 0.1)' }}
                >
                  Resend Code
                </Button>
              </VStack>
            </MotionBox>
          )}

          {step === 'success' && (
            <MotionBox
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <VStack spacing={6} textAlign="center">
                <Box
                  p={4}
                  bg={accentColor}
                  borderRadius="full"
                  animation={`${pulseAnimation} 1s infinite`}
                >
                  <Icon as={FaCheckCircle} boxSize={8} color="white" />
                </Box>
                
                <VStack spacing={3}>
                  <Text fontSize="lg" fontWeight="bold" color={accentColor}>
                    Verification Successful!
                  </Text>
                  <Text color={mutedTextColor}>
                    You can now proceed with changing your password.
                  </Text>
                </VStack>

                <Alert status="success" bg="green.900" border="1px solid" borderColor="green.700">
                  <AlertIcon color="green.300" />
                  <AlertDescription color="green.100">
                    Your identity has been verified. This window will close automatically.
                  </AlertDescription>
                </Alert>
              </VStack>
            </MotionBox>
          )}
        </ModalBody>

        <ModalFooter>
          {step === 'request' && (
            <HStack spacing={3}>
              <Button 
                variant="outline" 
                onClick={handleClose}
                borderColor={borderColor}
                color={textColor}
                _hover={{ bg: 'rgba(255,255,255,0.1)' }}
              >
                Cancel
              </Button>
              <Button 
                colorScheme="green"
                onClick={handleRequestVerification}
                isLoading={isLoading}
                loadingText="Sending..."
                bg={accentColor}
                _hover={{ bg: `${accentColor}CC` }}
              >
                Send Verification Code
              </Button>
            </HStack>
          )}

          {step === 'verify' && (
            <Button 
              variant="outline" 
              onClick={handleClose}
              borderColor={borderColor}
              color={textColor}
              _hover={{ bg: 'rgba(255,255,255,0.1)' }}
            >
              Cancel
            </Button>
          )}

          {step === 'success' && (
            <Text fontSize="sm" color={mutedTextColor}>
              Closing automatically...
            </Text>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default TwoFactorAuth; 