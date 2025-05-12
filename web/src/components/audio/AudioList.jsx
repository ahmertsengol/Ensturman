import { useState, useEffect, useCallback } from 'react';
import { Box, Heading, Text, SimpleGrid, Spinner, Button, useToast, Flex, Icon, Card, CardBody, CardFooter, Stack, Badge, IconButton, HStack } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { FaMicrophone, FaPlay, FaTrash, FaClock, FaFileAudio } from 'react-icons/fa';
import { getUserRecordings, deleteRecording } from '../../api/api';

const AudioCard = ({ recording, onDelete, onPlay }) => {
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };
  
  return (
    <Card 
      direction="column" 
      overflow="hidden" 
      variant="outline"
      bg="dark.300"
      borderColor="dark.400"
      h="100%"
      display="flex"
      flexDirection="column"
      boxShadow="md"
      _hover={{
        transform: "translateY(-4px)",
        boxShadow: "xl",
        transition: "all 0.3s ease"
      }}
    >
      <CardBody flex="1">
        <Flex align="center" mb={3}>
          <Icon as={FaFileAudio} boxSize={5} color="brand.500" mr={2} />
          <Heading size="md" noOfLines={1}>{recording.title}</Heading>
        </Flex>
        
        {recording.description && (
          <Text fontSize="sm" color="gray.400" noOfLines={2} mb={4}>
            {recording.description}
          </Text>
        )}
        
        <Stack spacing={2} mt="auto">
          <Flex align="center">
            <Icon as={FaClock} color="gray.500" mr={2} />
            <Text fontSize="sm" color="gray.500">
              {formatDate(recording.created_at)}
            </Text>
          </Flex>
          
          {recording.file_size && (
            <Flex align="center">
              <Badge colorScheme="green" variant="subtle">
                {formatFileSize(recording.file_size)}
              </Badge>
            </Flex>
          )}
        </Stack>
      </CardBody>
      
      <CardFooter pt={2} pb={2}>
        <HStack spacing={2} w="100%">
          <IconButton
            aria-label="Play recording"
            icon={<FaPlay />}
            colorScheme="green"
            size="sm"
            onClick={() => onPlay(recording)}
          />
          
          <IconButton
            aria-label="Delete recording"
            icon={<FaTrash />}
            colorScheme="red"
            variant="outline"
            size="sm"
            onClick={() => onDelete(recording.id)}
          />
        </HStack>
      </CardFooter>
    </Card>
  );
};

const AudioList = () => {
  const [recordings, setRecordings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [audio] = useState(new Audio());
  
  const toast = useToast();
  
  // Fetch recordings from API - moved before useEffect and wrapped in useCallback
  const fetchRecordings = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getUserRecordings();
      setRecordings(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching recordings:', err);
      setError('Failed to load recordings. Please try again.');
      toast({
        title: 'Error',
        description: 'Failed to load recordings',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top'
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);
  
  // Load recordings on component mount
  useEffect(() => {
    fetchRecordings();
    
    // Clean up audio
    return () => {
      if (audio) {
        audio.pause();
        audio.src = '';
      }
    };
  }, [audio, fetchRecordings]);
  
  // Handle recording deletion
  const handleDelete = async (id) => {
    try {
      await deleteRecording(id);
      setRecordings(recordings.filter(rec => rec.id !== id));
      toast({
        title: 'Success',
        description: 'Recording deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top'
      });
    } catch (err) {
      console.error('Error deleting recording:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete recording',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top'
      });
    }
  };
  
  // Handle recording playback
  const handlePlay = (recording) => {
    // Backend URL
    const API_BASE_URL = 'http://localhost:3001';
    
    // First priority: use file_url if available
    let audioUrl = recording.file_url;
    
    // If file_url is not available, construct from file_path
    if (!audioUrl && recording.file_path) {
      // If file_path already contains full URL
      if (recording.file_path.startsWith('http')) {
        audioUrl = recording.file_path;
      } 
      // If file_path contains an absolute local path (this is the problematic case)
      else if (recording.file_path.includes('/Users/') || recording.file_path.includes(':\\')) {
        // Extract just the filename from the path
        const filename = recording.file_path.split('/').pop();
        audioUrl = `${API_BASE_URL}/api/audio/stream/${filename}`;
      }
      // If file_path starts with / (relative path)
      else if (recording.file_path.startsWith('/')) {
        audioUrl = `${API_BASE_URL}${recording.file_path}`;
      }
      // For all other cases
      else {
        audioUrl = `${API_BASE_URL}/uploads/${recording.file_path}`;
      }
    }
    
    console.log('Playing audio from URL:', audioUrl);
    
    // Dosya uzantısını kontrol et
    const fileExtension = audioUrl.split('.').pop().toLowerCase();
    const isM4aFormat = fileExtension === 'm4a';
    
    // If already playing, pause it
    if (audio.src === audioUrl && !audio.paused) {
      audio.pause();
      return;
    }
    
    // M4A formatı için tarayıcı uyumluluğunu kontrol et
    const handleM4aCompatibility = () => {
      // M4A formatını oynatmayı dene
      audio.src = audioUrl;
      
      // Error handling for audio playback
      const handleError = (e) => {
        console.error('Audio playback error (M4A format):', e);
        
        // M4A uyumsuzluğu durumunda, alternatif yol olarak streaming API kullan
        if (isM4aFormat) {
          // Orijinal dosya adını al
          const filename = audioUrl.split('/').pop();
          // Stream endpoint'i kullan
          const streamUrl = `${API_BASE_URL}/api/audio/stream/${filename}`;
          console.log('Trying alternative stream URL for M4A:', streamUrl);
          
          // Yeni URL ile tekrar dene
          audio.src = streamUrl;
          
          audio.play()
            .then(() => {
              console.log('M4A playback started successfully with alternative URL');
            })
            .catch(altError => {
              console.error('Error playing M4A audio with alternative method:', altError);
              toast({
                title: 'M4A Playback Error',
                description: 'This audio format (M4A) might not be supported by your browser. Try converting to MP3.',
                status: 'error',
                duration: 5000,
                isClosable: true,
                position: 'top'
              });
            });
        } else {
          toast({
            title: 'Playback Error',
            description: 'Could not play the recording. Please check if the file exists and is accessible.',
            status: 'error',
            duration: 3000,
            isClosable: true,
            position: 'top'
          });
        }
      };
      
      // Remove any existing error listener before adding a new one
      audio.removeEventListener('error', handleError);
      audio.addEventListener('error', handleError);
      
      // Play the audio
      audio.play()
        .then(() => {
          console.log('Audio playback started successfully');
        })
        .catch(error => {
          console.error('Error playing audio:', error);
          // handleError fonksiyonu zaten hatayı işleyecek
        })
        .finally(() => {
          // Başarılı çalma durumunda listener'ı kaldırabilirsin
          if (!audio.error) {
            audio.removeEventListener('error', handleError);
          }
        });
    };
    
    // M4A formatı için özel işlem uygula
    if (isM4aFormat) {
      handleM4aCompatibility();
    } else {
      // Normal dosya formatları için standart oynatma
    audio.src = audioUrl;
    
    // Error handling for audio playback
    const handleError = (e) => {
      console.error('Audio playback error:', e);
      toast({
        title: 'Playback Error',
        description: 'Could not play the recording. Please check if the file exists and is accessible.',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top'
      });
    };
    
    // Remove any existing error listener before adding a new one
    audio.removeEventListener('error', handleError);
    audio.addEventListener('error', handleError);
    
    // Play the audio
    audio.play()
      .then(() => {
        console.log('Audio playback started successfully');
      })
      .catch(error => {
        console.error('Error playing audio:', error);
        toast({
          title: 'Playback Error',
          description: 'Could not play the recording: ' + error.message,
          status: 'error',
          duration: 3000,
          isClosable: true,
          position: 'top'
        });
      })
      .finally(() => {
        // Remove the event listener when done
        audio.removeEventListener('error', handleError);
      });
    }
  };
  
  if (isLoading) {
    return (
      <Flex justify="center" align="center" p={10}>
        <Spinner size="xl" />
      </Flex>
    );
  }
  
  if (error) {
    return (
      <Box textAlign="center" p={5}>
        <Heading size="md" mb={4} color="red.500">
          {error}
        </Heading>
        <Button colorScheme="blue" onClick={fetchRecordings}>
          Try Again
        </Button>
      </Box>
    );
  }
  
  if (recordings.length === 0) {
    return (
      <Box textAlign="center" p={5}>
        <Icon as={FaMicrophone} boxSize={12} color="gray.400" mb={4} />
        <Heading size="md" mb={4}>
          No recordings yet
        </Heading>
        <Text mb={6} color="gray.500">
          Start by creating your first audio recording
        </Text>
        <Button
          as={Link}
          to="/record"
          colorScheme="blue"
          leftIcon={<FaMicrophone />}
        >
          Record Audio
        </Button>
      </Box>
    );
  }
  
  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg">Your Recordings</Heading>
        <Button
          as={Link}
          to="/record"
          colorScheme="blue"
          leftIcon={<FaMicrophone />}
        >
          New Recording
        </Button>
      </Flex>
      
      <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={4}>
        {recordings.map((recording) => (
          <AudioCard
            key={recording.id}
            recording={recording}
            onDelete={handleDelete}
            onPlay={handlePlay}
          />
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default AudioList; 