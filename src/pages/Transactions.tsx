import { useEffect, useState } from 'react'
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
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
  ReceiptText,
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

type TransactionDraft = {
  kind: 'Income' | 'Expense'
  amount: string
  description: string
  date: string
  category: string
  account: string
  note: string
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
  const [transactionRows, setTransactionRows] = useState<Transaction[]>(transactions)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [actionMenuId, setActionMenuId] = useState<number | null>(null)
  const [noticeVisible, dismissNotice] = useSessionDismissed('transactions-review')

  useEffect(() => {
    document.body.classList.toggle('modal-is-open', drawerOpen || Boolean(selectedTransaction))

    return () => document.body.classList.remove('modal-is-open')
  }, [drawerOpen, selectedTransaction])

  return (
    <AppShell
      {...props}
      searchPlaceholder="Search transactions, merchants, categories"
      overlay={
        <>
          {drawerOpen ? (
            <TransactionDrawer
              onClose={() => setDrawerOpen(false)}
              onSave={(transaction) => {
                setTransactionRows((rows) => [transaction, ...rows])
                setDrawerOpen(false)
              }}
              nextId={Math.max(...transactionRows.map((row) => row.id), 0) + 1}
            />
          ) : null}
          {selectedTransaction ? (
            <TransactionDetailsModal
              transaction={selectedTransaction}
              onClose={() => setSelectedTransaction(null)}
              onUpdate={(updated) => {
                setTransactionRows((rows) => rows.map((row) => (row.id === updated.id ? updated : row)))
                setSelectedTransaction(updated)
              }}
              onDelete={() => {
                setTransactionRows((rows) => rows.filter((row) => row.id !== selectedTransaction.id))
                setSelectedTransaction(null)
              }}
            />
          ) : null}
        </>
      }
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
                  {transactionRows.map((transaction) => (
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
                        <button
                          className="row-action"
                          type="button"
                          aria-label={`Actions for ${transaction.description}`}
                          aria-expanded={actionMenuId === transaction.id}
                          onClick={() => setActionMenuId((id) => (id === transaction.id ? null : transaction.id))}
                        >
                          <MoreHorizontal size={18} />
                        </button>
                        {actionMenuId === transaction.id ? (
                          <div className="row-action-menu">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedTransaction(transaction)
                                setActionMenuId(null)
                              }}
                            >
                              View details
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setTransactionRows((rows) => rows.map((row) => (
                                  row.id === transaction.id ? { ...row, status: 'Cleared' } : row
                                )))
                                setActionMenuId(null)
                              }}
                            >
                              Mark cleared
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setTransactionRows((rows) => rows.map((row) => (
                                  row.id === transaction.id ? { ...row, receipt: 'Attached', status: 'Cleared' } : row
                                )))
                                setActionMenuId(null)
                              }}
                            >
                              Attach receipt
                            </button>
                            <button
                              className="is-danger"
                              type="button"
                              onClick={() => {
                                setTransactionRows((rows) => rows.filter((row) => row.id !== transaction.id))
                                setActionMenuId(null)
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="table-footer">
              <span>Showing 1 to {transactionRows.length} of {transactionRows.length} transactions</span>
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

const emptyDraft: TransactionDraft = {
  kind: 'Income',
  amount: '',
  description: '',
  date: '',
  category: '',
  account: '',
  note: '',
}

function TransactionDrawer({
  onClose,
  onSave,
  nextId,
}: {
  onClose: () => void
  onSave: (transaction: Transaction) => void
  nextId: number
}) {
  const [draft, setDraft] = useState<TransactionDraft>(emptyDraft)
  const [error, setError] = useState('')
  const isIncome = draft.kind === 'Income'

  function updateDraft<K extends keyof TransactionDraft>(key: K, value: TransactionDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }))
    setError('')
  }

  function saveTransaction() {
    const numericAmount = Number(draft.amount.replace(/[$,]/g, ''))
    if (!draft.description.trim() || !Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError('Add a description and a valid amount.')
      return
    }

    onSave({
      id: nextId,
      date: draft.date ? formatShortDate(draft.date) : 'Today',
      description: draft.description.trim(),
      category: draft.category || draft.kind,
      account: draft.account || 'Checking',
      receipt: 'Missing',
      status: draft.kind === 'Income' ? 'Cleared' : 'Needs review',
      amount: isIncome ? numericAmount : -numericAmount,
      merchantTone: isIncome ? 'green' : 'blue',
    })
  }

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
          <button className={isIncome ? 'is-selected' : ''} type="button" onClick={() => updateDraft('kind', 'Income')}>Income</button>
          <button className={!isIncome ? 'is-selected' : ''} type="button" onClick={() => updateDraft('kind', 'Expense')}>Expense</button>
        </div>

        <form className="drawer-form" onSubmit={(event) => event.preventDefault()}>
          <label>
            Amount
            <input
              inputMode="decimal"
              placeholder="$0.00"
              value={draft.amount}
              onChange={(event) => updateDraft('amount', event.target.value)}
            />
          </label>
          <label>
            Description
            <input
              placeholder="Merchant or payer"
              value={draft.description}
              onChange={(event) => updateDraft('description', event.target.value)}
            />
          </label>
          <label>
            Date
            <input type="date" value={draft.date} onChange={(event) => updateDraft('date', event.target.value)} />
          </label>
          <label>
            Category
            <select value={draft.category} onChange={(event) => updateDraft('category', event.target.value)}>
              <option value="">Select category</option>
              <option value="Income">Income</option>
              <option value="Software">Software</option>
              <option value="Fuel">Fuel</option>
              <option value="Meals">Meals</option>
              <option value="Office">Office</option>
            </select>
          </label>
          <label>
            Account
            <select value={draft.account} onChange={(event) => updateDraft('account', event.target.value)}>
              <option value="">Select account</option>
              <option value="Checking">Checking</option>
              <option value="Business Card">Business Card</option>
              <option value="Cash">Cash</option>
            </select>
          </label>
          <details>
            <summary>Receipt, tax treatment, and notes</summary>
            <div className="advanced-fields">
              <button className="secondary-button" type="button">
                <Upload size={17} />
                Attach receipt
              </button>
              <textarea
                placeholder="Internal note"
                value={draft.note}
                onChange={(event) => updateDraft('note', event.target.value)}
              />
            </div>
          </details>
          {error ? <p className="drawer-error" role="alert">{error}</p> : null}
        </form>

        <div className="drawer-actions">
          <button className="secondary-button" type="button" onClick={onClose}>
            Cancel
          </button>
          <button className="primary-button" type="button" onClick={saveTransaction}>
            Save transaction
          </button>
        </div>
      </aside>
    </div>
  )
}

function TransactionDetailsModal({
  transaction,
  onClose,
  onUpdate,
  onDelete,
}: {
  transaction: Transaction
  onClose: () => void
  onUpdate: (transaction: Transaction) => void
  onDelete: () => void
}) {
  return (
    <div className="transaction-modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="transaction-detail-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="transactionDetailTitle"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="drawer-header">
          <div>
            <h2 id="transactionDetailTitle">{transaction.description}</h2>
            <p>{transaction.date} - {transaction.account}</p>
          </div>
          <button className="icon-button" type="button" aria-label="Close transaction details" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="transaction-detail-body">
          <div className={`transaction-detail-amount ${transaction.amount >= 0 ? 'is-positive' : 'is-negative'}`}>
            {formatMoney(transaction.amount)}
          </div>
          <dl className="transaction-detail-list">
            <div><dt>Category</dt><dd>{transaction.category}</dd></div>
            <div><dt>Receipt</dt><dd>{transaction.receipt}</dd></div>
            <div><dt>Status</dt><dd><StatusPill status={transaction.status} /></dd></div>
          </dl>
          <div className="transaction-detail-actions">
            <button className="secondary-button" type="button" onClick={() => onUpdate({ ...transaction, status: 'Cleared' })}>
              <CheckCircle2 size={17} />
              Mark cleared
            </button>
            <button className="secondary-button" type="button" onClick={() => onUpdate({ ...transaction, receipt: 'Attached', status: 'Cleared' })}>
              <ReceiptText size={17} />
              Attach receipt
            </button>
            <button className="secondary-button danger-button" type="button" onClick={onDelete}>Delete</button>
          </div>
        </div>
      </section>
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

function formatShortDate(date: string) {
  const parsed = new Date(`${date}T00:00:00`)
  return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default Transactions
