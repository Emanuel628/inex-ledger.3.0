import { useState } from 'react'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import type { PageProps } from '../App'
import AuthShell from '../components/AuthShell'

function Login(props: PageProps) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <AuthShell
      theme={props.theme}
      onNavigate={props.onNavigate}
      eyebrow="Welcome back"
      title="Sign in and get straight to the books."
      description="A focused login flow for business owners who need the app to load quickly and clearly."
    >
      <h2>Sign in</h2>
      <p>Use the email and password attached to your InEx Ledger account.</p>
      <form className="auth-form" onSubmit={(event) => event.preventDefault()}>
        <label>
          Email
          <input type="email" autoComplete="email" placeholder="you@example.com" />
        </label>
        <label>
          Password
          <input type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="Enter password" />
        </label>
        <div className="auth-inline-row">
          <label className="auth-check">
            <input type="checkbox" checked={showPassword} onChange={(event) => setShowPassword(event.target.checked)} />
            Show password
          </label>
          <button className="auth-link" type="button" onClick={() => props.onNavigate('ForgotPassword')}>Forgot password?</button>
        </div>
        <button className="primary-button" type="button" onClick={() => props.onNavigate('Transactions')}>
          <LogIn size={18} />
          Sign in
        </button>
        <button className="secondary-button" type="button" onClick={() => props.onNavigate('MfaChallenge')}>
          {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
          Preview MFA step
        </button>
      </form>
      <div className="auth-card-footer">
        <span>New here?</span>
        <button className="auth-link" type="button" onClick={() => props.onNavigate('Register')}>Create an account</button>
      </div>
    </AuthShell>
  )
}

export default Login
