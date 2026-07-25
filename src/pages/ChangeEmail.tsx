import type { PageProps } from '../App'
import AuthShell from '../components/AuthShell'

function ChangeEmail(props: PageProps) {
  return (
    <AuthShell theme={props.theme} onNavigate={props.onNavigate}>
      <h2>Change email</h2>
      <p>Confirm the current email, enter the new email, then verify the change before it takes effect.</p>
      <form className="auth-form" onSubmit={(event) => event.preventDefault()}>
        <label>
          Current email
          <input type="email" autoComplete="email" placeholder="current@example.com" />
        </label>
        <label>
          New email
          <input type="email" autoComplete="email" placeholder="new@example.com" />
        </label>
        <label>
          Password
          <input type="password" autoComplete="current-password" placeholder="Confirm password" />
        </label>
        <button className="primary-button" type="button" onClick={() => props.onNavigate('VerifyEmail')}>Send verification</button>
        <button className="secondary-button" type="button" onClick={() => props.onNavigate('Settings')}>Cancel</button>
      </form>
    </AuthShell>
  )
}

export default ChangeEmail
