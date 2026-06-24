import { redirect } from 'next/navigation'

// Custom labels on hold — redirect to homepage until relaunch
export default function CustomLabelSuccessPage() {
  redirect('/')
}
