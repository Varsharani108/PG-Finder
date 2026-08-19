import Notification from "../models/Notification.js";

export async function createNotification({ recipient, type, title, message, relatedId }) {
  if (!recipient) return null;
  return Notification.create({ recipient, type, title, message, relatedId });
}