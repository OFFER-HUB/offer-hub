"use client"

import { motion } from "framer-motion"

export function FaqSupport() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="mt-16 rounded-xl overflow-hidden"
    >
      <div className="bg-gradient-to-r from-[#002333] to-[#159A9C] p-8 md:p-12 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Still Have Questions?</h2>
          <p className="text-white/80 mb-8">
            If you couldn&apos;t find the answer to your question, our support team is here to help.
          </p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="
              inline-flex items-center justify-center
              bg-white text-[#159A9C] font-medium
              px-6 py-3 rounded-lg
              shadow-lg
              transition-all duration-300
              hover:shadow-xl
            "
          >
            Contact Support
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

