import { useState, useEffect, useCallback } from 'react';
import { ChatMessage, ConversationInfo } from '../types/chat';
import { CryptoService } from '../services/cryptoService';
import { WebSocketService } from '../services/websocketService';
import { SecureStorage } from '../storage/secureStorage';

export function useChat(conversationId: string | undefined, partnerPublicKey: string | undefined) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [isPartnerOnline, setIsPartnerOnline] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [replyingToMessage, setReplyingToMessage] = useState<ChatMessage | null>(null);

  const wsService = WebSocketService.getInstance();

  // Listen to incoming WebSocket events
  useEffect(() => {
    const unsubscribe = wsService.subscribe(async (event) => {
      if (event.type === 'message') {
        const payload = event.payload;
        // Decrypt incoming message using local secret key
        const myKeyPair = await CryptoService.getOrCreateKeyPair();
        const decryptedText = CryptoService.decryptMessage(
          payload.encrypted_payload,
          myKeyPair.secretKey
        );

        if (decryptedText) {
          const newMsg: ChatMessage = {
            id: payload.id || 'msg_' + Date.now(),
            conversationId: payload.conversation_id,
            senderId: payload.sender_id,
            text: decryptedText,
            timestamp: payload.created_at || Date.now(),
            status: 'read',
            imageUri: payload.image_uri,
            replyToId: payload.reply_to_id,
          };

          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });

          // Send read ack back via WS
          wsService.send('read_ack', { message_id: newMsg.id, conversation_id: conversationId });
        }
      } else if (event.type === 'typing') {
        setIsTyping(event.payload.is_typing);
      } else if (event.type === 'presence') {
        setIsPartnerOnline(event.payload.status === 'online');
      } else if (event.type === 'delivery_ack') {
        setMessages((prev) =>
          prev.map((m) => (m.id === event.payload.message_id ? { ...m, status: 'delivered' } : m))
        );
      } else if (event.type === 'read_ack') {
        setMessages((prev) =>
          prev.map((m) => (m.id === event.payload.message_id ? { ...m, status: 'read' } : m))
        );
      }
    });

    return () => {
      unsubscribe();
    };
  }, [conversationId, wsService]);

  const sendMessage = useCallback(
    async (text: string, imageUri?: string) => {
      if (!text.trim() && !imageUri) return;

      const session = await SecureStorage.getDeviceSession();
      const myKeyPair = await CryptoService.getOrCreateKeyPair();
      if (!session) return;

      // Use partner public key or fallback public key
      const targetPubKey = partnerPublicKey || myKeyPair.publicKey;

      // Encrypt message on device BEFORE network transmission
      const encryptedPayload = CryptoService.encryptMessage(
        text,
        targetPubKey,
        myKeyPair.secretKey,
        myKeyPair.publicKey
      );

      const messageId = 'msg_' + Math.random().toString(36).slice(2, 10);
      const newMsg: ChatMessage = {
        id: messageId,
        conversationId: conversationId || 'conv_default',
        senderId: session.userId,
        text,
        encryptedPayload,
        timestamp: Date.now(),
        status: 'sending',
        imageUri,
        replyToId: replyingToMessage?.id,
      };

      setMessages((prev) => [...prev, newMsg]);
      setReplyingToMessage(null);

      // Transmit ONLY the encrypted payload over WebSocket
      const sentSuccess = wsService.send('message', {
        id: messageId,
        conversation_id: conversationId,
        sender_id: session.userId,
        encrypted_payload: encryptedPayload,
        image_uri: imageUri,
        reply_to_id: replyingToMessage?.id,
      });

      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, status: sentSuccess ? 'sent' : 'sending' } : m))
      );
    },
    [conversationId, partnerPublicKey, replyingToMessage, wsService]
  );

  const deleteMessage = useCallback((messageId: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== messageId));
  }, []);

  const sendTypingSignal = useCallback(
    (typingState: boolean) => {
      wsService.send('typing', { conversation_id: conversationId, is_typing: typingState });
    },
    [conversationId, wsService]
  );

  const filteredMessages = searchQuery.trim()
    ? messages.filter((m) => m.text.toLowerCase().includes(searchQuery.toLowerCase()))
    : messages;

  return {
    messages: filteredMessages,
    sendMessage,
    deleteMessage,
    isTyping,
    isPartnerOnline,
    sendTypingSignal,
    searchQuery,
    setSearchQuery,
    replyingToMessage,
    setReplyingToMessage,
  };
}
