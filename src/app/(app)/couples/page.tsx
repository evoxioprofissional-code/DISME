import Link from "next/link";
import { Flame } from "lucide-react";
import { couples, getUser } from "@/data";
import { relationshipMeta } from "@/lib/labels";
import { pluralDays, formatNumber, longDate } from "@/lib/utils";
import { PageContainer } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";

export default function CouplesPage() {
  return (
    <PageContainer className="max-w-4xl">
      <PageHeader title="Casais" subtitle="Quem está junto no DisMe" />
      <div className="grid gap-4 sm:grid-cols-2">
        {couples.map((c) => {
          const a = getUser(c.userIds[0]);
          const b = getUser(c.userIds[1]);
          if (!a || !b) return null;
          return (
            <Link key={c.id} href={`/couple/${c.id}`}>
              <Card interactive className="p-5">
                <div className="flex items-center gap-3">
                  <div className="flex">
                    <Avatar src={a.avatar} name={a.displayName} size="lg" className="ring-2 ring-surface" />
                    <Avatar src={b.avatar} name={b.displayName} size="lg" className="-ml-4 ring-2 ring-surface" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-extrabold text-text">
                      {a.displayName} + {b.displayName}
                    </p>
                    <p className="text-xs text-muted">
                      {relationshipMeta[c.type]} · desde {longDate(c.since)}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-sm">
                  <span className="flex items-center gap-1.5 font-semibold text-rarity-legendary">
                    <Flame className="size-4" />
                    {pluralDays(c.streakDays)}
                  </span>
                  <span className="text-text-secondary">
                    <span className="tnum font-bold text-text">{formatNumber(c.giftsExchanged)}</span> presentes trocados
                  </span>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </PageContainer>
  );
}
