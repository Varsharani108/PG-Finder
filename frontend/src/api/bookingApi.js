import axiosClient from "./axiosClient.js";

export const getCheckoutDetails = async (propertyId) => (await axiosClient.get(`/bookings/checkout/${propertyId}`)).data;
export const createCashBooking = async (payload) => (await axiosClient.post("/bookings/cash", payload)).data;
export const createStripeSession = async (payload) => (await axiosClient.post("/bookings/stripe-session", payload)).data;
export const getBooking = async (id, sessionId) => (await axiosClient.get(`/bookings/${id}`, { params: sessionId ? { session_id: sessionId } : undefined })).data;
export const getPaymentStatus = async (id, sessionId) => (await axiosClient.get(`/bookings/${id}/payment-status`, { params: { session_id: sessionId } })).data;