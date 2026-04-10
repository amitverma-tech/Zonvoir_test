import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api/axios";

function Auth() {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
    });

    const [loading, setLoading] = useState(false);

    // ✅ FRONTEND VALIDATION
    const validate = () => {
        if (!isLogin && !form.name.trim()) {
            toast.error("Please enter your name");
            return false;
        }

        if (!form.email.trim()) {
            toast.error("Email is required");
            return false;
        }

        if (!/\S+@\S+\.\S+/.test(form.email)) {
            toast.error("Please enter a valid email");
            return false;
        }

        if (!form.password) {
            toast.error("Password is required");
            return false;
        }

        if (form.password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) return;

        setLoading(true);

        try {
            if (isLogin) {
                const res = await api.post("/auth/login", form);

                localStorage.setItem("token", res.data.token);
                localStorage.setItem("user", JSON.stringify(res.data.user));

                toast.success("Login successful 🎉");

                navigate("/dashboard");
            } else {
                const res = await api.post("/auth/register", form);

                localStorage.setItem("token", res.data.token);
                localStorage.setItem("user", JSON.stringify(res.data.user));

                toast.success("Registration successful 🎉");

                navigate("/dashboard");
            }
        } catch (err) {
            if (err.response?.data?.errors) {
                Object.values(err.response.data.errors).forEach((fieldErrors) => {
                    fieldErrors.forEach((message) => toast.error(message));
                });
            } 
            else if (err.response?.data?.message) {
                toast.error(err.response.data.message);
            } 
            else {
                toast.error("Something went wrong ❌");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-purple-600">
            <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">

                <h2 className="text-3xl font-bold text-center mb-2">
                    {isLogin ? "Welcome Back" : "Create Account"}
                </h2>

                <p className="text-center text-gray-500 mb-6">
                    {isLogin
                        ? "Sign in to your dashboard"
                        : "Register to get started"}
                </p>

                <form onSubmit={handleSubmit}>

                    {/* Name */}
                    {!isLogin && (
                        <div className="mb-4">
                            <label className="block mb-1">Name</label>
                            <input
                                type="text"
                                placeholder="Enter your full name"
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-400"
                                value={form.name}
                                onChange={(e) =>
                                    setForm({ ...form, name: e.target.value })
                                }
                            />
                        </div>
                    )}

                    {/* Email */}
                    <div className="mb-4">
                        <label className="block mb-1">Email</label>
                        <input
                            type="email"
                            placeholder="Enter your email address"
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-400"
                            value={form.email}
                            onChange={(e) =>
                                setForm({ ...form, email: e.target.value })
                            }
                        />
                    </div>

                    {/* Password */}
                    <div className="mb-4">
                        <label className="block mb-1">Password</label>
                        <input
                            type="password"
                            placeholder="Enter your password"
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-400"
                            value={form.password}
                            onChange={(e) =>
                                setForm({ ...form, password: e.target.value })
                            }
                        />
                    </div>

                    <button
                        className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition"
                        disabled={loading}
                    >
                        {loading
                            ? "Please wait..."
                            : isLogin
                            ? "Log In"
                            : "Sign Up"}
                    </button>
                </form>

                <p className="text-center mt-4 text-sm">
                    {isLogin
                        ? "Don't have an account?"
                        : "Already have an account?"}
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="ml-2 text-purple-600 font-bold"
                    >
                        {isLogin ? "Sign Up" : "Login"}
                    </button>
                </p>
            </div>
        </div>
    );
}

export default Auth;