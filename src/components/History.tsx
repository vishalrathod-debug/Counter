import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";

type DailyRecord = {
  count: number;
  target: number;
};

type DailyCounts = {
  [date: string]: DailyRecord;
};

type HistoryItem = {
  date: string;
  count: number;
  target: number;
};

const DAILY_COUNTS_KEY = "dailyCounts";

export default function History() {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const storedData = await AsyncStorage.getItem(DAILY_COUNTS_KEY);

        if (storedData === null) {
          return;
        }

        const dailyCounts: DailyCounts = JSON.parse(storedData);

        const historyItems: HistoryItem[] = Object.entries(dailyCounts).map(
          ([date, record]) => ({
            date,
            count: record.count,
            target: record.target,
          }),
        );

        historyItems.sort((a, b) => b.date.localeCompare(a.date));

        setHistory(historyItems);
      } catch (error) {
        console.error("Failed to load history:", error);
      }
    };

    loadHistory();
  }, []);

  const totalCount = history.reduce((total, item) => total + item.count, 0);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>History</Text>

      <Text style={styles.total}>Total: {totalCount}</Text>

      <FlatList
        data={history}
        keyExtractor={(item) => item.date}
        renderItem={({ item }) => {
          const achieved = item.count >= item.target;

          return (
            <View style={styles.item}>
              <View>
                <Text style={styles.date}>{item.date}</Text>

                <Text style={styles.target}>
                  {item.count} / {item.target}
                </Text>
              </View>

              <Text style={styles.status}>{achieved ? "✅" : "❌"}</Text>
            </View>
          );
        }}
        ListEmptyComponent={<Text style={styles.empty}>No history yet</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },

  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 10,
  },

  total: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },

  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },

  date: {
    fontSize: 18,
  },

  target: {
    fontSize: 16,
    marginTop: 5,
  },

  status: {
    fontSize: 22,
  },

  empty: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 30,
  },
});
