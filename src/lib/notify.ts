import { prisma } from '@/lib/prisma'
import { sendConfirmationEmail, sendStatusUpdateEmail } from '@/lib/email'
import { sendSms } from '@/lib/sms'

export async function notifyComplaintSubmitted(params: {
  complaintId: number
  userId: string
  referenceNumber: string
  title: string
  category: string
  district: string
}): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: params.userId },
      select: { email: true },
    })
    if (!user?.email) return

    const sent = await sendConfirmationEmail(user.email, {
      referenceNumber: params.referenceNumber,
      title: params.title,
      category: params.category,
      district: params.district,
    })

    if (sent) {
      await prisma.notification.create({
        data: {
          complaintId: params.complaintId,
          type: 'email',
          recipient: user.email,
          message: `Confirmation: ${params.referenceNumber} received.`,
          deliveryStatus: 'sent',
        },
      })
    }
  } catch {
    // notifications are best-effort and must not break the request
  }
}

export async function notifyStatusUpdated(params: {
  complaintId: number
  referenceNumber: string
  title: string
  status: string
  notes?: string
}): Promise<void> {
  try {
    const complaint = await prisma.complaint.findUnique({
      where: { id: params.complaintId },
      include: { user: { select: { email: true, mobile: true } } },
    })
    if (!complaint?.user) return

    const { email, mobile } = complaint.user

    if (email) {
      const sent = await sendStatusUpdateEmail(email, {
        referenceNumber: params.referenceNumber,
        title: params.title,
        status: params.status,
        notes: params.notes,
      })
      if (sent) {
        await prisma.notification.create({
          data: {
            complaintId: params.complaintId,
            type: 'email',
            recipient: email,
            message: `Status updated to ${params.status} for ${params.referenceNumber}.`,
            deliveryStatus: 'sent',
          },
        })
      }
    }

    if (mobile) {
      const body = `LankaFix: Your complaint ${params.referenceNumber} is now ${params.status}.${params.notes ? ` Note: ${params.notes}` : ''}`
      const sent = await sendSms(mobile, body)
      if (sent) {
        await prisma.notification.create({
          data: {
            complaintId: params.complaintId,
            type: 'sms',
            recipient: mobile,
            message: body,
            deliveryStatus: 'sent',
          },
        })
      }
    }
  } catch {
    // notifications are best-effort and must not break the request
  }
}
