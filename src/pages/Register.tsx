import type { PageProps } from '../App'
import AuthShell from '../components/AuthShell'

function Register(props: PageProps) {
  return (
    <AuthShell
      theme={props.theme}
      onNavigate={props.onNavigate}
      eyebrow="Create account"
      title="Start clean with the essentials first."
      description="Registration should collect only what is needed to create the account. Business setup comes next."
    >
      <h2>Create account</h2>
      <p>Set up your personal login before creating the first business workspace.</p>
      <form className="auth-form" onSubmit={(event) => event.preventDefault()}>
        <div className="auth-form-grid">
          <label>
            First name
            <input autoComplete="given-name" placeholder="Emanuel" />
          </label>
          <label>
            Last name
            <input autoComplete="family-name" placeholder="Castro" />
          </label>
        </div>
        <label>
          Email
          <input type="email" autoComplete="email" placeholder="you@example.com" />
        </label>
        <label>
          Password
          <input type="password" autoComplete="new-password" placeholder="Create password" />
        </label>
        <label className="auth-check">
          <input type="checkbox" />
          I agree to the Terms and Privacy Policy.
        </label>
        <button className="primary-button" type="button" onClick={() => props.onNavigate('VerifyEmail')}>Create account</button>
      </form>
      <div className="auth-card-footer">
        <span>Already have an account?</span>
        <button className="auth-link" type="button" onClick={() => props.onNavigate('Login')}>Sign in</button>
      </div>
    </AuthShell>
  )
}

export default Register
