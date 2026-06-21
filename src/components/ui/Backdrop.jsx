import { motion } from "framer-motion";

export default function Backdrop({ handleClose, onClick, children }) {
  // Accept either prop name for backward compatibility across the codebase.
  const close = onClick ?? handleClose;

  return (
    <motion.div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={(e) => {
        // Only fire when the click is on the backdrop itself, not a bubbled
        // child click (children already call e.stopPropagation()).
        e.preventDefault();
        close?.(e);
      }}
    >
      {children}
    </motion.div>
  );
}