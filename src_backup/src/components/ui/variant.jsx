export const pageVariants = {
    initial: {
        opacity: 0,
        y: 20,
    },
    animate: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.4,
            ease: "easeOut",
        }
    },
    exit: {
        opacity: 0,
        y: -20,
        transition: {
            duration: 0.3,
            ease: "easeIn"
        }
    }
};

export const modalVariant = (y=20) => ({
  initial: { scale: 0.9, y },
  animate: {
    scale: 1,
    y: 0,
    transition: { duration: 0.3 },
  },
  exit: {
    scale: 0.96,
    y,
    transition: { duration: 0.22 },
  },
})

export const pressable = (scale=1.03, color) => ({
  whileHover: { scale: scale, boxShadow: "0 12px 30px rgba(0,0,0,0.12)", backgroundColor: color },
  whileTap: { scale: 0.96, boxShadow: "0 6px 18px rgba(0,0,0,0.16)" },
})
