import { auth } from '@/lib/auth'
import PredictionsClient from './PredictionsClient'

export const metadata = { title: 'Complaint Predictions — LankaFix Admin' }

export default async function PredictionsPage() {
  const session = await auth()
  const departmentId = session?.user?.departmentId ?? null
  return <PredictionsClient departmentId={departmentId} />
}
