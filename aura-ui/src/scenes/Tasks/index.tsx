import React, { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { palette, commonStyles } from "../../theme";
import { AppCard } from "../../components/AppCard";
import { Badge } from "../../components/Badge";
import { ProgressBar } from "../../components/ProgressBar";
import { ScreenHeader } from "../../components/ScreenHeader";
import { SegmentedControl } from "../../components/SegmentedControl";
import { PrimaryButton } from "../../components/PrimaryButton";
import { InputField } from "../../components/InputField";
import { api } from "../../api/api";
import { screenStyles } from "../../styles/screenStyles";

function statusLabel(status: string | undefined) {
  const s = (status || "").toLowerCase();
  if (s === "completed") return "Done";
  if (s === "in_progress") return "In progress";
  return "To do";
}

function statusProgress(status: string | undefined) {
  const s = (status || "").toLowerCase();
  if (s === "completed") return 100;
  if (s === "in_progress") return 55;
  return 20;
}

export function TasksScreen({ onNavigateCalendar }: { onNavigateCalendar: () => void }) {
  const { width } = useWindowDimensions();
  const [listTab, setListTab] = useState("Today");
  const [tasks, setTasks] = useState<any[]>([]);
  const [newTask, setNewTask] = useState("");
  const [newStartDate, setNewStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [newEndDate, setNewEndDate] = useState(new Date().toISOString().slice(0, 10));
  const safeDate = (value: any) => (typeof value === "string" ? value : "");

  const loadTasks = async () => {
    try {
      const data = await api.getTasks();
      if (!data?.length) {
        await api.generateTaskPlan();
        const generated = await api.getTasks();
        setTasks(Array.isArray(generated) ? generated : []);
        return;
      }
      setTasks(Array.isArray(data) ? data : []);
    } catch (error) {
      Alert.alert("Task loading failed", (error as Error).message);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayTasks = tasks.filter(
    (task) => safeDate(task.start_date_time).slice(0, 10) <= todayStr && (task.status || "").toLowerCase() !== "completed",
  );
  const upcomingTasks = tasks.filter(
    (task) => safeDate(task.start_date_time).slice(0, 10) > todayStr && (task.status || "").toLowerCase() !== "completed",
  );
  const completed = tasks.filter((task) => (task.status || "").toLowerCase() === "completed");

  const shown = listTab === "Today" ? todayTasks : listTab === "Upcoming" ? upcomingTasks : completed;

  const addTask = async () => {
    if (!newTask.trim()) return;
    if (!newStartDate || !newEndDate) {
      Alert.alert("Missing dates", "Start and end date are required.");
      return;
    }
    if (newEndDate < newStartDate) {
      Alert.alert("Invalid range", "End date should be equal to or after start date.");
      return;
    }
    await api.addTask({
      task: newTask.trim(),
      status: "pending",
      start_date_time: `${newStartDate}T09:00:00.000Z`,
      end_date_time: `${newEndDate}T18:00:00.000Z`,
    });
    setNewTask("");
    await loadTasks();
    Alert.alert("Success", "Task added successfully.");
  };

  const moveTask = async (task: any, status: string) => {
    if (!task.is_custom) {
      Alert.alert("Managed by AURA", "Status for generated tasks is updated through agent interactions.");
      return;
    }
    await api.updateTask(task.id, { status });
    await loadTasks();
  };

  const deleteTask = async (taskId: number) => {
    Alert.alert("Delete Task", "Are you sure you want to delete this task?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await api.deleteTask(taskId);
            await loadTasks();
          } catch (error) {
            Alert.alert("Delete failed", (error as Error).message);
          }
        },
      },
    ]);
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[screenStyles.scrollContent, { backgroundColor: palette.background }]}>
      <ScreenHeader
        title="Tasks"
        subtitle="Stay on top of your plan"
        rightAction={
          <Pressable onPress={onNavigateCalendar} style={styles.iconButton} accessibilityLabel="Open calendar">
            <Ionicons name="calendar" size={22} color={palette.primary} />
          </Pressable>
        }
      />

      <View style={styles.tabContainer}>
        <SegmentedControl options={["Today", "Upcoming", "Completed"]} value={listTab} onChange={setListTab} />
      </View>

      {shown.length === 0 ? (
        <AppCard style={styles.emptyCard}>
          <View style={styles.emptyIcon}>
            <Ionicons name="clipboard-outline" size={48} color={palette.muted} />
          </View>
          <Text style={styles.emptyTitle}>No tasks here</Text>
          <Text style={styles.emptyBody}>
            {listTab === "Today" && "You're all caught up for today! Add a personal task below."}
            {listTab === "Upcoming" && "No future tasks scheduled. Plan your next moves!"}
            {listTab === "Completed" && "Finish tasks to see them in your archives."}
          </Text>
        </AppCard>
      ) : null}

      <View style={commonStyles.stackMd}>
        {shown.map((task) => (
          <AppCard key={task.id} style={styles.taskCard}>
            <View style={styles.cardTop}>
              <View style={commonStyles.flexOne}>
                <Text style={commonStyles.cardTitle} numberOfLines={3}>
                  {task.task}
                </Text>
                <View style={[commonStyles.badgeRow, styles.badges]}>
                  {task.is_custom ? (
                    <Badge label="Personal" backgroundColor={palette.chipGreen} textColor={palette.accent} />
                  ) : (
                    <Badge label="AURA" backgroundColor={palette.chipPurple} textColor={palette.secondary} />
                  )}
                  <Badge label={statusLabel(task.status)} backgroundColor={palette.surfaceMuted} textColor={palette.muted} />
                </View>
              </View>
              <Pressable onPress={() => deleteTask(task.id)} style={styles.deleteButton}>
                <Ionicons name="trash-outline" size={18} color={palette.danger} />
              </Pressable>
            </View>

            <View style={styles.progressSection}>
              <ProgressBar value={statusProgress(task.status)} color={task.is_custom ? palette.accent : palette.primary} />
            </View>

            <View style={styles.dateFooter}>
              <View style={styles.dateInfo}>
                <Ionicons name="calendar-outline" size={14} color={palette.muted} />
                <Text style={styles.dateText}>
                  {safeDate(task.start_date_time).slice(0, 10)} → {safeDate(task.end_date_time).slice(0, 10) || "—"}
                </Text>
              </View>
            </View>

            {task.is_custom ? (
              <View style={styles.actions}>
                <MiniAction label="To Do" onPress={() => moveTask(task, "pending")} active={task.status === "pending"} />
                <MiniAction label="Doing" onPress={() => moveTask(task, "in_progress")} active={task.status === "in_progress"} />
                <MiniAction label="Done" onPress={() => moveTask(task, "completed")} primary />
              </View>
            ) : (
              <View style={styles.auraHint}>
                <Ionicons name="sparkles-outline" size={12} color={palette.muted} />
                <Text style={styles.hintText}>Managed by AI Coach interactions</Text>
              </View>
            )}
          </AppCard>
        ))}
      </View>

      <AppCard style={styles.addCard}>
        <View style={styles.addHeader}>
          <View style={styles.addIconCircle}>
            <Ionicons name="add" size={24} color={palette.primary} />
          </View>
          <View>
            <Text style={styles.addTitle}>Create Task</Text>
            <Text style={styles.addHint}>Add a custom goal to your track</Text>
          </View>
        </View>
        <View style={commonStyles.stackSm}>
          <InputField label="Task Name" placeholder="e.g. Learn React Navigation" value={newTask} onChangeText={setNewTask} />
          <View style={styles.dateInputRow}>
            <View style={commonStyles.flexOne}>
              <InputField label="Start Date" placeholder="YYYY-MM-DD" value={newStartDate} onChangeText={setNewStartDate} />
            </View>
            <View style={commonStyles.flexOne}>
              <InputField label="End Date" placeholder="YYYY-MM-DD" value={newEndDate} onChangeText={setNewEndDate} />
            </View>
          </View>
          <PrimaryButton label="Add Task" onPress={addTask} />
        </View>
      </AppCard>
    </ScrollView>
  );
}

function MiniAction({
  label,
  onPress,
  primary,
  active,
}: {
  label: string;
  onPress: () => void;
  primary?: boolean;
  active?: boolean;
}) {
  return (
    <Pressable 
      onPress={onPress} 
      style={[
        styles.miniBtn, 
        primary && styles.miniBtnPrimary,
        active && styles.miniBtnActive
      ]}
    >
      <Text style={[
        styles.miniBtnText, 
        primary && styles.miniBtnTextPrimary,
        active && styles.miniBtnTextActive
      ]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
  },
  tabContainer: {
    marginBottom: 16,
  },
  taskCard: {
    padding: 16,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  badges: {
    marginTop: 10,
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(239, 68, 68, 0.1)",
  },
  progressSection: {
    marginVertical: 14,
  },
  dateFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  dateInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dateText: {
    fontSize: 13,
    fontWeight: "700",
    color: palette.muted,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  miniBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surface,
    alignItems: "center",
  },
  miniBtnPrimary: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
  },
  miniBtnActive: {
    backgroundColor: palette.chipBlue,
    borderColor: palette.primary,
  },
  miniBtnText: {
    fontWeight: "800",
    fontSize: 12,
    color: palette.text,
  },
  miniBtnTextPrimary: {
    color: "#FFFFFF",
  },
  miniBtnTextActive: {
    color: palette.primary,
  },
  auraHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  hintText: {
    fontSize: 12,
    color: palette.muted,
    fontWeight: "600",
  },
  emptyCard: {
    alignItems: "center",
    padding: 32,
    gap: 12,
    marginBottom: 16,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: palette.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: palette.text,
  },
  emptyBody: {
    fontSize: 14,
    color: palette.muted,
    textAlign: "center",
    lineHeight: 20,
  },
  addCard: {
    marginTop: 24,
    padding: 20,
    backgroundColor: palette.surface,
    borderColor: palette.primary,
    borderWidth: 1,
    borderStyle: "dashed",
  },
  addHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  addIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: palette.chipBlue,
    alignItems: "center",
    justifyContent: "center",
  },
  addTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: palette.text,
  },
  addHint: {
    fontSize: 13,
    color: palette.muted,
  },
  dateInputRow: {
    flexDirection: "row",
    gap: 12,
  },
});
