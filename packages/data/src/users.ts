import { Ustadz } from "@alwa/core";

export const MOCK_USTADZ: Ustadz[] = [
  {
    id: "u-001",
    name: "Ustadz Ahmad Fauzi",
    username: "ahmad",
    passwordHash: "smp123",
    assignedLevels: ["1SMP", "2SMP", "3SMP"],
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "u-002",
    name: "Ustadz Hasan Basri",
    username: "hasan",
    passwordHash: "sma123",
    assignedLevels: ["1SMA", "2SMA", "3SMA"],
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "u-003",
    name: "Ustadz Ridwan",
    username: "ridwan",
    passwordHash: "all123",
    assignedLevels: ["1SMP", "2SMP", "3SMP", "1SMA", "2SMA", "3SMA"],
    createdAt: "2026-01-01T00:00:00Z",
  },
];
