import { ArrowRight, CheckCircle2, Download, FileText, Receipt, ShieldCheck } from 'lucide-react'
import type { PageProps } from '../App'
import PublicShell from '../components/PublicShell'

function Landing(props: PageProps) {
  return (
    <PublicShell theme={props.theme} onNavigate={props.onNavigate}>
      <section className="public-hero">
        <div className="public-hero-copy">
          <p className="eyebrow">Built for independent businesses</p>
          <h1>Clean books without the accounting headache.</h1>
          <p>
            Track income, expenses, receipts, mileage, invoices, and export-ready records in one calm ledger.
          </p>
          <div className="public-hero-actions">
            <button className="primary-button" type="button" onClick={() => props.onNavigate('Register')}>
              Start free
              <ArrowRight size={18} />
            </button>
            <button className="secondary-button" type="button" onClick={() => props.onNavigate('Pricing')}>
              View pricing
            </button>
          </div>
        </div>

        <article className="landing-preview" aria-label="Product preview">
          <div className="landing-preview-head">
            <strong>May summary</strong>
            <span>Export ready</span>
          </div>
          <div className="landing-preview-stats">
            <div><span>Income</span><strong className="is-positive">$6,420</strong></div>
            <div><span>Expenses</span><strong className="is-negative">$2,180</strong></div>
            <div><span>Net</span><strong>$4,240</strong></div>
          </div>
          <div className="landing-preview-list">
            <span><Receipt size={17} /> 24 receipts attached</span>
            <span><FileText size={17} /> 3 invoices paid</span>
            <span><Download size={17} /> CSV and PDF exports</span>
          </div>
        </article>
      </section>

      <section className="public-section">
        <div className="public-section-head">
          <h2>Everything Pro needs</h2>
          <p>Simple daily workflows first. Accounting-heavy Business features can come later.</p>
        </div>
        <div className="public-feature-grid">
          <Feature icon={Receipt} title="Receipts tied to records" text="Keep proof with the transaction instead of hunting for files later." />
          <Feature icon={ShieldCheck} title="Export safeguards" text="Sensitive tax details stay behind explicit review before a final export." />
          <Feature icon={CheckCircle2} title="Review only what matters" text="Missing receipts, uncategorized rows, and stale exports are easy to find." />
        </div>
      </section>
    </PublicShell>
  )
}

function Feature({ icon: Icon, title, text }: { icon: typeof Receipt; title: string; text: string }) {
  return (
    <article className="public-feature-card">
      <span><Icon size={21} /></span>
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
  )
}

export default Landing
