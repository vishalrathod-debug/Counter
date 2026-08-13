import AsyncStorage from "@react-native-async-storage/async-storage";

export type DailyRecord = {
  count: number;
  target: number;
};

export type DailyCounts = {
  [date: string]: DailyRecord;
};

const STORAGE_KEY = "dailyCounts";

export async function getDailyCounts(): Promise<DailyCounts> {
  const data = await AsyncStorage.getItem(STORAGE_KEY);

  if (!data) {
    return {};
  }

  return JSON.parse(data);
}

export async function saveDailyCounts(dailyCounts: DailyCounts): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(dailyCounts));
}
