export type Status = 'Open' | 'InProgress' | 'Resolved' | 'Urgent'
export type Priority = 'Low' | 'Medium' | 'High'
export type NotifType = 'email' | 'sms'

export interface User {
  id: string
  fullName: string
  email: string
  mobile?: string
  isAdmin: boolean
  createdAt: Date
}

export interface Department {
  id: number
  name: string
  contactEmail?: string
}

export interface Category {
  id: number
  name: string
  departmentId: number
  department?: Department
}

export interface Complaint {
  id: number
  referenceNumber: string
  userId?: string
  user?: User
  categoryId: number
  category?: Category
  title: string
  description: string
  photoUrl?: string
  latitude?: number
  longitude?: number
  address?: string
  district?: string
  status: Status
  priority: Priority
  createdAt: Date
  updatedAt: Date
  statusHistory?: StatusHistory[]
}

export interface StatusHistory {
  id: number
  complaintId: number
  status: Status
  notes?: string
  changedAt: Date
}

export interface Notification {
  id: number
  complaintId: number
  type: NotifType
  recipient: string
  message: string
  sentAt: Date
  deliveryStatus: string
}

export interface ClusterData {
  cluster_id: number
  centroid_lat: number
  centroid_lng: number
  complaint_count: number
  top_category: string
  priority: 'Critical' | 'High' | 'Medium' | 'Low'
}

export interface HotzoneResult {
  clusters: ClusterData[]
  heatmap_points: [number, number, number][]
  k_used: number
  total_complaints: number
  generated_at: string
}
