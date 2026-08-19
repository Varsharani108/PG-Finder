import axiosClient from "./axiosClient.js";

export const signupRequest = (payload) =>
  axiosClient.post("/auth/signup", payload).then((res) => res.data);

export const loginRequest = (payload) =>
  axiosClient.post("/auth/login", payload).then((res) => res.data);

export const forgotPasswordRequest = (payload) =>
  axiosClient.post("/auth/forgot-password", payload).then((res) => res.data);

export const resetPasswordRequest = (payload) =>
  axiosClient.post("/auth/reset-password", payload).then((res) => res.data);

export const getProfileRequest = () =>
  axiosClient.get("/auth/profile").then((res) => res.data);
