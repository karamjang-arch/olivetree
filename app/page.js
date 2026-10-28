import DayView from "../components/DayView";
import { todayKey } from "../lib/content";

export const revalidate = 300;
export default function Home() {
  return <DayView date={todayKey()} home />;
}
