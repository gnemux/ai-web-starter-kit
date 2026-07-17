"use server";

import {
  markAllOwnerNotificationsRead,
  markOwnerNotificationRead
} from "@/lib/catcare/product-service";

export async function markOwnerNotificationReadAction(notificationId: string) {
  return markOwnerNotificationRead(notificationId);
}

export async function markAllOwnerNotificationsReadAction() {
  return markAllOwnerNotificationsRead();
}
