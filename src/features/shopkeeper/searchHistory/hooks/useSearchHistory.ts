import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getSearchHistory } from "../api/search-history.api";
import { getActiveShopId } from "@/features/shopkeeper/shop/store/shopStorage";

export function useSearchHistory(page = 1, limit = 10) {
  const activeShopId = getActiveShopId();
  return useQuery({
    queryKey: ["imei-search-history", activeShopId, page, limit],
    queryFn: () => getSearchHistory({ page, limit }),
    placeholderData: keepPreviousData,
  });
}
