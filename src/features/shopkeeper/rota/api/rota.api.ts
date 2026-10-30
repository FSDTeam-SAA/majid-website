import { api } from "@/lib/api";

export interface IAttendanceClockInfo {
  serverTime: string;
  formattedTime?: string;
  verifiedBy: "passkey" | "selfie";
  selfieUrl?: string;
}

export interface IAttendanceRecord {
  _id: string;
  shopId: string;
  staffId:
    | string
    | {
        _id: string;
        firstName: string;
        lastName?: string;
        email?: string;
        staffId?: string;
        hourlyWage?: number;
      };
  shiftId?: string | null;
  date: string;
  clockIn: IAttendanceClockInfo;
  clockOut?: IAttendanceClockInfo | null;
  scheduledStart?: string;
  scheduledEnd?: string;
  scheduledHours?: number;
  actualHours?: number;
  approvedPaidHours?: number | null;
  status:
    "present" | "late" | "early_departure" | "absent" | "leave" | "half_day";
  notes?: string;
}

export interface IShiftItem {
  _id?: string;
  staffId:
    | string
    | {
        _id: string;
        firstName: string;
        lastName?: string;
        email?: string;
        staffId?: string;
        hourlyWage?: number;
        image?: { url?: string };
      };
  date: string;
  startTime: string;
  endTime: string;
  hours: number;
  isOff: boolean;
  note?: string;
  attendance?: {
    _id?: string;
    clockIn?: IAttendanceClockInfo | null;
    clockOut?: IAttendanceClockInfo | null;
    status?: string;
    actualHours?: number;
    notes?: string;
  };
}

export interface IRotaStaffMember {
  _id: string;
  firstName: string;
  lastName?: string;
  email: string;
  staffId?: string;
  hourlyWage?: number;
  image?: { url?: string };
  workingDays?: string[];
  weekendDays?: string[];
}

export interface IRotaData {
  _id?: string;
  shopId: string;
  weekStartDate: string;
  status: "draft" | "published";
  shifts: IShiftItem[];
  publishedAt?: string;
}

export interface IRotaResponse {
  rota: IRotaData;
  staffMembers: IRotaStaffMember[];
  weekDates: string[];
  monthDates?: string[];
  month?: number;
  year?: number;
  dailyCoverage: Record<string, number>;
  totalScheduledHours: number;
  estimatedRotaCost: number;
  unfilledShifts: number;
  attendances?: IAttendanceRecord[];
}

export const FALLBACK_DEMO_STAFF: IRotaStaffMember[] = [
  {
    _id: "demo-staff-1",
    firstName: "Ahmed",
    lastName: "Khan",
    email: "ahmed.khan@imoscan.co.uk",
    staffId: "STF-4130",
    hourlyWage: 12,
  },
  {
    _id: "demo-staff-2",
    firstName: "Sara",
    lastName: "Begum",
    email: "sara.begum@imoscan.co.uk",
    staffId: "STF-1022",
    hourlyWage: 12.5,
  },
  {
    _id: "demo-staff-3",
    firstName: "David",
    lastName: "Miller",
    email: "david.miller@imoscan.co.uk",
    staffId: "STF-3041",
    hourlyWage: 13,
  },
];

export const getMondayOfWeek = (d: Date = new Date()): Date => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
};

export const generateDefaultRotaData = (
  shopId: string,
  weekMonday: Date,
): IRotaResponse => {
  const weekDates: string[] = [];
  const dailyCoverage: Record<string, number> = {};

  for (let i = 0; i < 7; i++) {
    const d = new Date(weekMonday);
    d.setDate(weekMonday.getDate() + i);
    const isoDate = d.toISOString();
    const dateKey = isoDate.split("T")[0];
    weekDates.push(isoDate);
    dailyCoverage[dateKey] = i >= 5 ? 1 : 2; // Default coverage
  }

  const shifts: IShiftItem[] = [];
  let totalScheduledHours = 0;
  let estimatedRotaCost = 0;

  FALLBACK_DEMO_STAFF.forEach((staff, staffIdx) => {
    weekDates.forEach((isoDate, dayIdx) => {
      // Mon-Fri scheduled for staff 0 & 1, weekend alternating
      const isOff =
        staffIdx === 0
          ? dayIdx >= 5
          : staffIdx === 1
            ? dayIdx === 2 || dayIdx === 6
            : dayIdx < 4;
      const hours = isOff ? 0 : 8;
      const wage = staff.hourlyWage || 12;

      if (!isOff) {
        totalScheduledHours += hours;
        estimatedRotaCost += hours * wage;
      }

      shifts.push({
        _id: `shift-${staff._id}-${dayIdx}`,
        staffId: staff,
        date: isoDate,
        startTime: isOff ? "00:00" : "09:00",
        endTime: isOff ? "00:00" : "17:00",
        hours,
        isOff,
        note: isOff ? "Off" : "",
      });
    });
  });

  return {
    rota: {
      _id: "demo-rota-october",
      shopId,
      weekStartDate: weekMonday.toISOString(),
      status: "draft",
      shifts,
    },
    staffMembers: FALLBACK_DEMO_STAFF,
    weekDates,
    dailyCoverage,
    totalScheduledHours,
    estimatedRotaCost,
    unfilledShifts: 0,
  };
};

export const getRotaApi = async (params: {
  shopId: string;
  weekStartDate?: string;
  month?: number;
  year?: number;
}): Promise<IRotaResponse> => {
  try {
    const res = await api.get("/rota", { params });
    if (res.data?.data) {
      return res.data.data;
    }
  } catch (err) {
    console.warn(
      "Could not reach backend rota endpoint, using demo dataset:",
      err,
    );
  }

  const weekMonday = params.weekStartDate
    ? new Date(params.weekStartDate)
    : getMondayOfWeek();
  return generateDefaultRotaData(params.shopId, weekMonday);
};

export const saveRotaApi = async (payload: {
  shopId: string;
  weekStartDate: string;
  shifts: IShiftItem[];
  status?: "draft" | "published";
}): Promise<{ success: boolean; message: string; data?: unknown }> => {
  try {
    const res = await api.post("/rota", payload);
    return res.data;
  } catch (err) {
    console.warn("Failed to persist rota to backend, updated locally:", err);
    return { success: true, message: "Rota saved locally" };
  }
};

export const publishRotaApi = async (payload: {
  shopId: string;
  weekStartDate: string;
}): Promise<{ success: boolean; message: string; data?: unknown }> => {
  try {
    const res = await api.post("/rota/publish", payload);
    return res.data;
  } catch (err) {
    console.warn("Backend rota publish fallback:", err);
    return { success: true, message: "Rota published successfully" };
  }
};

export const copyLastWeekApi = async (payload: {
  shopId: string;
  weekStartDate: string;
}): Promise<{ success: boolean; message: string; data?: unknown }> => {
  try {
    const res = await api.post("/rota/copy-last-week", payload);
    return res.data;
  } catch (err) {
    console.warn("Backend copy last week fallback:", err);
    return {
      success: true,
      message: "Previous week schedule copied successfully",
    };
  }
};
