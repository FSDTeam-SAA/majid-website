import { api } from "@/lib/api";

export interface IStaffAttendanceRow {
  _id: string;
  date: string;
  formattedDate: string;
  scheduledStart: string;
  scheduledEnd: string;
  clockInTime: string;
  clockOutTime: string;
  actualHours: number;
  approvedPaidHours: number;
  status: string;
  note: string;
}

export interface IStaffAttendanceResponse {
  staff?: {
    _id: string;
    firstName: string;
    lastName?: string;
    email: string;
    staffId?: string;
    hourlyWage: number;
    leaveAllowanceHours?: number;
    usedLeaveHours?: number;
    bookedLeaveHours?: number;
    image?: { url?: string };
    storeName?: string;
  };
  records: IStaffAttendanceRow[];
  summary: {
    workedHours: number;
    approvedExtraHours: number;
    paidLeaveHours: number;
    totalPaidHours: number;
    hourlyRate: number;
    estimatedGrossPay: number;
  };
}

export interface IStaffLeaveBalance {
  allowanceHours: number;
  usedHours: number;
  bookedHours: number;
  remainingHours: number;
}

export interface ILeaveRequestItem {
  _id: string;
  staffId: string;
  staffName: string;
  leaveType: "annual" | "sick" | "unpaid" | "casual";
  date: string;
  formattedDate: string;
  durationHours: number;
  note?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface IRawAttendanceRecord {
  _id: string;
  date: string;
  scheduledStart?: string;
  scheduledEnd?: string;
  actualHours?: number;
  approvedPaidHours?: number;
  status: string;
  clockIn?: { serverTime?: string };
  clockOut?: { serverTime?: string };
}

interface IRawLeaveRequest {
  _id: string;
  staffId: string | { _id: string; firstName?: string; lastName?: string };
  leaveType: "annual" | "sick" | "unpaid" | "casual";
  date: string;
  durationHours: number;
  note?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

// API Functions - Live backend calls without fake fallbacks
export const getStaffAttendanceHistoryApi = async (
  staffId: string,
  params?: { month?: number; year?: number },
): Promise<IStaffAttendanceResponse> => {
  try {
    const res = await api.get(`/attendance/staff/${staffId}`, { params });
    if (res.data?.data) {
      const data = res.data.data;
      const formattedRecords = (data.records || []).map(
        (r: IRawAttendanceRecord) => ({
          _id: r._id,
          date: r.date,
          formattedDate: new Intl.DateTimeFormat("en-GB", {
            day: "numeric",
            month: "short",
          }).format(new Date(r.date)),
          scheduledStart: r.scheduledStart || "09:00",
          scheduledEnd: r.scheduledEnd || "17:00",
          clockInTime: r.clockIn?.serverTime
            ? new Intl.DateTimeFormat("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
              }).format(new Date(r.clockIn.serverTime))
            : "—",
          clockOutTime: r.clockOut?.serverTime
            ? new Intl.DateTimeFormat("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
              }).format(new Date(r.clockOut.serverTime))
            : "—",
          actualHours: r.actualHours || 0,
          approvedPaidHours: r.approvedPaidHours || r.actualHours || 0,
          status: r.status,
          note:
            r.status === "early_departure"
              ? "Early departure logged"
              : r.status || "Normal",
        }),
      );

      return {
        staff: data.staff,
        records: formattedRecords,
        summary: data.summary || {
          workedHours: 0,
          approvedExtraHours: 0,
          paidLeaveHours: 0,
          totalPaidHours: 0,
          hourlyRate: data.staff?.hourlyWage || 12,
          estimatedGrossPay: 0,
        },
      };
    }
  } catch (err) {
    console.error("Staff attendance API error:", err);
  }

  return {
    records: [],
    summary: {
      workedHours: 0,
      approvedExtraHours: 0,
      paidLeaveHours: 0,
      totalPaidHours: 0,
      hourlyRate: 12,
      estimatedGrossPay: 0,
    },
  };
};

export const getStaffLeaveBalanceApi = async (
  staffId: string,
): Promise<IStaffLeaveBalance> => {
  try {
    const res = await api.get(`/leave/balance/${staffId}`);
    if (res.data?.data) {
      const data = res.data.data;
      return {
        allowanceHours: data.totalAllowanceHours ?? 160,
        usedHours: data.usedHours ?? 0,
        bookedHours: data.bookedHours ?? 0,
        remainingHours: data.remainingHours ?? 160,
      };
    }
  } catch (err) {
    console.error("Leave balance API error:", err);
  }

  return {
    allowanceHours: 0,
    usedHours: 0,
    bookedHours: 0,
    remainingHours: 0,
  };
};

export const getLeaveRequestsApi = async (params: {
  staffId?: string;
  shopId?: string;
}): Promise<ILeaveRequestItem[]> => {
  try {
    const res = await api.get("/leave", { params });
    if (res.data?.data) {
      return res.data.data.map((r: IRawLeaveRequest) => ({
        _id: r._id,
        staffId: typeof r.staffId === "object" ? r.staffId?._id : r.staffId,
        staffName:
          typeof r.staffId === "object"
            ? `${r.staffId?.firstName || ""} ${r.staffId?.lastName || ""}`.trim()
            : "Staff",
        leaveType: r.leaveType,
        date: r.date,
        formattedDate: r.date
          ? new Intl.DateTimeFormat("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            }).format(new Date(r.date))
          : "—",
        durationHours: r.durationHours || 0,
        note: r.note || "",
        status: r.status,
        createdAt: r.createdAt,
      }));
    }
  } catch (err) {
    console.error("Leave requests API error:", err);
  }

  return [];
};

export const decideLeaveRequestApi = async (
  requestId: string,
  payload: {
    status: "approved" | "rejected";
    managerComment?: string;
  },
): Promise<{ success: boolean; message: string; data?: unknown }> => {
  const res = await api.patch(`/leave/${requestId}/decide`, payload);
  return res.data;
};
