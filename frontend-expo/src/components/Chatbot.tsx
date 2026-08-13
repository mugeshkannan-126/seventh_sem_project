import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
  Dimensions,
  Animated,
  KeyboardAvoidingView,
  Keyboard,
} from 'react-native';
import { CHATBOT_SYSTEM_PROMPT } from '../constants/chatbotPrompt';
import {
  BotIcon,
  SparklesIcon,
  SendIcon,
  CloseIcon,
  TrashIcon,
} from './Icons';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}

const QUICK_PROMPTS = [
  '📝 How to report a civic issue?',
  '🤖 What does AI Smart Analysis do?',
  '📊 How do I track my complaint status?',
  '🗺️ How to use the Interactive Map?',
  '🏆 How do I earn points and badges?',
];

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-msg',
      sender: 'bot',
      text: '👋 Hello! I am your CivicFlow AI Assistant.\nI can help you navigate the app, explain how to file public reports, track complaint status, and use AI features. How can I assist you today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  // Track keyboard height dynamically to push chat modal above soft keyboard
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates ? e.endCoordinates.height : 0);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Auto scroll to end when keyboard opens or messages update
  useEffect(() => {
    if (keyboardHeight > 0 && isOpen) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [keyboardHeight, isOpen]);

  useEffect(() => {
    if (isOpen) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 250);
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const queryText = (textToSend || inputMessage).trim();
    if (!queryText || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setIsLoading(true);

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    // Build multi-turn prompt history for Gemini API
    const historyPayload = messages
      .filter((m) => m.id !== 'welcome-msg')
      .map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }],
      }));

    historyPayload.push({
      role: 'user',
      parts: [{ text: queryText }],
    });

    const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || 'AQ.Ab8RN6Ke6RBI-W89tiE6XoxFeC2BxLt-AxZBtyyEPauZa-lFGw';
    const maskedKey = apiKey ? `${apiKey.substring(0, 6)}...${apiKey.substring(apiKey.length - 4)}` : 'NONE';

    const modelsToTry = [
      'gemini-flash-latest',
      'gemini-2.0-flash',
      'gemini-1.5-flash',
      'gemini-1.5-pro',
    ];

    let botResponseText = '';

    for (const model of modelsToTry) {
      console.log(`🤖 [CHATBOT AI REQUEST] Calling Gemini model "${model}" with key ${maskedKey}...`);
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const payload = {
        system_instruction: {
          parts: [{ text: CHATBOT_SYSTEM_PROMPT }],
        },
        contents: historyPayload,
      };

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (
          response.ok &&
          !result.error &&
          result.candidates &&
          result.candidates.length > 0 &&
          result.candidates[0].content?.parts?.length > 0
        ) {
          botResponseText = result.candidates[0].content.parts[0].text;
          console.log(`🎉 [CHATBOT SUCCESS (${model})]:`, botResponseText.substring(0, 80));
          break;
        } else if (result.error) {
          console.log(`⚠️ [CHATBOT MODEL ERROR (${model})]:`, result.error.message);
        }
      } catch (err) {
        console.log(`❌ [CHATBOT MODEL FETCH FAILED (${model})]:`, err);
      }
    }

    if (!botResponseText) {
      botResponseText =
        'Sorry, I could not process your request right now. Please check your internet connection or try asking again in a moment!';
    }

    const botMsg: Message = {
      id: (Date.now() + 1).toString(),
      sender: 'bot',
      text: botResponseText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, botMsg]);
    setIsLoading(false);

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 150);
  };

  const clearHistory = () => {
    setMessages([
      {
        id: 'welcome-msg',
        sender: 'bot',
        text: 'Chat history cleared. How else can I help you with CivicFlow?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const renderFormattedText = (text: string, isUser: boolean) => {
    // Sanitize string: replace 3+ consecutive newlines with 2, trim
    const sanitized = text.replace(/\n{3,}/g, '\n\n').trim();
    const lines = sanitized.split('\n');
    const processedLines: string[] = [];
    let prevWasEmpty = false;

    for (const line of lines) {
      const isEmpty = line.trim() === '';
      if (isEmpty && prevWasEmpty) {
        continue; // Skip consecutive duplicate empty lines
      }
      processedLines.push(line);
      prevWasEmpty = isEmpty;
    }

    return processedLines.map((line, lineIdx) => {
      if (line.trim() === '') {
        // Small 4px spacer instead of a full text line for blank breaks
        return <View key={`spacer-${lineIdx}`} style={styles.paragraphSpacer} />;
      }

      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      return (
        <Text
          key={lineIdx}
          style={[
            styles.messageText,
            isUser ? styles.userMessageText : styles.botMessageText,
          ]}
        >
          {parts.map((part, partIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return (
                <Text
                  key={partIdx}
                  style={[
                    styles.boldText,
                    isUser ? styles.userBoldText : styles.botBoldText,
                  ]}
                >
                  {part.slice(2, -2)}
                </Text>
              );
            }
            return part;
          })}
        </Text>
      );
    });
  };

  const windowHeight = Dimensions.get('window').height;
  const screenWidth = Dimensions.get('window').width;
  const isSmallScreen = screenWidth < 450;

  // Calculate dynamic bottom position & height based on keyboard visibility
  const dynamicBottom = keyboardHeight > 0
    ? keyboardHeight + (Platform.OS === 'ios' ? 10 : 8)
    : (Platform.OS === 'web' ? 80 : 85);

  const dynamicMaxHeight = keyboardHeight > 0
    ? Math.min(480, Math.max(260, windowHeight - keyboardHeight - 70))
    : (isSmallScreen ? 500 : 540);

  return (
    <>
      {/* FLOATING ACTION CHAT BOT BUTTON */}
      {!isOpen && (
        <TouchableOpacity
          style={styles.fabButton}
          activeOpacity={0.85}
          onPress={() => setIsOpen(true)}
        >
          <View style={styles.fabIconContainer}>
            <SparklesIcon color="#ffffff" size={24} />
          </View>

          <View style={styles.badgePulse}>
            <Text style={styles.badgeText}>AI</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* CHAT MODAL OVERLAY */}
      {isOpen && (
        <Animated.View
          style={[
            styles.chatContainer,
            isSmallScreen ? styles.chatContainerSmall : styles.chatContainerDesktop,
            {
              bottom: dynamicBottom,
              maxHeight: dynamicMaxHeight,
              height: dynamicMaxHeight,
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.flexOne}
          >
            {/* CHAT HEADER */}
            <View style={styles.header}>
              <View style={styles.headerInfo}>
                <View style={styles.avatarCircle}>
                  <BotIcon color="#ffffff" size={18} />
                  <View style={styles.onlineDot} />
                </View>

                <View style={styles.headerTextCol}>
                  <View style={styles.titleRow}>
                    <Text style={styles.headerTitle}>CivicFlow AI</Text>
                    <View style={styles.aiTag}>
                      <Text style={styles.aiTagText}>Gemini 2.0</Text>
                    </View>
                  </View>
                  <Text style={styles.headerSubtitle}>App Assistant • Always Online</Text>
                </View>
              </View>

              <View style={styles.headerActions}>
                <TouchableOpacity
                  style={styles.headerIconButton}
                  onPress={clearHistory}
                >
                  <TrashIcon color="#cbd5e1" size={16} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.headerIconButton}
                  onPress={() => setIsOpen(false)}
                >
                  <CloseIcon color="#ffffff" size={18} />
                </TouchableOpacity>
              </View>
            </View>

            {/* CHAT MESSAGES SCROLLVIEW */}
            <ScrollView
              ref={scrollViewRef}
              style={styles.messageList}
              contentContainerStyle={styles.messageListContent}
              keyboardShouldPersistTaps="handled"
            >
              {messages.map((msg) => {
                const isUser = msg.sender === 'user';
                return (
                  <View
                    key={msg.id}
                    style={[
                      styles.messageRow,
                      isUser ? styles.userRow : styles.botRow,
                    ]}
                  >
                    {!isUser && (
                      <View style={styles.botMiniAvatar}>
                        <BotIcon color="#00386c" size={13} />
                      </View>
                    )}

                    <View
                      style={[
                        styles.bubble,
                        isUser ? styles.userBubble : styles.botBubble,
                      ]}
                    >
                      {renderFormattedText(msg.text, isUser)}
                      <Text
                        style={[
                          styles.timestamp,
                          isUser ? styles.userTimestamp : styles.botTimestamp,
                        ]}
                      >
                        {msg.timestamp}
                      </Text>
                    </View>
                  </View>
                );
              })}

              {isLoading && (
                <View style={[styles.messageRow, styles.botRow]}>
                  <View style={styles.botMiniAvatar}>
                    <BotIcon color="#00386c" size={13} />
                  </View>
                  <View style={[styles.bubble, styles.botBubble, styles.loadingBubble]}>
                    <ActivityIndicator size="small" color="#00386c" />
                    <Text style={styles.loadingText}>CivicBot is thinking...</Text>
                  </View>
                </View>
              )}
            </ScrollView>

            {/* QUICK SUGGESTIONS CAROUSEL */}
            {messages.length < 5 && !isLoading && (
              <View style={styles.quickPromptContainer}>
                <Text style={styles.quickPromptHeader}>Suggested Questions:</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.quickPromptScroll}
                >
                  {QUICK_PROMPTS.map((prompt, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={styles.promptChip}
                      onPress={() => handleSendMessage(prompt.replace(/^[^\s]+\s/, ''))}
                    >
                      <Text style={styles.promptChipText}>{prompt}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* INPUT TOOLBAR */}
            <View style={styles.inputToolbar}>
              <TextInput
                style={styles.textInput}
                placeholder="Ask about CivicFlow features..."
                placeholderTextColor="#94a3b8"
                value={inputMessage}
                onChangeText={setInputMessage}
                onSubmitEditing={() => handleSendMessage()}
                onFocus={() => {
                  setTimeout(() => {
                    scrollViewRef.current?.scrollToEnd({ animated: true });
                  }, 150);
                }}
                returnKeyType="send"
                multiline={false}
              />

              <TouchableOpacity
                style={[
                  styles.sendButton,
                  (!inputMessage.trim() || isLoading) && styles.sendButtonDisabled,
                ]}
                onPress={() => handleSendMessage()}
                disabled={!inputMessage.trim() || isLoading}
              >
                <SendIcon
                  color={!inputMessage.trim() || isLoading ? '#94a3b8' : '#ffffff'}
                  size={16}
                />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </Animated.View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  flexOne: {
    flex: 1,
  },

  /* FAB BUTTON STYLES */
  fabButton: {
    position: 'absolute',
    bottom: Platform.OS === 'web' ? 80 : 85,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#00386c',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00386c',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 99999,
  },
  fabIconContainer: {
    width: 34,
    height: 34,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgePulse: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#10b981',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 8.5,
    fontWeight: '800',
  },

  /* CHAT CONTAINER STYLES */
  chatContainer: {
    position: 'absolute',
    right: 20,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    shadowColor: '#0b1c30',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
    overflow: 'hidden',
    zIndex: 99999,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  chatContainerDesktop: {
    width: 380,
  },
  chatContainerSmall: {
    width: Dimensions.get('window').width - 32,
    right: 16,
  },

  /* HEADER STYLES */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#00386c',
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  avatarCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#002548',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderWidth: 1.5,
    borderColor: '#38bdf8',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#10b981',
    borderWidth: 1.5,
    borderColor: '#00386c',
  },
  headerTextCol: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  aiTag: {
    backgroundColor: 'rgba(56, 189, 248, 0.2)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.4)',
  },
  aiTagText: {
    color: '#38bdf8',
    fontSize: 8.5,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: '#94a3b8',
    fontSize: 10.5,
    marginTop: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerIconButton: {
    padding: 5,
    borderRadius: 7,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },

  /* MESSAGE LIST STYLES */
  messageList: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  messageListContent: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 6,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
    marginVertical: 1.5,
  },
  userRow: {
    justifyContent: 'flex-end',
  },
  botRow: {
    justifyContent: 'flex-start',
  },
  botMiniAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  bubble: {
    maxWidth: '84%',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: '#00386c',
    borderTopRightRadius: 4,
  },
  botBubble: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  loadingText: {
    fontSize: 12.5,
    color: '#64748b',
    fontStyle: 'italic',
  },
  paragraphSpacer: {
    height: 4,
  },
  messageText: {
    fontSize: 13.5,
    lineHeight: 18.5,
    marginVertical: 1,
  },
  userMessageText: {
    color: '#ffffff',
  },
  botMessageText: {
    color: '#1e293b',
  },
  boldText: {
    fontWeight: '700',
  },
  userBoldText: {
    color: '#ffffff',
  },
  botBoldText: {
    color: '#0f172a',
  },
  timestamp: {
    fontSize: 9.5,
    marginTop: 2,
    alignSelf: 'flex-end',
  },
  userTimestamp: {
    color: 'rgba(255, 255, 255, 0.75)',
  },
  botTimestamp: {
    color: '#94a3b8',
  },

  /* QUICK PROMPTS */
  quickPromptContainer: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  quickPromptHeader: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#64748b',
    paddingHorizontal: 12,
    marginBottom: 4,
  },
  quickPromptScroll: {
    paddingHorizontal: 12,
    gap: 6,
  },
  promptChip: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  promptChipText: {
    fontSize: 11.5,
    color: '#00386c',
    fontWeight: '500',
  },

  /* INPUT TOOLBAR STYLES */
  inputToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    gap: 6,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 8 : 6,
    fontSize: 13.5,
    color: '#0f172a',
    maxHeight: 90,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#00386c',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#e2e8f0',
  },
});

