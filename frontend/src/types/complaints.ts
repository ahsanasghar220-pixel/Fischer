export type ComplainantType = 'online_customer' | 'offline_customer' | 'dealer'
export type PurchaseChannel = 'website' | 'dealer' | 'retailer' | 'market' | 'other'
export type ComplaintCategory = 'defect' | 'delivery' | 'missing_item' | 'installation' | 'warranty' | 'other'
export type ComplaintStatus = 'open' | 'assigned' | 'in_progress' | 'resolved' | 'closed'
export type FiledByType = 'salesperson' | 'admin_staff' | 'self'
export type ActivityActionType = 'status_change' | 'assignment' | 'comment' | 'note'

export interface ComplaintAttachment {
  id: number
  complaint_id: number
  file_path: string
  file_name: string
  uploaded_by: number
}

export interface ComplaintActivity {
  id: number
  complaint_id: number
  user_id: number
  user?: { id: number; full_name: string }
  action_type: ActivityActionType
  old_status: ComplaintStatus | null
  new_status: ComplaintStatus | null
  body: string | null
  created_at: string
}

export interface Complaint {
  id: number
  complaint_number: string
  complainant_type: ComplainantType
  customer_id: number | null
  online_order_id: number | null
  b2b_order_id: number | null
  complainant_name: string
  complainant_phone: string
  complainant_city: string
  dealer_purchased_from: string | null
  purchase_channel: PurchaseChannel | null
  approx_purchase_month: number | null
  approx_purchase_year: number | null
  product_id: number | null
  sku_manual: string | null
  product_name_manual: string | null
  serial_number: string | null
  complaint_category: ComplaintCategory
  description: string
  status: ComplaintStatus
  assigned_to: number | null
  assignedTo?: { id: number; full_name: string } | null
  resolved_at: string | null
  resolution_notes: string | null
  filed_by_id: number
  filed_by_type: FiledByType
  filedBy?: { id: number; full_name: string }
  product?: { id: number; name: string; sku: string } | null
  attachments?: ComplaintAttachment[]
  activity_log?: ComplaintActivity[]
  created_at: string
  updated_at: string
}

export interface ComplaintListItem {
  id: number
  complaint_number: string
  complainant_type: ComplainantType
  complainant_name: string
  complainant_phone: string
  complainant_city: string
  complaint_category: ComplaintCategory
  status: ComplaintStatus
  filed_by?: { id: number; full_name: string }
  assigned_to_user?: { id: number; full_name: string } | null
  product_name: string | null
  sku: string | null
  created_at: string
}

export interface CreateComplaintPayload {
  complainant_type: ComplainantType
  complainant_name: string
  complainant_phone: string
  complainant_city: string
  complaint_category: ComplaintCategory
  description: string
  customer_id?: number
  online_order_id?: number
  b2b_order_id?: number
  dealer_purchased_from?: string
  purchase_channel?: PurchaseChannel
  approx_purchase_month?: number
  approx_purchase_year?: number
  product_id?: number
  sku_manual?: string
  product_name_manual?: string
  serial_number?: string
}

export interface UpdateComplaintStatusPayload {
  status: ComplaintStatus
  resolution_notes?: string
}

export interface PublicComplaintTrack {
  complaint_number: string
  complaint_category: ComplaintCategory
  status: ComplaintStatus
  description: string
  created_at: string
  resolved_at: string | null
}
