import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Line, Pie } from "react-chartjs-2";
import "chart.js/auto";
import api from "../api";

// ================= API SERVICE =================
const expensesService = {
  get: () => api.get("/expenses"),
  add: (data) => api.post("/expenses", data),
  update: (id, data) => api.put(`/expenses/${id}`, data),
  delete: (id) => api.delete(`/expenses/${id}`),
};

// ================= INLINE EXPENSE =================
const InlineExpense = React.memo(({ expense, onUpdate, onDelete }) => {
  const [editField, setEditField] = useState(null);
  const [fields, setFields] = useState({
    title: expense.title,
    amount: expense.amount,
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => setFields({ title: expense.title, amount: expense.amount }), [expense]);

  const save = async () => {
    const { title, amount } = fields;
    if (!title || amount === "") return;
    setLoading(true);
    try {
      const res = await expensesService.update(expense._id, {
        title,
        amount: Number(amount),
        date: expense.date, // preserve original date
      });
      onUpdate(res.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 1000);
      setEditField(null);
    } catch {
      alert("Failed to update");
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter") save();
    if (e.key === "Escape") setEditField(null);
  };

  const fieldUI = (field) => {
    const editing = editField === field;
    const common = "border rounded-md p-1 bg-yellow-100 w-32 sm:w-40";
    if (editing)
      return (
        <input
          className={common}
          value={fields[field]}
          onChange={(e) => setFields((f) => ({ ...f, [field]: e.target.value }))}
          onKeyDown={handleKey}
          onBlur={save}
          autoFocus
          disabled={loading}
        />
      );
    return (
      <div
        className={`cursor-pointer ${
          field === "amount"
            ? "text-lg font-semibold hover:text-green-600"
            : "font-medium hover:text-blue-600"
        } ${saved && "animate-pulse text-green-600"}`}
        onClick={() => setEditField(field)}
      >
        {field === "amount" ? `₹${fields.amount}` : fields.title}
      </div>
    );
  };

  return (
    <div className="flex justify-between items-center py-2">
      <div className="flex gap-4 items-center flex-wrap">
        {fieldUI("title")}
        {fieldUI("amount")}
        <div className="text-sm text-gray-500">
          {new Date(expense.date).toLocaleString()}
        </div>
      </div>
      <button
        onClick={() => onDelete(expense._id)}
        className="text-red-600 hover:underline ml-2"
        disabled={loading}
      >
        Delete
      </button>
    </div>
  );
});

// ================= EXPENSE FORM =================
function ExpenseForm({ onAdded }) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const addExpense = async (e) => {
    e.preventDefault();
    if (!title || amount === "" || Number(amount) < 0) return alert("Invalid data");
    setLoading(true);
    try {
      const res = await expensesService.add({
        title,
        amount: Number(amount),
        date: new Date().toISOString(),
      });
      onAdded(res.data);
      setTitle("");
      setAmount("");
    } catch {
      alert("Failed to add expense");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={addExpense} className="flex gap-2 mb-4 flex-wrap">
      <input
        className="flex-1 border rounded-md p-2"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <input
        className="w-28 border rounded-md p-2"
        type="number"
        min="0"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
      />
      <button
        type="submit"
        disabled={loading}
        className={`px-4 rounded-md text-white ${
          loading ? "bg-green-400" : "bg-green-600 hover:bg-green-700"
        }`}
      >
        {loading ? "Adding..." : "Add"}
      </button>
    </form>
  );
}

// ================= DASHBOARD =================
export default function Dashboard() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [deletedExpense, setDeletedExpense] = useState(null);
  const [undoLoading, setUndoLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");
    const fetchData = async () => {
      try {
        const res = await expensesService.get();
        setExpenses(
          res.data.sort((a, b) => new Date(b.date) - new Date(a.date))
        );
      } catch {
        alert("Failed to fetch");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const filtered = useMemo(() => {
    const now = new Date();
    let list = [...expenses];
    if (filter === "week") {
      const weekAgo = new Date();
      weekAgo.setDate(now.getDate() - 7);
      list = list.filter((e) => new Date(e.date) >= weekAgo);
    } else if (filter === "month") {
      const monthAgo = new Date();
      monthAgo.setMonth(now.getMonth() - 1);
      list = list.filter((e) => new Date(e.date) >= monthAgo);
    }
    return list.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [expenses, filter]);

  const total = useMemo(
    () => filtered.reduce((sum, e) => sum + (e.amount || 0), 0),
    [filtered]
  );

  const monthlyTotal = useMemo(() => {
    const now = new Date();
    return expenses
      .filter(
        (e) =>
          new Date(e.date).getMonth() === now.getMonth() &&
          new Date(e.date).getFullYear() === now.getFullYear()
      )
      .reduce((sum, e) => sum + (e.amount || 0), 0);
  }, [expenses]);

  const handleAdd = (exp) =>
    setExpenses((prev) => [exp, ...prev].sort((a, b) => new Date(b.date) - new Date(a.date)));

  const handleUpdate = (updated) =>
    setExpenses((prev) =>
      prev.map((e) => (e._id === updated._id ? updated : e))
    );

  const handleDelete = async (id) => {
    const exp = expenses.find((e) => e._id === id);
    if (!window.confirm("Delete this expense?")) return;
    try {
      await expensesService.delete(id);
      setDeletedExpense(exp);
      setExpenses((prev) => prev.filter((e) => e._id !== id));
      setTimeout(() => setDeletedExpense(null), 5000);
    } catch {
      alert("Failed to delete");
    }
  };

  const handleUndo = async () => {
    if (!deletedExpense) return;
    setUndoLoading(true);
    try {
      const res = await expensesService.add(deletedExpense);
      setExpenses((prev) => [res.data, ...prev]);
      setDeletedExpense(null);
    } catch {
      alert("Failed to undo");
    } finally {
      setUndoLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const pieData = useMemo(() => {
    const top = [...filtered].sort((a, b) => b.amount - a.amount).slice(0, 5);
    const labels = top.map((e) => e.title);
    const data = top.map((e) => e.amount);
    return { labels, datasets: [{ data, backgroundColor: ["#3B82F6", "#10B981", "#F97316", "#A855F7", "#F59E0B"] }] };
  }, [filtered]);

  const lineData = useMemo(() => ({
    labels: filtered.map((e) => new Date(e.date).toLocaleDateString()),
    datasets: [{ label: "Expenses", data: filtered.map((e) => e.amount), borderColor: "#3B82F6", tension: 0.3 }],
  }), [filtered]);

  const chartOptions = { responsive: true, plugins: { legend: { display: false } } };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ===== Title Header ===== */}
      <header className="bg-blue-600 text-white text-center py-5 shadow-md">
        <h1 className="text-3xl font-bold">Expense Tracker</h1>
      </header>

      {/* ===== Dashboard Section ===== */}
      <div className="p-6 flex-grow">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-semibold">Dashboard</h2>
            <p className="text-sm text-gray-500">Track and manage your expenses</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 text-blue-700 px-3 py-2 rounded-md">Total: ₹{total}</div>
            <button onClick={logout} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md">
              Logout
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <h3 className="font-medium mb-2">Quick Filter</h3>
          <div className="flex gap-2">
            {["all", "month", "week"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-md ${
                  filter === f ? "bg-blue-600 text-white" : "bg-gray-200"
                }`}
              >
                {f === "all" ? "All" : f === "month" ? "Last 30d" : "Last 7d"}
              </button>
            ))}
          </div>
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow md:col-span-2">
            <h3 className="font-medium mb-2">Cash Flow</h3>
            <Line data={lineData} options={chartOptions} />
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-medium mb-2">Breakdown</h3>
            <Pie data={pieData} options={chartOptions} />
          </div>
        </div>

        {/* Expenses */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-medium mb-3">Expenses (This Month: ₹{monthlyTotal})</h3>
          <ExpenseForm onAdded={handleAdd} />
          {deletedExpense && (
            <div className="flex justify-between items-center bg-yellow-100 px-4 py-2 rounded-md mb-3">
              <span>Deleted “{deletedExpense.title}”</span>
              <button
                onClick={handleUndo}
                disabled={undoLoading}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md"
              >
                {undoLoading ? "Restoring..." : "Undo"}
              </button>
            </div>
          )}
          {loading ? (
            <p className="text-center text-gray-500">Loading...</p>
          ) : (
            <ul className="divide-y">
              {filtered.map((expense, i) => (
                <li key={expense._id || i}>
                  <InlineExpense
                    expense={expense}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
