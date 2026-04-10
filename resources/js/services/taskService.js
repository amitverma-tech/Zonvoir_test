import api from "../api/axios";

export const getTasks = async ({ page = 1, search = "", status = "" } = {}) => {
    const params = new URLSearchParams({ page });
    if (search) params.append("search", search);
    if (status) params.append("status", status);
    const response = await api.get(`/tasks?${params.toString()}`);
    return response.data;
};

export const createTask = async (data) => {
    const response = await api.post("/tasks", data);
    return response.data;
};

export const updateTask = async (id, data) => {
    const response = await api.put(`/tasks/${id}`, data);
    return response.data;
};

export const deleteTask = async (id) => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
};
