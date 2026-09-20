import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MessageBubble } from '../components/MessageBubble';
import { ChatInput } from '../components/ChatInput';
import { useChat } from '../hooks/useChat';
import { ChatMessage } from '../types/chat';
import { WebSocketService } from '../services/websocketService';

interface ChatScreenProps {
  conversationId?: string;
  partnerUserId?: string;
  partnerPublicKey?: string;
  onOpenSettings: () => void;
  onLockApp: () => void;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({
  conversationId = 'conv_paired_1',
  partnerUserId = 'Partner',
  partnerPublicKey,
  onOpenSettings,
  onLockApp,
}) => {
  const {
    messages,
    sendMessage,
    deleteMessage,
    isTyping,
    isPartnerOnline,
    sendTypingSignal,
    searchQuery,
    setSearchQuery,
    replyingToMessage,
    setReplyingToMessage,
  } = useChat(conversationId, partnerPublicKey);

  const [isSearching, setIsSearching] = React.useState<boolean>(false);

  useEffect(() => {
    // Connect WebSocket when entering Chat screen
    const ws = WebSocketService.getInstance();
    ws.connect('https://calculatorx-backend.onrender.com', 'dev_current');
  }, []);

  const handleLongPressMessage = (msg: ChatMessage) => {
    Alert.alert('Message Options', undefined, [
      {
        text: 'Reply',
        onPress: () => setReplyingToMessage(msg),
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteMessage(msg.id),
      },
      {
        text: 'Cancel',
        style: 'cancel',
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {isSearching ? (
          <View style={styles.searchBarContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search messages..."
              placeholderTextColor="#8E8E93"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            <TouchableOpacity onPress={() => { setIsSearching(false); setSearchQuery(''); }}>
              <Text style={styles.headerActionText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.partnerNameText}>{partnerUserId}</Text>
              <Text style={styles.statusText}>
                {isTyping
                  ? 'typing...'
                  : isPartnerOnline
                  ? '🟢 Online'
                  : '⚪ Offline'}
              </Text>
            </View>

            <View style={styles.headerActions}>
              <TouchableOpacity
                onPress={() => setIsSearching(true)}
                style={styles.iconButton}
              >
                <Text style={styles.iconText}>🔍</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onOpenSettings}
                style={styles.iconButton}
              >
                <Text style={styles.iconText}>⚙️</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={onLockApp} style={styles.iconButton}>
                <Text style={styles.iconText}>🔒</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>

      {/* Messages Virtualized List */}
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MessageBubble
            message={item}
            isMyMessage={item.senderId !== partnerUserId}
            onLongPress={handleLongPressMessage}
            replyToMessage={
              item.replyToId
                ? messages.find((m) => m.id === item.replyToId)
                : undefined
            }
          />
        )}
        contentContainerStyle={styles.messageList}
        initialNumToRender={20}
        maxToRenderPerBatch={10}
        windowSize={10}
      />

      {/* Input Bar */}
      <ChatInput
        onSend={sendMessage}
        onTyping={sendTypingSignal}
        replyingToMessage={replyingToMessage}
        onCancelReply={() => setReplyingToMessage(null)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    height: 56,
    backgroundColor: '#1C1C1E',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#2C2C2E',
  },
  headerTitleContainer: {
    justifyContent: 'center',
  },
  partnerNameText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  statusText: {
    color: '#8E8E93',
    fontSize: 12,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 6,
    marginLeft: 8,
  },
  iconText: {
    fontSize: 18,
  },
  searchBarContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#2C2C2E',
    borderRadius: 8,
    color: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 10,
    fontSize: 14,
  },
  headerActionText: {
    color: '#007AFF',
    fontSize: 15,
  },
  messageList: {
    paddingVertical: 12,
  },
});
