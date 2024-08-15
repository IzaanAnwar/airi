export interface Message {
  id: string;
  author_role: string | 'user';
  content: string;
  timestamp: number;
  parent_id?: string;
  children_ids?: string[];
}

export interface Conversation {
  title: string;
  label?: string;
  create_time: number;
  update_time: number;
  conversation_id: string;
  messages: Message[];
}

export interface IUser {
  id: string;
  email: string;
  name: string;
  has_uploaded: boolean;
}
