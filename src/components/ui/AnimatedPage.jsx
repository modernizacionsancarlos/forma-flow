import { motion } from 'framer-motion';

/**
 * Wrapper animado para transiciones de página suaves.
 */
const AnimatedPage = ({ children }) => {
  const MotionDiv = motion.div;

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.98 }}
      transition={{ 
        duration: 0.4, 
        ease: [0.22, 1, 0.36, 1] // Custom cubic bezier para efecto fluido
      }}
      className="w-full h-full"
    >
      {children}
    </MotionDiv>
  );
};

export default AnimatedPage;
