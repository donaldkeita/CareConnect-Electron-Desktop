import { useState } from "react";
import "./App.css";

type Screen = "home" | "appointments";

function App() {
  const [screen, setScreen] = useState<Screen>("home");

  return (
    <div className="app">
      <aside className="sidebar">
        <div>
          <h1>CareConnect</h1>
          <p className="subtitle">Health made simpler</p>

          <nav aria-label="Main navigation">
            <button
              className={screen === "home" ? "nav-item active" : "nav-item"}
              onClick={() => setScreen("home")}
            >
              Home
            </button>

            <button
              className={screen === "appointments" ? "nav-item active" : "nav-item"}
              onClick={() => setScreen("appointments")}
            >
              Appointments
            </button>

            <button className="nav-item">Medications</button>
            <button className="nav-item">Inbox</button>
          </nav>
        </div>

        <button className="nav-item">Settings</button>
      </aside>

      <main className="main-content">
        <header className="toolbar">
          <strong>{screen === "home" ? "Home" : "Appointments"}</strong>

          <div className="toolbar-actions">
            <button>Search</button>
            <button>Notifications</button>
          </div>
        </header>

        {screen === "home" ? (
          <HomeScreen onAppointments={() => setScreen("appointments")} />
        ) : (
          <AppointmentsScreen />
        )}

        <footer className="status-bar">
          <span>CareConnect Desktop</span>
          <span>Last synced: Just now</span>
        </footer>
      </main>
    </div>
  );
}

function HomeScreen({ onAppointments }: { onAppointments: () => void }) {
  return (
    <section className="content">
      <div className="page-heading">
        <div>
          <h2>Good morning</h2>
          <p>Here is your health summary for today.</p>
        </div>

        <button className="primary-button">+ Add Appointment</button>
      </div>

      <div className="dashboard-grid">
        <article className="card">
          <h3>Upcoming Appointments</h3>
          <p className="large-text">2 appointments</p>
          <p>in the next 24 hours</p>
          <button onClick={onAppointments}>View appointments</button>
        </article>

        <article className="card">
          <h3>Medications</h3>
          <p className="large-text">3 medications</p>
          <p>1 dose due this evening</p>
          <button>View medications</button>
        </article>

        <article className="card full-width">
          <h3>Today's Highlights</h3>
          <ul>
            <li>Primary care appointment at 10:30 AM</li>
            <li>Medication reminder at 6:00 PM</li>
            <li>No new messages from your care team</li>
          </ul>
        </article>
      </div>
    </section>
  );
}

function AppointmentsScreen() {
  return (
    <section className="content">
      <div className="page-heading">
        <div>
          <h2>Appointments</h2>
          <p>View and manage your upcoming healthcare visits.</p>
        </div>

        <button className="primary-button">+ New Appointment</button>
      </div>

      <div className="card">
        <h3>Today</h3>

        <div className="appointment">
          <div>
            <strong>10:30 AM — Primary Care</strong>
            <p>Dr. Sarah Williams</p>
            <p>Rockville Medical Center</p>
          </div>
          <button>View Details</button>
        </div>

        <div className="appointment">
          <div>
            <strong>3:00 PM — Physical Therapy</strong>
            <p>Michael Chen, PT</p>
            <p>CareConnect Rehabilitation Center</p>
          </div>
          <button>View Details</button>
        </div>
      </div>
    </section>
  );
}

export default App;
