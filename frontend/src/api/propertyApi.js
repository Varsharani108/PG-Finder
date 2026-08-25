import axiosClient from "./axiosClient.js";

export const getPublicProperties = async (filters = {}) => {
  const { data } = await axiosClient.get("/properties/public", {
    params: {
      search: filters.search || undefined,
      minPrice: filters.minPrice || undefined,
      maxPrice: filters.maxPrice || undefined,
      roomType: filters.roomType || undefined,
      facilities: filters.facilities?.length ? filters.facilities : undefined,
      food: filters.food?.length ? filters.food : undefined,
      foodIncluded: filters.foodIncluded || undefined,
      distance: filters.distance || undefined,
      sort: filters.sort || undefined,
      page: filters.page || undefined,
      limit: filters.limit || undefined,
    },
  });
  return data;
};

export const getPublicProperty = async (id) => {
  const { data } = await axiosClient.get(`/properties/public/${encodeURIComponent(id)}`);
  return data;
};

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
