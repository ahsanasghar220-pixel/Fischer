import { useSearchParams } from 'react-router-dom'
import NewOrderForm from './NewOrderForm'
import MyOrders from './MyOrders'
import NewComplaintForm from './NewComplaintForm'
import MyComplaints from './MyComplaints'
import {
  PlusCircleIcon,
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon,
  FolderOpenIcon,
} from '@heroicons/react/24/outline'

type TabId = 'new_order' | 'my_orders' | 'new_complaint' | 'my_complaints'

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'new_order', label: 'New Order', icon: PlusCircleIcon },
  { id: 'my_orders', label: 'My Orders', icon: ClipboardDocumentListIcon },
  { id: 'new_complaint', label: 'Complaint', icon: ExclamationTriangleIcon },
  { id: 'my_complaints', label: 'My Cases', icon: FolderOpenIcon },
]

export default function SalesPortal() {
  const [searchParams, setSearchParams] = useSearchParams()
  const VALID_TABS: TabId[] = ['new_order', 'my_orders', 'new_complaint', 'my_complaints']
  const tabParam = searchParams.get('tab') as TabId | null
  const activeTab: TabId = (tabParam && VALID_TABS.includes(tabParam)) ? tabParam : 'new_order'
  const setActiveTab = (tab: TabId) => setSearchParams({ tab }, { replace: true })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* ── Portal Header ──────────────────────────────── */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
        <div className="px-4 pt-5 pb-2">
          <div className="flex items-baseline gap-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              Field Portal
            </h1>
            <span className="text-xs font-semibold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full uppercase tracking-wide">
              B2B
            </span>
          </div>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
            Place orders and file complaints from the field
          </p>
        </div>

        {/* ── Tab Bar ──────────────────────────────────── */}
        <div className="flex">
          {TABS.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={[
                  'flex-1 flex flex-col items-center gap-1 py-3 text-xs font-semibold transition-all relative',
                  isActive
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300',
                ].join(' ')}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-2' : 'stroke-[1.5]'}`} />
                <span>{tab.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-t-full" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Tab Content ───────────────────────────────── */}
      <div className="px-4 py-5">
        {activeTab === 'new_order' && <NewOrderForm />}
        {activeTab === 'my_orders' && <MyOrders />}
        {activeTab === 'new_complaint' && <NewComplaintForm />}
        {activeTab === 'my_complaints' && <MyComplaints />}
      </div>
    </div>
  )
}
