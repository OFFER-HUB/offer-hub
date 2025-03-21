"use client"

import { useState } from "react"
import { FaqCategories } from "./faq-categories"
import { FaqAccordion } from "./faq-accordion"
import { FaqSupport } from "./faq-support"
import { HelpCircle, CreditCard, Users, Briefcase, Shield, Settings } from "lucide-react"

// FAQ data structure
const faqData = {
  "General Questions": [
    {
      question: "What is Offer Hub?",
      answer:
        "Offer Hub is a platform that connects talented freelancers with clients looking for professional services. Our platform makes it easy to find the right talent for your project or find work opportunities if you're a freelancer.",
    },
    {
      question: "How do I create an account?",
      answer:
        "Click on the 'Sign Up' button on the homepage, fill in your details, verify your email address, and complete your profile information.",
    },
    {
      question: "Is Offer Hub free to use?",
      answer:
        "Offer Hub offers both free and premium plans. The basic features are available for free, while advanced features require a subscription.",
    },
    {
      question: "Which countries does Offer Hub support?",
      answer:
        "Offer Hub is available worldwide, with specific payment methods and features varying by region. Check our regional availability page for details.",
    },
  ],
  "Payments & Billing": [
    {
      question: "What payment methods are accepted?",
      answer:
        "We accept credit/debit cards, PayPal, bank transfers, and various regional payment methods depending on your location.",
    },
    {
      question: "How does the payment protection work?",
      answer:
        "Our escrow system holds funds until both parties confirm the work is completed satisfactorily, protecting both clients and freelancers.",
    },
  ],
  "Security & Privacy": [
    {
      question: "How does Offer Hub protect my data?",
      answer:
        "We use industry-standard encryption and security protocols to protect your data. All information is stored on secure servers with regular security audits.",
    },
    {
      question: "Is my payment information secure?",
      answer:
        "Yes, all payment information is encrypted and processed through secure payment gateways that comply with PCI DSS standards. We don't store your full credit card details on our servers.",
    },
    {
      question: "How can I keep my account secure?",
      answer:
        "Use a strong password, enable two-factor authentication, regularly review your account activity, and never share your login credentials.",
    },
    {
      question: "What should I do if I suspect unauthorized activity?",
      answer:
        "Immediately change your password, enable two-factor authentication if not already active, and contact our support team through the Help Center.",
    },
  ],
  "Technical Support": [
    {
      question: "What browsers are supported?",
      answer:
        "Offer Hub works best on the latest versions of Chrome, Firefox, Safari, and Edge. We recommend keeping your browser updated for optimal performance.",
    },
    {
      question: "Is there a mobile app available?",
      answer:
        "Yes, we have mobile apps for both iOS and Android devices. You can download them from the App Store or Google Play Store. The mobile apps allow you to manage your projects, communicate with clients or freelancers, and receive notifications on the go.",
    },
    {
      question: "How do I reset my password?",
      answer:
        "Click on the 'Forgot Password' link on the login page, enter your email address, and follow the instructions sent to your email to reset your password.",
    },
    {
      question: "What should I do if I encounter a technical issue?",
      answer:
        "First, try refreshing the page or clearing your browser cache. If the issue persists, check our status page for any known outages, or contact our technical support team.",
    },
  ],
  "For Clients": [
    {
      question: "How do I post a project?",
      answer:
        "Log in to your account, click on 'Post a Project', fill in the project details including requirements and budget, then publish it to start receiving proposals.",
    },
    {
      question: "How do I choose the right freelancer?",
      answer:
        "Review freelancer profiles, portfolios, ratings, and reviews. You can also conduct interviews or request small test projects before making your final decision.",
    },
  ],
  "For Freelancers": [
    {
      question: "How do I find projects?",
      answer:
        "Browse the project marketplace, use search filters to find relevant opportunities, or set up job alerts to be notified of new projects matching your skills.",
    },
    {
      question: "How and when do I get paid?",
      answer:
        "Payment terms vary by project. For fixed-price projects, funds are released upon milestone completion. For hourly projects, payments are processed weekly based on tracked hours.",
    },
  ],
}

export default function FaqContainer() {
  const [activeCategory, setActiveCategory] = useState("General Questions")

  const categories = Object.keys(faqData)

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-secondary-500 mb-4">Frequently Asked Questions</h1>
        <p className="text-[#7a8a9a] max-w-2xl mx-auto">
          Find answers to the most common questions about Offer Hub and how our platform works.
        </p>
      </div>

      <FaqCategories categories={categories} activeCategory={activeCategory} setActiveCategory={setActiveCategory} />

      <div className="mt-12">
        <div className="flex items-center gap-3 mb-6">
          {activeCategory === "General Questions" && (
            <div className="w-8 h-8 rounded-full bg-[#e4f7f7] flex items-center justify-center">
              <HelpCircle size={20} className="text-primary-500" />
            </div>
          )}
          {activeCategory === "Payments & Billing" && (
            <div className="w-8 h-8 rounded-full bg-[#e4f7f7] flex items-center justify-center">
              <CreditCard size={20} className="text-primary-500" />
            </div>
          )}
          {activeCategory === "For Clients" && (
            <div className="w-8 h-8 rounded-full bg-[#e4f7f7] flex items-center justify-center">
              <Users size={20} className="text-primary-500" />
            </div>
          )}
          {activeCategory === "For Freelancers" && (
            <div className="w-8 h-8 rounded-full bg-[#e4f7f7] flex items-center justify-center">
              <Briefcase size={20} className="text-primary-500" />
            </div>
          )}
          {activeCategory === "Security & Privacy" && (
            <div className="w-8 h-8 rounded-full bg-[#e4f7f7] flex items-center justify-center">
              <Shield size={20} className="text-primary-500" />
            </div>
          )}
          {activeCategory === "Technical Support" && (
            <div className="w-8 h-8 rounded-full bg-[#e4f7f7] flex items-center justify-center">
              <Settings size={20} className="text-primary-500" />
            </div>
          )}
          <h2 className="text-2xl font-bold text-secondary-500">{activeCategory}</h2>
        </div>

        <FaqAccordion faqs={faqData[activeCategory as keyof typeof faqData]} />
      </div>

      <FaqSupport />
    </div>
  )
}

