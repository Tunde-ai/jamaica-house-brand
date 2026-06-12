import { Metadata } from 'next'
import CustomLabelsClient from './CustomLabelsClient'

export const metadata: Metadata = {
  title: 'Custom Label Jerk Sauce — Corporate Events, Gifts & Parties',
  description: 'Create custom-labeled Jamaica House Brand jerk sauce bottles for corporate events, birthday parties, weddings, and gifts. Your logo, your message, our legendary sauce. 2-case minimum.',
  openGraph: {
    title: 'Custom Label Jerk Sauce | Jamaica House Brand',
    description: 'Your brand. Our legendary sauce. Custom-labeled bottles for events, gifts & more.',
  },
}

export default function CustomLabelsPage() {
  return <CustomLabelsClient />
}
