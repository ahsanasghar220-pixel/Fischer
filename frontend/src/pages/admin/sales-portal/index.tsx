import { useState } from 'react'
import NewOrderForm from './NewOrderForm'
import MyOrders from './MyOrders'
import NewComplaintForm from './NewComplaintForm'
import MyComplaints from './MyComplaints'

type TabId = 'new_order' | 'my_orders' | 'new_complaint' | 'my_complaints'

const TABS: { id: TabId; label: string }[] = [
  { id: 'new_order', label: 'New Order' },
  { id: 'my_orders', label: 'My Orders' },
  { id: 'new_complaint', label: 'New Complaint' },
  { id: 'my_complaints', label: 'My Complaints' },
]

export default function SalesPortal() {
  const [activeTab, setActiveTab] = useState<TabId>('new_order')

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 pt-5 pb-3">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Field Portal</h1>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
            Place orders and file complaints from the field
          </p>
        </div>

        {/* Tab Bar */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={[
                'flex-1 py-3 text-sm font-medium transition-colors',
                activeTab === tab.id
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200',
              ].join(' ')}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-4 py-5">
        {activeTab === 'new_order' && <NewOrderForm />}
        {activeTab === 'my_orders' && <MyOrders />}
        {activeTab === 'new_complaint' && <NewComplaintForm />}
        {activeTab === 'my_complaints' && <MyComplaints />}
      </div>
    </div>
  )
}
