import { EncryptedPayload } from './crypto';

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  encryptedPayload?: EncryptedPayload;
  timestamp: number;
  status: MessageStatus;
  imageUri?: string;
  replyToId?: string;
  isDeleted?: boolean;
}

export interface ConversationInfo {
  id: string;
  partnerUserId: string;
  partnerDeviceId?: string;
  partnerPublicKey?: string;
  isPartnerOnline: boolean;
  isPartnerTyping: boolean;
  lastSeen?: number;
}

export type WsEventType =
  | 'message'
  | 'delivery_ack'
  | 'read_ack'
  | 'typing'
  | 'presence'
  | 'ping'
  | 'pong'
  | 'error';

export interface WsMessageEvent {
  type: WsEventType;
  payload: any;
}
