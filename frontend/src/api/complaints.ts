import api from '@/lib/api'
import type {
  Complaint,
  ComplaintListItem,
  ComplaintActivity,
  ComplaintAttachment,
  CreateComplaintPayload,
  UpdateComplaintStatusPayload,
  PublicComplaintTrack,
} from '@/types/complaints'

export interface PaginatedComplaints {
  data: ComplaintListItem[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export async function getAllComplaints(params?: {
  status?: string
  category?: string
  complainant_type?: string
  city?: string
  search?: string
  page?: number
}): Promise<PaginatedComplaints> {
  const response = await api.get('/complaints', { params })
  return response.data.data
}

export async function getMyComplaints(page = 1): Promise<PaginatedComplaints> {
  const response = await api.get('/complaints/my-complaints', { params: { page } })
  return response.data.data
}

export async function getComplaint(id: number): Promise<Complaint> {
  const response = await api.get(`/complaints/${id}`)
  return response.data.data
}

export async function createComplaint(payload: CreateComplaintPayload): Promise<Complaint> {
  const response = await api.post('/complaints', payload)
  return response.data.data
}

export async function updateComplaintStatus(
  id: number,
  payload: UpdateComplaintStatusPayload,
): Promise<Complaint> {
  const response = await api.put(`/complaints/${id}/status`, payload)
  return response.data.data
}

export async function assignComplaint(
  id: number,
  assigned_to_id: number,
): Promise<Complaint> {
  const response = await api.post(`/complaints/${id}/assign`, { assigned_to_id })
  return response.data.data
}

export async function addComplaintComment(
  id: number,
  body: string,
): Promise<ComplaintActivity> {
  const response = await api.post(`/complaints/${id}/comments`, { body })
  return response.data.data
}

export async function uploadComplaintAttachment(
  id: number,
  file: File,
): Promise<ComplaintAttachment> {
  const formData = new FormData()
  formData.append('attachment', file)
  const response = await api.post(`/complaints/${id}/attachments`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data.data
}

export async function trackComplaint(reference: string): Promise<PublicComplaintTrack> {
  const response = await api.get(`/complaints/track/${reference}`)
  return response.data.data
}
