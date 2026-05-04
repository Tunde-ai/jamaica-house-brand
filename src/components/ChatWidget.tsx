'use client'

import { useState, useRef, useEffect } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const QUICK_REPLIES = [
  { label: 'Products & Pricing', message: 'What products do you sell and how much do they cost?' },
  { label: 'Shipping Info', message: 'What are your shipping options and costs?' },
  { label: 'Catering', message: 'Tell me about your catering services and pricing.' },
  { label: 'Talk to Someone', action: 'whatsapp' as const },
]

const WHATSAPP_URL = 'https://wa.me/17867091027'

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  async function sendMessage(text: string) {
    if (!text.trim()) return

    const userMessage: Message = { role: 'user', content: text.trim() }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          history: messages,
        }),
      })

      const data = await res.json()
      const reply = data.reply || "I'm having trouble right now. Please reach out on WhatsApp at +1 (786) 709-1027!"
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: "I'm having trouble connecting right now. Please reach out on WhatsApp at +1 (786) 709-1027 for immediate help!" },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  function handleQuickReply(reply: typeof QUICK_REPLIES[number]) {
    if ('action' in reply && reply.action === 'whatsapp') {
      window.open(WHATSAPP_URL, '_blank', 'noopener,noreferrer')
      return
    }
    if ('message' in reply) {
      sendMessage(reply.message)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    sendMessage(input)
  }

  return (
    <>
      {/* Chat Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-3 z-50 flex h-14 w-14 sm:bottom-5 sm:right-5 items-center justify-center rounded-full bg-brand-gold shadow-lg transition-all duration-200 hover:scale-110 hover:bg-brand-gold-light hover:shadow-xl"
          style={{ boxShadow: '0 4px 15px rgba(196, 169, 97, 0.4)' }}
          aria-label="Open chat"
        >
          <span className="text-2xl">🥘</span>
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-[70px] right-3 z-50 flex w-[calc(100vw-24px)] max-w-[320px] sm:bottom-20 sm:right-5 sm:w-[360px] sm:max-w-[360px] md:w-[380px] md:max-w-[380px] flex-col overflow-hidden rounded-xl border-2 border-brand-gold bg-white shadow-2xl" style={{ height: 'min(450px, calc(100dvh - 140px))', boxShadow: '0 10px 40px rgba(0,0,0,0.3)' }}>
          {/* Header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-[#2D2D2D] to-[#1A1A1A] text-brand-gold px-3 py-3 sm:px-4 rounded-t-xl">
            <div className="flex items-center gap-2.5">
              <div className="text-2xl sm:text-3xl min-w-[32px] sm:min-w-[36px] flex-shrink-0">
                🥘
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm sm:text-base font-semibold text-brand-gold m-0">Chef's Chat</h3>
                <p className="text-xs text-gray-400 m-0 mt-0.5">Ask about our products</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="flex h-11 w-11 items-center justify-center text-brand-gold text-3xl bg-none border-none cursor-pointer flex-shrink-0 transition-colors hover:bg-white/10"
              aria-label="Close chat"
            >
              ×
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 sm:px-4 sm:py-4 bg-white">
            {messages.length === 0 && (
              <div className="space-y-3">
                <p className="text-sm text-gray-700">
                  Hey there! 🔥 What would you like to know about our authentic Jamaican jerk sauce?
                </p>
                <div className="flex flex-wrap gap-2">
                  {QUICK_REPLIES.map((reply) => (
                    <button
                      key={reply.label}
                      onClick={() => handleQuickReply(reply)}
                      className="rounded-full border border-brand-gold/30 bg-brand-gold/10 px-3 py-1.5 text-xs font-medium text-brand-gold transition-colors hover:bg-brand-gold/20"
                    >
                      {reply.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`mb-3 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] whitespace-pre-line rounded-lg px-3 py-2.5 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-brand-gold text-brand-dark'
                      : 'bg-gray-100 border-l-3 border-brand-gold text-gray-800'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="mb-3 flex justify-start">
                <div className="flex gap-1.5 rounded-lg bg-gray-100 border-l-3 border-brand-gold px-4 py-3">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-brand-gold" style={{ animationDelay: '0ms' }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-brand-gold" style={{ animationDelay: '150ms' }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-brand-gold" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* WhatsApp Banner */}
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mx-4 mb-2 flex items-center gap-2 rounded-lg bg-[#25D366]/10 px-3 py-2 text-xs text-[#25D366] transition-colors hover:bg-[#25D366]/20"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Chat with us on WhatsApp
          </a>

          {/* Input */}
          <form onSubmit={handleSubmit} className="border-t border-gray-200 px-3 py-2.5 sm:px-4 sm:py-3 bg-white">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask us anything..."
                disabled={isLoading}
                className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-500 outline-none transition-colors focus:border-brand-gold focus:ring-1 focus:ring-brand-gold disabled:opacity-50 min-h-[44px]"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="flex h-11 w-11 items-center justify-center rounded-md bg-brand-gold text-brand-dark transition-colors hover:bg-brand-gold-light disabled:opacity-30 flex-shrink-0"
                aria-label="Send message"
              >
                <span className="text-lg font-bold">→</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}
