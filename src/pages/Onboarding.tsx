import type { PageProps } from '../App'
import AuthShell from '../components/AuthShell'

function Onboarding(props: PageProps) {
  return (
    <AuthShell
      theme={props.theme}
      onNavigate={props.onNavigate}
    >
      <h2>Business basics</h2>
      <p>These settings can be changed later in Settings.</p>
      <div className="onboarding-steps">
        <div className="onboarding-step">
          <span>1</span>
          <div><strong>Account created</strong><small>Email verified and sign-in is ready.</small></div>
        </div>
        <div className="onboarding-step">
          <span>2</span>
          <div><strong>Business profile</strong><small>Add the business name, type, region, and currency.</small></div>
        </div>
        <div className="onboarding-step">
          <span>3</span>
          <div><strong>First transaction</strong><small>Start with one income or expense entry.</small></div>
        </div>
      </div>
      <form className="auth-form" onSubmit={(event) => event.preventDefault()}>
        <label>
          Business name
          <input placeholder="Mejor Tech LLC" />
        </label>
        <div className="auth-form-grid">
          <label>
            Business type
            <select defaultValue="llc">
              <option value="sole">Sole proprietor</option>
              <option value="llc">LLC</option>
              <option value="corp">Corporation</option>
            </select>
          </label>
          <label>
            Currency
            <select defaultValue="usd">
              <option value="usd">USD</option>
              <option value="cad">CAD</option>
            </select>
          </label>
        </div>
        <button className="primary-button" type="button" onClick={() => props.onNavigate('Transactions')}>Enter dashboard</button>
      </form>
    </AuthShell>
  )
}

export default Onboarding
