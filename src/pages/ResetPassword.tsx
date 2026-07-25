import type { PageProps } from '../App'
import AuthShell from '../components/AuthShell'

function ResetPassword(props: PageProps) {
  return (
    <AuthShell
      theme={props.theme}
      onNavigate={props.onNavigate}
      eyebrow="New password"
      title="Create a new password and continue."
      description="Keep the reset flow direct, with clear password fields and no extra distractions."
    >
      <h2>Reset password</h2>
      <p>Enter the reset code from your email and choose a new password.</p>
      <form className="auth-form" onSubmit={(event) => event.preventDefault()}>
        <label>
          Reset code
          <input inputMode="numeric" placeholder="6-digit code" />
        </label>
        <label>
          New password
          <input type="password" autoComplete="new-password" placeholder="New password" />
        </label>
        <label>
          Confirm password
          <input type="password" autoComplete="new-password" placeholder="Confirm password" />
        </label>
        <button className="primary-button" type="button" onClick={() => props.onNavigate('Login')}>Update password</button>
      </form>
    </AuthShell>
  )
}

export default ResetPassword
