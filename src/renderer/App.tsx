import { useEffect, useRef, useState } from "react";
import { Icon, type IconName } from "./components/Icon";
import { appointments, medications, messages, type Appointment, type PageId } from "./mock-data";

const navigation: Array<{ label: string; icon: IconName; page?: PageId; badge?: number }> = [
  { label: "Overview", icon: "grid", page: "overview" },
  { label: "Appointments", icon: "calendar", page: "appointments" },
  { label: "Medications", icon: "pill", page: "medications", badge: 2 },
  { label: "Messages", icon: "message", page: "messages", badge: 2 },
];

const careNavigation = [
  { label: "Health records", icon: "pulse" as const },
  { label: "Care team", icon: "shield" as const },
];

export default function App() {
  const [page, setPage] = useState<PageId>("overview");
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => { headingRef.current?.focus(); }, [page]);

  return (
    <div className="app-frame">
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <TopBar />
      <div className="workspace">
        <Sidebar page={page} onNavigate={setPage} />
        <main id="main-content" className="main-content" tabIndex={-1}>
          {page === "overview" && <OverviewPage headingRef={headingRef} onNavigate={setPage} />}
          {page === "appointments" && <AppointmentsPage headingRef={headingRef} />}
          {page === "medications" && <MedicationsPage headingRef={headingRef} />}
          {page === "messages" && <MessagesPage headingRef={headingRef} />}
        </main>
      </div>
      <StatusBar />
    </div>
  );
}

function TopBar() {
  return (
    <header className="topbar">
      <div className="quick-actions" aria-label="Quick actions">
        <button type="button"><Icon name="calendar" />New appointment</button>
        <button type="button"><Icon name="message" />New message</button>
        <button type="button"><Icon name="pill" />Add medication</button>
      </div>
      <label className="search-box">
        <span className="sr-only">Search CareConnect</span><Icon name="search" />
        <input type="search" placeholder="Search CareConnect" /><kbd>Ctrl K</kbd>
      </label>
      <div className="account-actions">
        <button className="icon-button notification" type="button" aria-label="Notifications"><Icon name="bell" /><span aria-hidden="true" /></button>
        <button className="icon-button" type="button" aria-label="Help"><Icon name="help" /></button>
        <button className="profile-button" type="button"><span className="avatar">JD</span><span><strong>Jordan Davis</strong><small>Patient</small></span><Icon name="chevron" /></button>
      </div>
    </header>
  );
}

function Sidebar({ page, onNavigate }: { page: PageId; onNavigate: (page: PageId) => void }) {
  return (
    <aside className="sidebar">
      <nav aria-label="Primary navigation">
        <p className="nav-heading">Workspace</p>
        {navigation.map((item) => (
          <button className={`nav-item ${item.page === page ? "active" : ""}`} type="button" aria-current={item.page === page ? "page" : undefined} onClick={() => item.page && onNavigate(item.page)} key={item.label}>
            <Icon name={item.icon} /><span>{item.label}</span>
            {item.badge && <span className="nav-badge" aria-label={`${item.badge} notifications`}>{item.badge}</span>}
          </button>
        ))}
        <div className="nav-divider" /><p className="nav-heading">Care</p>
        {careNavigation.map((item) => <button className="nav-item" type="button" key={item.label} disabled><Icon name={item.icon} /><span>{item.label}</span></button>)}
      </nav>
      <div className="sidebar-footer">
        <button className="nav-item" type="button" disabled><Icon name="settings" />Preferences</button>
        <p><Icon name="shield" />HIPAA-secure session</p>
      </div>
    </aside>
  );
}

type HeadingRef = React.RefObject<HTMLHeadingElement | null>;

function PageHeading({ title, subtitle, action, headingRef }: { title: string; subtitle: string; action?: React.ReactNode; headingRef: HeadingRef }) {
  return <div className="page-heading"><div><h1 ref={headingRef} tabIndex={-1}>{title}</h1><p>{subtitle}</p></div>{action}</div>;
}

function OverviewPage({ headingRef, onNavigate }: { headingRef: HeadingRef; onNavigate: (page: PageId) => void }) {
  return (
    <section className="page overview-page" aria-labelledby="overview-title">
      <div className="welcome-row">
        <div><p className="eyebrow">Thursday, October 1</p><h1 id="overview-title" ref={headingRef} tabIndex={-1}>Good morning, Jordan</h1><p>Here&apos;s what needs your attention today.</p></div>
        <button className="secondary-button" type="button"><Icon name="pulse" />View health summary</button>
      </div>
      <div className="stat-grid">
        <StatCard icon="calendar" value="3" label="Upcoming appointments" onClick={() => onNavigate("appointments")} />
        <StatCard icon="pill" value="2" label="Missed doses today" onClick={() => onNavigate("medications")} tone="orange" />
        <StatCard icon="message" value="2" label="Unread messages" onClick={() => onNavigate("messages")} />
      </div>
      <section className="section-block" aria-labelledby="upcoming-heading">
        <div className="section-heading"><div><h2 id="upcoming-heading">Upcoming appointments</h2><p>Your next visits at a glance</p></div><button className="text-button" onClick={() => onNavigate("appointments")}>View all <Icon name="chevron" /></button></div>
        <div className="appointment-grid">{appointments.map((item) => <AppointmentCard appointment={item} key={item.doctor} />)}</div>
      </section>
      <div className="overview-lower-grid">
        <section className="panel" aria-labelledby="reminders-heading">
          <div className="panel-heading"><div><h2 id="reminders-heading">Medication reminders</h2><p>Today&apos;s schedule</p></div><button className="text-button" onClick={() => onNavigate("medications")}>View all <Icon name="chevron" /></button></div>
          {medications.slice(0, 3).map((medication) => <div className="compact-row" key={medication.name}><span className="soft-icon orange"><Icon name="pill" /></span><span className="grow"><strong>{medication.name} <small>{medication.dose}</small></strong><small>{medication.schedule}</small></span><StatusPill status={medication.status} /></div>)}
        </section>
        <section className="panel" aria-labelledby="recent-messages-heading">
          <div className="panel-heading"><div><h2 id="recent-messages-heading">Recent messages</h2><p>From your care team</p></div><button className="icon-button" type="button" aria-label="New message"><Icon name="plus" /></button></div>
          {messages.slice(0, 3).map((message) => <div className="compact-row" key={message.sender}><span className="initials">{message.initials}</span><span className="grow"><strong>{message.sender}</strong><small>{message.subject}</small></span><small>{message.time}</small><span className="unread-dot" aria-label="Unread" /></div>)}
        </section>
      </div>
    </section>
  );
}

function StatCard({ icon, value, label, onClick, tone = "blue" }: { icon: IconName; value: string; label: string; onClick: () => void; tone?: "blue" | "orange" }) {
  return <button className="stat-card" type="button" onClick={onClick}><span className={`soft-icon ${tone}`}><Icon name={icon} /></span><span><strong>{value}</strong><small>{label}</small></span><Icon name="chevron" /></button>;
}

function AppointmentsPage({ headingRef }: { headingRef: HeadingRef }) {
  return (
    <section className="page">
      <PageHeading title="Appointments" subtitle="Manage upcoming visits and appointment history." headingRef={headingRef} action={<button className="primary-button" type="button"><Icon name="plus" />Request appointment</button>} />
      <div className="tabs" role="tablist" aria-label="Appointment timing"><button type="button" role="tab" aria-selected="true">Upcoming <span>3</span></button><button type="button" role="tab" aria-selected="false">Past</button></div>
      <div className="appointment-grid appointments-page-grid">{appointments.map((item) => <AppointmentCard appointment={item} key={item.doctor} />)}</div>
    </section>
  );
}

function AppointmentCard({ appointment }: { appointment: Appointment }) {
  return (
    <article className="appointment-card">
      <div className="card-top"><span className="soft-icon"><Icon name={appointment.type === "Telehealth" ? "video" : "calendar"} /></span><span className={`visit-pill ${appointment.type === "Telehealth" ? "telehealth" : ""}`}>{appointment.type}</span></div>
      <h3>{appointment.doctor}</h3><p>{appointment.specialty}</p>
      <div className="appointment-details"><span>{appointment.date}</span><span>{appointment.location}</span></div>
      <div className="card-actions"><button className="secondary-button" type="button">Reschedule</button>{appointment.type === "Telehealth" && <button className="primary-button small" type="button"><Icon name="video" />Join</button>}<button className="icon-button push" type="button" aria-label={`More options for ${appointment.doctor}`}><Icon name="more" /></button></div>
    </article>
  );
}

function MedicationsPage({ headingRef }: { headingRef: HeadingRef }) {
  return (
    <section className="page">
      <PageHeading title="Medications" subtitle="Your active prescriptions and daily schedule." headingRef={headingRef} action={<button className="primary-button" type="button"><Icon name="plus" />Add medication</button>} />
      <div className="table-wrap"><table><caption className="sr-only">Current medications</caption><thead><tr><th scope="col">Medication</th><th scope="col">Schedule</th><th scope="col">Prescriber</th><th scope="col">Next refill</th><th scope="col">Status</th></tr></thead><tbody>{medications.map((medication) => <tr key={medication.name}><td data-label="Medication"><span className="soft-icon orange"><Icon name="pill" /></span><span><strong>{medication.name}</strong><small>{medication.dose}</small></span></td><td data-label="Schedule">{medication.schedule}</td><td data-label="Prescriber">{medication.prescriber}</td><td data-label="Next refill">{medication.refill}</td><td data-label="Status"><StatusPill status={medication.status} /></td></tr>)}</tbody></table></div>
    </section>
  );
}

function StatusPill({ status }: { status: "Missed" | "On track" }) { return <span className={`status-pill ${status === "Missed" ? "missed" : "on-track"}`}>{status}</span>; }

function MessagesPage({ headingRef }: { headingRef: HeadingRef }) {
  const [selectedId, setSelectedId] = useState(messages[0].id);
  const selected = messages.find((message) => message.id === selectedId) ?? messages[0];
  return (
    <section className="page messages-page">
      <PageHeading title="Messages" subtitle="2 unread messages from your care team." headingRef={headingRef} action={<button className="primary-button" type="button"><Icon name="plus" />New message</button>} />
      <div className="message-layout">
        <div className="message-list" aria-label="Message threads">{messages.map((message) => <button type="button" className={`message-preview ${message.id === selectedId ? "selected" : ""}`} onClick={() => setSelectedId(message.id)} aria-pressed={message.id === selectedId} key={message.id}><span className="initials">{message.initials}</span><span className="grow"><strong>{message.sender}</strong><span>{message.subject}</span><small>{message.preview}</small></span><span className="message-meta"><small>{message.time}</small>{message.unread && <span className="unread-dot" aria-label="Unread" />}</span></button>)}</div>
        <article className="message-detail" aria-live="polite"><p className="eyebrow">{selected.sender} · {selected.time}</p><h2>{selected.subject}</h2><p>Hi Jordan,</p><p>{selected.body}</p><p>Best,<br />{selected.sender}</p><button className="primary-button reply-button" type="button"><Icon name="message" />Reply</button></article>
      </div>
    </section>
  );
}

function StatusBar() {
  const [version, setVersion] = useState("0.1.0");
  useEffect(() => { void window.careConnectDesktop.getAppVersion().then(setVersion); }, []);
  return <footer className="status-bar"><span><i />Connected securely</span><span>Last synced just now</span><span>CareConnect v{version}</span></footer>;
}
