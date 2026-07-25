import { Monitor, Smartphone, ShieldCheck } from 'lucide-react'
import type { PageProps } from '../App'
import AppShell from '../components/AppShell'

const sessions = [
  { device: 'Windows PC', location: 'New Jersey, US', lastSeen: 'Active now', current: true, icon: Monitor },
  { device: 'iPhone', location: 'New Jersey, US', lastSeen: '2 hours ago', current: false, icon: Smartphone },
  { device: 'Chrome browser', location: 'Toronto, CA', lastSeen: 'May 18', current: false, icon: Monitor },
]

function Sessions(props: PageProps) {
  return (
    <AppShell {...props} searchPlaceholder="Search sessions, devices, locations">
      <main className="transactions-page support-page">
        <section className="page-heading">
          <div>
            <p className="eyebrow">Security</p>
            <h1>Sessions</h1>
            <p>Review signed-in devices and remove access that should no longer be active.</p>
          </div>
          <button className="secondary-button danger-button" type="button">Sign out other sessions</button>
        </section>

        <section className="support-card-list">
          {sessions.map(({ device, location, lastSeen, current, icon: Icon }) => (
            <article className="support-card" key={`${device}-${location}`}>
              <span className="support-card-icon"><Icon size={21} /></span>
              <div>
                <h2>{device}</h2>
                <p>{location} - {lastSeen}</p>
              </div>
              {current ? <span className="status-pill status-cleared">Current</span> : <button className="secondary-button" type="button">Remove</button>}
            </article>
          ))}
        </section>

        <section className="support-note-card">
          <ShieldCheck size={20} />
          <p>Session controls are frontend-only in this project until backend auth is connected.</p>
        </section>
      </main>
    </AppShell>
  )
}

export default Sessions
