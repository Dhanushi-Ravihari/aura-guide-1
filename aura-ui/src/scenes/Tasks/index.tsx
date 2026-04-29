import React, { useEffect, useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { palette, commonStyles } from "../../theme";
import { AppCard } from "../../components/AppCard";
import { ProgressBar } from "../../components/ProgressBar";
import { ScreenHeader } from "../../components/ScreenHeader";
import { SegmentedControl } from "../../components/SegmentedControl";
import { PrimaryButton } from "../../components/PrimaryButton";
import { InputField } from "../../components/InputField";
import { api } from "../../api/api";

type TaskStatus = "pending" | "in_progress" | "completed" | string;

function toYYYYMMDD(isoOrDate: string | Date | null | undefined) {
  if (!isoOrDate) return "";
  const d = typeof isoOrDate === "string" ? new Date(isoOrDate) : isoOrDate;
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

function statusToProgress(status: TaskStatus) {
  const s = (status || "").toLowerCase();
  if (s === "completed") return 100;
  if (s === "in_progress") return 60;
  return 15;
}

export function TasksScreen({ onNavigateCalendar }: { onNavigateCalendar: () => void }) {
  const [viewMode, setViewMode] = useState("List");
  const [listTab, setListTab] = useState("Today");
  const [tasks, setTasks] = useState<any[]>([]);
  const [newTask, setNewTask] = useState("");

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const refresh = async () => {
    const data = await api.getTasks();
    if (!data?.length) {
      await api.generateTaskPlan();
      const generated = await api.getTasks();
      setTasks(generated || []);
      return;
    }
    setTasks(data || []);
  };

  useEffect(() => {
    refresh().catch((e) => Alert.alert("Task load failed", (e as Error).message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const normalized = tasks.map((t) => ({
      ...t,
      _start: toYYYYMMDD(t.start_date_time),
      _end: toYYYYMMDD(t.end_date_time),
      _status: (t.status || "").toLowerCase(),
    }));

    if (viewMode === "Board") return normalized;

    if (listTab === "Completed") return normalized.filter((t) => t._status === "completed");

    if (listTab === "Today") return normalized.filter((t) => t._status !== "completed" && (t._start === today || t._end === today));

    // Upcoming
    return normalized.filter((t) => t._status !== "completed" && t._start > today);
  }, [listTab, tasks, today, viewMode]);

  const moveTask = async (taskId: number, status: TaskStatus) => {
    await api.updateTask(taskId, { status });
    await refresh();
  };

  const addTask = async () => {
    if (!newTask.trim()) return;
    await api.addTask({ task: newTask.trim(), status: "pending" });
    setNewTask("");
    await refresh();
  };

  return (
    <ScrollView contentContainerStyle={styles.screenContent}>
      <ScreenHeader
        title="Tasks & Planner"
        subtitle="Manage your daily execution"
        rightAction={
          <Pressable onPress={onNavigateCalendar} style={styles.iconButton}>
            <Ionicons name="calendar-outline" size={20} color={palette.text} />
          </Pressable>
        }
      />

      <SegmentedControl options={["List", "Board"]} value={viewMode} onChange={setViewMode} />

      {viewMode === "List" ? <SegmentedControl options={["Today", "Upcoming", "Completed"]} value={listTab} onChange={setListTab} /> : null}

      {viewMode === "List" ? (
        <View style={commonStyles.stackMd}>
          {filtered.map((task) => {
            const progress = statusToProgress(task.status);
            const due = toYYYYMMDD(task.end_date_time) || toYYYYMMDD(task.start_date_time);
            return (
              <AppCard key={task.id} style={commonStyles.stackMd}>
                <View style={styles.cardHeaderSpace}>
                  <View style={commonStyles.flexOne}>
                    <Text style={commonStyles.cardTitle}>{task.task}</Text>
                    <Text style={commonStyles.cardBody}>{due ? `Due: ${due}` : ""}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={palette.muted} />
                </View>

                <View style={commonStyles.progressSummaryRow}>
                  <Text style={commonStyles.helperText}>{task.status}</Text>
                  <Text style={commonStyles.helperText}>{due ? due : "—"}</Text>
                </View>

                <ProgressBar value={progress} />

                <View style={styles.inlineActions}>
                  <PrimaryButton label="Todo" onPress={() => moveTask(task.id, "pending")} secondary />
                  <PrimaryButton label="In progress" onPress={() => moveTask(task.id, "in_progress")} secondary />
                  <PrimaryButton label="Done" onPress={() => moveTask(task.id, "completed")} secondary />
                </View>
              </AppCard>
            );
          })}
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.boardRow}>
            {[
              { title: "To Do", status: "pending" },
              { title: "In Progress", status: "in_progress" },
              { title: "Done", status: "completed" },
            ].map((column) => {
              const colItems = filtered.filter((t) => (t.status || "").toLowerCase() === column.status);
              return (
                <View key={column.title} style={styles.boardColumn}>
                  <Text style={styles.boardTitle}>{column.title}</Text>
                  <View style={commonStyles.stackSm}>
                    {colItems.map((task) => (
                      <AppCard key={task.id} style={styles.boardCard}>
                        <Text style={commonStyles.cardTitle}>{task.task}</Text>
                        <Text style={commonStyles.cardBody}>{toYYYYMMDD(task.end_date_time) || "—"}</Text>

                        <View style={styles.inlineActions}>
                          <PrimaryButton label="Todo" onPress={() => moveTask(task.id, "pending")} secondary />
                          <PrimaryButton label="In" onPress={() => moveTask(task.id, "in_progress")} secondary />
                          <PrimaryButton label="Done" onPress={() => moveTask(task.id, "completed")} secondary />
                        </View>
                      </AppCard>
                    ))}
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>
      )}

      <AppCard style={commonStyles.stackSm}>
        <InputField label="New Task" placeholder="Add a task" value={newTask} onChangeText={setNewTask} />
        <PrimaryButton label="Add New Task" onPress={addTask} />
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
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.8)",
    borderWidth: 1,
    borderColor: palette.border,
  },
  cardHeaderSpace: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  inlineActions: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
    marginTop: 8,
  },
  boardRow: {
    flexDirection: "row",
    gap: 14,
    paddingVertical: 6,
  },
  boardColumn: {
    width: 260,
    gap: 10,
  },
  boardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: palette.text,
    marginBottom: 6,
  },
  boardCard: {
    gap: 6,
    padding: 10,
  },
});

