import { users, currentUserId, matches } from "@/data";
import { DiscoverDeck } from "@/components/discover/DiscoverDeck";

export default function DiscoverPage() {
  const matchedIds = new Set(matches.map((m) => m.userId));
  const candidates = users.filter(
    (u) => u.id !== currentUserId && !matchedIds.has(u.id),
  );

  return (
    <div className="px-4 py-5 sm:px-6 lg:py-8">
      <DiscoverDeck candidates={candidates} />
    </div>
  );
}
