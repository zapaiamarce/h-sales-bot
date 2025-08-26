export interface Message {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateMessageData {
  content: string;
}

export interface UpdateMessageData {
  content: string;
}
