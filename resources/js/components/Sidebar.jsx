import { Link } from "react-router-dom";

function Sidebar() {
    return (
        <div className="w-64 bg-white shadow-md p-5">

            <h2 className="text-xl font-bold mb-6 text-purple-600">
                Task App
            </h2>

            <nav className="flex flex-col gap-3">
                <Link
                    to="/dashboard"
                    className="p-2 rounded hover:bg-purple-100"
                >
                    Dashboard
                </Link>

                <Link
                    to="/tasks"
                    className="p-2 rounded hover:bg-purple-100"
                >
                    Tasks
                </Link>
            </nav>
        </div>
    );
}

export default Sidebar;