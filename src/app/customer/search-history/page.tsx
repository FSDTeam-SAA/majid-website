import SearchHistory from "@/features/shopkeeper/searchHistory/component/SearchHistory";

export const metadata = {
  title: "Scan History | Customer Dashboard",
  description: "View your recent IMEI checks and device scan history.",
};

export default function CustomerSearchHistoryPage() {
  return <SearchHistory />;
}
