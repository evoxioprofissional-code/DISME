import { notFound } from "next/navigation";
import { ChatThread } from "@/components/messages/ChatThread";
import { getConversation, getSessionUserId } from "@/lib/queries";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const meId = await getSessionUserId();
  if (!meId) notFound();
  const thread = await getConversation(id, meId);
  if (!thread) notFound();
  const conversation = {
    id: thread.id,
    userId: thread.other.id,
    messages: thread.messages,
    updatedAt: thread.messages.at(-1)?.createdAt ?? new Date().toISOString(),
    unread: 0,
  };

  return <ChatThread conversation={conversation} other={thread.other} meId={meId} />;
}
