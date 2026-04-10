
import { useState, useEffect } from "react";
import MainLayout from "../layouts/MainLayout";
import { getTasks } from "../services/taskService";

const ShimmerCard = () => (
    <div className="bg-white p-6 rounded-xl shadow animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4 shimmer" />
        <div className="h-8 bg-gray-200 rounded w-1/3 shimmer" />
    </div>
);

function Dashboard() {
    const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Fetch all tasks (page 1, large enough to get counts)
                const data = await getTasks(1);
                const all = data.data;
                const completed = all.filter((t) => t.status === "completed").length;
                const pending = all.filter((t) => t.status === "pending").length;
                setStats({ total: data.total, completed, pending });
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const cards = [
        { title: "Total Tasks", value: stats.total },
        { title: "Completed", value: stats.completed },
        { title: "Pending", value: stats.pending },
    ];

    return (
        <MainLayout>
            <h2 className="text-2xl font-bold mb-6">Dashboard</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {loading
                    ? [1, 2, 3].map((i) => <ShimmerCard key={i} />)
                    : cards.map((card, index) => (
                        <div
                            key={index}
                            className="bg-white p-6 rounded-xl shadow"
                        >
                            <h3 className="text-gray-500">{card.title}</h3>
                            <p className="text-3xl font-bold mt-2 text-purple-600">
                                {card.value}
                            </p>
                        </div>
                    ))}
            </div>
        </MainLayout>
    );
}

export default Dashboard;