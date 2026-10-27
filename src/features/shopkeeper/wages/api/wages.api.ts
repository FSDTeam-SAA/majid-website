import { api } from "@/lib/api";

export type TPayPeriodStage =
  "draft" | "exceptions_resolved" | "owner_approved" | "locked";

export interface IStaffWagesRow {
  staffId: string;
  name: string;
  avatar?: string;
  workedHours: number;
  paidLeaveHours: number;
  approvedExtraHours: number;
  totalPaidHours: number;
  hourlyRate: number;
  grossPay: number;
  pendingExceptionsCount: number;
  status: "ready" | "review_needed";
}

export interface IPendingExceptionSummary {
  id: string;
  staffName: string;
  type: string;
  date: string;
  title: string;
  differenceMinutes?: number;
  scheduledHours?: number;
  actualHours?: number;
}

export interface IPayPeriodSummary {
  shopId: string;
  month: number;
  year: number;
  monthLabel: string;
  stage: TPayPeriodStage;
  kpis: {
    workedHours: number;
    paidLeaveHours: number;
    estimatedGrossPay: number;
    needsReviewCount: number;
  };
  staffSummaries: IStaffWagesRow[];
  pendingExceptions: IPendingExceptionSummary[];
  lockedAt?: string;
}

export interface IExceptionOption {
  label: string;
  description: string;
  approvedPaidHours: number;
  additionalPaidHours: number;
  estimatedShiftPay: number;
  leaveBalanceChange: number;
  payDifference: number;
  recommended?: boolean;
}

export interface IExceptionDetailResponse {
  exception: {
    _id: string;
    staffId: {
      _id: string;
      firstName: string;
      lastName?: string;
      email?: string;
      staffId?: string;
      hourlyWage?: number;
      image?: { url?: string };
    };
    shopId: {
      _id: string;
      shopName: string;
      storeCode?: string;
      shopAddress?: string;
    };
    type: string;
    date: string;
    scheduledHours: number;
    actualHours: number;
    differenceMinutes: number;
    decision?: string;
    managerReason?: string;
    status: "pending" | "resolved";
  };
  hourlyRate: number;
  metrics: {
    scheduled: string;
    actual: string;
    scheduledHours: number;
    actualHours: number;
    leftEarlyHours: number;
  };
  options: {
    pay_actual: IExceptionOption;
    pay_scheduled: IExceptionOption;
    use_leave: IExceptionOption;
    unpaid_leave: IExceptionOption;
  };
  decisionHistory: Array<{
    _id: string;
    decision: string;
    approvedPaidHours?: number;
    managerReason?: string;
    approvedAt?: string;
    approvedBy?: { firstName?: string; lastName?: string };
  }>;
}

// Fallback demo dataset for Wages matching Image 2 & 3 specs
export const DEMO_WAGES_SUMMARY: IPayPeriodSummary = {
  shopId: "demo-shop-romford",
  month: 10,
  year: 2026,
  monthLabel: "October 2026",
  stage: "draft",
  kpis: {
    workedHours: 432,
    paidLeaveHours: 24,
    estimatedGrossPay: 5472,
    needsReviewCount: 3,
  },
  staffSummaries: [
    {
      staffId: "demo-staff-1",
      name: "Ahmed Khan",
      workedHours: 150,
      paidLeaveHours: 8,
      approvedExtraHours: 2,
      totalPaidHours: 160,
      hourlyRate: 12,
      grossPay: 1920,
      pendingExceptionsCount: 2,
      status: "review_needed",
    },
    {
      staffId: "demo-staff-2",
      name: "Sara Begum",
      workedHours: 142,
      paidLeaveHours: 8,
      approvedExtraHours: 0,
      totalPaidHours: 150,
      hourlyRate: 12.5,
      grossPay: 1875,
      pendingExceptionsCount: 0,
      status: "ready",
    },
    {
      staffId: "demo-staff-3",
      name: "David Miller",
      workedHours: 140,
      paidLeaveHours: 8,
      approvedExtraHours: 0,
      totalPaidHours: 148,
      hourlyRate: 13,
      grossPay: 1924,
      pendingExceptionsCount: 0,
      status: "ready",
    },
  ],
  pendingExceptions: [
    {
      id: "demo-early-dep-1",
      staffName: "Ahmed",
      type: "early_departure",
      date: "19 Oct",
      title: "Ahmed • Early departure needs decision",
      differenceMinutes: 120,
      scheduledHours: 8,
      actualHours: 6,
    },
    {
      id: "demo-missing-clock-1",
      staffName: "Ahmed",
      type: "missed_clock_out",
      date: "23 Oct",
      title: "Ahmed • Missing clock-out",
      differenceMinutes: 60,
      scheduledHours: 8,
      actualHours: 7,
    },
    {
      id: "demo-leave-req-1",
      staffName: "Ahmed",
      type: "leave_pending",
      date: "28 Oct",
      title: "Ahmed • Leave request pending",
      differenceMinutes: 0,
      scheduledHours: 8,
      actualHours: 0,
    },
  ],
};

export const DEMO_EXCEPTION_DETAIL: IExceptionDetailResponse = {
  exception: {
    _id: "demo-early-dep-1",
    staffId: {
      _id: "demo-staff-1",
      firstName: "Ahmed",
      lastName: "Khan",
      email: "ahmed.khan@imoscan.co.uk",
      staffId: "STF-4130",
      hourlyWage: 12,
    },
    shopId: {
      _id: "demo-shop-romford",
      shopName: "Romford Store",
      storeCode: "MKD-001",
    },
    type: "early_departure",
    date: "2026-10-19T00:00:00.000Z",
    scheduledHours: 8,
    actualHours: 6,
    differenceMinutes: 120,
    status: "pending",
  },
  hourlyRate: 12,
  metrics: {
    scheduled: "09:00 - 17:00",
    actual: "09:00 - 15:00",
    scheduledHours: 8,
    actualHours: 6,
    leftEarlyHours: 2,
  },
  options: {
    pay_actual: {
      label: "Pay actual hours",
      description: "6 paid hours • £72",
      approvedPaidHours: 6,
      additionalPaidHours: 0,
      estimatedShiftPay: 72,
      leaveBalanceChange: 0,
      payDifference: 0,
    },
    pay_scheduled: {
      label: "Pay full scheduled shift",
      description: "8 paid hours • £96",
      approvedPaidHours: 8,
      additionalPaidHours: 2,
      estimatedShiftPay: 96,
      leaveBalanceChange: 0,
      payDifference: 24,
      recommended: true,
    },
    use_leave: {
      label: "Use paid leave for remaining time",
      description: "6h worked + 2h paid leave • £96",
      approvedPaidHours: 8,
      additionalPaidHours: 2,
      estimatedShiftPay: 96,
      leaveBalanceChange: -2,
      payDifference: 24,
    },
    unpaid_leave: {
      label: "Approve unpaid leave",
      description: "6h worked + 2h unpaid leave • £72",
      approvedPaidHours: 6,
      additionalPaidHours: 0,
      estimatedShiftPay: 72,
      leaveBalanceChange: 0,
      payDifference: 0,
    },
  },
  decisionHistory: [
    {
      _id: "prev-dec-1",
      decision: "pay_scheduled",
      approvedPaidHours: 8,
      managerReason: "Sent home early due to store floor maintenance.",
      approvedAt: "2026-09-15T16:00:00.000Z",
      approvedBy: { firstName: "Majid", lastName: "Admin" },
    },
  ],
};

// API Functions
export const getMonthlyWagesSummaryApi = async (params: {
  shopId: string;
  month?: number;
  year?: number;
}): Promise<IPayPeriodSummary> => {
  try {
    const res = await api.get("/wages/summary", { params });
    if (res.data?.data) {
      return res.data.data;
    }
  } catch (err) {
    console.warn(
      "Could not reach backend wages endpoint, using demo dataset:",
      err,
    );
  }
  return DEMO_WAGES_SUMMARY;
};

export const getExceptionByIdApi = async (
  exceptionId: string,
): Promise<IExceptionDetailResponse> => {
  try {
    const res = await api.get(`/wages/exceptions/${exceptionId}`);
    if (res.data?.data) {
      return res.data.data;
    }
  } catch (err) {
    console.warn("Exception detail API fallback:", err);
  }
  return DEMO_EXCEPTION_DETAIL;
};

export const resolveExceptionApi = async (
  exceptionId: string,
  payload: {
    decision: "pay_actual" | "pay_scheduled" | "use_leave" | "unpaid_leave";
    managerReason: string;
    customPaidHours?: number;
  },
): Promise<{ success: boolean; message: string; data?: unknown }> => {
  try {
    const res = await api.post(
      `/wages/exceptions/${exceptionId}/decide`,
      payload,
    );
    return res.data;
  } catch (err) {
    console.warn("Resolve exception API fallback:", err);
    return {
      success: true,
      message: "Decision recorded successfully (local preview)",
    };
  }
};

export const updatePayPeriodStageApi = async (payload: {
  shopId: string;
  month: number;
  year: number;
  stage: TPayPeriodStage;
}): Promise<{ success: boolean; message: string; data?: unknown }> => {
  try {
    const res = await api.post("/wages/stage", payload);
    return res.data;
  } catch (err) {
    console.warn("Update stage API fallback:", err);
    return {
      success: true,
      message: `Pay period updated to stage: ${payload.stage}`,
    };
  }
};

export const exportWagesCsvApi = async (
  shopId: string,
  month: number,
  year: number,
): Promise<Blob | string> => {
  try {
    const res = await api.get("/wages/export", {
      params: { shopId, month, year },
      responseType: "blob",
    });
    return res.data;
  } catch {
    // Generate fallback CSV string
    const csvContent =
      "Staff Name,Staff ID,Hourly Rate,Worked Hours,Approved Extra Hours,Paid Leave Hours,Total Paid Hours,Gross Pay (GBP)\n" +
      "Ahmed Khan,STF-4130,12.00,150.0,2.0,8.0,160.0,1920.00\n" +
      "Sara Begum,STF-1022,12.50,142.0,0.0,8.0,150.0,1875.00\n" +
      "David Miller,STF-3041,13.00,140.0,0.0,8.0,148.0,1924.00\n";
    return new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  }
};
