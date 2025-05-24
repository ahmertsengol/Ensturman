import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { AuthProvider } from './context/AuthContext';
import { ChatbotProvider } from './context/ChatbotContext';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import RecordPage from './pages/RecordPage';
import NotFoundPage from './pages/NotFoundPage';
import ProfilePage from './pages/ProfilePage';
import TrainingPage from './pages/TrainingPage';
import { MusicChatbot } from './components/ui';

// Create a custom music-themed dark mode
const theme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
  fonts: {
    heading: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
    body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
  },
  colors: {
    brand: {
      50: '#E3F9EC',
      100: '#C5F3D9',
      200: '#9EECBF',
      300: '#6EE29D',
      400: '#36D573',
      500: '#1DB954', // Spotify green
      600: '#17A449',
      700: '#118C3F',
      800: '#0B7433',
      900: '#065C29',
  },
    accent: {
      50: '#FCE4EC',
      100: '#F8BBD0',
      200: '#F48FB1',
      300: '#F06292',
      400: '#EC407A',
      500: '#E91E63', // Pink
      600: '#D81B60',
      700: '#C2185B',
      800: '#AD1457',
      900: '#880E4F',
    },
    gray: {
      50: '#F7FAFC',
      100: '#EDF2F7',
      200: '#E2E8F0',
      300: '#CBD5E0',
      400: '#A0AEC0',
      500: '#718096',
      600: '#4A5568',
      700: '#2D3748',
      800: '#1A202C',
      900: '#121212', // Main background dark
    },
    dark: {
      100: '#444054',
      200: '#352F44',
      300: '#2A2438', // Card background dark
      400: '#1F1D36',
      500: '#191729', // Main background dark
      600: '#161525', // Even darker shade for depth
      700: '#13111F', // Deepest background elements
    },
  },
  styles: {
    global: {
      // Keyframe animations
      '@keyframes float': {
        '0%': { transform: 'translateY(0px)' },
        '50%': { transform: 'translateY(-15px)' },
        '100%': { transform: 'translateY(0px)' }
      },
      '@keyframes glow': {
        '0%': { boxShadow: '0 0 5px rgba(29, 185, 84, 0.2)' },
        '50%': { boxShadow: '0 0 20px rgba(29, 185, 84, 0.4), 0 0 30px rgba(233, 30, 99, 0.3)' },
        '100%': { boxShadow: '0 0 5px rgba(29, 185, 84, 0.2)' }
      },
      body: {
        bg: 'dark.500',
        color: '#E0E0E0',
        lineHeight: 'base',
      },
      '#root': {
        bg: 'dark.500',
      },
      '.chakra-container': {
        bg: 'transparent',
      },
      '.chakra-card': {
        bg: 'dark.300',
        color: 'white',
      },
      // Add specific styles for the problematic card class
      '.css-1sad0u8': {
        color: 'white !important', // Force white text color
        bg: 'dark.300 !important', // Ensure dark background
      },
      // Fix for specific ChatBot bubble elements
      '.css-1ht6jsg': {
        color: 'white !important',
        background: 'dark.300 !important',
        borderColor: 'dark.200 !important',
      },
      '.css-h2yqag': {
        color: 'white !important',
        background: 'dark.400 !important',
        borderColor: 'dark.300 !important',
      },
      // Fix for popover readability issues
      '.chakra-popover__popper': {
        color: 'white !important',
        bg: 'dark.300 !important',
      },
      '.css-1qq679y': {
        color: 'white !important',
        bg: 'dark.300 !important',
      },
      // Fix for instrument selection readability
      '.chakra-select': {
        color: 'white !important',
      },
      '.chakra-select__wrapper': {
        color: 'white !important',
      },
      '.chakra-select option': {
        color: 'black !important',
        background: 'white !important',
      },
      // Enhanced focus styles for better accessibility
      '*:focus': {
        boxShadow: '0 0 0 3px rgba(29, 185, 84, 0.4) !important',
        outline: 'none !important',
      },
      // Remove ugly outlines in Firefox
      'button::-moz-focus-inner': {
        border: 0,
      },
      // Customize scrollbars
      '::-webkit-scrollbar': {
        width: '8px',
        height: '8px',
      },
      '::-webkit-scrollbar-track': {
        bg: 'dark.400',
      },
      '::-webkit-scrollbar-thumb': {
        bg: 'dark.100',
        borderRadius: '8px',
      },
      '::-webkit-scrollbar-thumb:hover': {
        bg: 'brand.500',
      },
    },
  },
  components: {
    Container: {
      baseStyle: {
        maxW: 'container.xl',
        bg: 'transparent', 
      },
    },
    Box: {
      baseStyle: {
        bg: 'transparent',
      },
    },
    Button: {
      baseStyle: {
        borderRadius: 'md',
        fontWeight: 'semibold',
        _hover: {
          transform: 'translateY(-2px)',
          boxShadow: 'lg',
        },
        _active: {
          transform: 'translateY(0)',
        },
        transition: 'all 0.2s ease',
      },
      variants: {
        solid: (props) => ({
          bg: props.colorScheme === 'green' ? 'brand.500' : 
               props.colorScheme === 'pink' ? 'accent.500' : 
               `${props.colorScheme}.500`,
          color: 'white',
          _hover: {
            bg: props.colorScheme === 'green' ? 'brand.600' : 
                props.colorScheme === 'pink' ? 'accent.600' : 
                `${props.colorScheme}.600`,
            transform: 'translateY(-2px)',
            boxShadow: 'lg',
          },
        }),
        outline: {
          borderWidth: '2px',
        },
        glassmorphic: {
          bg: 'rgba(26, 23, 42, 0.7)',
          backdropFilter: 'blur(8px)',
          color: 'white',
          borderRadius: 'lg',
          _hover: {
            bg: 'rgba(42, 36, 56, 0.8)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    Card: {
      baseStyle: {
        container: {
          borderRadius: 'lg',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          bg: 'dark.300', 
          color: 'white', // Ensure text is white in all cards
        },
        header: {
          color: 'white', // Ensure header text is white
        },
        body: {
          color: 'gray.100', // Set body text to light gray for better contrast
        },
        footer: {
          color: 'gray.200', // Set footer text to light gray
        }
      },
      variants: {
        elevated: {
          container: {
            boxShadow: 'lg',
            _hover: {
              transform: 'translateY(-4px)',
              boxShadow: 'xl',
            },
          },
        },
        glassmorphic: {
          container: {
            bg: 'rgba(42, 36, 56, 0.7)',
            backdropFilter: 'blur(8px)',
            borderRadius: 'xl',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
            color: 'white', // Ensure white text in glassmorphic cards
          },
        },
      },
      // Set default props for all cards
      defaultProps: {
        variant: 'elevated',
      },
    },
    Heading: {
      baseStyle: {
        fontWeight: '700',
        letterSpacing: '-0.5px',
        color: 'white',
      },
    },
    Input: {
      variants: {
        filled: {
          field: {
            bg: 'dark.300',
            _hover: {
              bg: 'dark.200',
            },
            _focus: {
              bg: 'dark.400',
              borderColor: 'brand.500',
            },
          },
        },
        outline: {
          field: {
            borderColor: 'dark.100',
            bg: 'dark.400',
            _hover: {
              borderColor: 'brand.500',
            },
            _focus: {
              borderColor: 'brand.500',
              boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)',
            },
          },
        },
      },
      defaultProps: {
        variant: 'filled',
      },
    },
    Select: {
      variants: {
        filled: {
          field: {
            bg: 'dark.300',
            color: 'white',
            _hover: {
              bg: 'dark.200',
            },
            _focus: {
              bg: 'dark.400',
              borderColor: 'brand.500',
            },
          },
          icon: {
            color: 'gray.300',
          },
        },
        outline: {
          field: {
            borderColor: 'dark.100',
            bg: 'dark.400',
            color: 'white',
            _hover: {
              borderColor: 'brand.500',
            },
            _focus: {
              borderColor: 'brand.500',
              boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)',
            },
          },
          icon: {
            color: 'gray.300',
          },
        },
      },
      defaultProps: {
        variant: 'filled',
      },
    },
    Link: {
      baseStyle: {
        color: 'brand.400',
        _hover: {
          textDecoration: 'none',
          color: 'brand.300',
        },
      },
    },
    Text: {
      baseStyle: {
        color: 'gray.100',
      },
    },
    Divider: {
      baseStyle: {
        borderColor: 'dark.200',
        opacity: 0.6,
      },
    },
    Modal: {
      baseStyle: {
        dialog: {
          bg: 'dark.300',
          boxShadow: 'xl',
        },
        header: {
          color: 'white',
        },
        body: {
          color: 'gray.100',
        },
        footer: {
          borderTopWidth: '1px',
          borderColor: 'dark.400',
        },
      },
    },
    Drawer: {
      baseStyle: {
        dialog: {
          bg: 'dark.300',
          boxShadow: 'xl',
        },
        header: {
          color: 'white', 
        },
        body: {
          color: 'gray.100',
        },
        footer: {
          borderTopWidth: '1px',
          borderColor: 'dark.400',
        },
      },
    },
    Tooltip: {
      baseStyle: {
        bg: 'dark.200',
        color: 'white',
        borderRadius: 'md',
        px: 3,
        py: 2,
      },
    },
    Popover: {
      baseStyle: {
        popper: {
          bg: 'dark.300',
          color: 'white',
        },
        content: {
          bg: 'dark.300',
          color: 'white',
          borderColor: 'dark.200',
          boxShadow: 'xl',
        },
        header: {
          color: 'white',
          borderColor: 'dark.200',
        },
        body: {
          color: 'gray.100',
        },
        footer: {
          color: 'gray.200',
          borderColor: 'dark.200',
        },
        arrow: {
          bg: 'dark.300',
        },
      },
    },
  },
});

function App() {
  return (
    <ChakraProvider theme={theme}>
      <AuthProvider>
        <ChatbotProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/record" element={<RecordPage />} />
              <Route path="/profile" element={<ProfilePage />} />
                <Route path="/training" element={<TrainingPage />} />
                <Route path="/training/:id" element={<TrainingPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
              <MusicChatbot />
          </Layout>
        </Router>
        </ChatbotProvider>
      </AuthProvider>
    </ChakraProvider>
  );
}

export default App;
