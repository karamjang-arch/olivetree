import { redirect } from "next/navigation";
import { todayKey, honeyDatesLive } from "../../lib/content";

export const dynamic = "force-dynamic";
export default async function HoneyIndex() {
  const t = todayKey();
  const all = await honeyDatesLive();
  const target = all.includes(t) ? t : all.filter((d) => d <= t).pop() || all[0];
  redirect(`/honey/${target}`);
}
