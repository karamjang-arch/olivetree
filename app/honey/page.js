import { redirect } from "next/navigation";
import { todayKey, honeyDates } from "../../lib/content";

export const dynamic = "force-dynamic";
export default function HoneyIndex() {
  const t = todayKey();
  const all = honeyDates();
  const target = all.includes(t) ? t : all.filter((d) => d <= t).pop() || all[0];
  redirect(`/honey/${target}`);
}
