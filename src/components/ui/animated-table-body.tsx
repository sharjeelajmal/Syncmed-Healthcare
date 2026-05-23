"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface AnimatedTableBodyProps {
  pageKey: number
  direction: number
  className?: string
  children: React.ReactNode
}

export function AnimatedTableBody({
  pageKey,
  direction,
  className,
  children,
}: AnimatedTableBodyProps) {
  return (
    <motion.tbody
      key={pageKey}
      initial={{ opacity: 0, x: direction > 0 ? 28 : -28 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.32,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
    >
      {children}
    </motion.tbody>
  )
}
