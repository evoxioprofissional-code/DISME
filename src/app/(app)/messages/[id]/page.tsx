import { notFound } from "next/navigation";
import { conversations, getUser, currentUserId } from "@/data";
import { ChatThread } from "@/components/messages/ChatThread";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const conversation = conversations.find((c) => c.id === id);
  if (!conversation) notFound();
  const other = getUser(conversation.userId);
  if (!other) notFound();

  return <ChatThread conversation={conversation} other={other} meId={currentUserId} />;
}
