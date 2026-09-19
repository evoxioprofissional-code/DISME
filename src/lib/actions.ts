"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Intent, RelationshipStatus } from "@/types";

async function meId(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("unauthenticated");
  return user.id;
}

// -------- auth --------
export async function signUpEmail(
  email: string,
  password: string,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

// -------- onboarding / profile --------
export async function completeOnboarding(input: {
  displayName: string;
  username: string;
  age: number;
  intent: Intent;
  interests: string[];
  games: string[];
}): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const id = await meId();
  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: input.displayName,
      username: input.username,
      age: input.age,
      intent: input.intent,
      interests: input.interests,
      games: input.games,
      onboarded: true,
    })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function updateProfile(input: {
  displayName: string;
  username: string;
  bio: string;
  age: number;
  pronouns: string;
  intent: Intent;
  games: string[];
  interests: string[];
  isHidden: boolean;
}): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const id = await meId();
  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: input.displayName,
      username: input.username,
      bio: input.bio,
      age: input.age,
      pronouns: input.pronouns || null,
      intent: input.intent,
      games: input.games,
      interests: input.interests,
      is_hidden: input.isHidden,
    })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/", "layout");
  return { ok: true };
}

// -------- discover: like / crush --------
export async function likeProfile(
  toId: string,
  kind: "like" | "crush",
): Promise<{ matched: boolean }> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("like_profile", {
    target: toId,
    like_type: kind,
  });
  if (error) throw new Error(error.message);
  return { matched: Boolean(data) };
}

// -------- gifts --------
export async function sendGift(
  toId: string,
  giftId: string,
  message?: string,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("send_gift", {
    target: toId,
    selected_gift: giftId,
    gift_message: message || null,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/gifts");
  return { ok: true };
}

// -------- messages --------
async function ensureConversation(meIdVal: string, otherId: string): Promise<string> {
  void meIdVal;
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("start_conversation", { target: otherId });
  if (error || !data) throw new Error(error?.message ?? "conversation unavailable");
  return data;
}

export async function sendMessage(input: {
  conversationId?: string;
  toId?: string;
  body?: string;
  giftId?: string;
}): Promise<{ ok: boolean; conversationId?: string; error?: string }> {
  const id = await meId();
  let convId = input.conversationId;
  if (!convId && input.toId) convId = await ensureConversation(id, input.toId);
  if (!convId) return { ok: false, error: "Conversa inválida" };
  if (input.giftId) return { ok: false, error: "Envie presentes pela loja." };

  const supabase = await createClient();
  const { error } = await supabase.rpc("send_chat_message", {
    chat_id: convId,
    message_body: input.body || "",
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/messages/${convId}`);
  return { ok: true, conversationId: convId };
}

// -------- relationship --------
export async function requestRelationship(
  toId: string,
  type: RelationshipStatus,
  message?: string,
): Promise<{ ok: boolean; error?: string }> {
  await meId();
  const supabase = await createClient();
  const { error } = await supabase.rpc("request_relationship", {
    target: toId,
    relationship_type: type,
    request_message: message || null,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

// -------- follow --------
export async function toggleFollow(toId: string): Promise<{ following: boolean }> {
  const id = await meId();
  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("follows")
    .select("follower_id")
    .eq("follower_id", id)
    .eq("following_id", toId)
    .maybeSingle();
  if (existing) {
    await supabase.from("follows").delete().eq("follower_id", id).eq("following_id", toId);
    return { following: false };
  }
  await supabase.from("follows").insert({ follower_id: id, following_id: toId });
  return { following: true };
}

// -------- privacy --------
export async function setProfileHidden(hidden: boolean): Promise<{ ok: boolean }> {
  const supabase = await createClient();
  const id = await meId();
  const { error } = await supabase.from("profiles").update({ is_hidden: hidden }).eq("id", id);
  if (error) return { ok: false };
  revalidatePath("/", "layout");
  return { ok: true };
}

// -------- connections --------
export async function upsertConnection(
  platform: "steam" | "spotify" | "riot" | "twitch" | "discord",
  handle: string,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const id = await meId();
  const clean = handle.trim();
  if (!clean) return { ok: false, error: "Informe seu usuário." };
  const { error } = await supabase
    .from("connections")
    .upsert({ profile_id: id, platform, handle: clean }, { onConflict: "profile_id,platform" });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/settings");
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function removeConnection(
  platform: "steam" | "spotify" | "riot" | "twitch" | "discord",
): Promise<{ ok: boolean }> {
  const supabase = await createClient();
  const id = await meId();
  await supabase.from("connections").delete().eq("profile_id", id).eq("platform", platform);
  revalidatePath("/settings");
  revalidatePath("/", "layout");
  return { ok: true };
}

// -------- notifications --------
export async function markNotificationsRead() {
  const supabase = await createClient();
  const id = await meId();
  await supabase.from("notifications").update({ read: true }).eq("profile_id", id).eq("read", false);
  revalidatePath("/notifications");
}
