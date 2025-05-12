import React, { useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { useAnimation, motion } from 'framer-motion';
import { Box, keyframes, useColorModeValue } from '@chakra-ui/react';
import { forwardRef } from 'react';
import { useInView } from 'react-intersection-observer';

// Predefined animations for common UI effects
const animations = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.5 }
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  },
  slideDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  },
  slideLeft: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.5 }
  },
  slideRight: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.5 }
  },
  scale: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.5 }
  },
  pulse: {
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 },
    transition: { duration: 0.2 }
  },
  bounce: {
    initial: { y: 0 },
    animate: { y: [0, -10, 0] },
    transition: { 
      duration: 2,
      times: [0, 0.5, 1],
      repeat: Infinity,
      repeatType: "loop"
    }
  },
  wave: {
    initial: { rotate: 0 },
    animate: { rotate: [0, 5, 0, -5, 0] },
    transition: { 
      duration: 2,
      repeat: Infinity,
      repeatType: "loop"
    }
  },
  float: {
    initial: { y: 0 },
    animate: { y: [0, -5, 0] },
    transition: { 
      duration: 3,
      repeat: Infinity,
      repeatType: "loop"
    }
  }
};

// Main animated component that can be used with different animation types
const AnimatedElement = forwardRef(({
  children,
  animationType = 'fadeIn',
  delay = 0,
  duration,
  asBox = true,
  onClick,
  glow = false,
  inViewAnimate = false, // new prop for intersection observer animation
  custom = {},
  ...props
}, ref) => {
  // Get theme colors for glow effect
  const brandGlowColor = useColorModeValue(
    'rgba(29, 185, 84, 0.8)', // light mode
    'rgba(29, 185, 84, 0.8)'  // dark mode
  );
  
  const brandGlowColorLight = useColorModeValue(
    'rgba(29, 185, 84, 0.5)', // light mode
    'rgba(29, 185, 84, 0.5)'  // dark mode
  );
  
  // Pulse animation for glowing elements - theme aware
  const glowPulse = keyframes`
    0% { box-shadow: 0 0 5px ${brandGlowColorLight}; }
    50% { box-shadow: 0 0 20px ${brandGlowColor}; }
    100% { box-shadow: 0 0 5px ${brandGlowColorLight}; }
  `;
  
  // Setup intersection observer for "when in view" animations
  const controls = useAnimation();
  const [inViewRef, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  
  // Start animation when element comes into view
  useEffect(() => {
    if (inViewAnimate && inView) {
      controls.start("animate");
    }
  }, [inViewAnimate, controls, inView]);
  
  // Select animation from predefined list or use custom
  let animationProps = animations[animationType] || animations.fadeIn;
  
  // Allow overriding the transition duration
  if (duration) {
    animationProps = {
      ...animationProps,
      transition: {
        ...animationProps.transition,
        duration
      }
    };
  }
  
  // Apply delay if specified
  if (delay) {
    animationProps = {
      ...animationProps,
      transition: {
        ...animationProps.transition,
        delay
      }
    };
  }
  
  // Merge with any custom animation properties
  animationProps = {
    ...animationProps,
    ...custom
  };
  
  // Apply glow effect if specified
  const glowProps = glow ? {
    sx: {
      animation: `${glowPulse} 2s infinite ease-in-out`,
      ...props.sx
    }
  } : {};
  
  // Setup ref combining
  const combineRefs = (el) => {
    if (inViewAnimate) {
      inViewRef(el);
    }
    
    if (ref) {
      if (typeof ref === 'function') {
        ref(el);
      } else {
        ref.current = el;
      }
    }
  };
  
  // If asBox is true, wrap with MotionBox
  if (asBox) {
    return (
      <motion.div
        ref={combineRefs}
        initial={inViewAnimate ? animationProps.initial : undefined}
        animate={inViewAnimate ? controls : animationProps.animate}
        exit={animationProps.exit}
        transition={animationProps.transition}
        whileHover={animationProps.whileHover}
        whileTap={animationProps.whileTap}
        {...props}
        onClick={onClick}
      >
        <Box {...glowProps}>
          {children}
        </Box>
      </motion.div>
    );
  }
  
  // Otherwise, use the motion component directly with the children
  return (
    <motion.div
      ref={combineRefs}
      initial={inViewAnimate ? animationProps.initial : undefined}
      animate={inViewAnimate ? controls : animationProps.animate}
      exit={animationProps.exit}
      transition={animationProps.transition}
      whileHover={animationProps.whileHover}
      whileTap={animationProps.whileTap}
      {...props}
      onClick={onClick}
    >
      {React.cloneElement(children, { ...glowProps })}
    </motion.div>
  );
});

AnimatedElement.displayName = 'AnimatedElement';

export default AnimatedElement; 