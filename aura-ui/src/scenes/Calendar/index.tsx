import React, { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { palette, commonStyles } from "../../theme";
import { AppCard } from "../../components/AppCard";
import { PrimaryButton } from "../../components/PrimaryButton";
import { ScreenHeader } from "../../components/ScreenHeader";
import { api } from "../../api/api";

function toLocalInputValue(d: Date) {
  // YYYY-MM-DDTHH:mm
  const pad = (n: number) => `${n}`.padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function safeParseToISO(localValue: string) {
  const date = new Date(localValue);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

export function CalendarScreen({ onBack }: { onBack: () => void }) {
  const defaultStart = useMemo(() => {
    const d = new Date();
    d.setHours(d.getHours() + 1);
    return toLocalInputValue(d);
  }, []);
  const defaultEnd = useMemo(() => {
    const d = new Date();
    d.setHours(d.getHours() + 2);
    return toLocalInputValue(d);
  }, []);

  const [events, setEvents] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [startLocal, setStartLocal] = useState(defaultStart);
  const [endLocal, setEndLocal] = useState(defaultEnd);

  const load = async () => {
    try {
      const data = await api.getCalendarEvents();
      setEvents(Array.isArray(data) ? data : []);
    } catch (e) {
      Alert.alert("Calendar load failed", (e as Error).message);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addEvent = async () => {
    if (!title.trim()) return;
    const startISO = safeParseToISO(startLocal);
    const endISO = safeParseToISO(endLocal);
    if (!startISO || !endISO) {
      Alert.alert("Invalid date", "Start and end date/time must be valid.");
      return;
    }
    try {
      await api.addCalendarEvent({
        title: title.trim(),
        description: "",
        start_time: startISO,
        end_time: endISO,
      });
      setTitle("");
      await load();
    } catch (e) {
      Alert.alert("Add event failed", (e as Error).message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.screenContent}>
      <ScreenHeader title="Calendar" subtitle="Your scheduled activities" onBack={onBack} />

      <AppCard style={commonStyles.stackMd}>
        <Text style={styles.sectionTitle}>Add event</Text>

        <Text style={styles.label}>Title</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="e.g., Mock interview"
          placeholderTextColor={palette.muted}
          style={styles.input}
        />

        <Text style={styles.label}>Start (local)</Text>
        <TextInput value={startLocal} onChangeText={setStartLocal} style={styles.input} />

        <Text style={styles.label}>End (local)</Text>
        <TextInput value={endLocal} onChangeText={setEndLocal} style={styles.input} />

        <PrimaryButton label="Add Event" onPress={addEvent} />
      </AppCard>

      <AppCard style={commonStyles.stackMd}>
        <View style={styles.sectionHeadingRow}>
          <Text style={styles.sectionTitle}>Upcoming</Text>
          <Pressable onPress={load} style={styles.refreshButton}>
            <Ionicons name="refresh" size={16} color={palette.primary} />
          </Pressable>
        </View>

        <View style={commonStyles.stackSm}>
          {events.length === 0 ? (
            <Text style={commonStyles.helperText}>No events yet. Add one above.</Text>
          ) : null}

          {events.map((e) => (
            <View key={e.id} style={styles.eventRow}>
              <View style={styles.eventIconWrap}>
                <Ionicons name="calendar" size={16} color={palette.surface} />
              </View>
              <View style={commonStyles.flexOne}>
                <Text style={commonStyles.cardBodyStrong}>{e.title}</Text>
                <Text style={commonStyles.cardBody}>
                  {typeof e.start_time === "string" ? e.start_time.slice(0, 16).replace("T", " ") : ""}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </AppCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 24,
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: palette.text,
  },
  sectionHeadingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  refreshButton: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: palette.border,
  },
  label: {
    marginTop: 8,
    fontWeight: "700",
    color: palette.text,
  },
  input: {
    height: 48,
    borderRadius: 16,
    backgroundColor: "#F8FBFF",
    borderWidth: 1,
    borderColor: palette.border,
    paddingHorizontal: 14,
    color: palette.text,
    marginTop: 6,
  },
  eventRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  eventIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 14,
    backgroundColor: palette.primary,
    alignItems: "center",
    justifyContent: "center",
  },
});

