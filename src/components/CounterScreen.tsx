import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Button, StyleSheet, Text, View } from "react-native";

import { getDailyCounts, saveDailyCounts } from "../utils/storage";

function getToday(): string {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function Counter() {
  const [count, setCount] = useState(0);
  const [target, setTarget] = useState(0);

  const today = getToday();

  /*
   * Load today's data whenever Counter becomes active.
   */
  useFocusEffect(
    useCallback(() => {
      const loadToday = async () => {
        try {
          const dailyCounts = await getDailyCounts();

          const todayRecord = dailyCounts[today];

          if (todayRecord) {
            setCount(todayRecord.count);
            setTarget(todayRecord.target);
          } else {
            setCount(0);
            setTarget(0);
          }
        } catch (error) {
          console.error("Failed to load today's data:", error);
        }
      };

      loadToday();
    }, [today]),
  );

  /*
   * Increase and save immediately.
   */
  const increaseCount = async () => {
    const newCount = count + 1;

    // Update screen immediately
    setCount(newCount);

    try {
      const dailyCounts = await getDailyCounts();

      const todayRecord = dailyCounts[today];

      const currentTarget = todayRecord?.target ?? target;

      dailyCounts[today] = {
        count: newCount,
        target: currentTarget,
      };

      await saveDailyCounts(dailyCounts);

      console.log("Saved:", newCount, "Target:", currentTarget);
    } catch (error) {
      console.error("Failed to save count:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Today's Count</Text>

      <Text style={styles.count}>{count}</Text>

      <Text style={styles.target}>Target: {target}</Text>

      <Button title="Increase" onPress={increaseCount} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
  },

  count: {
    fontSize: 60,
    marginVertical: 20,
  },

  target: {
    fontSize: 18,
    marginBottom: 20,
  },
});
