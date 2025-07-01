import { motion } from 'framer-motion';

const Unauthorized = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex items-center justify-center h-screen"
    >
      <div className="bg-white p-8 rounded-lg shadow-lg">
        {/* Rest of the component content */}
      </div>
    </motion.div>
  );
};

export default Unauthorized;
