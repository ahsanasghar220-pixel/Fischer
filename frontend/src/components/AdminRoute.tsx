import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

interface AdminRouteProps {
  children: React.ReactNode
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  const canAccessAdmin = user?.is_admin ||
    user?.roles?.some(r => ['admin', 'super-admin', 'order-manager', 'content-manager', 'salesperson', 'production_manager', 'complaints_manager'].includes(r))

  if (!canAccessAdmin) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
