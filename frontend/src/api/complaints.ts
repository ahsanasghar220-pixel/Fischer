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

// Backend returns { success, data: items[], meta: { current_page, last_page, ... } }
// Flatten into PaginatedComplaints so callers get a consistent shape.
function flattenPaginated(raw: {
  data: ComplaintListItem[]
  meta: { current_page: number; last_page: number; per_page: number; total: number }
}): PaginatedComplaints {
  return {
    data: raw.data,
    current_page: raw.meta.current_page,
    last_page: raw.meta.last_page,
    per_page: raw.meta.per_page,
    total: raw.meta.total,
  }
}

export async function getAllComplaints(params?: {
  status?: string
  category?: string
  complainant_type?: string
  city?: string
  search?: string
  page?: number
}): Promise<PaginatedComplaints> {
  const response = await api.get('/api/complaints', { params })
  return flattenPaginated(response.data)
}

export async function getMyComplaints(page = 1): Promise<PaginatedComplaints> {
  const response = await api.get('/api/complaints/my-complaints', { params: { page } })
  return flattenPaginated(response.data)
}

export async function getComplaint(id: number): Promise<Complaint> {
  const response = await api.get(`/api/complaints/${id}`)
  return response.data.data
}

export async function createComplaint(payload: CreateComplaintPayload): Promise<Complaint> {
  const response = await api.post('/api/complaints', payload)
  return response.data.data.complaint
}

export async function updateComplaintStatus(
  id: number,
  payload: UpdateComplaintStatusPayload,
): Promise<Complaint> {
  const response = await api.put(`/api/complaints/${id}/status`, payload)
  return response.data.data
}

export async function assignComplaint(
  id: number,
  assigned_to_id: number,
): Promise<Complaint> {
  const response = await api.post(`/api/complaints/${id}/assign`, { assigned_to_id })
  return response.data.data
}

export async function addComplaintComment(
  id: number,
  body: string,
): Promise<ComplaintActivity> {
  const response = await api.post(`/api/complaints/${id}/comments`, { body })
  return response.data.data
}

export async function uploadComplaintAttachment(
  id: number,
  file: File,
): Promise<ComplaintAttachment> {
  const formData = new FormData()
  formData.append('file', file)
  const response = await api.post(`/api/complaints/${id}/attachments`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data.data
}

export async function trackComplaint(reference: string): Promise<PublicComplaintTrack> {
  const response = await api.get(`/api/complaints/track/${reference}`)
  return response.data.data
}
