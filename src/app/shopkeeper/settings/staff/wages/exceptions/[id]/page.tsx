import { Metadata } from "next";
import { ReviewEarlyDeparture } from "@/features/shopkeeper/wages/components/ReviewEarlyDeparture";

export const metadata: Metadata = {
  title: "Review Shift Decision | Shopkeeper Dashboard",
  description: "Review attendance exception and decide pay compensation.",
};

export default async function SettingsExceptionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ReviewEarlyDeparture exceptionId={id} />;
}
