
import { useState, useEffect, useRef, useCallback } from "react";
import MainLayout from "../layouts/MainLayout";
import { getTasks, createTask, updateTask, deleteTask } from "../services/taskService";
import { toast } from "react-toastify";

const ShimmerRow = () => (
    <tr className="animate-pulse">
        <td className="px-6 py-4">
            <div className="h-4 bg-gray-200 rounded w-24 shimmer" />
        </td>
        <td className="px-6 py-4">
            <div className="h-4 bg-gray-200 rounded w-40 shimmer" />
        </td>
        <td className="px-6 py-4">
            <div className="h-4 bg-gray-200 rounded w-16 shimmer" />
        </td>
        <td className="px-6 py-4">
            <div className="h-4 bg-gray-200 rounded w-20 shimmer" />
        </td>
        <td className="px-6 py-4">
            <div className="h-8 bg-gray-200 rounded w-20 shimmer" />
        </td>
    </tr>
);

const today = () => new Date().toISOString().split("T")[0];

const EMPTY_FORM = {
    title: "",
    description: "",
    status: "pending",
    due_date: "",
};

function Tasks() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState(EMPTY_FORM);
    const [editingTask, setEditingTask] = useState(null);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState("");
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [viewTask, setViewTask] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const debounceRef = useRef(null);

    const fetchTasks = useCallback(async (page = 1, searchVal = search, statusVal = statusFilter) => {
        setLoading(true);
        try {
            const data = await getTasks({ page, search: searchVal, status: statusVal });
            setTasks(data.data);
            setCurrentPage(data.current_page);
            setLastPage(data.last_page);
            setTotal(data.total);
        } catch {
            setError("Failed to load tasks.");
        } finally {
            setLoading(false);
        }
    }, [search, statusFilter]);

    useEffect(() => {
        fetchTasks(1, search, statusFilter);
    }, [statusFilter]);

    const handleSearchChange = (e) => {
        const val = e.target.value;
        setSearch(val);
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            fetchTasks(1, val, statusFilter);
        }, 400);
    };

    const openCreate = () => {
        setEditingTask(null);
        setForm(EMPTY_FORM);
        setError("");
        setShowModal(true);
    };

    const openEdit = (task) => {
        setEditingTask(task);
        setForm({
            title: task.title,
            description: task.description || "",
            status: task.status,
            due_date: task.due_date || "",
        });
        setError("");
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingTask(null);
        setForm(EMPTY_FORM);
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        // Client-side validation
        if (!form.title.trim()) {
            setError("Title is required.");
            return;
        }
        if (!form.description.trim()) {
            setError("Description is required.");
            return;
        }
        if (!form.due_date) {
            setError("Due date is required.");
            return;
        }
        if (form.due_date < today()) {
            setError("Due date cannot be in the past.");
            return;
        }

        // Duplicate title check (exclude current task when editing)
        const duplicate = tasks.find(
            (t) =>
                t.title.trim().toLowerCase() === form.title.trim().toLowerCase() &&
                (!editingTask || t.id !== editingTask.id)
        );
        if (duplicate) {
            setError("A task with this title already exists.");
            return;
        }

        setSaving(true);
        try {
            if (editingTask) {
                await updateTask(editingTask.id, form);
                toast.success("Task updated successfully");
            } else {
                await createTask(form);
                toast.success("Task added successfully");
            }
            closeModal();
            fetchTasks(currentPage, search, statusFilter);
        } catch (err) {
            setError(
                err?.response?.data?.message ||
                Object.values(err?.response?.data?.errors || {}).flat().join(", ") ||
                "Something went wrong."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        setDeleting(true);
        try {
            await deleteTask(id);
            setDeleteConfirm(null);
            toast.success("Task deleted successfully");
            fetchTasks(currentPage, search, statusFilter);
        } catch {
            toast.error("Failed to delete task.");
        } finally {
            setDeleting(false);
        }
    };

    const statusBadge = (status) =>
        status === "completed" ? (
            <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full">
                Completed
            </span>
        ) : (
            <span className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-2 py-1 rounded-full">
                Pending
            </span>
        );

    return (
        <MainLayout>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h2 className="text-2xl font-bold">Tasks
                    {!loading && <span className="ml-2 text-sm font-normal text-gray-400">({total} total)</span>}
                </h2>
                <button
                    onClick={openCreate}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    New Task
                </button>
            </div>

            {/* Search & Filter Bar */}
            <div className="bg-white rounded-xl shadow px-5 py-4 mb-4 flex flex-col sm:flex-row gap-3 items-center">
                {/* Search */}
                <div className="relative flex-1 w-full">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" /></svg>
                    <input
                        type="text"
                        value={search}
                        onChange={handleSearchChange}
                        placeholder="Search by title or description..."
                        className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-400 outline-none"
                    />
                    {search && (
                        <button onClick={() => { setSearch(""); fetchTasks(1, "", statusFilter); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    )}
                </div>
                {/* Status Filter Tabs */}
                <div className="flex gap-2 shrink-0">
                    {[{ label: "All", value: "" }, { label: "Pending", value: "pending" }, { label: "Completed", value: "completed" }].map((f) => (
                        <button
                            key={f.value}
                            onClick={() => setStatusFilter(f.value)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                                statusFilter === f.value
                                    ? "bg-purple-600 text-white shadow"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {error && !showModal && (
                <div className="bg-red-100 text-red-600 p-3 rounded mb-4 text-sm">
                    {error}
                </div>
            )}

            <div className="bg-white rounded-xl shadow overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                        <tr>
                            <th className="px-6 py-3 text-left">Title</th>
                            <th className="px-6 py-3 text-left">Description</th>
                            <th className="px-6 py-3 text-left">Status</th>
                            <th className="px-6 py-3 text-left">Due Date</th>
                            <th className="px-6 py-3 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading
                            ? [1,2,3,4,5,6,7].map((i) => <ShimmerRow key={i} />)
                            : tasks.length === 0
                                ? (
                                    <tr>
                                        <td colSpan={5} className="text-center py-20 text-gray-400">
                                            No tasks yet. Click <strong>+ New Task</strong> to get started.
                                        </td>
                                    </tr>
                                )
                                : tasks.map((task) => (
                                    <tr key={task.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            {task.title}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 max-w-xs truncate">
                                            {task.description || "—"}
                                        </td>
                                        <td className="px-6 py-4">{statusBadge(task.status)}</td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {task.due_date ? new Date(task.due_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : "—"}
                                        </td>
                                        <td className="px-6 py-4 flex gap-2">
                                            <button
                                                onClick={() => setViewTask(task)}
                                                className="bg-gray-50 text-gray-600 px-3 py-1 rounded hover:bg-gray-100 transition text-xs font-medium"
                                            >
                                                View
                                            </button>
                                            <button
                                                onClick={() => openEdit(task)}
                                                className="bg-blue-50 text-blue-600 px-3 py-1 rounded hover:bg-blue-100 transition text-xs font-medium"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => setDeleteConfirm(task.id)}
                                                className="bg-red-50 text-red-600 px-3 py-1 rounded hover:bg-red-100 transition text-xs font-medium"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                    </tbody>
                </table>

                {/* Pagination */}
                {!loading && (
                    <div className="flex items-center justify-between px-6 py-4 border-t">
                        <p className="text-sm text-gray-500">
                            Page {currentPage} of {lastPage}
                        </p>
                        <div className="flex gap-1">
                            <button
                                onClick={() => fetchTasks(currentPage - 1, search, statusFilter)}
                                disabled={currentPage === 1}
                                className="px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition"
                            >
                                ← Prev
                            </button>
                            {Array.from({ length: lastPage }, (_, i) => i + 1)
                                .filter(p => p === 1 || p === lastPage || Math.abs(p - currentPage) <= 1)
                                .reduce((acc, p, idx, arr) => {
                                    if (idx > 0 && p - arr[idx - 1] > 1) acc.push("...");
                                    acc.push(p);
                                    return acc;
                                }, [])
                                .map((p, idx) =>
                                    p === "..." ? (
                                        <span key={`ellipsis-${idx}`} className="px-2 py-1.5 text-gray-400 text-sm">…</span>
                                    ) : (
                                        <button
                                            key={p}
                                            onClick={() => fetchTasks(p, search, statusFilter)}
                                            className={`w-8 h-8 rounded-lg text-sm font-medium transition ${
                                                p === currentPage
                                                    ? "bg-purple-600 text-white shadow"
                                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                            }`}
                                        >
                                            {p}
                                        </button>
                                    )
                                )}
                            <button
                                onClick={() => fetchTasks(currentPage + 1, search, statusFilter)}
                                disabled={currentPage === lastPage}
                                className="px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition"
                            >
                                Next →
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Create / Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
                        <h3 className="text-xl font-bold mb-4">
                            {editingTask ? "Edit Task" : "New Task"}
                        </h3>

                        {error && (
                            <div className="bg-red-100 text-red-600 p-2 mb-4 rounded text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-purple-400 outline-none"
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    placeholder="e.g. Fix login bug"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Description <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-purple-400 outline-none resize-none"
                                    rows={3}
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    placeholder="Describe what needs to be done..."
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Status <span className="text-red-500">*</span>
                                </label>
                                <select
                                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-purple-400 outline-none"
                                    value={form.status}
                                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                                    required
                                >
                                    <option value="pending">Pending</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Due Date <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-purple-400 outline-none"
                                    value={form.due_date}
                                    onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                                    min={today()}
                                    required
                                />
                                {form.due_date && (
                                    <p className="text-xs text-gray-400 mt-1">
                                        {new Date(form.due_date).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                                    </p>
                                )}
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition disabled:opacity-60 flex items-center gap-2"
                                >
                                    {saving && (
                                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                                        </svg>
                                    )}
                                    {saving ? "Saving..." : editingTask ? "Update" : "Create"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
                        <h3 className="text-lg font-bold mb-2">Delete Task?</h3>
                        <p className="text-gray-500 text-sm mb-6">
                            This action cannot be undone.
                        </p>
                        <div className="flex justify-center gap-3">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDelete(deleteConfirm)}
                                disabled={deleting}
                                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition disabled:opacity-60 flex items-center gap-2"
                            >
                                {deleting && (
                                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                                    </svg>
                                )}
                                {deleting ? "Deleting..." : "Yes, Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* View Task Modal */}
            {viewTask && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
                        <div className="flex justify-between items-start mb-5">
                            <h3 className="text-xl font-bold text-gray-800">Task Details</h3>
                            <button
                                onClick={() => setViewTask(null)}
                                className="text-gray-400 hover:text-gray-600 transition"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Title</p>
                                <p className="text-gray-800 font-medium">{viewTask.title}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Description</p>
                                <p className="text-gray-600 whitespace-pre-wrap">{viewTask.description || "—"}</p>
                            </div>
                            <div className="flex gap-6">
                                <div>
                                    <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Status</p>
                                    {viewTask.status === "completed" ? (
                                        <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full">Completed</span>
                                    ) : (
                                        <span className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-2 py-1 rounded-full">Pending</span>
                                    )}
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Due Date</p>
                                    <p className="text-gray-600">
                                        {viewTask.due_date
                                            ? new Date(viewTask.due_date).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
                                            : "—"}
                                    </p>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Created</p>
                                <p className="text-gray-500 text-sm">
                                    {new Date(viewTask.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setViewTask(null)}
                                className="px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-50 transition"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => { setViewTask(null); openEdit(viewTask); }}
                                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
                            >
                                Edit Task
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </MainLayout>
    );
}

export default Tasks;
