'use client'

import { useState } from 'react'
import TierCards from './TierCards'
import MemberStats from './MemberStats'
import MembershipSignupForm from './MembershipSignupForm'

export default function MembershipPageClient() {
  const [selectedTier, setSelectedTier] = useState('')

  return (
    <>
      <TierCards onSelectTier={setSelectedTier} />
      <MemberStats />
      <MembershipSignupForm selectedTier={selectedTier} />
    </>
  )
}
