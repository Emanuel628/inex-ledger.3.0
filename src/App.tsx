import { useEffect, useState, type Dispatch, type SetStateAction } from 'react'
import Transactions from './pages/Transactions'
import Accounts from './pages/Accounts'
import Categories from './pages/Categories'
import Receipts from './pages/Receipts'
import Exports from './pages/Exports'
import Mileage from './pages/Mileage'
import Invoices from './pages/Invoices'
import Messages from './pages/Messages'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'
import Billing from './pages/Billing'
import Subscription from './pages/Subscription'
import PlaceholderPage from './pages/PlaceholderPage'

export type AppPage =
  | 'Transactions'
  | 'Accounts'
  | 'Categories'
  | 'Receipts'
  | 'Mileage'
  | 'Exports'
  | 'Invoices'
  | 'Analytics'
  | 'Messages'
  | 'Settings'
  | 'Billing'
  | 'Subscription'

export type ThemeMode = 'light' | 'dark'

export type PageProps = {
  activePage: AppPage
  onNavigate: (page: AppPage) => void
  sidebarCollapsed: boolean
  setSidebarCollapsed: Dispatch<SetStateAction<boolean>>
  theme: ThemeMode
  setTheme: Dispatch<SetStateAction<ThemeMode>>
}

function App() {
  const [currentPage, setCurrentPage] = useState<AppPage>('Transactions')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [theme, setTheme] = useState<ThemeMode>(() => (
    window.localStorage.getItem('inex-theme') === 'dark' ? 'dark' : 'light'
  ))

  useEffect(() => {
    window.localStorage.setItem('inex-theme', theme)
  }, [theme])

  const pageProps = {
    activePage: currentPage,
    onNavigate: setCurrentPage,
    sidebarCollapsed,
    setSidebarCollapsed,
    theme,
    setTheme,
  }

  if (currentPage === 'Accounts') {
    return <Accounts {...pageProps} />
  }

  if (currentPage === 'Categories') {
    return <Categories {...pageProps} />
  }

  if (currentPage === 'Receipts') {
    return <Receipts {...pageProps} />
  }

  if (currentPage === 'Exports') {
    return <Exports {...pageProps} />
  }

  if (currentPage === 'Mileage') {
    return <Mileage {...pageProps} />
  }

  if (currentPage === 'Invoices') {
    return <Invoices {...pageProps} />
  }

  if (currentPage === 'Messages') {
    return <Messages {...pageProps} />
  }

  if (currentPage === 'Analytics') {
    return <Analytics {...pageProps} />
  }

  if (currentPage === 'Settings') {
    return <Settings {...pageProps} />
  }

  if (currentPage === 'Billing') {
    return <Billing {...pageProps} />
  }

  if (currentPage === 'Subscription') {
    return <Subscription {...pageProps} />
  }

  if (currentPage === 'Transactions') {
    return <Transactions {...pageProps} />
  }

  return <PlaceholderPage {...pageProps} />
}

export default App
