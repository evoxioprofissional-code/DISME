import { redirect } from "next/navigation";
import { getMyProfile } from "@/lib/queries";
import { Onboarding } from "@/components/onboarding/Onboarding";

export default async function OnboardingPage() {
  const profile = await getMyProfile();
  if (!profile) redirect("/login");
  if (profile.onboarded) redirect("/home");
  return <Onboarding profile={profile} />;
}
