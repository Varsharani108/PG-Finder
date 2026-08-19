import axiosClient from "./axiosClient.js";

export const getUserDashboard = async () => (await axiosClient.get("/user/dashboard")).data;
export const removeSavedProperty = async (id) => (await axiosClient.delete(`/user/saved-properties/${id}`)).data;