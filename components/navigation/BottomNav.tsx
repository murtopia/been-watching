'use client'

import { usePathname, useRouter } from 'next/navigation'

export default function BottomNav({ onSearchOpen }: { onSearchOpen?: () => void }) {
  const pathname = usePathname()
  const router = useRouter()

  const tabs = [
    { id: 'feed', label: '🏠 Feed', path: '/' },
    { id: 'search', label: '+', path: null },
    { id: 'myshows', label: '📚 My Shows', path: '/myshows' },
  ]

  const handleTabClick = (tab: typeof tabs[0]) => {
    if (tab.id === 'search') {
      onSearchOpen?.()
    } else if (tab.path) {
      router.push(tab.path)
    }
  }

  return (
    <nav
      className="tab-bar"
      style={{
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)'
      }}
    >
      {tabs.map((tab) => {
        const isActive = tab.path === pathname

        if (tab.id === 'search') {
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab)}
              className="tab-add"
            >
              {tab.label}
            </button>
          )
        }

        return (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab)}
            className={`tab-item ${isActive ? 'active' : ''}`}
          >
            {tab.label}
          </button>
        )
      })}
    </nav>
  )
}