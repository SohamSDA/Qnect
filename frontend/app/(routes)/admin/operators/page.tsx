"use client";

import { useMemo, useState } from "react";
import ProtectedRoute from "../../../components/ProtectedRoute";
import AdminSidebar from "@/components/sidebar/AdminSidebar";

type OperatorRecord = {
  id: string;
  name: string;
  email: string;
  department: string;
  assignedQueue: string;
  shift: string;
  status: "online" | "offline" | "on-break";
};

const seedOperators: OperatorRecord[] = [
  {
    id: "OP-101",
    name: "Riya Menon",
    email: "riya.menon@campus.edu",
    department: "Academic Affairs",
    assignedQueue: "Admissions Helpdesk",
    shift: "09:00 - 13:00",
    status: "online",
  },
  {
    id: "OP-102",
    name: "Aman Gupta",
    email: "aman.gupta@campus.edu",
    department: "Central Library",
    assignedQueue: "Library Card Counter",
    shift: "10:00 - 14:00",
    status: "online",
  },
  {
    id: "OP-103",
    name: "Neha Singh",
    email: "neha.singh@campus.edu",
    department: "Student Housing",
    assignedQueue: "Hostel Office",
    shift: "09:00 - 17:00",
    status: "on-break",
  },
  {
    id: "OP-104",
    name: "Karan Shah",
    email: "karan.shah@campus.edu",
    department: "Accounts",
    assignedQueue: "Fee Clarification Desk",
    shift: "12:00 - 18:00",
    status: "offline",
  },
];

export default function AdminOperatorsPage() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return seedOperators;

    return seedOperators.filter((operator) =>
      [
        operator.name,
        operator.email,
        operator.department,
        operator.assignedQueue,
        operator.id,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [query]);

  return (
    <ProtectedRoute roles={["admin"]}>
      <div className="flex min-h-screen bg-slate-50">
        <AdminSidebar />

        <main className="flex-1 lg:ml-64 xl:ml-72">
          <div className="p-4 sm:p-6 lg:p-8 pt-12 space-y-6">
            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">Operators</h1>
              <p className="text-slate-600 mt-2">
                This page currently uses demo operator records until backend operator-admin endpoints are connected.
              </p>
            </section>

            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search operators by name, email, department, or queue"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </section>

            <section className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
              {filtered.map((operator) => (
                <article key={operator.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold text-slate-900">{operator.name}</p>
                      <p className="text-sm text-slate-600">{operator.email}</p>
                      <p className="text-xs text-slate-500 mt-1">{operator.id}</p>
                    </div>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        operator.status === "online"
                          ? "bg-emerald-100 text-emerald-700"
                          : operator.status === "on-break"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {operator.status}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2 text-sm text-slate-700">
                    <p>
                      <span className="font-medium text-slate-900">Department:</span> {operator.department}
                    </p>
                    <p>
                      <span className="font-medium text-slate-900">Assigned Queue:</span> {operator.assignedQueue}
                    </p>
                    <p>
                      <span className="font-medium text-slate-900">Shift:</span> {operator.shift}
                    </p>
                  </div>
                </article>
              ))}

              {filtered.length === 0 && (
                <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-10 text-center text-slate-500">
                  No operators match your search.
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
