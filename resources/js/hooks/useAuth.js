import { useState } from "react";
import { loginUser } from "../services/authService";

export default function useAuth() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const login = async (data) => {
        try {
            setLoading(true);
            setError(null);

            const res = await loginUser(data);

            localStorage.setItem("token", res.token);

            return true;
        } catch (err) {
            setError(err?.response?.data?.message || "Login failed");
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { login, loading, error };
}