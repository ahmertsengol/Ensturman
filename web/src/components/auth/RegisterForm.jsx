import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Box, Button, FormControl, FormLabel, Input, VStack, Heading, FormErrorMessage, useToast, InputGroup, InputRightElement, Text, HStack } from '@chakra-ui/react';
import { registerUser, testCors } from '../../api/api';
import { useAuth } from '../../context/AuthContext';

const RegisterForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [testingCors, setTestingCors] = useState(false);
  const { login } = useAuth();
  const toast = useToast();
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors },
    watch 
  } = useForm();
  
  const password = watch('password');
  
  const onSubmit = async (data) => {
    setIsLoading(true);
    setApiError('');
    try {
      const response = await registerUser(data);
      login(response.data.user, response.data.token);
      
      toast({
        title: 'Kayıt başarılı',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top'
      });
    } catch (error) {
      console.error('Registration error:', error);
      
      // Detaylı hata mesajını göster
      let errorMessage = 'Kayıt başarısız';
      
      if (error.response) {
        // Sunucudan bir yanıt geldi
        errorMessage = error.response.data?.error || 'Sunucu hatası oluştu';
      } else if (error.request) {
        // İstek yapıldı ama yanıt gelmedi - muhtemelen CORS veya network sorunu
        errorMessage = 'Ağ hatası - Lütfen sunucunun çalıştığından emin olun';
        setApiError('Ağ bağlantı hatası. Lütfen sunucunun http://localhost:3001 adresinde çalıştığını kontrol edin');
      } else {
        // İstek oluşturulurken hata oluştu
        errorMessage = error.message || 'Beklenmeyen bir hata oluştu';
      }
      
      toast({
        title: 'Kayıt başarısız',
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
  
  // CORS testi fonksiyonu
  const handleTestCors = async () => {
    setTestingCors(true);
    try {
      await testCors();
      toast({
        title: 'CORS Testi Başarılı',
        description: 'Backend bağlantısı düzgün çalışıyor',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top'
      });
      setApiError('');
    } catch (error) {
      console.error('CORS Test Error:', error);
      let errorMessage = 'CORS Testi Başarısız';
      
      if (error.response) {
        errorMessage = `Sunucu şu durumla yanıt verdi: ${error.response.status}`;
      } else if (error.request) {
        errorMessage = 'Sunucudan yanıt yok - CORS veya Ağ sorunu';
      } else {
        errorMessage = error.message;
      }
      
      setApiError(`CORS Bağlantı Testi Başarısız: ${errorMessage}`);
      
      toast({
        title: 'CORS Testi Başarısız',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top'
      });
    } finally {
      setTestingCors(false);
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
        <Heading as="h2" size="lg" color="white">Kaydol</Heading>
        
        {apiError && (
          <Box p={3} bg="rgba(229, 62, 62, 0.1)" color="red.300" borderRadius="md" w="100%">
            <Text>{apiError}</Text>
          </Box>
        )}
        
        <form onSubmit={handleSubmit(onSubmit)} style={{ width: '100%' }}>
          <VStack spacing={4} align="flex-start" w="100%">
            {/* Username Field */}
            <FormControl isInvalid={errors.username}>
              <FormLabel htmlFor="username" color="gray.100">Kullanıcı Adı</FormLabel>
              <Input
                id="username"
                placeholder="Kullanıcı adı girin"
                bg="dark.400"
                borderColor="dark.200"
                _hover={{ borderColor: "brand.500" }}
                _focus={{ borderColor: "brand.500", boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)" }}
                {...register('username', {
                  required: 'Kullanıcı adı gerekli',
                  minLength: {
                    value: 3,
                    message: 'Kullanıcı adı en az 3 karakter olmalıdır'
                  }
                })}
              />
              <FormErrorMessage>
                {errors.username && errors.username.message}
              </FormErrorMessage>
            </FormControl>
            
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
            
            {/* Confirm Password Field */}
            <FormControl isInvalid={errors.confirmPassword}>
              <FormLabel htmlFor="confirmPassword" color="gray.100">Şifreyi Onayla</FormLabel>
              <Input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                placeholder="Şifrenizi tekrar girin"
                bg="dark.400"
                borderColor="dark.200"
                _hover={{ borderColor: "brand.500" }}
                _focus={{ borderColor: "brand.500", boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)" }}
                {...register('confirmPassword', {
                  required: 'Lütfen şifrenizi onaylayın',
                  validate: value => value === password || 'Şifreler eşleşmiyor'
                })}
              />
              <FormErrorMessage>
                {errors.confirmPassword && errors.confirmPassword.message}
              </FormErrorMessage>
            </FormControl>
            
            <HStack w="100%" spacing={4}>
              <Button
                colorScheme="accent"
                bg="accent.500"
                flex="3"
                type="submit"
                isLoading={isLoading}
                loadingText="Kaydolunuyor"
                mt={4}
                _hover={{ bg: "accent.600" }}
              >
                Kaydol
              </Button>
              
              <Button
                variant="outline"
                borderColor="brand.500"
                color="brand.500"
                flex="2"
                onClick={handleTestCors}
                isLoading={testingCors}
                loadingText="Test Ediliyor"
                mt={4}
                _hover={{ bg: "rgba(29, 185, 84, 0.2)" }}
              >
                Bağlantı Testi
              </Button>
            </HStack>
          </VStack>
        </form>
      </VStack>
    </Box>
  );
};

export default RegisterForm; 