import type { PageProps } from '../App'
import AuthShell from '../components/AuthShell'

function VerifyEmail(props: PageProps) {
  return (
    <AuthShell
      theme={props.theme}
      onNavigate={props.onNavigate}
      eyebrow="Verify email"
      title="Confirm ownership before setup begins."
      description="Email verification should be short and obvious, especially before onboarding."
    >
      <h2>Check your email</h2>
      <p>Enter the code sent to your inbox to continue creating your workspace.</p>
      <form className="auth-form" onSubmit={(event) => event.preventDefault()}>
        <div className="auth-code-row" aria-label="Verification code">
          {Array.from({ length: 6 }).map((_, index) => (
            <input key={index} inputMode="numeric" maxLength={1} aria-label={`Digit ${index + 1}`} />
          ))}
        </div>
        <button className="primary-button" type="button" onClick={() => props.onNavigate('Onboarding')}>Verify email</button>
        <button className="auth-link" type="button">Resend code</button>
      </form>
    </AuthShell>
  )
}

export default VerifyEmail
