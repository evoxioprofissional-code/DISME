import { DiscoverDeck } from "@/components/discover/DiscoverDeck";
import { getMyProfile, listDiscover } from "@/lib/queries";

export default async function DiscoverPage() {
  const me = await getMyProfile();
  const candidates = await listDiscover(me?.id ?? null);

  return (
    <div className="px-4 py-5 sm:px-6 lg:py-8">
      <DiscoverDeck candidates={candidates} me={me} />
    </div>
  );
}
