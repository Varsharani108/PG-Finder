import axiosClient from "./axiosClient.js";

export const getAdminDashboard = async () => (await axiosClient.get("/admin/dashboard")).data;
export const setUserSuspended = async (id, isSuspended) => (await axiosClient.patch(`/admin/users/${id}/status`, { isSuspended })).data;
export const deleteAdminUser = async (id) => (await axiosClient.delete(`/admin/users/${id}`)).data;
export const setOwnerStatus = async (id, ownerStatus) => (await axiosClient.patch(`/admin/owners/${id}/status`, { ownerStatus })).data;
export const reviewProperty = async (id, status, reason) => {
	const verificationStatus = { Active: "verified", Rejected: "rejected", Pending: "pending" }[status] || status;
	return (await axiosClient.patch(`/admin/properties/${id}/review`, { status: verificationStatus, reason })).data;
};
export const updateAdminProperty = async (id, payload) => (await axiosClient.put(`/admin/properties/${id}`, payload)).data;
export const deleteAdminProperty = async (id) => (await axiosClient.delete(`/admin/properties/${id}`)).data;
export const resolveReport = async (id, resolution) => (await axiosClient.patch(`/admin/reports/${id}/resolve`, { resolution })).data;
export const updateReportStatus = async (id, status, resolution = "") => (await axiosClient.patch(`/admin/reports/${id}/resolve`, { status, resolution })).data;
export const updateAdminInquiry = async (id, status, reply = "") => (await axiosClient.patch(`/admin/inquiries/${id}/status`, { status, reply })).data;
export const deleteAdminReview = async (id) => (await axiosClient.delete(`/admin/reviews/${id}`)).data;
