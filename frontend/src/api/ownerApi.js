import axiosClient from "./axiosClient.js";

export const getOwnerDashboard = async () => {
  const { data } = await axiosClient.get("/owner/dashboard");
  return data;
};

export const updateInquiryStatus = async (id, status) => {
  const { data } = await axiosClient.patch(`/owner/inquiries/${id}/status`, { status });
  return data;
};
