import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { ChatMessage } from '../types/chat';

interface MessageBubbleProps {
  message: ChatMessage;
  isMyMessage: boolean;
  onLongPress?: (message: ChatMessage) => void;
  replyToMessage?: ChatMessage;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isMyMessage,
  onLongPress,
  replyToMessage,
}) => {
  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderStatus = () => {
    if (!isMyMessage) return null;
    switch (message.status) {
      case 'sending':
        return <Text style={styles.statusText}>🕒</Text>;
      case 'sent':
        return <Text style={styles.statusText}>✓</Text>;
      case 'delivered':
        return <Text style={styles.statusText}>✓✓</Text>;
      case 'read':
        return <Text style={[styles.statusText, styles.readStatusText]}>✓✓</Text>;
      default:
        return null;
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onLongPress={() => onLongPress && onLongPress(message)}
      style={[
        styles.container,
        isMyMessage ? styles.myContainer : styles.partnerContainer,
      ]}
    >
      <View
        style={[
          styles.bubble,
          isMyMessage ? styles.myBubble : styles.partnerBubble,
        ]}
      >
        {/* Reply reference header */}
        {replyToMessage && (
          <View style={styles.replyPreview}>
            <Text style={styles.replySender}>
              {replyToMessage.senderId === message.senderId ? 'You' : 'Partner'}
            </Text>
            <Text style={styles.replyText} numberOfLines={1}>
              {replyToMessage.text}
            </Text>
          </View>
        )}

        {/* Image attachment */}
        {message.imageUri && (
          <Image source={{ uri: message.imageUri }} style={styles.imageAttachment} />
        )}

        {/* Message text */}
        <Text style={[styles.messageText, isMyMessage ? styles.myText : styles.partnerText]}>
          {message.text}
        </Text>

        {/* Footer timestamp & status */}
        <View style={styles.footerRow}>
          <Text style={[styles.timestampText, isMyMessage ? styles.mySubtext : styles.partnerSubtext]}>
            {formatTime(message.timestamp)}
          </Text>
          {renderStatus()}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    marginHorizontal: 12,
    flexDirection: 'row',
  },
  myContainer: {
    justifyContent: 'flex-end',
  },
  partnerContainer: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '78%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  myBubble: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
  },
  partnerBubble: {
    backgroundColor: '#2C2C2E',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  myText: {
    color: '#FFFFFF',
  },
  partnerText: {
    color: '#F2F2F7',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  timestampText: {
    fontSize: 11,
    marginRight: 4,
  },
  mySubtext: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  partnerSubtext: {
    color: '#8E8E93',
  },
  statusText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  readStatusText: {
    color: '#64D2FF',
    fontWeight: 'bold',
  },
  replyPreview: {
    borderLeftWidth: 2,
    borderLeftColor: '#64D2FF',
    paddingLeft: 8,
    marginBottom: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    borderRadius: 4,
    paddingVertical: 4,
  },
  replySender: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#64D2FF',
  },
  replyText: {
    fontSize: 13,
    color: '#EBEBF5',
  },
  imageAttachment: {
    width: 200,
    height: 150,
    borderRadius: 12,
    marginBottom: 6,
  },
});
