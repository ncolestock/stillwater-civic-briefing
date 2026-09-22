export const DISCLAIMER =
  "Researched and written by AI from public records. Not a substitute for the official record. Charges are allegations, not convictions. Verify against the source links.";

export const DESKS = {
  meetings: { label: "Meetings", path: "meetings" },
  schools: { label: "Schools", path: "schools" },
  land: { label: "Land", path: "land" },
  roads: { label: "Roads", path: "roads" },
  blotter: { label: "Blotter", path: "blotter" },
  calendar: { label: "Calendar", path: "calendar" },
} as const;

export type DeskId = keyof typeof DESKS;

export const NAV: DeskId[] = ["meetings", "schools", "land", "blotter", "calendar"];

export function withBase(path: string): string {
  const base = import.meta.env.BASE_URL;
  const clean = path.replace(/^\//, "");
  return `${base}${clean}`;
}

export function formatDateline(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}
