import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import { ChatMessage } from '../types/chat';

interface ChatInputProps {
  onSend: (text: string, imageUri?: string) => void;
  onTyping: (isTyping: boolean) => void;
  replyingToMessage: ChatMessage | null;
  onCancelReply: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  onTyping,
  replyingToMessage,
  onCancelReply,
}) => {
  const [text, setText] = useState('');
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

  const handleChangeText = (val: string) => {
    setText(val);
    onTyping(true);

    if (typingTimeout) clearTimeout(typingTimeout);
    const timeout = setTimeout(() => {
      onTyping(false);
    }, 2000);
    setTypingTimeout(timeout);
  };

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text.trim());
    setText('');
    onTyping(false);
  };

  const handleAttachImage = () => {
    // Demo image attachment payload
    const demoImage = 'https://picsum.photos/400/300';
    onSend('📷 Photo attachment', demoImage);
  };

  return (
    <View style={styles.container}>
      {/* Reply banner */}
      {replyingToMessage && (
        <View style={styles.replyBanner}>
          <View style={styles.replyTextContainer}>
            <Text style={styles.replyTitle}>Replying to partner</Text>
            <Text style={styles.replySnippet} numberOfLines={1}>
              {replyingToMessage.text}
            </Text>
          </View>
          <TouchableOpacity onPress={onCancelReply}>
            <Text style={styles.cancelReplyText}>✕</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Main input bar */}
      <View style={styles.inputRow}>
        <TouchableOpacity
          style={styles.attachButton}
          onPress={handleAttachImage}
          activeOpacity={0.7}
        >
          <Text style={styles.attachIcon}>+</Text>
        </TouchableOpacity>

        <TextInput
          style={styles.textInput}
          placeholder="Type a message..."
          placeholderTextColor="#8E8E93"
          value={text}
          onChangeText={handleChangeText}
          multiline
          maxLength={1000}
        />

        <TouchableOpacity
          style={[styles.sendButton, !text.trim() && styles.disabledSendButton]}
          onPress={handleSend}
          disabled={!text.trim()}
          activeOpacity={0.7}
        >
          <Text style={styles.sendIcon}>➤</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1C1C1E',
    borderTopWidth: 0.5,
    borderTopColor: '#2C2C2E',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  replyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#2C2C2E',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 8,
  },
  replyTextContainer: {
    flex: 1,
    marginRight: 8,
  },
  replyTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  replySnippet: {
    fontSize: 13,
    color: '#EBEBF5',
  },
  cancelReplyText: {
    fontSize: 16,
    color: '#8E8E93',
    paddingHorizontal: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attachButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2C2C2E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  attachIcon: {
    fontSize: 22,
    color: '#007AFF',
    fontWeight: '300',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#2C2C2E',
    borderRadius: 20,
    color: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  disabledSendButton: {
    backgroundColor: '#3A3A3C',
  },
  sendIcon: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 2,
  },
});
