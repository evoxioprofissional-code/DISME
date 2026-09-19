import { redirect } from "next/navigation";
import { getSessionUserId, isOnboarded } from "@/lib/queries";
import { Onboarding } from "@/components/onboarding/Onboarding";

export default async function OnboardingPage() {
  const uid = await getSessionUserId();
  if (!uid) redirect("/login");
  if (await isOnboarded()) redirect("/home");
  return <Onboarding />;
}
