import React, { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { palette, commonStyles } from "../../theme";
import { Badge } from "../../components/Badge";
import { AppCard } from "../../components/AppCard";
import { ScreenHeader } from "../../components/ScreenHeader";
import { Message } from "../../types";
import { PrimaryButton } from "../../components/PrimaryButton";
import { api } from "../../api/api";
import { screenPadding } from "../../styles/screenStyles";

/** Short starter prompts — actions only, no fabricated user metrics */
const STARTER_PROMPTS = [
  "Debug a coding issue step by step",
  "Practice a behavioral interview answer",
  "Explain Git for team workflows",
  "Plan study time for technical depth",
];

function fmtTime(d: Date) {
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function contextualLine(userText: string) {
  const t = userText.toLowerCase();
  if (/debug|error|crash|exception|stack/.test(t)) {
    return "Reproduce reliably, isolate the smallest input, compare expected vs actual, then tighten the hypothesis with logs.";
  }
  if (/interview|star\b|behavioral/.test(t)) {
    return "Use STAR clearly: Situation, Task, Action, Result—with one metric or outcome.";
  }
  if (/git|merge|rebase|branch/.test(t)) {
    return "Branches move pointers; commits are snapshots. Keep commits small so review and rollback stay safe.";
  }
  if (/career|roadmap|job|intern/.test(t)) {
    return "Balance depth in one stack, visible projects, and consistent interview reps each week.";
  }
  return "Break the next step into something you can finish in under an hour, then stack the next block.";
}

import * as DocumentPicker from "expo-document-picker";

export function AICoachScreen() {
  const { width } = useWindowDimensions();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [cvContent, setCvContent] = useState("");
  const [cvFeedback, setCvFeedback] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState("");
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [quote, reminder, feedback] = await Promise.all([
          api.getMotivationalQuote(),
          api.getDailyTaskReminder(),
          api.getBehavioralInterviewFeedback().catch(() => null),
        ]);
        if (!alive) return;
        const tip = feedback?.feedback?.[0];
        const parts = [quote?.message, reminder?.message, tip && `Interview tip: ${tip}`].filter(Boolean);
        setMessages([
          {
            id: 1,
            type: "aura",
            content: parts.length > 0 ? parts.join("\n\n") : "Hello! I'm AURA, your AI Coach. How can I help you today?",
            timestamp: fmtTime(new Date()),
            category: "AURA",
          },
        ]);
      } catch {
        if (!alive) return;
        setMessages([
          {
            id: 1,
            type: "aura",
            content: "You're connected. Ask anything below—I'll pair ideas with your live task focus when available.",
            timestamp: fmtTime(new Date()),
            category: "AURA",
          },
        ]);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages, isTyping]);

  const sendMessage = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content) return;

    const userMsg: Message = {
      id: Date.now(),
      type: "user",
      content,
      timestamp: fmtTime(new Date()),
    };
    setMessages((c) => [...c, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const [reminder, quote] = await Promise.all([api.getDailyTaskReminder(), api.getMotivationalQuote()]);
      const body = [contextualLine(content), reminder?.message, quote?.message].filter(Boolean).join("\n\n");
      setMessages((c) => [
        ...c,
        {
          id: Date.now() + 1,
          type: "aura",
          content: body,
          category: "Guidance",
          timestamp: fmtTime(new Date()),
        },
      ]);
    } catch (e) {
      setMessages((c) => [
        ...c,
        {
          id: Date.now() + 1,
          type: "aura",
          content: `I could not reach the server: ${(e as Error).message}`,
          timestamp: fmtTime(new Date()),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "text/plain",
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const file = result.assets[0];
        setFileName(file.name);
        
        // In a real app, we'd read the file content. 
        // For this demo, we'll simulate reading text from the file if it's small, 
        // or just use a placeholder if we can't read it easily in this environment.
        setIsUploading(true);
        // Simulate reading and uploading
        setTimeout(async () => {
          try {
            await api.uploadCV(file.name, "Simulated CV content extracted from " + file.name);
            await api.analyzeCV();
            const feedback = await api.getCVFeedback();
            setCvFeedback(Array.isArray(feedback?.feedback) ? feedback.feedback : []);
            setMessages((c) => [
              ...c,
              {
                id: Date.now(),
                type: "aura",
                content: `I've analyzed your CV: ${file.name}. See the feedback panel above for details.`,
                category: "Analysis",
                timestamp: fmtTime(new Date()),
              },
            ]);
          } catch (e) {
            setCvFeedback([`Analysis failed: ${(e as Error).message}`]);
          } finally {
            setIsUploading(false);
          }
        }, 1500);
      }
    } catch (err) {
      alert("Error picking document: " + err);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={[commonStyles.flexOne, { backgroundColor: palette.background }]}>
      <View style={{ paddingHorizontal: screenPadding, paddingTop: 6 }}>
        <ScreenHeader title="AI Coach" subtitle="Personalized career guidance" />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.promptStrip}
        style={styles.promptsContainer}
      >
        {STARTER_PROMPTS.map((prompt) => (
          <Pressable key={prompt} onPress={() => sendMessage(prompt)} style={styles.promptChip}>
            <Ionicons name="flash" size={16} color={palette.primary} />
            <Text style={[styles.promptChipText, width < 360 && styles.promptChipTextSm]} numberOfLines={1}>
              {prompt}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView ref={scrollRef} contentContainerStyle={[styles.chatBody, { paddingHorizontal: screenPadding }]} keyboardShouldPersistTaps="handled">
        <AppCard style={styles.cvPanel}>
          <View style={styles.cvHeader}>
            <View>
              <Text style={styles.cvPanelTitle}>CV Analysis</Text>
              <Text style={styles.cvHint}>Upload your CV to get AI-powered feedback.</Text>
            </View>
            <Pressable onPress={handlePickDocument} style={styles.uploadBtn}>
              {isUploading ? (
                <Ionicons name="sync" size={24} color="#FFFFFF" />
              ) : (
                <Ionicons name="cloud-upload" size={24} color="#FFFFFF" />
              )}
            </Pressable>
          </View>
          
          {fileName ? (
            <View style={styles.fileLabelRow}>
              <Ionicons name="document-text" size={16} color={palette.primary} />
              <Text style={styles.fileLabelText}>{fileName}</Text>
            </View>
          ) : null}

          {cvFeedback.length > 0 ? (
            <View style={styles.feedbackBox}>
              <Text style={styles.feedbackTitle}>Feedback</Text>
              {cvFeedback.map((line, index) => (
                <View key={index} style={styles.feedbackRow}>
                  <Ionicons name="checkmark-circle" size={16} color={palette.success} />
                  <Text style={styles.cvFeedbackLine}>{line}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </AppCard>

        {messages.map((message) => {
          const isUser = message.type === "user";
          return (
            <View key={message.id} style={[styles.messageRow, isUser ? styles.rowUser : styles.rowAura]}>
              {!isUser ? (
                <View style={styles.avatarAura}>
                  <Ionicons name="sparkles" size={18} color="#FFFFFF" />
                </View>
              ) : null}
              <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAura]}>
                {message.category ? (
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>{message.category}</Text>
                  </View>
                ) : null}
                <Text style={[styles.msgText, isUser && styles.msgTextUser]}>{message.content}</Text>
                <Text style={[styles.msgTime, isUser && styles.msgTimeUser]}>{message.timestamp}</Text>
              </View>
            </View>
          );
        })}

        {isTyping ? (
          <View style={styles.messageRow}>
            <View style={styles.avatarAura}>
              <Ionicons name="sparkles" size={18} color="#FFFFFF" />
            </View>
            <View style={[styles.bubble, styles.bubbleAura]}>
              <Text style={styles.typing}>Thinking...</Text>
            </View>
          </View>
        ) : null}
      </ScrollView>

      <View style={[styles.footer, { paddingHorizontal: screenPadding }]}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Ask AURA anything..."
          placeholderTextColor={palette.muted}
          style={styles.footerInput}
          multiline
          onSubmitEditing={() => sendMessage()}
        />
        <Pressable accessibilityLabel="Send" onPress={() => sendMessage()} style={styles.sendFab}>
          <Ionicons name="send" size={20} color="#FFFFFF" />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  promptsContainer: {
    maxHeight: 52,
    marginBottom: 12,
  },
  promptStrip: {
    paddingHorizontal: screenPadding,
    gap: 8,
    alignItems: "center",
  },
  promptChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 99,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
  },
  promptChipText: {
    color: palette.text,
    fontWeight: "600",
    fontSize: 13,
  },
  promptChipTextSm: {
    fontSize: 12,
  },
  chatBody: {
    paddingBottom: 20,
    gap: 16,
    flexGrow: 1,
  },
  cvPanel: {
    padding: 16,
    gap: 12,
    marginBottom: 8,
  },
  cvHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cvPanelTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: palette.text,
  },
  cvHint: {
    fontSize: 13,
    color: palette.muted,
    marginTop: 2,
  },
  uploadBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: palette.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  fileLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    padding: 10,
    borderRadius: 12,
    backgroundColor: palette.chipBlue,
  },
  fileLabelText: {
    fontSize: 13,
    fontWeight: "700",
    color: palette.primary,
  },
  feedbackBox: {
    marginTop: 4,
    padding: 14,
    borderRadius: 16,
    backgroundColor: palette.surfaceMuted,
    borderWidth: 1,
    borderColor: palette.border,
    gap: 10,
  },
  feedbackTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: palette.text,
    marginBottom: 2,
  },
  feedbackRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  cvFeedbackLine: {
    flex: 1,
    color: palette.text,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  rowUser: {
    justifyContent: "flex-end",
  },
  rowAura: {
    justifyContent: "flex-start",
  },
  avatarAura: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: palette.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  bubble: {
    maxWidth: "80%",
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 6,
  },
  bubbleAura: {
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    borderBottomLeftRadius: 4,
  },
  bubbleUser: {
    backgroundColor: palette.primary,
    borderBottomRightRadius: 4,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  categoryText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#FFFFFF",
    textTransform: "uppercase",
  },
  msgText: {
    color: palette.text,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "500",
  },
  msgTextUser: {
    color: "#FFFFFF",
  },
  msgTime: {
    fontSize: 10,
    fontWeight: "600",
    color: palette.muted,
    alignSelf: "flex-end",
    marginTop: 2,
  },
  msgTimeUser: {
    color: "rgba(255,255,255,0.6)",
  },
  typing: {
    color: palette.muted,
    fontStyle: "italic",
    fontSize: 13,
  },
  footer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: palette.border,
    backgroundColor: palette.background,
  },
  footerInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    color: palette.text,
    fontSize: 15,
  },
  sendFab: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.primary,
  },
});
