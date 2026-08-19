import axiosClient from "./axiosClient.js";

export const getOwnerProperties = async () => {
  const { data } = await axiosClient.get("/properties");
  return data;
};

export const createProperty = async (payload) => {
  const { data } = await axiosClient.post("/properties", payload);
  return data;
};

export const updateProperty = async (id, payload) => {
  const { data } = await axiosClient.put(`/properties/${id}`, payload);
  return data;
};

export const deleteProperty = async (id) => {
  const { data } = await axiosClient.delete(`/properties/${id}`);
  return data;
};
