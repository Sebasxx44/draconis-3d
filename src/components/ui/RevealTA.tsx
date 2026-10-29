"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

export const RevealTA = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  const reducedMotion = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={false}
      whileInView={
        reducedMotion ? undefined : { opacity: [0.75, 1], y: [16, 0] }
      }
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.65, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
};
