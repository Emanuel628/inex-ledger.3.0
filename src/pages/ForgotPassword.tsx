import { Mail } from 'lucide-react'
import type { PageProps } from '../App'
import AuthShell from '../components/AuthShell'

function ForgotPassword(props: PageProps) {
  return (
    <AuthShell
      theme={props.theme}
      onNavigate={props.onNavigate}
      eyebrow="Account recovery"
      title="Reset access without making the page heavy."
      description="The recovery page should be simple, reassuring, and fast on mobile."
    >
      <h2>Forgot password</h2>
      <p>Enter your email and we will send a reset link if the account exists.</p>
      <form className="auth-form" onSubmit={(event) => event.preventDefault()}>
        <label>
          Email
          <input type="email" autoComplete="email" placeholder="you@example.com" />
        </label>
        <button className="primary-button" type="button" onClick={() => props.onNavigate('ResetPassword')}>
          <Mail size={18} />
          Send reset link
        </button>
        <button className="secondary-button" type="button" onClick={() => props.onNavigate('Login')}>Back to sign in</button>
      </form>
    </AuthShell>
  )
}

export default ForgotPassword
