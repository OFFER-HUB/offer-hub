"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronUp, ChevronDown } from "lucide-react"

interface Faq {
  question: string
  answer: string
}

interface FaqAccordionProps {
  faqs: Faq[]
}

export function FaqAccordion({ faqs }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="space-y-4">
      {faqs.map((faq, index) => (
        <motion.div
          // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.3,
            delay: index * 0.1,
            ease: "easeOut",
          }}
          className="border border-[#e4e4e4] rounded-lg overflow-hidden"
        >
          {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
          <button
            onClick={() => toggleFaq(index)}
            className="w-full flex items-center justify-between p-4 text-left"
            aria-expanded={openIndex === index}
          >
            <span className="font-medium text-secondary-500">{faq.question}</span>
            <div className="text-primary-500 flex-shrink-0 ml-2">
              {openIndex === index ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
          </button>

          <AnimatePresence>
            {openIndex === index && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{
                  height: "auto",
                  opacity: 1,
                  transition: {
                    height: {
                      duration: 0.3,
                    },
                    opacity: {
                      duration: 0.3,
                      delay: 0.1,
                    },
                  },
                }}
                exit={{
                  height: 0,
                  opacity: 0,
                  transition: {
                    height: {
                      duration: 0.3,
                    },
                    opacity: {
                      duration: 0.2,
                    },
                  },
                }}
                className="overflow-hidden"
              >
                <div className="px-4 py-6 text-[#7a8a9a] leading-relaxed border-t border-[#e4e4e4]">{faq.answer}</div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  )
}

