import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

const REMINDER_TYPE = "daily-target-reminder";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermission() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();

  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();

    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("Notification permission not granted");
    return false;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("daily-counter", {
      name: "Daily Counter",
      importance: Notifications.AndroidImportance.HIGH,
      sound: "default",
    });
  }

  return true;
}

export async function cancelDailyTargetReminder() {
  const notifications = await Notifications.getAllScheduledNotificationsAsync();

  for (const notification of notifications) {
    if (notification.content.data?.type === REMINDER_TYPE) {
      await Notifications.cancelScheduledNotificationAsync(
        notification.identifier,
      );
    }
  }
}

export async function scheduleDailyTargetReminder(
  count: number,
  target: number,
) {
  // Remove any previous reminder
  await cancelDailyTargetReminder();

  // Target already achieved.
  // No notification is needed.
  if (count >= target) {
    return;
  }

  const now = new Date();

  // Reminder time: 9:00 PM
  const reminder = new Date();

  reminder.setHours(21);
  reminder.setMinutes(0);
  reminder.setSeconds(0);
  reminder.setMilliseconds(0);

  // If 9 PM has already passed,
  // schedule for tomorrow.
  if (reminder <= now) {
    reminder.setDate(reminder.getDate() + 1);
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "🎯 Daily Counter",
      body: `Today's target is not achieved. You completed ${count} / ${target}.`,
      sound: "default",

      data: {
        type: REMINDER_TYPE,
      },
    },

    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: reminder,
    },
  });

  console.log(`Daily reminder scheduled for ${reminder.toLocaleString()}`);
}
