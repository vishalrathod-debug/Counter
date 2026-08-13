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

export async function requestNotificationPermission(): Promise<boolean> {
  try {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();

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
  } catch (error) {
    console.error("Notification permission error:", error);
    return false;
  }
}

export async function cancelDailyTargetReminder(): Promise<void> {
  try {
    const notifications =
      await Notifications.getAllScheduledNotificationsAsync();

    for (const notification of notifications) {
      if (notification.content.data?.type === REMINDER_TYPE) {
        await Notifications.cancelScheduledNotificationAsync(
          notification.identifier,
        );
      }
    }
  } catch (error) {
    console.error("Failed to cancel reminder:", error);
  }
}

export async function scheduleDailyTargetReminder(
  count: number,
  target: number,
): Promise<void> {
  try {
    // Remove the previous reminder first.
    await cancelDailyTargetReminder();

    // Nothing to remind if there is no valid target.
    if (!Number.isInteger(target) || target <= 0) {
      return;
    }

    // Target already achieved.
    if (count >= target) {
      console.log("Target already achieved. No reminder scheduled.");
      return;
    }

    const now = new Date();

    // Schedule today's reminder for 9:00 PM.
    const reminder = new Date();

    reminder.setHours(21);
    reminder.setMinutes(0);
    reminder.setSeconds(0);
    reminder.setMilliseconds(0);

    // If 9 PM has already passed, schedule tomorrow at 9 PM.
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
          count,
          target,
        },
      },

      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: reminder,
      },
    });

    console.log(`Daily reminder scheduled for ${reminder.toLocaleString()}`);
  } catch (error) {
    console.error("Failed to schedule daily reminder:", error);
  }
}
