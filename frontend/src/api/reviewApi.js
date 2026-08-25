import axiosClient from "./axiosClient.js";

export const getPropertyReviews = async (propertyId, params = {}) => {
  const { data } = await axiosClient.get(`/reviews/property/${encodeURIComponent(propertyId)}`, { params });
  return data;
};

export const createReview = async (payload) => (await axiosClient.post("/reviews", payload)).data;
export const updateReview = async (id, payload) => (await axiosClient.put(`/reviews/${encodeURIComponent(id)}`, payload)).data;
export const deleteReview = async (id) => (await axiosClient.delete(`/reviews/${encodeURIComponent(id)}`)).data;
