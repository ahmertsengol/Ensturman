import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Box, Button, FormControl, FormLabel, Input, VStack, Heading, Text, FormErrorMessage, useToast, InputGroup, InputRightElement, Alert, AlertIcon } from '@chakra-ui/react';
import { loginUser } from '../../api/api';
import { useAuth } from '../../context/AuthContext';

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const { login } = useAuth();
  const toast = useToast();
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm();
  
  const onSubmit = async (data) => {
    setIsLoading(true);
    setLoginError('');
    try {
      const response = await loginUser(data);
      login(response.data.user, response.data.token);
      
      toast({
        title: 'Giriş başarılı',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top'
      });
    } catch (error) {
      console.error('Login error:', error);
      
      let errorMessage = 'Giriş başarısız';
      
      if (error.response) {
        // Sunucudan bir yanıt geldi
        errorMessage = error.response.data?.error || 'Sunucu hatası oluştu';
      } else if (error.message === 'Network Error') {
        // CORS veya network sorunu
        errorMessage = 'Ağ hatası - Lütfen sunucunun çalıştığını kontrol edin';
        setLoginError('Sunucuya bağlanılamıyor. Backend\'in http://localhost:3001 adresinde çalıştığından emin olun');
      } else if (error.request) {
        // İstek yapıldı ama yanıt gelmedi
        errorMessage = 'Sunucudan yanıt alınamadı';
      } else {
        // İstek oluşturulurken hata oluştu
        errorMessage = error.message || 'Beklenmeyen bir hata oluştu';
      }
      
      toast({
        title: 'Giriş başarısız',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Test backend connection
  const testConnection = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3001/test-cors', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        toast({
          title: 'Bağlantı Başarılı',
          description: 'Backend sunucusuna erişilebiliyor',
          status: 'success',
          duration: 3000,
          isClosable: true
        });
        setLoginError('');
      } else {
        setLoginError('Backend hata yanıtı verdi: ' + response.status);
      }
    } catch (err) {
      console.error('Connection test failed:', err);
      setLoginError('Backend sunucusuna bağlanılamadı. Çalışıyor mu?');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Box
      p={8}
      maxWidth="400px"
      borderWidth={1}
      borderRadius={8}
      boxShadow="lg"
      mb={4}
      w="100%"
      bg="dark.300"
      borderColor="dark.400"
    >
      <VStack spacing={4} align="flex-start" w="100%">
        <Heading as="h2" size="lg" color="white">Giriş Yap</Heading>
        
        {loginError && (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            {loginError}
          </Alert>
        )}
        
        <form onSubmit={handleSubmit(onSubmit)} style={{ width: '100%' }}>
          <VStack spacing={4} align="flex-start" w="100%">
            {/* Email Field */}
            <FormControl isInvalid={errors.email}>
              <FormLabel htmlFor="email" color="gray.100">E-posta</FormLabel>
              <Input
                id="email"
                type="email"
                placeholder="E-posta adresinizi girin"
                bg="dark.400"
                borderColor="dark.200"
                _hover={{ borderColor: "brand.500" }}
                _focus={{ borderColor: "brand.500", boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)" }}
                {...register('email', {
                  required: 'E-posta gerekli',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Geçersiz e-posta adresi'
                  }
                })}
              />
              <FormErrorMessage>
                {errors.email && errors.email.message}
              </FormErrorMessage>
            </FormControl>
            
            {/* Password Field */}
            <FormControl isInvalid={errors.password}>
              <FormLabel htmlFor="password" color="gray.100">Şifre</FormLabel>
              <InputGroup>
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Şifrenizi girin"
                  bg="dark.400"
                  borderColor="dark.200"
                  _hover={{ borderColor: "brand.500" }}
                  _focus={{ borderColor: "brand.500", boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)" }}
                  {...register('password', {
                    required: 'Şifre gerekli',
                    minLength: {
                      value: 6,
                      message: 'Şifre en az 6 karakter olmalıdır'
                    }
                  })}
                />
                <InputRightElement width="4.5rem">
                  <Button 
                    h="1.75rem" 
                    size="sm" 
                    onClick={() => setShowPassword(!showPassword)}
                    variant="ghost"
                    color="gray.300"
                    _hover={{ bg: "dark.200" }}
                  >
                    {showPassword ? 'Gizle' : 'Göster'}
                  </Button>
                </InputRightElement>
              </InputGroup>
              <FormErrorMessage>
                {errors.password && errors.password.message}
              </FormErrorMessage>
            </FormControl>
            
            <Button
              colorScheme="brand"
              bg="brand.500"
              width="full"
              type="submit"
              isLoading={isLoading}
              loadingText="Giriş yapılıyor"
              mt={4}
              _hover={{ bg: "brand.600" }}
            >
              Giriş Yap
            </Button>
            
            <Button
              variant="outline"
              borderColor="accent.500"
              color="accent.500"
              width="full"
              onClick={testConnection}
              isLoading={isLoading}
              mt={2}
              _hover={{ bg: "rgba(233, 30, 99, 0.2)" }}
            >
              Bağlantıyı Test Et
            </Button>
          </VStack>
        </form>
      </VStack>
    </Box>
  );
};

export default LoginForm; 