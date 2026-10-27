import DayView from "../../../components/DayView";
import { honeyDates } from "../../../lib/content";

export const revalidate = 3600;
export function generateStaticParams() {
  return honeyDates().map((date) => ({ date }));
}
export default async function Page({ params }) {
  const { date } = await params;
  return <DayView date={date} />;
}
