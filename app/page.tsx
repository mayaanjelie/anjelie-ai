'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Send, Sparkles, Leaf, Droplet, Zap, TrendingDown, ShoppingBag, AlertCircle, Download } from 'lucide-react'

export default function SustainableFashionAI() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm your sustainable fashion design AI. I'll help you create beautiful designs while minimizing environmental impact. Try: 'Create a summer dress with eco-friendly materials'"
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [currentDesign, setCurrentDesign] = useState<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    ctx.fillStyle = '#f9fafb'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    if (currentDesign) {
      drawDesign(currentDesign, ctx)
    }
  }, [currentDesign])

  const drawDesign = (design: any, ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = '#f9fafb'
    ctx.fillRect(0, 0, 440, 550)
    
    ctx.strokeStyle = '#1f2937'
    ctx.lineWidth = 2
    
    if (design.type === 'dress') {
      ctx.beginPath()
      ctx.moveTo(200, 150)
      ctx.lineTo(280, 150)
      ctx.arc(240, 150, 40, Math.PI, 0, false)
      ctx.lineTo(320, 150)
      ctx.quadraticCurveTo(340, 300, 330, 450)
      ctx.lineTo(150, 450)
      ctx.quadraticCurveTo(140, 300, 160, 150)
      ctx.closePath()
      ctx.stroke()
      
      ctx.fillStyle = design.color
      ctx.globalAlpha = 0.3
      ctx.fill()
      ctx.globalAlpha = 1
      
      if (design.pattern === 'botanical') {
        for (let i = 0; i < 12; i++) {
          const x = 180 + Math.random() * 120
          const y = 200 + Math.random() * 200
          ctx.fillStyle = '#10b981'
          ctx.beginPath()
          ctx.arc(x, y, 4, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      
      if (design.sleeves === 'flowing') {
        ctx.strokeStyle = '#1f2937'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(160, 150)
        ctx.quadraticCurveTo(120, 200, 130, 280)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(320, 150)
        ctx.quadraticCurveTo(360, 200, 350, 280)
        ctx.stroke()
      }
    } else if (design.type === 'top') {
      ctx.beginPath()
      ctx.moveTo(180, 150)
      ctx.lineTo(300, 150)
      ctx.arc(240, 150, 60, Math.PI, 0, false)
      ctx.lineTo(320, 150)
      ctx.lineTo(330, 300)
      ctx.lineTo(150, 300)
      ctx.lineTo(160, 150)
      ctx.closePath()
      ctx.stroke()
      
      ctx.fillStyle = design.color
      ctx.globalAlpha = 0.3
      ctx.fill()
      ctx.globalAlpha = 1
    }
    
    ctx.fillStyle = '#10b981'
    ctx.font = 'bold 16px sans-serif'
    ctx.fillText('♻️ Eco-Friendly Design', 20, 30)
  }

  const handleSubmit = () => {
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setIsLoading(true)

    setTimeout(() => {
      const aiResponse = generateSustainableResponse(userMessage)
      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse.message }])
      if (aiResponse.design) {
        setCurrentDesign(aiResponse.design)
      }
      setIsLoading(false)
    }, 1500)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const generateSustainableResponse = (prompt: string) => {
    const lowerPrompt = prompt.toLowerCase()
    
    let design = null
    let message = ''

    if (lowerPrompt.includes('dress') || lowerPrompt.includes('maxi') || lowerPrompt.includes('gown')) {
      const isEcoFriendly = lowerPrompt.includes('eco') || lowerPrompt.includes('sustainable') || lowerPrompt.includes('organic')
      
      design = {
        type: 'dress',
        color: lowerPrompt.includes('green') ? '#10b981' : 
               lowerPrompt.includes('blue') ? '#3b82f6' : 
               lowerPrompt.includes('earth') || lowerPrompt.includes('natural') ? '#92400e' : '#8b5cf6',
        pattern: lowerPrompt.includes('botanical') || lowerPrompt.includes('floral') ? 'botanical' : 'solid',
        sleeves: lowerPrompt.includes('flowing') || lowerPrompt.includes('sleeve') ? 'flowing' : 'sleeveless',
        sustainable: isEcoFriendly
      }
      
      message = `✨ Beautiful sustainable design created!\n\n**Design Specifications:**\n• Style: Flowing ${lowerPrompt.includes('maxi') ? 'maxi' : ''} dress\n• Aesthetic: ${design.pattern === 'botanical' ? 'Botanical print' : 'Minimalist solid'}\n\n🌱 **SUSTAINABILITY ANALYSIS:**\n\n**Recommended Fabric:** Organic Cotton (GOTS Certified)\n• Carbon footprint: 46% lower than conventional cotton\n• Water usage: 91% less water required\n• No toxic pesticides\n\n**Alternative Options:**\n1. Tencel™ Lyocell - Eucalyptus-based, biodegradable\n2. Recycled Polyester - Made from ocean plastics\n3. Hemp Blend - Carbon negative, requires no irrigation\n\n💧 **Impact Metrics:**\n• Water saved: ~2,700 liters vs conventional\n• CO2 reduced: ~5.5 kg per garment\n• Microplastic prevention: 100%\n\n**Suggested Dyes:** Natural indigo or plant-based dyes\n**Production:** Fair Trade certified factories in Portugal\n\nWould you like me to suggest sustainable button/zipper options or adjust the design?`
      
    } else if (lowerPrompt.includes('top') || lowerPrompt.includes('blouse') || lowerPrompt.includes('shirt')) {
      design = {
        type: 'top',
        color: lowerPrompt.includes('white') || lowerPrompt.includes('natural') ? '#f3f4f6' : 
               lowerPrompt.includes('black') ? '#1f2937' : '#fbbf24',
        sustainable: true
      }
      
      message = `✨ Sustainable top design ready!\n\n**Design Details:**\n• Style: Modern fitted top\n• Color: ${design.color === '#f3f4f6' ? 'Natural white' : design.color === '#1f2937' ? 'Deep black' : 'Warm earth tone'}\n\n🌱 **SUSTAINABILITY RECOMMENDATIONS:**\n\n**Recommended Fabric:** Organic Linen\n• Naturally pest-resistant (no pesticides needed)\n• Fully biodegradable\n• Carbon negative crop\n• Durable - lasts 2-3x longer than cotton\n\n**Sustainable Alternatives:**\n1. Peace Silk - No harm to silkworms\n2. Piñatex - Made from pineapple leaves\n3. Modal - Beechwood fiber, closed-loop production\n\n💚 **Environmental Impact:**\n• 50% less energy than polyester production\n• Zero microplastic shedding\n• Compostable at end of life\n\n**Trim Suggestions:**\n• Coconut shell buttons (plastic-free)\n• Organic cotton thread\n• Natural rubber elastic\n\n**Manufacturing:** Recommend solar-powered facility in India with Fair Trade certification\n\nReady to generate tech pack with supplier connections?`
      
    } else {
      message = `I'd love to help you create a sustainable design! Tell me:\n\n• What type of garment? (dress, top, pants, jacket)\n• Preferred style? (casual, formal, bohemian, minimalist)\n• Any specific eco-concerns? (vegan materials, zero waste, recycled, organic)\n• Color palette preferences?\n\nI'll recommend the most sustainable fabrics, dyes, and manufacturing options while creating a beautiful design that aligns with your values! 🌱`
    }

    return { message, design }
  }

  const exportToShopify = () => {
    if (!currentDesign) return
    
    const csvData = `Title,Body (HTML),Vendor,Type,Tags,Option1 Name,Option1 Value,Variant Price,Variant SKU
"Sustainable ${currentDesign.type === 'dress' ? 'Dress' : 'Top'}","<p>Eco-friendly design with sustainability metrics</p>","Anjelie AI","Apparel","sustainable,eco-friendly,organic","Size","M","89.00","ECO-001"`
    
    const blob = new Blob([csvData], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'shopify-product.csv'
    a.click()
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="flex-1 flex flex-col border-r border-green-200 bg-white">
        <div className="border-b border-green-200 p-4 bg-gradient-to-r from-green-600 to-emerald-600">
          <div className="flex items-center gap-2">
            <Leaf className="text-white" size={24} />
            <div>
              <h1 className="text-xl font-bold text-white">Anjelie AI</h1>
              <p className="text-xs text-green-100">Sustainable Fashion Design</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  msg.role === 'user'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={16} className="text-green-600" />
                    <span className="text-xs font-semibold text-green-600">Eco AI Designer</span>
                  </div>
                )}
                <p className="whitespace-pre-line text-sm">{msg.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-green-200 p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Describe your sustainable design idea..."
              className="flex-1 px-4 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
              disabled={isLoading}
            />
            <button
              onClick={handleSubmit}
              disabled={isLoading || !input.trim()}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="w-[500px] flex flex-col bg-white border-l border-green-200">
        <div className="border-b border-green-200 p-4 bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} className="text-green-600" />
            <h2 className="font-semibold text-gray-800">Design Preview</h2>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <canvas
            ref={canvasRef}
            width={440}
            height={550}
            className="border-2 border-green-200 rounded-lg shadow-lg bg-white mx-auto"
          />
          
          {currentDesign && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 mt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-green-800 flex items-center gap-2">
                  <Leaf size={20} />
                  Sustainability Score
                </h3>
                <div className="text-3xl font-bold text-green-600">92/100</div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Droplet size={18} className="text-blue-500" />
                  <div>
                    <div className="text-xs text-gray-600">Water Saved</div>
                    <div className="font-semibold text-gray-800">2,700L</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingDown size={18} className="text-green-500" />
                  <div>
                    <div className="text-xs text-gray-600">CO2 Reduced</div>
                    <div className="font-semibold text-gray-800">5.5kg</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Zap size={18} className="text-yellow-500" />
                  <div>
                    <div className="text-xs text-gray-600">Energy</div>
                    <div className="font-semibold text-gray-800">-46%</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Leaf size={18} className="text-green-600" />
                  <div>
                    <div className="text-xs text-gray-600">Biodegradable</div>
                    <div className="font-semibold text-gray-800">100%</div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Overall Impact</span>
                  <span className="text-green-600 font-semibold">Excellent</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-white rounded-lg border border-green-200">
                <div className="flex items-start gap-2">
                  <AlertCircle size={16} className="text-green-600 mt-0.5" />
                  <div className="text-xs text-gray-700">
                    <strong>Certifications:</strong> GOTS, Fair Trade, OEKO-TEX Standard 100
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-green-200 p-4 bg-green-50">
          <div className="text-xs text-gray-600 text-center mb-3">
            🌍 Every design includes carbon footprint analysis
          </div>
          <button 
            onClick={exportToShopify}
            className="w-full py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all flex items-center justify-center gap-2 font-semibold"
          >
            <Download size={16} />
            Export to Shopify
          </button>
        </div>
      </div>
    </div>
  )
}