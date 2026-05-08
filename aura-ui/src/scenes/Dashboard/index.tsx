import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { palette, commonStyles } from "../../theme";
import { AppCard } from "../../components/AppCard";
import { Badge } from "../../components/Badge";
import { ProgressBar } from "../../components/ProgressBar";
import { ScreenHeader } from "../../components/ScreenHeader";
import { TextLink } from "../../components/TextLink";
import { UserProfile, Route } from "../../types";
import { api } from "../../api/api";
import { screenStyles } from "../../styles/screenStyles";

function formatToday() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

function taskStatusLabel(status: string | undefined) {
  const s = (status || "").toLowerCase();
  if (s === "completed") return "Done";
  if (s === "in_progress") return "In progress";
  return "To do";
}

function taskProgress(status: string | undefined) {
  const s = (status || "").toLowerCase();
  if (s === "completed") return 100;
  if (s === "in_progress") return 55;
  return 18;
}

export function DashboardScreen({
  user,
  onNavigate,
  onSignOut,
}: {
  user: UserProfile;
  onNavigate: (route: Route) => void;
  onSignOut: () => void;
}) {
  const { width } = useWindowDimensions();
  const [tasks, setTasks] = useState<any[]>([]);
  const [todayPlan, setTodayPlan] = useState<any[]>([]);
  const [dayStreak, setDayStreak] = useState(1);
  const [score, setScore] = useState(user.currentScore || 0);
  const [reminder, setReminder] = useState("");
  const [quote, setQuote] = useState("");

  const safeDate = (value: any) => (typeof value === "string" ? value : "");

  useEffect(() => {
    api
      .getDashboardSummary()
      .then((data) => {
        setTasks(Array.isArray(data.ongoing_tasks) ? data.ongoing_tasks : []);
        setTodayPlan(Array.isArray(data.todays_plan) ? data.todays_plan : []);
        setDayStreak(typeof data.day_streak === "number" ? data.day_streak : 1);
        setScore(typeof data.current_score === "number" ? data.current_score : 0);
      })
      .catch(() => {
        setTasks([]);
        setTodayPlan([]);
        setDayStreak(1);
        setScore(user.currentScore || 0);
      });
  }, [user.currentScore]);

  useEffect(() => {
    Promise.all([api.getDailyTaskReminder().catch(() => ({ message: "" })), api.getMotivationalQuote().catch(() => ({ message: "" }))]).then(([r, q]) => {
      setReminder(typeof r.message === "string" ? r.message : "");
      setQuote(typeof q.message === "string" ? q.message : "");
    });
  }, []);

  const coachBody =
    (user.recommendation && user.recommendation.trim()) ||
    reminder ||
    quote ||
    "Your plan updates as you complete tasks. Open Tasks to keep momentum.";

  const coachSupporting =
    user.recommendation?.trim() && reminder && reminder !== user.recommendation ? reminder : user.recommendation?.trim() && quote ? quote : "";

  const name = user.firstName?.trim() || "there";

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={screenStyles.scrollContent}>
      <ScreenHeader
        title={`Welcome back,\n${name}!`}
        subtitle={formatToday()}
        leftAction={
          <View style={styles.headerLogo}>
            <Ionicons name="sparkles" size={18} color="#FFFFFF" />
          </View>
        }
        rightAction={
          <View style={styles.headerActions}>
            <Pressable onPress={() => onNavigate("notifications")} style={styles.iconButton}>
              <Ionicons name="notifications-outline" size={20} color={palette.text} />
            </Pressable>
            <Pressable onPress={onSignOut} style={styles.iconButton}>
              <Ionicons name="log-out-outline" size={20} color={palette.text} />
            </Pressable>
          </View>
        }
      />

      <View style={[styles.statsRow, width < 360 && styles.statsRowStack]}>
        <AppCard style={styles.metricCard}>
          <View style={styles.metricContent}>
            <View>
              <Text style={styles.metricValue}>{score}</Text>
              <Text style={styles.metricLabel}>Aura Score</Text>
            </View>
            <View style={[styles.metricIconWrap, { backgroundColor: palette.chipYellow }]}>
              <Ionicons name="trophy" size={28} color={palette.warning} />
            </View>
          </View>
        </AppCard>
        <AppCard style={styles.metricCard}>
          <View style={styles.metricContent}>
            <View>
              <Text style={styles.metricValue}>{dayStreak}</Text>
              <Text style={styles.metricLabel}>Day Streak</Text>
            </View>
            <View style={[styles.metricIconWrap, { backgroundColor: palette.chipGreen }]}>
              <Ionicons name="flame" size={28} color={palette.success} />
            </View>
          </View>
        </AppCard>
      </View>

      <AppCard style={styles.goalCard}>
        <View style={styles.goalHeader}>
          <View style={styles.goalIcon}>
            <Ionicons name="rocket" size={20} color={palette.primary} />
          </View>
          <Text style={styles.eyebrow}>Career Track</Text>
        </View>
        <Text style={styles.goalTitle}>{user.goal || "Set your goal in Profile"}</Text>
      </AppCard>

      <AppCard style={styles.coachCard}>
        <View style={styles.coachHeader}>
          <Ionicons name="bulb" size={20} color="#FBBF24" />
          <Text style={styles.coachEyebrow}>Insights for you</Text>
        </View>
        <Text style={styles.coachBody}>{coachBody}</Text>
        {coachSupporting ? <Text style={styles.coachSupport}>{coachSupporting}</Text> : null}
      </AppCard>

      <View style={styles.sectionHeadingRow}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
      </View>
      <View style={styles.quickActionsGrid}>
        <Pressable style={({ pressed }) => [styles.quickAction, pressed && styles.quickPressed]} onPress={() => onNavigate("calendar")}>
          <View style={[styles.quickIconOuter, { backgroundColor: palette.chipBlue }]}>
            <Ionicons name="calendar" size={24} color={palette.primary} />
          </View>
          <Text style={styles.quickTitle}>Calendar</Text>
        </Pressable>
        <Pressable style={({ pressed }) => [styles.quickAction, pressed && styles.quickPressed]} onPress={() => onNavigate("aiCoach")}>
          <View style={[styles.quickIconOuter, { backgroundColor: palette.chipPurple }]}>
            <Ionicons name="chatbubbles" size={24} color={palette.secondary} />
          </View>
          <Text style={styles.quickTitle}>AI Coach</Text>
        </Pressable>
      </View>

      <AppCard style={commonStyles.stackMd}>
        <View style={styles.sectionHeadingRow}>
          <Text style={styles.sectionTitle}>Today's Plan</Text>
        </View>
        <View style={commonStyles.stackSm}>
          {todayPlan.length === 0 ? (
            <Text style={styles.emptyMuted}>Nothing scheduled today yet. Add tasks from the Tasks tab.</Text>
          ) : null}
          {todayPlan.map((item) => (
            <View key={`${item.id}-${item.task}`} style={styles.timelineRow}>
              <View style={[styles.timelineLine, item.status === "completed" && styles.timelineLineDone]} />
              <View style={commonStyles.flexOne}>
                <Text style={[styles.timelineTask, item.status === "completed" && styles.timelineTaskDone]}>{item.task}</Text>
                <View style={styles.timelineMetaRow}>
                  <Ionicons name="time-outline" size={12} color={palette.muted} />
                  <Text style={styles.timelineMeta}>
                    {safeDate(item.start_date_time).slice(11, 16) ? safeDate(item.start_date_time).slice(11, 16) + " · " : ""}
                    {taskStatusLabel(item.status)}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </AppCard>

      <View style={styles.sectionHeadingRow}>
        <Text style={styles.sectionTitle}>Ongoing Tasks</Text>
        <TextLink label="View all" onPress={() => onNavigate("tasks")} />
      </View>

      {tasks.length === 0 ? (
        <AppCard variant="muted">
          <Text style={styles.emptyMuted}>You're all caught up on active tasks!</Text>
        </AppCard>
      ) : null}

      {tasks.slice(0, 5).map((task) => (
        <AppCard key={task.id} style={styles.taskCard}>
          <View style={styles.taskRow}>
            <View style={commonStyles.flexOne}>
              <Text style={commonStyles.cardTitle} numberOfLines={2}>{task.task}</Text>
              <View style={[commonStyles.badgeRow, styles.taskBadges]}>
                {task.is_custom ? (
                  <Badge
                    label="Personal"
                    backgroundColor={palette.chipGreen}
                    textColor={palette.accent}
                  />
                ) : null}
                <Badge label={taskStatusLabel(task.status)} backgroundColor={palette.surfaceMuted} textColor={palette.muted} />
              </View>
            </View>
          </View>
          <View style={styles.progressContainer}>
            <ProgressBar value={taskProgress(task.status)} />
          </View>
          <View style={styles.taskFooter}>
            <Ionicons name="calendar-outline" size={12} color={palette.muted} />
            <Text style={styles.taskDate}>
              {safeDate(task.start_date_time).slice(0, 10)}
              {safeDate(task.end_date_time) ? ` → ${safeDate(task.end_date_time).slice(0, 10)}` : ""}
            </Text>
          </View>
        </AppCard>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  headerLogo: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.primary,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statsRowStack: {
    flexDirection: "column",
  },
  metricCard: {
    flex: 1,
    padding: 16,
  },
  metricContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  metricIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  metricValue: {
    fontSize: 24,
    fontWeight: "900",
    color: palette.text,
  },
  metricLabel: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2,
  },
  goalCard: {
    gap: 8,
    borderLeftWidth: 4,
    borderLeftColor: palette.primary,
  },
  goalHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  goalIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: palette.chipBlue,
    alignItems: "center",
    justifyContent: "center",
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: "800",
    color: palette.primary,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: palette.text,
  },
  coachCard: {
    backgroundColor: palette.primaryDark,
    borderColor: "rgba(255,255,255,0.1)",
    gap: 12,
  },
  coachHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  coachEyebrow: {
    fontSize: 11,
    fontWeight: "800",
    color: "rgba(255,255,255,0.7)",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  coachBody: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  coachSupport: {
    fontSize: 14,
    lineHeight: 21,
    color: "rgba(255,255,255,0.6)",
    fontWeight: "500",
  },
  sectionHeadingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: palette.text,
    letterSpacing: -0.5,
  },
  quickActionsGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 8,
  },
  quickAction: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    gap: 10,
  },
  quickPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  quickIconOuter: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  quickTitle: {
    fontWeight: "800",
    fontSize: 14,
    color: palette.text,
  },
  timelineRow: {
    flexDirection: "row",
    gap: 16,
    alignItems: "stretch",
    paddingVertical: 4,
  },
  timelineLine: {
    width: 4,
    borderRadius: 4,
    backgroundColor: palette.chipBlue,
    minHeight: 40,
  },
  timelineLineDone: {
    backgroundColor: palette.success,
  },
  timelineTask: {
    fontWeight: "700",
    fontSize: 15,
    color: palette.text,
  },
  timelineTaskDone: {
    color: palette.muted,
    textDecorationLine: "line-through",
  },
  timelineMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  timelineMeta: {
    fontSize: 12,
    color: palette.muted,
    fontWeight: "600",
  },
  emptyMuted: {
    color: palette.muted,
    textAlign: "center",
    paddingVertical: 12,
  },
  taskCard: {
    marginBottom: 12,
  },
  taskRow: {
    marginBottom: 8,
  },
  taskBadges: {
    marginTop: 8,
  },
  progressContainer: {
    marginVertical: 12,
  },
  taskFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  taskDate: {
    fontSize: 12,
    fontWeight: "600",
    color: palette.muted,
  },
});
