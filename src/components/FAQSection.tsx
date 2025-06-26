import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "Why invest in Siargao villas now?",
    answer: "Siargao is experiencing unprecedented growth as the Philippines' premier surfing destination. With the recent infrastructure improvements and the 511% increase in foreign arrivals, property values have risen 8% in 2024 alone. Our pre-selling villas offer early investors the opportunity to secure luxury properties at today's prices before further appreciation."
  },
  {
    question: "What makes these villas special compared to other Siargao properties?",
    answer: "Our luxury villas feature cutting-edge smart home automation, solar-powered energy systems, and infinity pools - amenities rarely found in Siargao's current market. Located just 1 minute from Sayak Airport and 30 minutes from Cloud 9, they offer the perfect blend of convenience and tropical serenity."
  },
  {
    question: "How close are the villas to popular Siargao attractions?",
    answer: "We're perfectly positioned in Del Carmen, giving you the best of both worlds. Cloud 9 and General Luna are just 30 minutes away, while you're only 25 minutes from Magpupungko tide pools and 35 minutes from Secret Beach. You'll have easy access to all of Siargao's must-see spots while enjoying a peaceful retreat."
  },
  {
    question: "What's included in the pre-selling package?",
    answer: "Each villa comes with premium SMEG appliances, smart home automation systems, solar power infrastructure, and an infinity pool. Villa Anna starts at ₱15M and Villa Perles is priced at ₱28M-₱35M. All properties include dedicated parking and 24/7 security."
  },
  {
    question: "Can foreigners buy these villas in the Philippines?",
    answer: "While foreigners cannot directly own land in the Philippines, we offer several legal ownership structures including long-term leases (up to 50 years, renewable) and partnership arrangements. Our legal team will guide you through the best option for your situation."
  },
  {
    question: "What's the expected rental income potential?",
    answer: "Siargao's tourism boom creates excellent rental opportunities. Similar luxury properties near popular surf spots generate ₱8,000-15,000 per night during peak season. With platforms like Airbnb and the island's growing reputation, many investors see 8-12% annual returns on their villa investments."
  },
  {
    question: "When will the villas be ready for occupancy?",
    answer: "Villa Anna is under construction with expected completion in August 2025. Villa Perles is available for immediate development. We provide regular construction updates and maintain strict quality standards throughout the building process."
  },
  {
    question: "What financing options are available?",
    answer: "We offer flexible payment terms for pre-selling purchases, including installment plans and construction milestone payments. Our sales team can discuss various financing arrangements to make your Siargao villa investment as smooth as possible."
  }
];

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12 lg:mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-playfair font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to know about investing in luxury villas in Siargao
            </p>
          </motion.div>

          <div className="space-y-4">
            {faqData.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-5 text-left flex justify-between items-center hover:bg-gray-50 transition-colors duration-200"
                >
                  <h3 className="text-lg font-semibold text-gray-900 pr-4">
                    {faq.question}
                  </h3>
                  <div className="flex-shrink-0">
                    {openIndex === index ? (
                      <ChevronUp className="w-5 h-5 text-skypearl" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </button>
                
                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-5">
                        <p className="text-gray-700 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <p className="text-gray-600 mb-6">
              Still have questions about our luxury villas in Siargao?
            </p>
            <a
              href="#contact"
              className="inline-flex items-center justify-center px-6 py-3 bg-skypearl text-white font-semibold rounded-md hover:bg-skypearl/90 transition-colors duration-200"
            >
              Get in Touch
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;