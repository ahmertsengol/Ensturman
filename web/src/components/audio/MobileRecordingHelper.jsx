import { useEffect, useState } from 'react';
import { 
  Alert, 
  AlertIcon, 
  AlertTitle, 
  AlertDescription, 
  Box, 
  Button, 
  VStack, 
  Text,
  useToast
} from '@chakra-ui/react';
import { FaMobile, FaGlobe, FaExclamationTriangle, FaApple, FaAndroid } from 'react-icons/fa';

const MobileRecordingHelper = ({ onBrowserCheck }) => {
  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    isIOS: false,
    isAndroid: false,
    browser: '',
    hasMediaRecorder: false,
    hasGetUserMedia: false
  });

  const toast = useToast();

  useEffect(() => {
    detectDevice();
  }, []);

  const detectDevice = () => {
    const userAgent = navigator.userAgent;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const isAndroid = /Android/.test(userAgent);
    
    let browser = 'Unknown';
    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) browser = 'Safari';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Edge')) browser = 'Edge';

    const hasMediaRecorder = !!window.MediaRecorder;
    const hasGetUserMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);

    const info = {
      isMobile,
      isIOS,
      isAndroid,
      browser,
      hasMediaRecorder,
      hasGetUserMedia
    };

    setDeviceInfo(info);
    
    if (onBrowserCheck) {
      onBrowserCheck(info);
    }

    // Log device info for debugging
    console.log('📱 Device Detection:', info);
  };

  const getBrowserSupport = () => {
    if (deviceInfo.isIOS) {
      if (deviceInfo.browser === 'Safari') {
        return {
          status: 'partial',
          message: 'iOS Safari has limited recording support. Recording may work but format will be limited.',
          icon: FaApple,
          color: 'orange'
        };
      } else {
        return {
          status: 'poor',
          message: 'iOS Chrome/Firefox have very limited recording support. Please use Safari for better results.',
          icon: FaApple,
          color: 'red'
        };
      }
    }

    if (deviceInfo.isAndroid) {
      if (deviceInfo.browser === 'Chrome') {
        return {
          status: 'good',
          message: 'Android Chrome has excellent recording support.',
          icon: FaAndroid,
          color: 'green'
        };
      } else {
        return {
          status: 'partial',
          message: 'Android Firefox has good recording support, but Chrome is recommended.',
          icon: FaAndroid,
          color: 'orange'
        };
      }
    }

    // Desktop
    if (deviceInfo.hasMediaRecorder && deviceInfo.hasGetUserMedia) {
      return {
        status: 'excellent',
        message: 'Your desktop browser has excellent recording support.',
        icon: FaGlobe,
        color: 'green'
      };
    }

    return {
      status: 'unsupported',
      message: 'Your browser does not support audio recording.',
      icon: FaExclamationTriangle,
      color: 'red'
    };
  };

  const handlePermissionTest = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      
      toast({
        title: '✅ Permission Test Successful',
        description: 'Microphone access is working correctly.',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top'
      });
    } catch (error) {
      console.error('Permission test failed:', error);
      
      let errorMessage = 'Microphone permission test failed.';
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Microphone permission denied. Please allow access and try again.';
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'No microphone found on this device.';
      }

      toast({
        title: '❌ Permission Test Failed',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top'
      });
    }
  };

  const support = getBrowserSupport();
  const SupportIcon = support.icon;

  if (!deviceInfo.hasMediaRecorder || !deviceInfo.hasGetUserMedia) {
    return (
      <Alert status="error" mb={4} borderRadius="md">
        <AlertIcon />
        <Box>
          <AlertTitle>Browser Not Supported</AlertTitle>
          <AlertDescription>
            Your browser does not support audio recording. Please try:
            <br />• Chrome (recommended)
            <br />• Firefox
            <br />• Safari (iOS)
          </AlertDescription>
        </Box>
      </Alert>
    );
  }

  return (
    <VStack spacing={4} mb={6}>
      {/* Device and Browser Info */}
      <Alert status={support.color === 'red' ? 'error' : support.color === 'orange' ? 'warning' : 'info'} borderRadius="md">
        <AlertIcon as={SupportIcon} />
        <Box>
          <AlertTitle>
            {deviceInfo.isMobile ? '📱 Mobile Device' : '💻 Desktop'} - {deviceInfo.browser}
          </AlertTitle>
          <AlertDescription>{support.message}</AlertDescription>
        </Box>
      </Alert>

      {/* iOS Specific Instructions */}
      {deviceInfo.isIOS && (
        <Alert status="info" borderRadius="md">
          <AlertIcon />
          <Box>
            <AlertTitle>📱 iOS Recording Tips</AlertTitle>
            <AlertDescription>
              <Text>• Use Safari for best results</Text>
              <Text>• Ensure iOS is updated to latest version</Text>
              <Text>• Recording may produce M4A format</Text>
              <Text>• Close other apps using microphone</Text>
            </AlertDescription>
          </Box>
        </Alert>
      )}

      {/* Android Specific Instructions */}
      {deviceInfo.isAndroid && (
        <Alert status="info" borderRadius="md">
          <AlertIcon />
          <Box>
            <AlertTitle>🤖 Android Recording Tips</AlertTitle>
            <AlertDescription>
              <Text>• Chrome is recommended</Text>
              <Text>• Check microphone permissions in browser settings</Text>
              <Text>• Close other recording apps</Text>
            </AlertDescription>
          </Box>
        </Alert>
      )}

      {/* Permission Test Button */}
      <Button
        leftIcon={<FaMobile />}
        onClick={handlePermissionTest}
        colorScheme="blue"
        variant="outline"
        size="sm"
      >
        Test Microphone Permission
      </Button>
    </VStack>
  );
};

export default MobileRecordingHelper; 