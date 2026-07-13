import { motion } from "framer-motion";

// Đường cong chuyển động (Easing) chuẩn phong cách mượt mà, sang trọng của Apple
const smoothEase = [0.16, 1, 0.3, 1];

export function RollCharIn({ text = "", classNa = "" }) {
  return (
    <div className="flex flex-wrap overflow-hidden">
      {text.split(" ").map((word, wi) => (
        <span key={wi} className="mr-1.5 whitespace-nowrap inline-flex">
          {word.split("").map((char, i) => (
            <motion.span
              key={i}
              initial={{ y: 15, opacity: 0, filter: "blur(8px)" }}
              animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.95, y: -10, filter: "blur(8px)" }}
              transition={{
                delay: (wi * 4 + i) * 0.025,
                duration: 0.7,
                ease: smoothEase,
              }}
              className={`inline-block ${classNa}`}
            >
              {char}
            </motion.span>
          ))}
        </span>
      ))}
    </div>
  );
}

export function RollCharOut({ text = "Xin chào anh em!", classNa = "text-base" }) {
  return (
    <div className="flex flex-wrap overflow-hidden">
      {text.split(" ").map((word, wi) => (
        <span key={wi} className="mr-1.5 whitespace-nowrap inline-flex">
          {word.split("").map((char, i) => (
            <motion.span
              key={i}
              initial={{ y: 0, opacity: 1, filter: "blur(0px)" }}
              animate={{ y: -15, opacity: 0, filter: "blur(8px)" }}
              transition={{
                delay: (wi * 4 + i) * 0.02,
                duration: 0.5,
                ease: smoothEase,
              }}
              className={`inline-block ${classNa}`}
            >
              {char}
            </motion.span>
          ))}
        </span>
      ))}
    </div>
  );
}