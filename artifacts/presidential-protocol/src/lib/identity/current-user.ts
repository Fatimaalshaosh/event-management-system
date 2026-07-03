import type { IdentityInput } from "./types";

/** The signed-in demo executive. One identity, reused across the platform. */
export const CURRENT_USER: IdentityInput = {
  id: "me",
  name: "Fatima Darwish",
  nameAr: "فاطمة درويش",
  gender: "female",
  nationality: "AE",
  role: "Chief of Protocol",
  roleAr: "مديرة البروتوكول",
  department: "protocol",
  presence: "available",
  email: "fatima.omar@psn.gov.ae",
  phone: "+971 2 555 0100",
  office: "Command HQ · Floor 7",
  tasks: 5,
  nextMeeting: "14:00 · Protocol Sync",
};
