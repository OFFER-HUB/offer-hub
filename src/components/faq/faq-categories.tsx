"use client"

import type React from "react"

import { motion } from "framer-motion"
import { HelpCircle, CreditCard, Users, Briefcase, Shield, Settings } from "lucide-react"

interface FaqCategoriesProps {
  categories: string[]
  activeCategory: string
  setActiveCategory: (category: string) => void
}

export function FaqCategories({ categories, setActiveCategory }: FaqCategoriesProps) {
  // Map category names to their respective icons
  const categoryIcons: Record<string, { icon: React.ReactNode }> = {
    "General Questions": {
      icon: <HelpCircle size={24} />,
    },
    "Payments & Billing": {
      icon: <CreditCard size={24} />,
    },
    "For Clients": {
      icon: <Users size={24} />,
    },
    "For Freelancers": {
      icon: <Briefcase size={24} />,
    },
    "Security & Privacy": {
      icon: <Shield size={24} />,
    },
    "Technical Support": {
      icon: <Settings size={24} />,
    },
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {categories.map((category) => (
        <motion.div
          key={category}
          whileHover={{
            scale: 1.03,
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
          }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          onClick={() => setActiveCategory(category)}
          className={`
            flex flex-col items-center justify-center p-6 rounded-xl cursor-pointer
            transition-all duration-300 bg-[#f8faf9]
          `}
        >
          <div className="w-12 h-12 rounded-full bg-[#e4f7f7] flex items-center justify-center mb-3">
            <div className="text-primary-500">{categoryIcons[category].icon}</div>
          </div>
          <h3 className="text-center font-medium text-secondary-500">{category}</h3>
        </motion.div>
      ))}
    </div>
  )
}

