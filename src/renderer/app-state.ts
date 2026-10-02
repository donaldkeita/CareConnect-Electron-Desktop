import { appointments, medications, messages, type Appointment, type Medication, type MessageThread, type PageId } from "./mock-data";

export interface NotificationItem {
  id: number;
  title: string;
  detail: string;
  page: PageId;
  read: boolean;
}

export interface AppState {
  page: PageId;
  appointments: Appointment[];
  medications: Medication[];
  messages: MessageThread[];
  notifications: NotificationItem[];
}

export type AppAction =
  | { type: "navigate"; page: PageId }
  | { type: "add-appointment"; appointment: Appointment }
  | { type: "update-appointment"; appointment: Appointment }
  | { type: "cancel-appointment"; id: number }
  | { type: "add-medication"; medication: Medication }
  | { type: "send-message"; message: MessageThread }
  | { type: "reply-message"; id: number; body: string }
  | { type: "select-message"; id: number }
  | { type: "read-notification"; id: number }
  | { type: "reset" };

export const initialState: AppState = {
  page: "overview",
  appointments,
  medications,
  messages,
  notifications: [
    { id: 1, title: "Two unread messages", detail: "New updates from your care team", page: "messages", read: false },
    { id: 2, title: "Two missed doses", detail: "Review today’s medication schedule", page: "medications", read: false },
    { id: 3, title: "Upcoming appointment", detail: "Dr. Sarah Chen at 5:21 PM", page: "appointments", read: true },
  ],
};

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "navigate": return { ...state, page: action.page };
    case "add-appointment": return { ...state, appointments: [...state.appointments, action.appointment], page: "appointments" };
    case "update-appointment": return { ...state, appointments: state.appointments.map((item) => item.id === action.appointment.id ? action.appointment : item), page: "appointments" };
    case "cancel-appointment": return { ...state, appointments: state.appointments.map((item) => item.id === action.id ? { ...item, status: "Cancelled" } : item) };
    case "add-medication": return { ...state, medications: [...state.medications, action.medication], page: "medications" };
    case "send-message": return { ...state, messages: [action.message, ...state.messages], page: "messages" };
    case "reply-message": return { ...state, messages: state.messages.map((item) => item.id === action.id ? { ...item, body: `${item.body}\n\nJordan: ${action.body}`, preview: action.body, time: "Just now", unread: false } : item) };
    case "select-message": return { ...state, messages: state.messages.map((item) => item.id === action.id ? { ...item, unread: false } : item) };
    case "read-notification": return { ...state, notifications: state.notifications.map((item) => item.id === action.id ? { ...item, read: true } : item) };
    case "reset": return initialState;
  }
}

const STORAGE_KEY = "careconnect-demo-state-v2";

export function loadAppState(): AppState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return initialState;
    const parsed = JSON.parse(saved) as Partial<AppState>;
    if (!Array.isArray(parsed.appointments) || !Array.isArray(parsed.medications) || !Array.isArray(parsed.messages)) return initialState;
    return { ...initialState, ...parsed, page: "overview" };
  } catch { return initialState; }
}

export function saveAppState(state: AppState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
