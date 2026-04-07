"use client";

import { useMemo, useState } from "react";
import ProtectedRoute from "../../../components/ProtectedRoute";
import AdminSidebar from "@/components/sidebar/AdminSidebar";

type QueueRecord = {
  id: string;
  serviceName: string;
  department: string;
  capacity: number;
  activeTokens: number;
  nowServing: string;
  status: "active" | "paused";
};

const seedQueues: QueueRecord[] = [
  {
    id: "Q-ADM-01",
    serviceName: "Admissions Helpdesk",
    department: "Academic Affairs",
    capacity: 60,
    activeTokens: 18,
    nowServing: "A-042",
    status: "active",
  },
  {
    id: "Q-LIB-01",
    serviceName: "Library Card Counter",
    department: "Central Library",
    capacity: 40,
    activeTokens: 9,
    nowServing: "L-117",
    status: "active",
  },
  {
    id: "Q-HST-01",
    serviceName: "Hostel Office",
    department: "Student Housing",
    capacity: 50,
    activeTokens: 0,
    nowServing: "-",
    status: "paused",
  },
  {
    id: "Q-FEE-01",
    serviceName: "Fee Clarification Desk",
    department: "Accounts",
    capacity: 45,
    activeTokens: 13,
    nowServing: "F-021",
    status: "active",
  },
];

export default function AdminQueuesPage() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "paused">("all");

  const filtered = useMemo(() => {
    return seedQueues.filter((queue) => {
      const matchesStatus = statusFilter === "all" ? true : queue.status === statusFilter;
      const q = query.trim().toLowerCase();
      const matchesText =
        q.length === 0 ||
        queue.serviceName.toLowerCase().includes(q) ||
        queue.department.toLowerCase().includes(q) ||
        queue.id.toLowerCase().includes(q);

      return matchesStatus && matchesText;
    });
  }, [query, statusFilter]);

  return (
    <ProtectedRoute roles={["admin"]}>
      <div className="flex min-h-screen bg-slate-50">
        <AdminSidebar />

        <main className="flex-1 lg:ml-64 xl:ml-72">
          <div className="p-4 sm:p-6 lg:p-8 pt-12 space-y-6">
            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">Queue Management</h1>
              <p className="text-slate-600 mt-2">
                Demo data is shown here because queue management routes are not connected yet.
              </p>
            </section>

            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by queue, department, or id"
                  className="md:col-span-2 rounded-lg border border-slate-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "paused")}
                  className="rounded-lg border border-slate-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="all">All statuses</option>
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                </select>
              </div>
            </section>

            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-100 text-slate-700">
                    <tr>
                      <th className="text-left px-4 py-3 font-semibold">Queue</th>
                      <th className="text-left px-4 py-3 font-semibold">Department</th>
                      <th className="text-left px-4 py-3 font-semibold">Capacity</th>
                      <th className="text-left px-4 py-3 font-semibold">Active Tokens</th>
                      <th className="text-left px-4 py-3 font-semibold">Now Serving</th>
                      <th className="text-left px-4 py-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((queue) => (
                      <tr key={queue.id} className="border-t border-slate-200">
                        <td className="px-4 py-3">
                          <p className="font-semibold text-slate-900">{queue.serviceName}</p>
                          <p className="text-xs text-slate-500">{queue.id}</p>
                        </td>
                        <td className="px-4 py-3 text-slate-700">{queue.department}</td>
                        <td className="px-4 py-3 text-slate-700">{queue.capacity}</td>
                        <td className="px-4 py-3 text-slate-700">{queue.activeTokens}</td>
                        <td className="px-4 py-3 text-slate-700">{queue.nowServing}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                              queue.status === "active"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {queue.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr>
                        <td className="px-4 py-8 text-center text-slate-500" colSpan={6}>
                          No queues match your filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
