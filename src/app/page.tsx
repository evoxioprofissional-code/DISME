import { redirect } from "next/navigation";

// Dev opens straight into the logged-in product (Home), per the brief.
export default function RootPage() {
  redirect("/home");
}
