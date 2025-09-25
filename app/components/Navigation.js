'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Navigation() {
  const pathname = usePathname()
  const [isManager, setIsManager] = useState(false)
  
  const isPropertiesPage = pathname === '/properties'
  const isDashboardPage = pathname === '/dashboard'

  useEffect(() => {
    // Check if user is logged in as manager
    const userRole = localStorage.getItem('userRole')
    setIsManager(userRole === 'manager')
  }, [pathname]) // Re-check when route changes

  const handleLogout = () => {
    localStorage.removeItem('userRole')
    setIsManager(false)
    window.location.href = '/properties'
  }

  return (
    <div className="bg-teal-800 text-white px-4 py-2">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/properties" className="font-bold hover:text-teal-200">
            Flex Living
          </Link>
          <span className="text-teal-200 text-sm">|</span>
          <span className="text-sm text-teal-100">
            {isDashboardPage ? 'Manager Portal' : 'Guest Portal'}
          </span>
        </div>
        
        <div className="flex gap-4 text-sm items-center">
          {/* Only show Browse Properties if NOT on properties page */}
          {!isPropertiesPage && (
            <Link 
              href="/properties" 
              className="hover:text-teal-200"
            >
              Browse Properties
            </Link>
          )}
          
          {/* Only show Dashboard if manager is logged in */}
          {isManager ? (
            <>
              {!isDashboardPage && (
                <Link 
                  href="/dashboard" 
                  className="hover:text-teal-200"
                >
                  Manager Dashboard
                </Link>
              )}
              <button 
                onClick={handleLogout}
                className="hover:text-teal-200 text-xs bg-teal-700 px-3 py-1 rounded"
              >
                Logout
              </button>
            </>
          ) : (
            // Show login link only if not already logged in
            !isDashboardPage && (
              <button
                onClick={() => {
                  // Simple login for demo
                  if (confirm('Login as manager? (Demo only)')) {
                    localStorage.setItem('userRole', 'manager')
                    setIsManager(true)
                  }
                }}
                className="hover:text-teal-200 text-xs"
              >
                Manager Login
              </button>
            )
          )}
        </div>
      </div>
    </div>
  )
}