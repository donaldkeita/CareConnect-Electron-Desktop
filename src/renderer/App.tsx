import { useEffect, useMemo, useReducer, useRef, useState, type FormEvent, type ReactNode } from "react";
import { appReducer, loadAppState, saveAppState } from "./app-state";
import { Dialog, Field } from "./components/Dialog";
import { Icon, type IconName } from "./components/Icon";
import type { Appointment, Medication, MessageThread, PageId } from "./mock-data";

type Modal = { type: "appointment"; appointment?: Appointment } | { type: "message"; replyTo?: MessageThread } | { type: "help" } | { type: "telehealth"; appointment: Appointment } | { type: "confirm-cancel"; appointment: Appointment } | { type: "details"; appointment: Appointment } | { type: "discard-medication" } | { type: "confirm-reset" } | null;
type Menu = "notifications" | "profile" | number | null;

const nav: Array<{ label: string; icon: IconName; page: PageId; badge?: "medications" | "messages" }> = [
  { label: "Overview", icon: "grid", page: "overview" }, { label: "Appointments", icon: "calendar", page: "appointments" },
  { label: "Medications", icon: "pill", page: "medications", badge: "medications" }, { label: "Messages", icon: "message", page: "messages", badge: "messages" },
];
const careNav: Array<{ label: string; icon: IconName; page: PageId }> = [
  { label: "Health records", icon: "pulse", page: "health-records" }, { label: "Care team", icon: "shield", page: "care-team" },
];

const pageTitles: Record<PageId, string> = {
  overview: "Dashboard - CareConnect",
  appointments: "Appointments - CareConnect",
  medications: "Medications - CareConnect",
  "add-medication": "Add Medication - CareConnect",
  messages: "Messages - CareConnect",
  "health-records": "Health records - CareConnect",
  "care-team": "Care team - CareConnect",
  preferences: "Preferences - CareConnect",
};

export default function App() {
  const [state, dispatch] = useReducer(appReducer, undefined, loadAppState);
  const [modal, setModal] = useState<Modal>(null); const [menu, setMenu] = useState<Menu>(null); const [toast, setToast] = useState(""); const [focusMenuItem, setFocusMenuItem] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(state.messages[0]?.id ?? 0); const [search, setSearch] = useState(""); const [activeSearchIndex,setActiveSearchIndex]=useState(-1);
  const searchRef = useRef<HTMLInputElement>(null); const headingRef = useRef<HTMLHeadingElement>(null);
  const menuOpenerRef = useRef<HTMLElement | null>(null);
  useEffect(() => saveAppState(state), [state]);
  useEffect(() => {
    document.title = pageTitles[state.page] ?? "CareConnect";
    headingRef.current?.focus();
  }, [state.page]);
  useEffect(() => { if (!toast) return; const timer = setTimeout(() => setToast(""), 3500); return () => clearTimeout(timer); }, [toast]);
  useEffect(() => { const key = (event: KeyboardEvent) => { if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") { event.preventDefault(); searchRef.current?.focus(); searchRef.current?.select(); } if (event.key === "Escape" && menu !== null) { event.preventDefault(); setMenu(null); setFocusMenuItem(false); window.setTimeout(() => menuOpenerRef.current?.focus()); return; } if (menu !== null && ["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) { const popupId = menuOpenerRef.current?.getAttribute("aria-controls"); const popup = popupId ? document.getElementById(popupId) : null; const items = popup ? Array.from(popup.querySelectorAll<HTMLElement>('[role="menuitem"]')) : []; if (items.length && (popup?.contains(event.target as Node) || event.target === menuOpenerRef.current)) { event.preventDefault(); const current = items.indexOf(document.activeElement as HTMLElement); const next = event.key === "Home" ? 0 : event.key === "End" ? items.length - 1 : (current + (event.key === "ArrowDown" ? 1 : -1) + items.length) % items.length; items[next].focus(); } } }; window.addEventListener("keydown", key); return () => window.removeEventListener("keydown", key); }, [menu]);
  useEffect(() => { if (menu === null) return; const focusChanged = (event: FocusEvent) => { const target=event.target as Node; const popupId=menuOpenerRef.current?.getAttribute("aria-controls"); const popup=popupId?document.getElementById(popupId):null; if (target!==menuOpenerRef.current&&!popup?.contains(target)) setMenu(null); }; document.addEventListener("focusin",focusChanged); return()=>document.removeEventListener("focusin",focusChanged); },[menu]);
  useEffect(() => { if (menu === null || !focusMenuItem) return; const popupId=menuOpenerRef.current?.getAttribute("aria-controls"); document.getElementById(popupId ?? "")?.querySelector<HTMLElement>('[role="menuitem"]')?.focus(); setFocusMenuItem(false); },[menu,focusMenuItem]);
  const toggleMenu = (next: Exclude<Menu, null>, opener: HTMLElement, focusFirst = false) => { const opening=menu!==next; menuOpenerRef.current = opener; setFocusMenuItem(opening&&focusFirst); setMenu(opening?next:null); };
  const openModal = (next: Exclude<Modal, null>) => { if ((document.activeElement as HTMLElement | null)?.getAttribute("role") === "menuitem") menuOpenerRef.current?.focus(); setMenu(null); setModal(next); };
  const navigate = (page: PageId) => { dispatch({ type: "navigate", page }); setMenu(null); setSearch(""); };
  const notify = (message: string) => setToast(message);
  const unreadMessages = state.messages.filter((item) => item.unread).length; const missed = state.medications.filter((item) => item.status === "Missed").length;
  const searchResults = useMemo(() => { const q = search.trim().toLowerCase(); if (!q) return []; return [
    ...state.appointments.filter((x) => `${x.doctor} ${x.specialty}`.toLowerCase().includes(q)).map((x) => ({ id: `a${x.id}`, label: x.doctor, detail: "Appointment", page: "appointments" as PageId })),
    ...state.medications.filter((x) => x.name.toLowerCase().includes(q)).map((x) => ({ id: `m${x.id}`, label: x.name, detail: "Medication", page: "medications" as PageId })),
    ...state.messages.filter((x) => `${x.sender} ${x.subject}`.toLowerCase().includes(q)).map((x) => ({ id: `t${x.id}`, label: x.subject, detail: x.sender, page: "messages" as PageId, messageId: x.id })),
  ].slice(0, 8); }, [search, state]);
  useEffect(()=>setActiveSearchIndex(-1),[search]);
  const chooseSearchResult=(result:any)=>{if(result.messageId){setSelectedMessage(result.messageId);dispatch({type:"select-message",id:result.messageId});}navigate(result.page);};

  return <div className="app-frame" onClick={() => menu !== null && setMenu(null)}>
    <a className="skip-link" href="#main-content">Skip to main content</a>
    <TopBar search={search} setSearch={setSearch} searchRef={searchRef} results={searchResults} chooseSearchResult={chooseSearchResult} activeSearchIndex={activeSearchIndex} setActiveSearchIndex={setActiveSearchIndex} navigate={navigate} openModal={openModal} menu={menu} toggleMenu={toggleMenu} state={state} dispatch={dispatch} />
    <div className="workspace"><Sidebar page={state.page} navigate={navigate} unreadMessages={unreadMessages} missed={missed} />
      <main id="main-content" className="main-content" tabIndex={-1} aria-label="CareConnect content">
        {state.page === "overview" && <Overview state={state} headingRef={headingRef} navigate={navigate} openModal={openModal} menu={menu} toggleMenu={toggleMenu} />}
        {state.page === "appointments" && <Appointments state={state} headingRef={headingRef} openModal={openModal} menu={menu} toggleMenu={toggleMenu} />}
        {state.page === "medications" && <Medications state={state} headingRef={headingRef} navigate={navigate} dispatch={dispatch} notify={notify} />}
        {state.page === "add-medication" && <AddMedication headingRef={headingRef} dispatch={dispatch} openModal={setModal} notify={notify} navigate={navigate} />}
        {state.page === "messages" && <Messages state={state} headingRef={headingRef} selectedId={selectedMessage} select={(id: number) => { setSelectedMessage(id); dispatch({ type: "select-message", id }); }} openModal={setModal} />}
        {state.page === "health-records" && <InfoPage headingRef={headingRef} title="Health records" subtitle="A summary of your current health information."><InfoCards items={["Recent lab results|CBC and metabolic panel reviewed", "Allergies|No known medication allergies", "Care plan|Continue current medication schedule"]} /></InfoPage>}
        {state.page === "care-team" && <InfoPage headingRef={headingRef} title="Care team" subtitle="Your connected healthcare providers."><InfoCards items={["Dr. Sarah Chen|Primary Care", "Dr. Marcus Webb|Cardiology", "Dr. Priya Nair|Endocrinology"]} /></InfoPage>}
        {state.page === "preferences" && <Preferences headingRef={headingRef} openModal={openModal} />}
      </main>
    </div><StatusBar /><div className="toast-region" role="status" aria-live="polite" aria-atomic="true">{toast && <div className="toast">{toast}</div>}</div>
    <WorkflowDialogs modal={modal} close={() => setModal(null)} state={state} dispatch={dispatch} notify={notify} navigate={navigate} />
  </div>;
}

function TopBar({ search, setSearch, searchRef, results, chooseSearchResult, activeSearchIndex, setActiveSearchIndex, navigate, openModal, menu, toggleMenu, state, dispatch }: any) {
  const chooseActiveResult = () => {
    if (activeSearchIndex >= 0 && activeSearchIndex < results.length) chooseSearchResult(results[activeSearchIndex]);
  };
  return <header className="topbar" aria-label="CareConnect toolbar" onClick={(e) => e.stopPropagation()}><div className="quick-actions">
    <button title="Request a new appointment" onClick={() => openModal({ type: "appointment" })}><Icon name="calendar" />New appointment</button><button title="Write a new secure message" onClick={() => openModal({ type: "message" })}><Icon name="message" />New message</button><button title="Add a medication and reminder schedule" onClick={() => navigate("add-medication")}><Icon name="pill" />Add medication</button></div>
    <div className="search-container"><label className="search-box" title="Search appointments, medications, and messages (Ctrl+K)"><span className="sr-only">Search CareConnect</span><Icon name="search" /><input ref={searchRef} type="search" role="combobox" aria-label="Search CareConnect" aria-autocomplete="list" aria-controls={search ? "search-results" : undefined} aria-expanded={search.length > 0} aria-activedescendant={activeSearchIndex >= 0 ? `search-option-${results[activeSearchIndex]?.id}` : undefined} value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => { if (e.key === "ArrowDown" && results.length) { e.preventDefault(); setActiveSearchIndex((index: number) => (index + 1) % results.length); } else if (e.key === "ArrowUp" && results.length) { e.preventDefault(); setActiveSearchIndex((index: number) => (index <= 0 ? results.length - 1 : index - 1)); } else if (e.key === "Enter") { e.preventDefault(); chooseActiveResult(); } else if (e.key === "Escape" && search) { setSearch(""); } }} placeholder="Search CareConnect" /><kbd>Ctrl K</kbd></label>
      {search && <div className="popover search-results" id="search-results" role="listbox" aria-label="Search results">{results.length ? results.map((r: any, index: number) => <button id={`search-option-${r.id}`} key={r.id} role="option" aria-selected={activeSearchIndex === index} onMouseEnter={() => setActiveSearchIndex(index)} onClick={() => chooseSearchResult(r)}>{r.label}<small>{r.detail}</small></button>) : <p>No matches found.</p>}</div>}</div>
    <div className="account-actions"><div className="menu-wrap"><button className="icon-button notification" aria-label="Notifications" aria-haspopup="menu" aria-controls={menu === "notifications" ? "notification-menu" : undefined} aria-expanded={menu === "notifications"} title="View notifications" onClick={(e) => toggleMenu("notifications", e.currentTarget)} onKeyDown={(e) => { if (e.key === "ArrowDown") { e.preventDefault(); toggleMenu("notifications", e.currentTarget, true); } }}><Icon name="bell" /><span aria-hidden="true" /></button>{menu === "notifications" && <div className="popover notification-menu"><h3 id="notifications-heading">Notifications</h3><div id="notification-menu" role="menu" aria-labelledby="notifications-heading">{state.notifications.map((n: any) => <button role="menuitem" key={n.id} onClick={() => { dispatch({ type: "read-notification", id: n.id }); navigate(n.page); }}><strong>{n.title}</strong><small>{n.detail}</small>{!n.read && <i />}</button>)}</div></div>}</div>
      <button className="icon-button" aria-label="Help" title="Open CareConnect help" onClick={() => openModal({ type: "help" })}><Icon name="help" /></button><div className="menu-wrap"><button className="profile-button" aria-haspopup="menu" aria-controls={menu === "profile" ? "profile-menu" : undefined} aria-expanded={menu === "profile"} title="Open the profile menu" onClick={(e) => toggleMenu("profile", e.currentTarget)} onKeyDown={(e) => { if (e.key === "ArrowDown") { e.preventDefault(); toggleMenu("profile", e.currentTarget, true); } }}><span className="avatar" aria-hidden="true">JD</span><span><strong>Jordan Davis</strong><small>Patient</small></span><Icon name="chevron" /></button>{menu === "profile" && <div className="popover profile-menu" id="profile-menu" role="menu" aria-label="Profile menu"><button role="menuitem" onClick={() => navigate("health-records")}>View health records</button><button role="menuitem" onClick={() => navigate("preferences")}>Preferences</button></div>}</div></div></header>;
}

function Sidebar({ page, navigate, unreadMessages, missed }: { page: PageId; navigate: (p: PageId) => void; unreadMessages: number; missed: number }) {
  return <aside className="sidebar" aria-label="Sidebar"><nav aria-label="Primary navigation"><p className="nav-heading">Workspace</p>{nav.map((n) => { const count = n.badge === "messages" ? unreadMessages : n.badge === "medications" ? missed : 0; return <button className={`nav-item ${n.page === page ? "active" : ""}`} title={`Open ${n.label}`} aria-current={n.page === page ? "page" : undefined} onClick={() => navigate(n.page)} key={n.page}><Icon name={n.icon} /><span>{n.label}</span>{count > 0 && <span className="nav-badge">{count}</span>}</button>; })}<div className="nav-divider" /><p className="nav-heading">Care</p>{careNav.map((n) => <button className={`nav-item ${n.page === page ? "active" : ""}`} title={`Open ${n.label}`} aria-current={n.page === page ? "page" : undefined} onClick={() => navigate(n.page)} key={n.page}><Icon name={n.icon} /><span>{n.label}</span></button>)}</nav><div className="sidebar-footer"><button className={`nav-item ${page === "preferences" ? "active" : ""}`} title="Open Preferences" aria-current={page === "preferences" ? "page" : undefined} onClick={() => navigate("preferences")}><Icon name="settings" />Preferences</button><p><Icon name="shield" />HIPAA-secure session</p></div></aside>;
}

type HeadingRef = React.RefObject<HTMLHeadingElement | null>;
function Heading({ title, subtitle, headingRef, action }: { title: string; subtitle: string; headingRef: HeadingRef; action?: ReactNode }) { return <div className="page-heading"><div><h1 ref={headingRef} tabIndex={-1}>{title}</h1><p>{subtitle}</p></div>{action}</div>; }
function Overview({ state, headingRef, navigate, openModal, menu, toggleMenu }: any) { const upcoming = state.appointments.filter((a: Appointment) => a.status === "Upcoming").slice(0,3); return <section className="page"><div className="welcome-row"><div><p className="eyebrow">Thursday, October 1</p><h1 ref={headingRef} tabIndex={-1}>Good morning, Jordan</h1><p>Here&apos;s what needs your attention today.</p></div><button className="secondary-button" onClick={() => navigate("health-records")}><Icon name="pulse" />View health summary</button></div><div className="stat-grid"><Stat icon="calendar" value={String(upcoming.length)} label="Upcoming appointments" click={() => navigate("appointments")} /><Stat icon="pill" value={String(state.medications.filter((m: Medication) => m.status === "Missed").length)} label="Missed doses today" click={() => navigate("medications")} /><Stat icon="message" value={String(state.messages.filter((m: MessageThread) => m.unread).length)} label="Unread messages" click={() => navigate("messages")} /></div><SectionTitle title="Upcoming appointments" subtitle="Your next visits at a glance" action={() => navigate("appointments")} /><div className="appointment-grid">{upcoming.map((a: Appointment) => <AppointmentCard key={a.id} appointment={a} openModal={openModal} menu={menu} toggleMenu={toggleMenu} />)}</div><div className="overview-lower-grid"><section className="panel"><PanelTitle title="Medication reminders" subtitle="Today’s schedule" action={() => navigate("medications")} />{state.medications.slice(0,3).map((m: Medication) => <div className="compact-row" key={m.id}><span className="soft-icon orange"><Icon name="pill" /></span><span className="grow"><strong>{m.name} <small>{m.dose}</small></strong><small>{m.schedule}</small></span><Status status={m.status} /></div>)}</section><section className="panel"><PanelTitle title="Recent messages" subtitle="From your care team" action={() => openModal({ type:"message" })} plus />{state.messages.slice(0,3).map((m: MessageThread) => <div className="compact-row" key={m.id}><span className="initials">{m.initials}</span><span className="grow"><strong>{m.sender}</strong><small>{m.subject}</small></span><small>{m.time}</small></div>)}</section></div></section>; }
function Stat({ icon, value, label, click }: any) { return <button className="stat-card" onClick={click}><span className="soft-icon"><Icon name={icon} /></span><span><strong>{value}</strong><small>{label}</small></span><Icon name="chevron" /></button>; }
function SectionTitle({ title, subtitle, action }: any) { return <div className="section-heading section-block"><div><h2>{title}</h2><p>{subtitle}</p></div><button className="text-button" onClick={action}>View all <Icon name="chevron" /></button></div>; }
function PanelTitle({ title, subtitle, action, plus }: any) { return <div className="panel-heading"><div><h2>{title}</h2><p>{subtitle}</p></div><button className={plus ? "icon-button" : "text-button"} onClick={action} aria-label={plus ? "New message" : undefined} title={plus ? "Write a new secure message" : `View all ${title.toLowerCase()}`}>{plus ? <Icon name="plus" /> : <>View all <Icon name="chevron" /></>}</button></div>; }

function Appointments({ state, headingRef, openModal, menu, toggleMenu }: any) {
  const [tab,setTab]=useState<"Upcoming"|"Past">("Upcoming");
  const tabRefs=useRef<Array<HTMLButtonElement|null>>([]);
  const items=state.appointments.filter((a:Appointment)=>tab === "Past" ? a.status !== "Upcoming" : a.status === "Upcoming");
  const selectTab=(next:"Upcoming"|"Past")=>{setTab(next);tabRefs.current[next==="Upcoming"?0:1]?.focus();};
  const onTabKeyDown=(event:React.KeyboardEvent<HTMLButtonElement>)=>{if(event.key==="ArrowRight"||event.key==="ArrowLeft"){event.preventDefault();selectTab(event.key==="ArrowRight"?"Past":"Upcoming");}else if(event.key==="Home"){event.preventDefault();selectTab("Upcoming");}else if(event.key==="End"){event.preventDefault();selectTab("Past");}};
  const tabId=tab==="Upcoming"?"appointments-upcoming-tab":"appointments-past-tab";
  return <section className="page"><Heading title="Appointments" subtitle="Manage upcoming visits and appointment history." headingRef={headingRef} action={<button className="primary-button" onClick={()=>openModal({type:"appointment"})}><Icon name="plus" />Request appointment</button>} /><div className="tabs" role="tablist" aria-label="Appointment views"><button ref={(node)=>{tabRefs.current[0]=node;}} id="appointments-upcoming-tab" role="tab" aria-controls="appointments-panel" tabIndex={tab==="Upcoming"?0:-1} aria-selected={tab==="Upcoming"} onKeyDown={onTabKeyDown} onClick={()=>setTab("Upcoming")}>Upcoming <span>{state.appointments.filter((a:Appointment)=>a.status==="Upcoming").length}</span></button><button ref={(node)=>{tabRefs.current[1]=node;}} id="appointments-past-tab" role="tab" aria-controls="appointments-panel" tabIndex={tab==="Past"?0:-1} aria-selected={tab==="Past"} onKeyDown={onTabKeyDown} onClick={()=>setTab("Past")}>Past</button></div><div role="tabpanel" id="appointments-panel" aria-labelledby={tabId}>{items.length ? <div className="appointment-grid appointments-page-grid">{items.map((a:Appointment)=><AppointmentCard key={a.id} appointment={a} openModal={openModal} menu={menu} toggleMenu={toggleMenu} />)}</div> : <Empty text="No appointments in this view." />}</div></section>;
}
function AppointmentCard({ appointment:a, openModal, menu, toggleMenu }: any) { const menuId=`appointment-menu-${a.id}`; return <article className="appointment-card"><div className="card-top"><span className="soft-icon"><Icon name={a.type==="Telehealth"?"video":"calendar"}/></span><span className={`visit-pill ${a.type==="Telehealth"?"telehealth":""}`}>{a.status === "Cancelled" ? "Cancelled" : a.type}</span></div><h2>{a.doctor}</h2><p>{a.specialty}</p><div className="appointment-details"><span>{a.date}</span><span>{a.location}</span></div><div className="card-actions">{a.status==="Upcoming" && <><button className="secondary-button" onClick={()=>openModal({type:"appointment",appointment:a})}>Reschedule</button>{a.type==="Telehealth"&&<button className="primary-button small" onClick={()=>openModal({type:"telehealth",appointment:a})}><Icon name="video"/>Join</button>}</>}<div className="menu-wrap push"><button className="icon-button" aria-label={`More options for ${a.doctor}`} aria-haspopup="menu" aria-controls={menu===a.id?menuId:undefined} aria-expanded={menu===a.id} title={`More appointment options for ${a.doctor}`} onClick={(e)=>{e.stopPropagation();toggleMenu(a.id,e.currentTarget);}}><Icon name="more"/></button>{menu===a.id&&<div className="popover card-menu" id={menuId} role="menu" aria-label={`${a.doctor} appointment options`}><button role="menuitem" onClick={()=>openModal({type:"details",appointment:a})}>View details</button>{a.status==="Upcoming"&&<button role="menuitem" className="danger-text" onClick={()=>openModal({type:"confirm-cancel",appointment:a})}>Cancel appointment</button>}</div>}</div></div></article>; }

function Medications({ state, headingRef, navigate, dispatch, notify }: any) { const date=todayValue(); return <section className="page"><Heading title="Medications" subtitle="Your active prescriptions and daily schedule." headingRef={headingRef} action={<button className="primary-button" onClick={()=>navigate("add-medication")}><Icon name="plus"/>Add medication</button>}/><div className="table-wrap"><table role="table"><caption className="sr-only">Current medications</caption><thead role="rowgroup"><tr role="row"><th role="columnheader" scope="col">Medication</th><th role="columnheader" scope="col">Schedule</th><th role="columnheader" scope="col">Prescriber</th><th role="columnheader" scope="col">Next refill</th><th role="columnheader" scope="col">Status</th><th role="columnheader" scope="col">Today&apos;s doses</th></tr></thead><tbody role="rowgroup">{state.medications.map((m:Medication)=><tr role="row" key={m.id}><td role="cell" data-label="Medication"><span className="soft-icon orange"><Icon name="pill"/></span><span><strong>{m.name}</strong><small>{m.dose}</small></span></td><td role="cell" data-label="Schedule">{m.schedule}</td><td role="cell" data-label="Prescriber">{m.prescriber}</td><td role="cell" data-label="Next refill">{m.refill}</td><td role="cell" data-label="Status"><Status status={m.status}/></td><td role="cell" data-label="Today's doses"><div className="dose-actions">{(m.reminderTimes?.length?m.reminderTimes:["08:00"]).map(time=>{const key=`${date}|${time}`;const taken=m.takenDoses?.includes(key);return <button type="button" className={taken?"secondary-button dose-taken":"primary-button small"} aria-pressed={taken} key={key} onClick={()=>{dispatch({type:"toggle-medication-dose",id:m.id,doseKey:key});notify(taken?`${m.name} marked not taken.`:`${m.name} at ${formatTime(time)} marked as taken.`);}}>{taken?`Taken · ${formatTime(time)}`:`Mark ${formatTime(time)} taken`}</button>})}</div></td></tr>)}</tbody></table></div></section>; }
function Status({status}:{status:Medication["status"]}){return <span className={`status-pill ${status==="Missed"?"missed":"on-track"}`}>{status}</span>}

function AddMedication({ headingRef, dispatch, openModal, notify, navigate }: any) {
  const [dirty, setDirty] = useState(false);
  const [times, setTimes] = useState(["08:00"]);
  const [focusNewTime, setFocusNewTime] = useState(false);
  const timeRefs = useRef<Array<HTMLSelectElement | null>>([]);
  useEffect(() => {
    if (!focusNewTime) return;
    timeRefs.current[times.length - 1]?.focus();
    setFocusNewTime(false);
  }, [focusNewTime, times]);
  const cancel = () => dirty ? openModal({ type: "discard-medication" }) : navigate("medications");
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const name = String(d.get("name") || "").trim();
    const dose = String(d.get("dose") || "").trim();
    if (!name || !dose) {
      notify("Enter a medication name and dosage.");
      return;
    }
    const frequency = String(d.get("frequency"));
    const medication: Medication = {
      id: Date.now(),
      name,
      dose: `${dose} ${d.get("unit")}`,
      schedule: `${frequency} · ${times.map(formatTime).join(", ")}`,
      reminderTimes: times,
      prescriber: String(d.get("doctor")),
      refill: String(d.get("refill") || "Not scheduled"),
      status: "On track",
      type: String(d.get("type")),
      pharmacy: String(d.get("pharmacy")),
      instructions: String(d.get("instructions")),
    };
    dispatch({ type: "add-medication", medication });
    notify(`${name} was added.`);
  };
  return <form className="page medication-form-page" onSubmit={submit} onChange={() => setDirty(true)}>
    <div className="med-form-heading">
      <button type="button" className="back-button" onClick={cancel} aria-label="Back to medications" title="Return to the medications list"><Icon name="back" /></button>
      <div><h1 ref={headingRef} tabIndex={-1}>Add Medication</h1><p>Create a medication schedule and reminders.</p></div>
      <div className="form-heading-actions"><button type="button" className="secondary-button" onClick={cancel}>Cancel</button><button className="primary-button">Save medication</button></div>
    </div>
    <ol className="progress-steps" aria-label="Medication form progress">
      <li className="complete"><i aria-hidden="true">✓</i> <b>Details</b><span className="sr-only"> (completed)</span></li>
      <li className="active" aria-current="step"><i aria-hidden="true">2</i> <b>Schedule</b><span className="sr-only"> (current step)</span></li>
      <li><i aria-hidden="true">3</i> <b>Doctor</b></li>
      <li><i aria-hidden="true">4</i> <b>Review</b></li>
    </ol>
    <div className="medication-form-grid">
      <FormSection number="1" title="Medication details">
        <fieldset><legend>Type</legend><div className="choice-row">{["Prescription", "OTC", "Supplement", "Vitamin"].map((x, i) => <label className="choice" key={x}><input type="radio" name="type" value={x} defaultChecked={i === 0} /><span>{x}</span></label>)}</div></fieldset>
        <Field label="Medication name" required><input name="name" required placeholder="e.g. Lisinopril" /></Field>
        <div className="field-grid"><Field label="Dosage" required><input name="dose" required inputMode="decimal" /></Field><Field label="Unit"><select name="unit"><option>mg</option><option>mcg</option><option>mL</option><option>IU</option></select></Field></div>
      </FormSection>
      <FormSection number="2" title="Schedule & reminders">
        <fieldset><legend>Frequency</legend><div className="choice-row">{["Once daily", "Twice daily", "Three times", "As needed"].map((x, i) => <label className="choice" key={x}><input type="radio" name="frequency" value={x} defaultChecked={i === 0} /><span>{x}</span></label>)}</div></fieldset>
        <div className="form-field"><span>Reminder time(s)</span><div className="time-row">{times.map((time, index) => <span className="time-chip" key={index}><select ref={(node) => { timeRefs.current[index] = node; }} aria-label={`Reminder time ${index + 1}`} value={time} onChange={(event) => setTimes(times.map((current, i) => i === index ? event.target.value : current))}>{halfHourOptions().map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}</select><button type="button" aria-label={`Remove ${formatTime(time)}`} title={`Remove the ${formatTime(time)} reminder`} disabled={times.length === 1} onClick={() => setTimes(times.filter((_, i) => i !== index))}>×</button></span>)}<button type="button" className="secondary-button" onClick={() => { setTimes((current) => [...current, current.length ? "20:00" : "08:00"]); setFocusNewTime(true); }}><Icon name="plus" />Add time</button></div></div>
        <Field label="Prescribing doctor"><select name="doctor"><option>Dr. Sarah Chen</option><option>Dr. Marcus Webb</option><option>Dr. Priya Nair</option></select></Field>
        <div className="field-grid"><Field label="Start date"><input name="start" type="date" /></Field><Field label="Refill date"><input name="refill" type="date" /></Field></div>
      </FormSection>
      <FormSection number="3" title="Pharmacy & instructions" wide><Field label="Pharmacy / notes"><input name="pharmacy" placeholder="e.g. CVS on Main St." /></Field><Field label="Instructions"><textarea name="instructions" placeholder="Take with food and water." /></Field></FormSection>
    </div>
    <div className="sticky-form-footer"><span><Icon name="shield" />Medication details are stored securely.</span><div><button type="button" className="secondary-button" onClick={cancel}>Cancel</button><button className="primary-button">Save medication</button></div></div>
  </form>;
}
function FormSection({number,title,wide,children}:{number:string;title:string;wide?:boolean;children:ReactNode}){return <section className={`form-section ${wide?"wide":""}`}><h2><span aria-hidden="true">{number}</span>{title}</h2>{children}</section>}

function Messages({state,headingRef,selectedId,select,openModal}:any){const selected=state.messages.find((m:MessageThread)=>m.id===selectedId)||state.messages[0];return <section className="page"><Heading title="Messages" subtitle={`${state.messages.filter((m:MessageThread)=>m.unread).length} unread messages from your care team.`} headingRef={headingRef} action={<button className="primary-button" onClick={()=>openModal({type:"message"})}><Icon name="plus"/>New message</button>}/><div className="message-layout"><div className="message-list" aria-label="Message conversations">{state.messages.map((m:MessageThread)=><button className={`message-preview ${m.id===selected?.id?"selected":""}`} aria-pressed={m.id===selected?.id} onClick={()=>select(m.id)} key={m.id}><span className="initials">{m.initials}</span><span className="grow"><strong>{m.sender}</strong><span>{m.subject}</span><small>{m.preview}</small></span><span className="message-meta"><small>{m.time}</small>{m.unread&&<><span className="sr-only">Unread</span><span className="unread-dot" aria-hidden="true"/></>}</span></button>)}</div>{selected&&<article className="message-detail"><p className="eyebrow">{selected.sender} · {selected.time}</p><h2>{selected.subject}</h2>{selected.body.split("\n").map((x:string,i:number)=><p key={i}>{x||<br/>}</p>)}<button className="primary-button reply-button" onClick={()=>openModal({type:"message",replyTo:selected})}><Icon name="message"/>Reply</button></article>}</div></section>}
function InfoPage({headingRef,title,subtitle,children}:{headingRef:HeadingRef;title:string;subtitle:string;children:ReactNode}){return <section className="page"><Heading headingRef={headingRef} title={title} subtitle={subtitle}/>{children}</section>}
function InfoCards({items}:{items:string[]}){return <div className="info-grid">{items.map(x=>{const [a,b]=x.split("|");return <article className="panel info-card" key={a}><h2>{a}</h2><p>{b}</p></article>})}</div>}
function Preferences({headingRef,openModal}:{headingRef:HeadingRef;openModal:(modal:Exclude<Modal,null>)=>void}){return <section className="page"><Heading headingRef={headingRef} title="Preferences" subtitle="Manage local CareConnect desktop preferences."/><article className="panel settings-panel"><h2>Demo data</h2><p>Restore appointments, medications, messages, and notifications to their initial values.</p><button className="danger-button" onClick={()=>openModal({type:"confirm-reset"})}><Icon name="trash"/>Reset demo data</button></article></section>}
function Empty({text}:{text:string}){return <div className="empty-state"><p>{text}</p></div>}

function todayValue() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

function halfHourOptions() {
  return Array.from({ length: 48 }, (_, index) => {
    const hours = Math.floor(index / 2); const minutes = index % 2 ? 30 : 0;
    const value = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
    return { value, label: formatTime(value) };
  });
}

function formatTime(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(new Date(2000, 0, 1, hours, minutes));
}

function quarterHourOptions() {
  return Array.from({ length: 64 }, (_, index) => {
    const totalMinutes = 6 * 60 + index * 15;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const value = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
    const label = new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(new Date(2000, 0, 1, hours, minutes));
    return { value, label };
  });
}

function formatAppointmentDate(dateValue: string, timeValue: string) {
  const date = new Date(`${dateValue}T${timeValue}:00`);
  const dateLabel = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(date);
  const timeLabel = new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(date);
  return `${dateLabel} · ${timeLabel}`;
}

function WorkflowDialogs({modal,close,state,dispatch,notify,navigate}:any){const[appointmentError,setAppointmentError]=useState("");useEffect(()=>setAppointmentError(""),[modal]);if(!modal)return null;const submitAppointment=(e:FormEvent<HTMLFormElement>)=>{e.preventDefault();const d=new FormData(e.currentTarget);const doctor=String(d.get("provider"));const dateValue=String(d.get("date"));const timeValue=String(d.get("time"));const dateInput=e.currentTarget.elements.namedItem("date") as HTMLInputElement;if(dateValue&&dateValue<todayValue()){const error="Choose today or a future date.";setAppointmentError(error);dateInput.setCustomValidity(error);dateInput.reportValidity();dateInput.focus();notify(error);return;}if(!doctor||!dateValue||!timeValue){notify("Choose a provider, date, and time.");return;}setAppointmentError("");const old=modal.appointment as Appointment|undefined;const appt:Appointment={id:old?.id??Date.now(),doctor,specialty:old?.specialty??"Requested visit",date:formatAppointmentDate(dateValue,timeValue),dateValue,timeValue,location:old?.location??"Location to be confirmed",type:old?.type??"In person",status:"Upcoming",notes:String(d.get("notes"))};dispatch({type:old?"update-appointment":"add-appointment",appointment:appt});close();notify(old?"Appointment rescheduled.":"Appointment request submitted.");};const submitMessage=(e:FormEvent<HTMLFormElement>)=>{e.preventDefault();const d=new FormData(e.currentTarget);const body=String(d.get("body")||"").trim();if(!body){notify("Enter a message.");return;}if(modal.replyTo){dispatch({type:"reply-message",id:modal.replyTo.id,body});notify("Reply sent.");}else{const sender=String(d.get("provider"));const subject=String(d.get("subject")||"").trim();if(!sender||!subject){notify("Choose a provider and enter a subject.");return;}dispatch({type:"send-message",message:{id:Date.now(),initials:sender.split(" ").filter(Boolean).map(x=>x[0]).slice(-2).join(""),sender,subject,preview:body,time:"Just now",unread:false,body:`Jordan: ${body}`}});notify("Message sent.");}close();};
return <>{(modal.type==="appointment")&&<Dialog open title={modal.appointment?"Reschedule appointment":"Request an appointment"} description="We’ll confirm with you within 24 hours." onClose={close} onSubmit={submitAppointment} actions={<><button type="button" className="secondary-button" onClick={close}>Cancel</button><button className="primary-button">{modal.appointment?"Save changes":"Submit request"}</button></>}><Field label="Provider" required><select name="provider" defaultValue={modal.appointment?.doctor??""} required><option value="">Choose a provider...</option><option>Dr. Sarah Chen</option><option>Dr. Marcus Webb</option><option>Dr. Priya Nair</option></select></Field><div className="appointment-datetime"><Field label="Preferred date" required><input name="date" type="date" min={todayValue()} aria-describedby={`appointment-date-hint${appointmentError?" appointment-date-error":""}`} aria-invalid={!!appointmentError} defaultValue={modal.appointment?.dateValue??""} onFocus={(e)=>{if(e.currentTarget.value>=todayValue())e.currentTarget.dataset.lastValidValue=e.currentTarget.value;}} onKeyDown={(e)=>{const input=e.currentTarget;input.dataset.valueBeforeKey=input.value;const minimumYear=Number(todayValue().slice(0,4));const displayedYear=input.value?Number(input.value.slice(0,4)):minimumYear;if(e.key==="ArrowDown"&&displayedYear<=minimumYear){e.preventDefault();notify(`Years before ${minimumYear} are not available.`);}}} onInput={(e)=>{const input=e.currentTarget;const minimum=todayValue();if(input.value&&input.value<minimum){input.value=input.dataset.valueBeforeKey&&input.dataset.valueBeforeKey>=minimum?input.dataset.valueBeforeKey:input.dataset.lastValidValue&&input.dataset.lastValidValue>=minimum?input.dataset.lastValidValue:minimum;setAppointmentError("Past dates are not available; the date was reset to the earliest available date.");notify("Past appointment dates are not available.");}else setAppointmentError("");input.setCustomValidity("");if(input.value>=minimum)input.dataset.lastValidValue=input.value;}} required/></Field><Field label="Preferred time" required><select name="time" aria-describedby="appointment-date-hint" defaultValue={modal.appointment?.timeValue??""} required><option value="">Choose a time...</option>{quarterHourOptions().map((option)=><option value={option.value} key={option.value}>{option.label}</option>)}</select></Field></div><p className="field-hint" id="appointment-date-hint">Appointment times are available in 15-minute increments. Dates must be today or later.</p>{appointmentError&&<p className="field-error" id="appointment-date-error" role="alert">{appointmentError}</p>}<Field label="Additional information"><textarea name="notes" defaultValue={modal.appointment?.notes} placeholder="Symptoms, reason for visit, or other details..."/></Field></Dialog>}
{modal.type==="message"&&<Dialog open title={modal.replyTo?`Reply to ${modal.replyTo.sender}`:"New message"} description="Send a secure message to your care team." onClose={close} onSubmit={submitMessage} actions={<><button type="button" className="secondary-button" onClick={close}>Cancel</button><button className="primary-button">Send message</button></>}><Field label="To" required><select name="provider" defaultValue={modal.replyTo?.sender??""} disabled={!!modal.replyTo} required><option value="">Select a provider...</option><option>Dr. Sarah Chen</option><option>Dr. Marcus Webb</option><option>Dr. Priya Nair</option><option>Northside Medical Center</option></select></Field><Field label="Subject" required><input name="subject" defaultValue={modal.replyTo?`Re: ${modal.replyTo.subject}`:""} disabled={!!modal.replyTo} required placeholder="What is this about?"/></Field><Field label="Message" required><textarea name="body" required placeholder="Write your message..."/></Field></Dialog>}
{modal.type==="help"&&<Dialog open title="CareConnect help" description="Keyboard and navigation guidance." onClose={close} actions={<button type="button" className="primary-button" onClick={close}>Done</button>}><div className="help-list"><p><kbd>Ctrl K</kbd><span>Focus search</span></p><p><kbd>Tab</kbd><span>Move between controls</span></p><p><kbd>Esc</kbd><span>Close dialogs and menus</span></p><p><kbd>Alt</kbd><span>Activate the application menu bar</span></p><p><kbd>Alt+F</kbd><span>Open the File menu</span></p><p><kbd>Alt+E</kbd><span>Open the Edit menu</span></p><p><kbd>Alt+V</kbd><span>Open the View menu</span></p><p><kbd>Alt+W</kbd><span>Open the Window menu</span></p><p><kbd>← →</kbd><span>Move between application menus</span></p><p><kbd>↑ ↓</kbd><span>Move through menu items</span></p><p><kbd>Enter</kbd><span>Select the focused menu item</span></p><p>Use the left navigation to move among your health information.</p></div></Dialog>}
{modal.type==="telehealth"&&<Dialog open title="Join telehealth visit" description={`Appointment with ${modal.appointment.doctor}.`} onClose={close} actions={<><button type="button" className="secondary-button" onClick={close}>Cancel</button><button type="button" className="primary-button" onClick={()=>{close();notify("Telehealth preflight complete. A meeting link will be supplied by your provider.");}}>Continue</button></>}><p>Check that you have a reliable internet connection and a private place for your visit.</p><p>The production service will request camera and microphone access immediately before joining.</p></Dialog>}
{modal.type==="details"&&<Dialog open title="Appointment details" onClose={close} actions={<button type="button" className="primary-button" onClick={close}>Done</button>}><dl className="details-list"><dt>Provider</dt><dd>{modal.appointment.doctor}</dd><dt>Specialty</dt><dd>{modal.appointment.specialty}</dd><dt>Date and time</dt><dd>{modal.appointment.date}</dd><dt>Location</dt><dd>{modal.appointment.location}</dd></dl></Dialog>}
{modal.type==="confirm-cancel"&&<Dialog open title="Cancel appointment?" description="The appointment will move to your past appointments." onClose={close} actions={<><button type="button" className="secondary-button" onClick={close}>Keep appointment</button><button type="button" className="danger-button" onClick={()=>{dispatch({type:"cancel-appointment",id:modal.appointment.id});close();notify("Appointment cancelled.");}}>Cancel appointment</button></>}><p>Cancel your appointment with {modal.appointment.doctor} on {modal.appointment.date}?</p></Dialog>}
{modal.type==="discard-medication"&&<Dialog open title="Discard medication changes?" description="Your entered medication details will not be saved." onClose={close} actions={<><button type="button" className="secondary-button" onClick={close}>Continue editing</button><button type="button" className="danger-button" onClick={()=>{close();navigate("medications");}}>Discard changes</button></>}><p>You have unsaved changes in the medication form.</p></Dialog>}
{modal.type==="confirm-reset"&&<Dialog open title="Reset demo data?" description="This replaces all locally saved prototype changes." onClose={close} actions={<><button type="button" className="secondary-button" onClick={close}>Keep current data</button><button type="button" className="danger-button" onClick={()=>{dispatch({type:"reset"});close();notify("Demo data reset.");}}>Reset demo data</button></>}><p>Appointments, medications, messages, and notifications will return to their initial values.</p></Dialog>}</>}

function StatusBar(){const[version,setVersion]=useState("0.1.0");useEffect(()=>{void window.careConnectDesktop?.getAppVersion?.()?.then(setVersion);},[]);return <footer className="status-bar"><span><i/>Connected securely</span><span>Last synced just now</span><span>CareConnect v{version}</span></footer>}
