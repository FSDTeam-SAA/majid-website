import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createRepairRequest,
  getMyRepairRequests,
  getShopkeepers,
  getRepairRequestDetails,
  updateRepairQuoteStatus,
  getShopkeeperRepairRequests,
  getTechnicians,
  updateRepairRequestStatusByShopkeeper,
  addRepairRequestNote,
  updateRepairReSentQuoteStatus,
} from "../api/repair-request.api";

export function useShopkeeperRepairRequests(page = 1, limit = 10) {
  return useQuery({
    queryKey: ["repair-requests", "shopkeeper", page, limit],
    queryFn: () => getShopkeeperRepairRequests({ page, limit }),
  });
}

export function useGetMyRepairRequests(
  page = 1,
  limit = 10,
  readyForCollection = false,
) {
  return useQuery({
    queryKey: ["repair-requests", "my", page, limit, readyForCollection],
    queryFn: () => getMyRepairRequests({ page, limit, readyForCollection }),
  });
}

export function useRepairTechnicians(enabled = true) {
  return useQuery({
    queryKey: ["repair-request-technicians"],
    queryFn: getTechnicians,
    enabled,
  });
}

export function useUpdateRepairRequestStatusByShopkeeper() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateRepairRequestStatusByShopkeeper,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["repair-request", data.data._id],
      });
      queryClient.invalidateQueries({
        queryKey: ["repair-requests", "shopkeeper"],
      });
      toast.success("Status updated successfully");
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || "Failed to update status");
    },
  });
}

export function useAddRepairRequestNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addRepairRequestNote,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["repair-request", data.data._id],
      });
      toast.success("Note added successfully");
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || "Failed to add note");
    },
  });
}

export function useShopkeepers(search: string, minRating?: number) {
  return useQuery({
    queryKey: ["shopkeepers", search, minRating],
    queryFn: () =>
      getShopkeepers({
        search: search || undefined,
        minRating,
        page: 1,
        limit: 12,
      }),
  });
}

export function useCreateRepairRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createRepairRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["repair-requests"] });
      queryClient.invalidateQueries({
        queryKey: ["repair-request-technicians"],
      });
      toast.success("Repair request created successfully");
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(
        error.response?.data?.message || "Failed to create repair request",
      );
    },
  });
}

export function useMyRepairRequests(page = 1, limit = 10) {
  return useQuery({
    queryKey: ["repair-requests", page, limit],
    queryFn: () => getMyRepairRequests({ page, limit }),
  });
}

export function useRepairRequestDetails(id: string) {
  return useQuery({
    queryKey: ["repair-request", id],
    queryFn: () => getRepairRequestDetails(id),
    enabled: !!id,
  });
}

export function useUpdateRepairQuoteStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateRepairQuoteStatus,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["repair-request", data.data._id],
      });
      queryClient.invalidateQueries({ queryKey: ["repair-requests"] });
      toast.success("Quote status updated successfully");
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(
        error.response?.data?.message || "Failed to update quote status",
      );
    },
  });
}

export function useUpdateResentRepairQuoteStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateRepairReSentQuoteStatus,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["repair-request", data.data._id],
      });
      queryClient.invalidateQueries({ queryKey: ["repair-requests"] });
      toast.success("Quote status updated successfully");
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(
        error.response?.data?.message || "Failed to update quote status",
      );
    },
  });
}
