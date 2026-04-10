import { useEffect, useState } from "react";

function Header() {
    const [user, setUser] = useState(null);

    const handleLogout = () => {
        localStorage.removeItem("token");
        window.location.href = "/";
    };

    useEffect(() => {
        // 👉 Get user from localStorage (or API later)
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (storedUser) {
            setUser(storedUser);
        }
    }, []);

    return (
        <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">

            {/* Left */}
            <h1 className="text-xl font-semibold text-gray-800">
                Dashboard
            </h1>

            {/* Right */}
            <div className="flex items-center gap-4">

                {/* User Info */}
                <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold">
                        {user?.name?.charAt(0).toUpperCase() || "U"}
                    </div>

                    <span className="text-gray-700 font-medium">
                        {user?.name || "User"}
                    </span>
                </div>

                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm transition"
                >
                    Logout
                </button>
            </div>
        </header>
    );
}

export default Header;