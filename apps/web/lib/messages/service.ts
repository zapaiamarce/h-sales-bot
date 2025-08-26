import { supabase } from "../supabase/client";
import type { Message, CreateMessageData, UpdateMessageData } from "./types";

export const messagesService = {
  // Fetch user messages
  async getMessages(): Promise<Message[]> {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Error fetching messages: ${error.message}`);
    }

    return data || [];
  },

  // Create new message
  async createMessage(content: string): Promise<Message> {
    const { data, error } = await supabase
      .from("messages")
      .insert([{ content }])
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating message: ${error.message}`);
    }

    return data;
  },

  // Update message
  async updateMessage(id: string, content: string): Promise<Message> {
    const { data, error } = await supabase
      .from("messages")
      .update({ content, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating message: ${error.message}`);
    }

    return data;
  },

  // Delete message
  async deleteMessage(id: string): Promise<void> {
    const { error } = await supabase.from("messages").delete().eq("id", id);

    if (error) {
      throw new Error(`Error deleting message: ${error.message}`);
    }
  },
};
