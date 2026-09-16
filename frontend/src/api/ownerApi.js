import axiosClient from "./axiosClient.js";

export const getOwnerDashboard = async () => {
  const { data } = await axiosClient.get("/owner/dashboard");
  return data;
};

export const getOwnerProfile = async () => {
  const { data } = await axiosClient.get("/owner/profile");
  return data;
};

export const updateOwnerProfile = async (payload) => {
  const { data } = await axiosClient.patch("/owner/profile", payload);
  return data;
};

export const changeOwnerPassword = async (payload) => {
  const { data } = await axiosClient.patch("/owner/change-password", payload);
  return data;
};

export const updateInquiryStatus = async (id, status) => {
  const { data } = await axiosClient.patch(`/owner/inquiries/${id}/status`, { status });
  return data;
};

export const updateBookingStatus = async (id, status) => {
  const { data } = await axiosClient.patch(`/owner/bookings/${id}/status`, { status });
  return data;
};
