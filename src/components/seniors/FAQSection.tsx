'use client'

import { useState } from 'react'

interface FAQSectionProps {
  faqs: { question: string; answer: string }[]
}

export function FAQSection({ faqs }: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  if (!faqs?.length) return null

  return (
    <div className="faq-section">
      <h2 className="faq-title">Frequently Asked Questions</h2>
      {faqs.map((faq, index) => (
        <div
          key={index}
          className={`faq-item${openIndex === index ? ' open' : ''}`}
        >
          <div className="faq-question" onClick={() => setOpenIndex(openIndex === index ? null : index)} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setOpenIndex(openIndex === index ? null : index)}>
            <span>{faq.question}</span>
            <span className="faq-chevron">&#x25BC;</span>
          </div>
          <div className="faq-answer">{faq.answer}</div>
        </div>
      ))}
    </div>
  )
}
