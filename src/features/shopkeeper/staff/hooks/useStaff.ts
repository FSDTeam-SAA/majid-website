import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createStaffApi,
  getAllUsersApi,
  StaffUser,
  updateStaffReferenceFaceApi,
} from "../api/staff.api";

export function useStaffList() {
  return useQuery({
    queryKey: ["staff-users"],
    queryFn: getAllUsersApi,
    select: (response) =>
      (response.data || []).filter(
        (user: StaffUser) => user.role?.toLowerCase() === "staff",
      ),
  });
}

export function useCreateStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createStaffApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-users"] });
      toast.success("Staff member created successfully");
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || "Failed to create staff");
    },
  });
}

export function useUpdateStaffReferenceFace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      staffId,
      payload,
    }: {
      staffId: string;
      payload: { file?: File; photoUrl?: string };
    }) => updateStaffReferenceFaceApi(staffId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-users"] });
      toast.success("Staff biometric reference face enrolled successfully");
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(
        error.response?.data?.message || "Failed to register reference face",
      );
    },
  });
}
