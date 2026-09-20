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

  const handleSendHeart = () => {
    onSend('❤️');
  };

  return (
    <View style={styles.container}>
      {/* Reply banner */}
      {replyingToMessage && (
        <View style={styles.replyBanner}>
          <View style={styles.replyTextContainer}>
            <Text style={styles.replyTitle}>Replying to partner ❤️</Text>
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

        <TouchableOpacity
          style={styles.heartButton}
          onPress={handleSendHeart}
          activeOpacity={0.7}
        >
          <Text style={styles.heartIcon}>❤️</Text>
        </TouchableOpacity>

        <TextInput
          style={styles.textInput}
          placeholder="Type a message..."
          placeholderTextColor="#A88295"
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
    backgroundColor: '#1E0E18',
    borderTopWidth: 0.5,
    borderTopColor: '#3A1828',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  replyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#2D1424',
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
    color: '#FF4D79',
  },
  replySnippet: {
    fontSize: 13,
    color: '#FFF0F5',
  },
  cancelReplyText: {
    fontSize: 16,
    color: '#DDA0DD',
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
    backgroundColor: '#2D1424',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  attachIcon: {
    fontSize: 22,
    color: '#FF2D55',
    fontWeight: '300',
  },
  heartButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2D1424',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  heartIcon: {
    fontSize: 18,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#2D1424',
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
    backgroundColor: '#FF2D55',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  disabledSendButton: {
    backgroundColor: '#4A2035',
  },
  sendIcon: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 2,
  },
});
