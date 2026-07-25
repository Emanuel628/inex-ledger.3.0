import { useEffect, useState } from 'react'
import {
  AlertTriangle,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Coffee,
  Filter,
  Fuel,
  MoreHorizontal,
  Package,
  Plus,
  Search,
  ShoppingBag,
  TrendingDown,
  TrendingUp,
  Upload,
  X,
  type LucideIcon,
} from 'lucide-react'
import type { PageProps } from '../App'
import AppShell from '../components/AppShell'
import useSessionDismissed from '../hooks/useSessionDismissed'

type TransactionStatus = 'Cleared' | 'Needs review' | 'Missing receipt' | 'Draft'

type Transaction = {
  id: number
  date: string
  description: string
  category: string
  account: string
  receipt: 'Attached' | 'Missing' | 'Uploaded'
  status: TransactionStatus
  amount: number
  merchantTone: string
}

const transactions: Transaction[] = [
  {
    id: 1,
    date: 'May 31',
    description: 'Stripe payout',
    category: 'Income',
    account: 'Checking',
    receipt: 'Uploaded',
    status: 'Cleared',
    amount: 2450,
    merchantTone: 'blue',
  },
  {
    id: 2,
    date: 'May 29',
    description: 'Adobe Creative Cloud',
    category: 'Software',
    account: 'Business Card',
    receipt: 'Attached',
    status: 'Cleared',
    amount: -52.99,
    merchantTone: 'red',
  },
  {
    id: 3,
    date: 'May 28',
    description: 'Shell',
    category: 'Fuel',
    account: 'Business Card',
    receipt: 'Missing',
    status: 'Missing receipt',
    amount: -68.45,
    merchantTone: 'yellow',
  },
  {
    id: 4,
    date: 'May 26',
    description: 'Client lunch',
    category: 'Meals',
    account: 'Checking',
    receipt: 'Missing',
    status: 'Needs review',
    amount: -134.86,
    merchantTone: 'coral',
  },
  {
    id: 5,
    date: 'May 24',
    description: 'Google Workspace',
    category: 'Software',
    account: 'Business Card',
    receipt: 'Uploaded',
    status: 'Cleared',
    amount: -14.4,
    merchantTone: 'violet',
  },
  {
    id: 6,
    date: 'May 21',
    description: 'Consulting invoice',
    category: 'Income',
    account: 'Checking',
    receipt: 'Uploaded',
    status: 'Cleared',
    amount: 1800,
    merchantTone: 'green',
  },
]

function Transactions(props: PageProps) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [expandedPanel, setExpandedPanel] = useState<string | null>(null)
  const [noticeVisible, dismissNotice] = useSessionDismissed('transactions-review')

  useEffect(() => {
    document.body.classList.toggle('modal-is-open', drawerOpen)

    return () => document.body.classList.remove('modal-is-open')
  }, [drawerOpen])

  return (
    <AppShell
      {...props}
      searchPlaceholder="Search transactions, merchants, categories"
      overlay={drawerOpen ? <TransactionDrawer onClose={() => setDrawerOpen(false)} /> : null}
    >
        <main className="transactions-page">
          <section className="page-heading">
            <div>
              <p className="eyebrow">Ledger</p>
              <h1>Transactions</h1>
              <p>Review the money coming in and going out. Everything else stays tucked away until you need it.</p>
            </div>
            <button className="primary-button" type="button" onClick={() => setDrawerOpen(true)}>
              <Plus size={18} />
              Add transaction
            </button>
          </section>

          {noticeVisible ? (
            <section className="top-alert" aria-label="Transactions need attention">
              <AlertTriangle size={17} />
              <div>
                <strong>3 transactions need attention</strong>
                <span>Missing receipts and business-use details before export.</span>
              </div>
              <button type="button">Review</button>
              <button className="top-alert-close" type="button" aria-label="Dismiss alert" onClick={dismissNotice}>
                <X size={16} />
              </button>
            </section>
          ) : null}

          <section className="summary-strip" aria-label="Transaction summary">
            <SummaryItem label="Income" value="$42,860" tone="income" icon={TrendingUp} />
            <SummaryItem label="Expenses" value="$18,430" tone="expense" icon={TrendingDown} />
            <SummaryItem label="Net" value="$24,430" tone="net" icon={CircleDollarSign} />
            <SummaryItem label="Needs review" value="3" tone="review" icon={AlertTriangle} />
          </section>

          <section className="table-panel">
            <div className="table-toolbar">
              <label className="field search-field">
                <Search size={18} />
                <input type="search" placeholder="Search transactions" />
              </label>

              <div className="filter-actions">
                <button className="secondary-button" type="button">
                  <Calendar size={17} />
                  May 2024
                </button>
                <button className="secondary-button" type="button">
                  <Filter size={17} />
                  More filters
                </button>
                <button className="secondary-button" type="button">
                  <Upload size={17} />
                  Import CSV
                </button>
              </div>
            </div>

            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Account</th>
                    <th>Receipt</th>
                    <th>Status</th>
                    <th className="align-right">Amount</th>
                    <th className="action-col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td data-label="Date">{transaction.date}</td>
                      <td data-label="Description">
                        <div className="merchant-cell">
                          <span className={`merchant-icon merchant-${transaction.merchantTone}`}>
                            {getMerchantInitial(transaction.description)}
                          </span>
                          <strong>{transaction.description}</strong>
                        </div>
                      </td>
                      <td data-label="Category">
                        <div className="category-cell">
                          <CategoryIcon category={transaction.category} />
                          <span>{transaction.category}</span>
                        </div>
                      </td>
                      <td data-label="Account">{transaction.account}</td>
                      <td data-label="Receipt">{transaction.receipt}</td>
                      <td data-label="Status">
                        <StatusPill status={transaction.status} />
                      </td>
                      <td data-label="Amount" className={`align-right amount ${transaction.amount >= 0 ? 'is-positive' : 'is-negative'}`}>
                        {formatMoney(transaction.amount)}
                      </td>
                      <td data-label="Actions" className="action-col">
                        <button className="row-action" type="button" aria-label={`Actions for ${transaction.description}`}>
                          <MoreHorizontal size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="table-footer">
              <span>Showing 1 to 6 of 102 transactions</span>
              <div className="pagination" aria-label="Pagination">
                <button type="button" aria-label="Previous page">
                  <ChevronLeft size={16} />
                </button>
                <button className="is-active" type="button">1</button>
                <button type="button">2</button>
                <button type="button">3</button>
                <span>...</span>
                <button type="button">17</button>
                <button type="button" aria-label="Next page">
                  <ChevronRight size={16} />
                </button>
              </div>
              <button className="secondary-button per-page-button" type="button">
                20 per page
                <ChevronDown size={16} />
              </button>
            </div>
          </section>

          <section className="progressive-panels" aria-label="Additional transaction tools">
            <ProgressivePanel
              id="review"
              title="Review queue"
              summary="3 items"
              expandedPanel={expandedPanel}
              onToggle={setExpandedPanel}
            >
              Missing receipts, mixed-use expenses, and uncategorized imported rows will appear here.
            </ProgressivePanel>
            <ProgressivePanel
              id="tax"
              title="Tax set-aside helper"
              summary="$7,329 estimated"
              expandedPanel={expandedPanel}
              onToggle={setExpandedPanel}
            >
              Tax estimates stay available, but they do not compete with daily transaction work.
            </ProgressivePanel>
            <ProgressivePanel
              id="recurring"
              title="Recurring templates"
              summary="4 active"
              expandedPanel={expandedPanel}
              onToggle={setExpandedPanel}
            >
              Recurring transaction templates live here until the user chooses to manage them.
            </ProgressivePanel>
          </section>
        </main>
    </AppShell>
  )
}

function SummaryItem({ label, value, tone, icon: Icon }: { label: string; value: string; tone: string; icon: LucideIcon }) {
  return (
    <article className={`summary-item tone-${tone}`}>
      <div className="summary-icon">
        <Icon size={24} />
      </div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </article>
  )
}

function CategoryIcon({ category }: { category: string }) {
  const Icon = category === 'Fuel' ? Fuel : category === 'Meals' ? Coffee : category === 'Software' ? Package : ShoppingBag
  return (
    <span className={`category-icon category-${category.toLowerCase()}`}>
      <Icon size={15} />
    </span>
  )
}

function StatusPill({ status }: { status: TransactionStatus }) {
  return <span className={`status-pill status-${status.toLowerCase().replace(/\s+/g, '-')}`}>{status}</span>
}

function ProgressivePanel({
  id,
  title,
  summary,
  expandedPanel,
  onToggle,
  children,
}: {
  id: string
  title: string
  summary: string
  expandedPanel: string | null
  onToggle: (id: string | null) => void
  children: string
}) {
  const isExpanded = expandedPanel === id

  return (
    <article className="progressive-panel">
      <button type="button" onClick={() => onToggle(isExpanded ? null : id)} aria-expanded={isExpanded}>
        <span>{title}</span>
        <strong>{summary}</strong>
        <ChevronDown size={17} />
      </button>
      {isExpanded ? <p>{children}</p> : null}
    </article>
  )
}

function TransactionDrawer({ onClose }: { onClose: () => void }) {
  return (
    <div className="drawer-backdrop" role="presentation" onMouseDown={onClose}>
      <aside className="transaction-drawer" aria-label="Add transaction" onMouseDown={(event) => event.stopPropagation()}>
        <div className="drawer-header">
          <div>
            <h2>Add transaction</h2>
            <p>Only the essentials first. Advanced details stay collapsed.</p>
          </div>
          <button className="icon-button" type="button" aria-label="Close drawer" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="transaction-type-toggle" role="group" aria-label="Transaction type">
          <button className="is-selected" type="button">Income</button>
          <button type="button">Expense</button>
        </div>

        <form className="drawer-form">
          <label>
            Amount
            <input placeholder="$0.00" />
          </label>
          <label>
            Description
            <input placeholder="Merchant or payer" />
          </label>
          <label>
            Date
            <input type="date" />
          </label>
          <label>
            Category
            <select>
              <option>Select category</option>
            </select>
          </label>
          <label>
            Account
            <select>
              <option>Select account</option>
            </select>
          </label>
          <details>
            <summary>Receipt, tax treatment, and notes</summary>
            <div className="advanced-fields">
              <button className="secondary-button" type="button">
                <Upload size={17} />
                Attach receipt
              </button>
              <textarea placeholder="Internal note" />
            </div>
          </details>
        </form>

        <div className="drawer-actions">
          <button className="secondary-button" type="button" onClick={onClose}>
            Cancel
          </button>
          <button className="primary-button" type="button">
            Save transaction
          </button>
        </div>
      </aside>
    </div>
  )
}

function formatMoney(value: number) {
  const formatted = Math.abs(value).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  })

  return value < 0 ? `-${formatted}` : formatted
}

function getMerchantInitial(description: string) {
  return description.trim().charAt(0).toUpperCase()
}

export default Transactions
