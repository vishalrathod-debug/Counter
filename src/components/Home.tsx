import { Link, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { getDailyCounts, saveDailyCounts } from "../utils/storage";

import {
  requestNotificationPermission,
  scheduleDailyTargetReminder,
} from "../utils/notifications";

function getToday(): string {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function Home() {
  const [target, setTarget] = useState<number | null>(null);
  const [count, setCount] = useState(0);

  const [inputTarget, setInputTarget] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const today = getToday();

  // Request notification permission once
  useEffect(() => {
    const setupNotifications = async () => {
      await requestNotificationPermission();
    };

    setupNotifications();
  }, []);

  // Load today's data whenever Home becomes visible
  useFocusEffect(
    useCallback(() => {
      const loadToday = async () => {
        try {
          const dailyCounts = await getDailyCounts();

          const todayRecord = dailyCounts[today];

          if (todayRecord) {
            setCount(todayRecord.count);
            setTarget(todayRecord.target);

            setIsEditing(false);

            // Keep the reminder updated
            await scheduleDailyTargetReminder(
              todayRecord.count,
              todayRecord.target,
            );
          } else {
            setCount(0);
            setTarget(null);
            setInputTarget("");
            setIsEditing(true);
          }
        } catch (error) {
          console.error("Failed to load today's data:", error);
        }
      };

      loadToday();
    }, [today]),
  );

  // Save today's target
  const saveTarget = async () => {
    const newTarget = Number(inputTarget);

    if (!Number.isInteger(newTarget) || newTarget <= 0) {
      return;
    }

    try {
      const dailyCounts = await getDailyCounts();

      const todayRecord = dailyCounts[today];

      const currentCount = todayRecord?.count ?? 0;

      dailyCounts[today] = {
        count: currentCount,
        target: newTarget,
      };

      await saveDailyCounts(dailyCounts);

      // Update Home immediately
      setCount(currentCount);
      setTarget(newTarget);

      setInputTarget("");
      setIsEditing(false);

      // Update notification
      await scheduleDailyTargetReminder(currentCount, newTarget);
    } catch (error) {
      console.error("Failed to save target:", error);
    }
  };

  const progress =
    target && target > 0 ? Math.min((count / target) * 100, 100) : 0;

  return (
    <View style={styles.container}>
      {/* Header */}

      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome 👋</Text>

        <Text style={styles.title}>Daily Counter</Text>

        <Text style={styles.subtitle}>Stay consistent. Reach your goal.</Text>
      </View>

      {/* Target Card */}

      <View style={styles.card}>
        {isEditing ? (
          <>
            <Text style={styles.cardLabel}>Set Your Daily Target</Text>

            <TextInput
              value={inputTarget}
              onChangeText={setInputTarget}
              keyboardType="number-pad"
              placeholder="Enter target"
              style={styles.input}
            />

            <Pressable style={styles.saveButton} onPress={saveTarget}>
              <Text style={styles.saveButtonText}>Save Target</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Text style={styles.cardLabel}>Today's Target</Text>

            <Text style={styles.target}>{target}</Text>

            <Text style={styles.progressText}>
              {count} / {target}
            </Text>

            <View style={styles.progressBackground}>
              <View
                style={[
                  styles.progress,
                  {
                    width: `${progress}%`,
                  },
                ]}
              />
            </View>

            <Text style={styles.percentage}>
              {Math.round(progress)}% completed
            </Text>

            <Pressable
              onPress={() => {
                setInputTarget(String(target));

                setIsEditing(true);
              }}
            >
              <Text style={styles.edit}>Edit Target</Text>
            </Pressable>
          </>
        )}
      </View>

      {/* Navigation */}

      <View style={styles.navigation}>
        <Link href="/counter" asChild>
          <Pressable style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>➕ Open Counter</Text>
          </Pressable>
        </Link>

        <Link href="/history" asChild>
          <Pressable style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>📊 View History</Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FB",
    padding: 20,
  },

  header: {
    marginTop: 50,
    marginBottom: 30,
  },

  greeting: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 5,
  },

  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#111827",
  },

  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 6,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",

    shadowOffset: {
      width: 0,
      height: 4,
    },

    shadowOpacity: 0.08,
    shadowRadius: 10,

    elevation: 4,
  },

  cardLabel: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 10,
  },

  target: {
    fontSize: 48,
    fontWeight: "800",
    color: "#111827",
  },

  progressText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginTop: 5,
  },

  progressBackground: {
    width: "100%",
    height: 12,
    backgroundColor: "#E5E7EB",
    borderRadius: 10,
    marginTop: 20,
    overflow: "hidden",
  },

  progress: {
    height: "100%",
    backgroundColor: "#22C55E",
    borderRadius: 10,
  },

  percentage: {
    marginTop: 10,
    color: "#6B7280",
    fontSize: 14,
  },

  edit: {
    marginTop: 18,
    fontSize: 15,
    fontWeight: "600",
    color: "#2563EB",
  },

  input: {
    width: "80%",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    padding: 14,
    fontSize: 20,
    textAlign: "center",
    marginVertical: 15,
  },

  saveButton: {
    backgroundColor: "#2563EB",
    paddingVertical: 14,
    paddingHorizontal: 35,
    borderRadius: 12,
  },

  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  navigation: {
    marginTop: 25,
    gap: 15,
  },

  primaryButton: {
    backgroundColor: "#2563EB",
    paddingVertical: 18,
    borderRadius: 15,
    alignItems: "center",
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },

  secondaryButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 18,
    borderRadius: 15,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  secondaryButtonText: {
    color: "#111827",
    fontSize: 17,
    fontWeight: "700",
  },
});
