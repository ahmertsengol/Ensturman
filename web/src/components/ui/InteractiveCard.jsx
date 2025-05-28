import React, { useState } from 'react';
import { Box, Text, Icon, HStack, VStack } from '@chakra-ui/react';
import { FaMusic, FaHeadphones, FaMicrophone, FaRobot, FaGraduationCap, FaBrain, FaArrowRight, FaPlay } from 'react-icons/fa';

const InstrumentsCard = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Box
      position="relative"
      h="320px"
      w="280px"
      overflow="hidden"
      borderRadius="xl"
      bg="rgba(255, 255, 255, 0.05)"
      backdropFilter="blur(20px)"
      border="1px solid"
      borderColor="rgba(255, 255, 255, 0.1)"
      boxShadow="0 25px 45px rgba(0, 0, 0, 0.15)"
      cursor="pointer"
      transition="all 0.3s ease"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      transform={isHovered ? "translateY(-8px) scale(1.02)" : "translateY(0) scale(1)"}
      _hover={{
        boxShadow: "0 35px 60px rgba(0, 0, 0, 0.25)",
        borderColor: "brand.400",
        bg: "rgba(255, 255, 255, 0.08)"
      }}
    >
      <Box
        position="absolute"
        inset="2px"
        zIndex={1}
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
        gap={6}
        borderRadius="lg"
        bg="rgba(45, 55, 72, 0.4)"
        backdropFilter="blur(10px)"
        p={6}
        color="white"
      >
        <Box
          h="200px"
          w="full"
          overflow="hidden"
          borderRadius="lg"
          bg="rgba(255, 255, 255, 0.9)"
          display="flex"
          justifyContent="center"
          alignItems="center"
          position="relative"
          border="1px solid"
          borderColor="rgba(255, 255, 255, 0.2)"
        >
          {/* Sliding background bar */}
          <Box
            position="absolute"
            top="50%"
            left={isHovered ? "48px" : "-200px"}
            transform="translate(-48px, -48px)"
            w="full"
            h="80px"
            bg="linear-gradient(90deg, rgba(128, 90, 213, 0.1), rgba(159, 122, 234, 0.2), rgba(128, 90, 213, 0.1))"
            zIndex={10}
            transition="all 0.7s ease"
            borderRadius="md"
          />
          
          <HStack
            zIndex={20}
            gap="8px"
            transform={isHovered ? "translateX(-150px)" : "translateX(120px)"}
            transition="all 1s ease"
          >
            <Box
              display="flex"
              zIndex={10}
              w="100px"
              h="60px"
              alignItems="center"
              justifyContent="center"
              gap={3}
              borderRadius="lg"
              bg="gray.700"
              backdropFilter="blur(10px)"
              border="1px solid"
              borderColor="gray.600"
              color="white"
              transition="all 1s ease"
              opacity={isHovered ? 0 : 1}
              transform={isHovered ? "scale(0.8)" : "scale(1)"}
            >
              <Box h="2px" w="50px" borderRadius="full" bg="white" />
              <Icon as={FaMusic} boxSize={5} />
            </Box>
            
            <Box
              display="flex"
              zIndex={10}
              w="100px"
              h="60px"
              alignItems="center"
              justifyContent="center"
              gap={3}
              borderRadius="lg"
              bg="gray.600"
              backdropFilter="blur(10px)"
              border="1px solid"
              borderColor="gray.500"
              color="white"
              transition="all 1s ease"
              opacity={isHovered ? 0 : 1}
              transform={isHovered ? "scale(0.8)" : "scale(1)"}
            >
              <Box h="2px" w="50px" borderRadius="full" bg="white" />
              <Icon as={FaHeadphones} boxSize={5} />
            </Box>
            
            <Box position="relative">
              <Box
                display="flex"
                zIndex={10}
                w="100px"
                h="60px"
                alignItems="center"
                justifyContent="center"
                gap={3}
                borderRadius="lg"
                bg={isHovered ? "brand.500" : "gray.500"}
                backdropFilter="blur(10px)"
                border="2px solid"
                borderColor={isHovered ? "brand.400" : "gray.400"}
                color="white"
                transition="all 1s ease"
                transform={isHovered ? "scale(1.2)" : "scale(1)"}
                boxShadow={isHovered ? "0 0 30px rgba(128, 90, 213, 0.5)" : "none"}
              >
                <Box h="2px" w="50px" borderRadius="full" bg="white" />
                <Icon as={FaMicrophone} boxSize={5} />
              </Box>
              
              <Box
                position="absolute"
                top="15px"
                left="80px"
                transition="all 0.7s ease"
                transitionDelay={isHovered ? "0.7s" : "0s"}
                transform={isHovered ? "translate(0px, 0px)" : "translate(60px, 80px)"}
              >
                <Icon 
                  as={FaPlay} 
                  boxSize={10} 
                  color={isHovered ? "brand.300" : "brand.400"}
                  transition="all 1s ease"
                  transitionDelay={isHovered ? "1s" : "0s"}
                  transform={isHovered ? "scale(0.8)" : "scale(1)"}
                />
              </Box>
            </Box>
            
            <Box
              display="flex"
              zIndex={10}
              w="100px"
              h="60px"
              alignItems="center"
              justifyContent="center"
              gap={3}
              borderRadius="lg"
              bg="gray.600"
              backdropFilter="blur(10px)"
              border="1px solid"
              borderColor="gray.500"
              color="white"
              transition="all 1s ease"
              transform={isHovered ? "translateX(20px)" : "translateX(0px)"}
              opacity={isHovered ? 0.7 : 1}
            >
              <Box h="2px" w="50px" borderRadius="full" bg="white" />
              <Icon as={FaMusic} boxSize={5} />
            </Box>
          </HStack>
        </Box>
        
        <HStack justify="space-between" w="full" align="center">
          <VStack spacing={1} align="start">
            <Text fontSize="xl" fontWeight="bold" color="white">
              Instruments
            </Text>
            <Text fontSize="sm" color="gray.300">
              50+ types available
            </Text>
          </VStack>
          <Icon 
            as={FaArrowRight} 
            boxSize={6}
            color={isHovered ? "brand.400" : "gray.400"}
            transform={isHovered ? "translateX(0px)" : "translateX(-12px)"}
            opacity={isHovered ? 1 : 0}
            transition="all 0.3s ease"
          />
        </HStack>
      </Box>
      
      <Box
        position="absolute"
        transition="all 0.5s ease"
        top={isHovered ? "40%" : "60%"}
        left={isHovered ? "-20%" : "-40%"}
        h="160px"
        w="200px"
        zIndex={-10}
        bg="linear-gradient(135deg, rgba(128, 90, 213, 0.3), rgba(159, 122, 234, 0.2))"
        filter={isHovered ? "blur(50px)" : "blur(40px)"}
        borderRadius="full"
      />
    </Box>
  );
};

const LearningCard = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Box
      position="relative"
      h="320px"
      w="280px"
      overflow="hidden"
      borderRadius="xl"
      bg="rgba(255, 255, 255, 0.05)"
      backdropFilter="blur(20px)"
      border="1px solid"
      borderColor="rgba(255, 255, 255, 0.1)"
      boxShadow="0 25px 45px rgba(0, 0, 0, 0.15)"
      cursor="pointer"
      transition="all 0.3s ease"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      transform={isHovered ? "translateY(-8px) scale(1.02)" : "translateY(0) scale(1)"}
      _hover={{
        boxShadow: "0 35px 60px rgba(0, 0, 0, 0.25)",
        borderColor: "accent.400",
        bg: "rgba(255, 255, 255, 0.08)"
      }}
    >
      <Box
        position="absolute"
        inset="2px"
        zIndex={1}
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
        gap={6}
        borderRadius="lg"
        bg="rgba(45, 55, 72, 0.4)"
        backdropFilter="blur(10px)"
        p={6}
        color="white"
      >
        <Box
          h="200px"
          w="full"
          overflow="hidden"
          borderRadius="lg"
          bg="rgba(255, 255, 255, 0.9)"
          display="flex"
          justifyContent="center"
          alignItems="center"
          position="relative"
          border="1px solid"
          borderColor="rgba(255, 255, 255, 0.2)"
        >
          {/* Sliding background bar */}
          <Box
            position="absolute"
            top="50%"
            left={isHovered ? "48px" : "-200px"}
            transform="translate(-48px, -48px)"
            w="full"
            h="80px"
            bg="linear-gradient(90deg, rgba(236, 201, 75, 0.1), rgba(246, 224, 94, 0.2), rgba(236, 201, 75, 0.1))"
            zIndex={10}
            transition="all 0.7s ease"
            borderRadius="md"
          />
          
          <HStack
            zIndex={20}
            gap="8px"
            transform={isHovered ? "translateX(-150px)" : "translateX(120px)"}
            transition="all 1s ease"
          >
            <Box
              display="flex"
              zIndex={10}
              w="100px"
              h="60px"
              alignItems="center"
              justifyContent="center"
              gap={3}
              borderRadius="lg"
              bg="gray.700"
              backdropFilter="blur(10px)"
              border="1px solid"
              borderColor="gray.600"
              color="white"
              transition="all 1s ease"
              opacity={isHovered ? 0 : 1}
              transform={isHovered ? "scale(0.8)" : "scale(1)"}
            >
              <Box h="2px" w="50px" borderRadius="full" bg="white" />
              <Icon as={FaRobot} boxSize={5} />
            </Box>
            
            <Box
              display="flex"
              zIndex={10}
              w="100px"
              h="60px"
              alignItems="center"
              justifyContent="center"
              gap={3}
              borderRadius="lg"
              bg="gray.600"
              backdropFilter="blur(10px)"
              border="1px solid"
              borderColor="gray.500"
              color="white"
              transition="all 1s ease"
              opacity={isHovered ? 0 : 1}
              transform={isHovered ? "scale(0.8)" : "scale(1)"}
            >
              <Box h="2px" w="50px" borderRadius="full" bg="white" />
              <Icon as={FaGraduationCap} boxSize={5} />
            </Box>
            
            <Box position="relative">
              <Box
                display="flex"
                zIndex={10}
                w="100px"
                h="60px"
                alignItems="center"
                justifyContent="center"
                gap={3}
                borderRadius="lg"
                bg={isHovered ? "accent.500" : "gray.500"}
                backdropFilter="blur(10px)"
                border="2px solid"
                borderColor={isHovered ? "accent.400" : "gray.400"}
                color="white"
                transition="all 1s ease"
                transform={isHovered ? "scale(1.2)" : "scale(1)"}
                boxShadow={isHovered ? "0 0 30px rgba(236, 201, 75, 0.5)" : "none"}
              >
                <Box h="2px" w="50px" borderRadius="full" bg="white" />
                <Icon as={FaBrain} boxSize={5} />
              </Box>
              
              <Box
                position="absolute"
                top="15px"
                left="80px"
                transition="all 0.7s ease"
                transitionDelay={isHovered ? "0.7s" : "0s"}
                transform={isHovered ? "translate(0px, 0px)" : "translate(60px, 80px)"}
              >
                <Icon 
                  as={FaRobot} 
                  boxSize={10} 
                  color={isHovered ? "accent.300" : "accent.400"}
                  transition="all 1s ease"
                  transitionDelay={isHovered ? "1s" : "0s"}
                  transform={isHovered ? "scale(0.8)" : "scale(1)"}
                />
              </Box>
            </Box>
            
            <Box
              display="flex"
              zIndex={10}
              w="100px"
              h="60px"
              alignItems="center"
              justifyContent="center"
              gap={3}
              borderRadius="lg"
              bg="gray.600"
              backdropFilter="blur(10px)"
              border="1px solid"
              borderColor="gray.500"
              color="white"
              transition="all 1s ease"
              transform={isHovered ? "translateX(20px)" : "translateX(0px)"}
              opacity={isHovered ? 0.7 : 1}
            >
              <Box h="2px" w="50px" borderRadius="full" bg="white" />
              <Icon as={FaGraduationCap} boxSize={5} />
            </Box>
          </HStack>
        </Box>
        
        <HStack justify="space-between" w="full" align="center">
          <VStack spacing={1} align="start">
            <Text fontSize="xl" fontWeight="bold" color="white">
              AI Learning
            </Text>
            <Text fontSize="sm" color="gray.300">
              Smart modules
            </Text>
          </VStack>
          <Icon 
            as={FaArrowRight} 
            boxSize={6}
            color={isHovered ? "accent.400" : "gray.400"}
            transform={isHovered ? "translateX(0px)" : "translateX(-12px)"}
            opacity={isHovered ? 1 : 0}
            transition="all 0.3s ease"
          />
        </HStack>
      </Box>
      
      <Box
        position="absolute"
        transition="all 0.5s ease"
        top={isHovered ? "40%" : "60%"}
        left={isHovered ? "-20%" : "-40%"}
        h="160px"
        w="200px"
        zIndex={-10}
        bg="linear-gradient(135deg, rgba(236, 201, 75, 0.3), rgba(246, 224, 94, 0.2))"
        filter={isHovered ? "blur(50px)" : "blur(40px)"}
        borderRadius="full"
      />
    </Box>
  );
};

export { InstrumentsCard, LearningCard }; 