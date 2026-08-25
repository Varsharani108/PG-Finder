import axiosClient from "./axiosClient.js";

export const getUserDashboard = async () => (await axiosClient.get("/user/dashboard")).data;
export const removeSavedProperty = async (id) => (await axiosClient.delete(`/user/saved-properties/${id}`)).data;
export const sendInquiry = async (payload) => (await axiosClient.post("/user/inquiries", payload)).data;
export const requestBooking = async (payload) => (await axiosClient.post("/user/bookings", payload)).data;