import axiosClient from "./axiosClient.js";

export const getNotifications = async () => (await axiosClient.get("/notifications")).data;
export const markNotificationRead = async (id) => (await axiosClient.patch(`/notifications/${id}/read`)).data;
export const markAllNotificationsRead = async () => (await axiosClient.patch("/notifications/read-all")).data;
