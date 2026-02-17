'use client'

interface QuickAddButtonProps {
  productId: string
  productName: string
}

export default function QuickAddButton({ productId, productName }: QuickAddButtonProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    console.log('Add to cart:', productName)
    // Phase 3 will wire this to actual cart state management
  }

  return (
    <button
      onClick={handleClick}
      className="w-full bg-brand-gold text-brand-dark font-semibold py-2 rounded-md hover:bg-brand-gold-light transition-colors mt-3"
    >
      Add to Cart
    </button>
  )
}
