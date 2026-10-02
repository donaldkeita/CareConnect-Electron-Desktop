export type PageId = "overview" | "appointments" | "medications" | "messages";
export interface Appointment { doctor: string; specialty: string; date: string; location: string; type: "In person" | "Telehealth"; }
export const appointments: Appointment[] = [
  { doctor: "Dr. Sarah Chen", specialty: "Primary Care", date: "Today, 5:21 PM", location: "Northside Medical Center, Suite 210", type: "In person" },
  { doctor: "Dr. Marcus Webb", specialty: "Cardiology", date: "Tomorrow, 11:21 AM", location: "Telehealth · Video call", type: "Telehealth" },
  { doctor: "Dr. Priya Nair", specialty: "Endocrinology", date: "Fri, Sep 4 · 1:21 PM", location: "Westfield Health Pavilion, Room 114", type: "In person" },
];
export const medications: Array<{ name: string; dose: string; schedule: string; prescriber: string; refill: string; status: "Missed" | "On track" }> = [
  { name: "Lisinopril", dose: "10 mg", schedule: "Once daily · 8:00 AM", prescriber: "Dr. Chen", refill: "Sep 14, 2026", status: "Missed" },
  { name: "Metformin", dose: "500 mg", schedule: "Twice daily · 8:00 AM, 8:00 PM", prescriber: "Dr. Nair", refill: "Sep 22, 2026", status: "Missed" },
  { name: "Atorvastatin", dose: "20 mg", schedule: "Once daily · 9:00 PM", prescriber: "Dr. Webb", refill: "Oct 3, 2026", status: "On track" },
  { name: "Vitamin D3", dose: "2,000 IU", schedule: "Once daily · 8:00 AM", prescriber: "Dr. Chen", refill: "Nov 1, 2026", status: "On track" },
];
export const messages = [
  { id: 1, initials: "SC", sender: "Dr. Sarah Chen", subject: "Your recent lab results", preview: "Your CBC and metabolic panel results are in. Overall things look...", time: "2h ago", unread: true, body: "Your CBC and metabolic panel results are in. Overall things look good. I’d like to discuss one value at your next appointment." },
  { id: 2, initials: "NM", sender: "Northside Medical Center", subject: "Refill reminder: Lisinopril", preview: "Your prescription is ready for renewal.", time: "18h ago", unread: true, body: "Your Lisinopril prescription is ready for renewal. Please contact the pharmacy if you have any questions." },
  { id: 3, initials: "MW", sender: "Dr. Marcus Webb", subject: "Pre-appointment instructions", preview: "Please review these instructions before your upcoming visit.", time: "2d ago", unread: false, body: "Please review your medication list and have your recent blood pressure readings available for our appointment." },
  { id: 4, initials: "AT", sender: "Appointments Team", subject: "Appointment confirmed: Dr. Priya Nair", preview: "Your upcoming appointment has been confirmed.", time: "4d ago", unread: false, body: "Your appointment with Dr. Priya Nair is confirmed. Please arrive 15 minutes before the scheduled time." },
];
