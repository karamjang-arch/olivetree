import { redirect } from "next/navigation";

// 브나야는 서재의 '우리가 쓴 책'으로 옮겼다
export default function Benaiah() {
  redirect("/library#ours");
}
