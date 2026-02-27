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

interface Response {
  keywords: RegExp
  reply: string
}

const RESPONSES: Response[] = [
  {
    keywords: /product|sauce|pikliz|bundle|buy|sell|price|cost|how much|menu/i,
    reply: `Here's what we offer!\n\n🌶️ Original Jerk Sauce\n• 2oz — $6.99\n• 5oz — $11.99\n• 10oz — $18.99\n\n🥕 Escovitch Pikliz (12oz) — $11.99\n\n🎁 Jamaica House Bundle — $24.99 (Save $6!)\nIncludes 2oz + 5oz Jerk Sauce + 12oz Pikliz\n\nAll products are all-natural, zero calories, and made from our 30-year family recipe. Shop at jamaicahousebrand.com/shop`,
  },
  {
    keywords: /ship|deliver|free shipping|express|standard/i,
    reply: `Here are our shipping options:\n\n📦 Standard Shipping — $5.99 (5-7 business days)\n🚀 Express Shipping — $12.99 (2-3 business days)\n🎉 FREE Shipping on orders over $50!\n\nWe currently ship within the US only.`,
  },
  {
    keywords: /cater|event|wedding|corporate|party|reunion|graduation/i,
    reply: `We cater events of all sizes with authentic Jamaican food!\n\nProteins: Jerk Chicken, Curry Goat, Oxtail, Brown Stew Chicken, Escovitch Fish, Curry Chicken\nSides: Rice & Peas, Fried Plantains, Festival, Mac & Cheese, and more\n\nPricing per person:\n• 20–50 guests: $25\n• 51–100 guests: $22\n• 101–200 guests: $20\n• 201–500 guests: $18\n• 500+: $15 (custom menu)\n\nTo book catering, message us on WhatsApp at +1 (786) 709-1027 or fill out the form at jamaicahousebrand.com/catering-services`,
  },
  {
    keywords: /member|family|subscription|subscribe|annual|plan/i,
    reply: `Join the Jamaica House Family!\n\n⭐ Standard Annual — $75/year\n• 13 bottles (5oz) delivered quarterly\n• Only $5.77/bottle + FREE shipping\n• 15% off first year\n\n👑 Premium Annual — $125/year\n• 13 bottles (10oz) delivered quarterly\n• Only $9.62/bottle + FREE shipping\n• Exclusive recipes + VIP event invitations\n\nSign up at jamaicahousebrand.com/family-members`,
  },
  {
    keywords: /recipe|cook|make|chicken|shrimp|salmon|wing|burger|fish/i,
    reply: `We have delicious recipes on our site!\n\n🍗 Authentic Jerk Chicken\n🌮 Jerk Shrimp Tacos\n🐟 Jerk Salmon with Rice & Peas\n🐠 Escovitch Fish\n🍗 Jerk Chicken Wings\n🍔 Pikliz Burger\n\nEach recipe uses our sauces — check them all out at jamaicahousebrand.com/recipes`,
  },
  {
    keywords: /restaurant|location|visit|address|miami|broward|lauderdale|miramar|dine|eat/i,
    reply: `Visit our restaurants!\n\n📍 Jamaica House Miami\n19555 NW 2nd Ave, Miami, FL 33169\n📞 (305) 651-0083\n\n📍 Jamaica House Broward\n3351 W Broward Blvd, Fort Lauderdale, FL 33312\n📞 (954) 530-2698\n\n📍 Jamaica House Miramar — Coming Soon!`,
  },
  {
    keywords: /story|about|who|history|chef|anthony|brand|family/i,
    reply: `Jamaica House Brand was born from 30+ years of restaurant heritage. Chef Anthony grew up in New York with Jamaican parents — his father ran Jamaica House restaurants in South Florida. 92% of restaurant customers asked "Can I buy a bottle of that sauce?" — so we bottled the exact family recipe that made the restaurants famous.\n\nLearn more at jamaicahousebrand.com/our-story`,
  },
  {
    keywords: /ingredient|natural|calorie|healthy|allspice|thyme|scotch bonnet|habanero/i,
    reply: `Our products are made with all-natural ingredients and are zero calories!\n\n🌶️ Jerk Sauce: Allspice, thyme, Scotch bonnet peppers, and our secret family blend\n🥕 Pikliz: Habanero peppers, carrots, onions, vinegar\n\nNo preservatives, no artificial anything — just authentic Jamaican flavor.`,
  },
  {
    keywords: /hello|hi|hey|good morning|good afternoon|good evening|sup|what'?s up/i,
    reply: `Hey there! Welcome to Jamaica House Brand! 👋\n\nI can help you with:\n• Products & pricing\n• Shipping info\n• Catering services\n• Membership plans\n• Recipes\n• Restaurant locations\n\nWhat would you like to know?`,
  },
  {
    keywords: /thank|thanks|appreciate/i,
    reply: `You're welcome! If you need anything else, I'm here to help. You can also reach us on WhatsApp at +1 (786) 709-1027 for personalized support. 🙏`,
  },
  {
    keywords: /help|support|contact|phone|email|reach|talk|speak|person|human|agent/i,
    reply: `You can reach our team directly on WhatsApp for personalized help!\n\n📱 WhatsApp: +1 (786) 709-1027\n\nOr tap the green "Chat with us on WhatsApp" button below.`,
  },
  {
    keywords: /order|track|status|refund|return|cancel/i,
    reply: `For questions about orders, tracking, returns, or refunds, please reach out to our team directly on WhatsApp at +1 (786) 709-1027 — they'll get you sorted right away!`,
  },
]

function getReply(message: string): string {
  for (const response of RESPONSES) {
    if (response.keywords.test(message)) {
      return response.reply
    }
  }
  return `Thanks for your message! I'm not sure about that one, but our team can definitely help.\n\nReach out on WhatsApp at +1 (786) 709-1027 or tap the green button below for personalized support!`
}

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

  function sendMessage(text: string) {
    if (!text.trim()) return

    const userMessage: Message = { role: 'user', content: text.trim() }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    // Simulate a brief typing delay
    setTimeout(() => {
      const reply = getReply(text.trim())
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }])
      setIsLoading(false)
    }, 600)
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
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-brand-gold shadow-lg transition-transform hover:scale-110 hover:bg-brand-gold-light"
          aria-label="Open chat"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-dark">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex w-[360px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#1A1A1A] shadow-2xl sm:bottom-6 sm:right-6" style={{ height: 'min(520px, calc(100dvh - 3rem))' }}>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 bg-brand-gold/10 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-gold text-xs font-bold text-brand-dark">
                JH
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Jamaica House Brand</p>
                <p className="text-xs text-white/50">Ask us anything</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-white/50 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Close chat"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            {messages.length === 0 && (
              <div className="space-y-3">
                <p className="text-sm text-white/70">
                  Welcome! I can help with products, shipping, catering, and more. What would you like to know?
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
                  className={`max-w-[80%] whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-brand-gold text-brand-dark'
                      : 'bg-white/10 text-white/90'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="mb-3 flex justify-start">
                <div className="flex gap-1.5 rounded-2xl bg-white/10 px-4 py-3">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-brand-gold/60" style={{ animationDelay: '0ms' }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-brand-gold/60" style={{ animationDelay: '150ms' }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-brand-gold/60" style={{ animationDelay: '300ms' }} />
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
          <form onSubmit={handleSubmit} className="border-t border-white/10 px-4 py-3">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                disabled={isLoading}
                className="flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-brand-gold/50 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-gold text-brand-dark transition-colors hover:bg-brand-gold-light disabled:opacity-30"
                aria-label="Send message"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}
