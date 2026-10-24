import type { Variants } from "framer-motion";

const ease = [0.25, 0.1, 0.25, 1] as const;

export const fadeIn: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease } },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
};

export const fadeInScale: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease } },
};

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -32 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease } },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 32 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease } },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease } },
};

export const cardHover = {
  rest: { y: 0, boxShadow: "0 1px 3px rgba(10,37,64,0.08)" },
  hover: { y: -4, boxShadow: "0 16px 40px rgba(10,37,64,0.14)", transition: { duration: 0.2, ease: "easeOut" } },
};

export const scaleOnHover = {
  rest: { scale: 1 },
  hover: { scale: 1.03, transition: { duration: 0.2, ease: "easeOut" } },
};

export const pageTransition = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.25 } },
};

export const overlayVariant: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

export const drawerVariant: Variants = {
  hidden: { x: "100%" },
  visible: { x: 0, transition: { duration: 0.3, ease } },
  exit: { x: "100%", transition: { duration: 0.25 } },
};
