import axiosClient from "./axiosClient.js";

export const getAdminDashboard = async () => (await axiosClient.get("/admin/dashboard")).data;
export const setUserSuspended = async (id, isSuspended) => (await axiosClient.patch(`/admin/users/${id}/status`, { isSuspended })).data;
export const deleteAdminUser = async (id) => (await axiosClient.delete(`/admin/users/${id}`)).data;
export const setOwnerStatus = async (id, ownerStatus) => (await axiosClient.patch(`/admin/owners/${id}/status`, { ownerStatus })).data;
export const reviewProperty = async (id, status, reason) => (await axiosClient.patch(`/admin/properties/${id}/review`, { status, reason })).data;
export const updateAdminProperty = async (id, payload) => (await axiosClient.put(`/admin/properties/${id}`, payload)).data;
export const deleteAdminProperty = async (id) => (await axiosClient.delete(`/admin/properties/${id}`)).data;
export const resolveReport = async (id, resolution) => (await axiosClient.patch(`/admin/reports/${id}/resolve`, { resolution })).data;
export const deleteAdminReview = async (id) => (await axiosClient.delete(`/admin/reviews/${id}`)).data;
