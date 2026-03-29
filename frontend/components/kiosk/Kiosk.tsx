"use client";

import { subscribeToQueue } from "@/lib/websocket";
import { useEffect, useMemo, useState } from "react";
import { Skeleton } from "../skeletons/SkeletonBase";

type QueueSnapshot = {
  queue: {
    id: string;
    name: string;
    location: string;
    status: "ACTIVE" | "PAUSED";
    capacity: number;
    isFull: boolean;
  };
  queueId: string;
  tokens: Array<{
    id: string;
    seq: number;
    status: string;
  }>;
};

type Props = {
  queueId: string;
};

export default function Kiosk({ queueId }: Props) {
  const [snapshot, setSnapshot] = useState<QueueSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!queueId) return;

    const unsubscribe = subscribeToQueue(queueId, {
      onUpdate: (payload) => {
        setSnapshot(payload as QueueSnapshot);
        setError(null);
      },
      onError: (err) => {
        setError(err.message || "Socket error");
      },
      onConnect: () => {
        setIsConnected(true);
        setError(null);
      },
      onDisconnect: () => {
        setIsConnected(false);
      },
    });

    return () => {
      unsubscribe();
      setSnapshot(null);
      setIsConnected(false);
    };
  }, [queueId]);

  const waitingTokens = useMemo(() => {
    if (!snapshot) return [];
    return snapshot.tokens
      .filter((t) => t.status === "waiting")
      .sort((a, b) => a.seq - b.seq);
  }, [snapshot]);

  const nowServing = useMemo(() => {
    if (!snapshot) return null;
    const served = snapshot.tokens
      .filter((t) => t.status === "served")
      .sort((a, b) => b.seq - a.seq);
    return served[0] || null;
  }, [snapshot]);

  const isFull =
    snapshot?.queue.isFull ||
    (snapshot?.queue.capacity !== undefined &&
      waitingTokens.length >= snapshot.queue.capacity);

  const waitingCount = waitingTokens.length;
  const capacity = snapshot?.queue.capacity || 0;
  const occupancyPercent =
    capacity > 0 ? Math.min((waitingCount / capacity) * 100, 100) : 0;

  if (!snapshot) {
    return (
      <div className="relative min-h-screen w-full overflow-hidden bg-slate-100 text-slate-900">
        <div className="pointer-events-none absolute -top-24 -left-16 h-72 w-72 rounded-full bg-cyan-300/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-12 h-80 w-80 rounded-full bg-emerald-300/35 blur-3xl" />

        <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1600px] flex-col p-4 md:p-6 xl:p-8">
          <div className="mb-4 rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-lg md:mb-6 md:p-7">
            <div className="space-y-2 text-center">
              <Skeleton className="mx-auto h-9 w-72 bg-slate-200" />
              <Skeleton className="mx-auto h-4 w-48 bg-slate-200" />
            </div>
          </div>

          <div className="grid flex-1 grid-cols-1 gap-4 md:gap-6 xl:grid-cols-12">
            <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-lg md:p-8 xl:col-span-7">
              <div className="space-y-4">
                <Skeleton className="h-6 w-36 bg-slate-200" />
                <Skeleton className="h-24 w-64 bg-slate-200" />
                <Skeleton className="h-4 w-56 bg-slate-200" />
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-lg md:p-8 xl:col-span-5">
              <div className="mb-4 flex items-center justify-between">
                <Skeleton className="h-6 w-36 bg-slate-200" />
                <Skeleton className="h-6 w-16 bg-slate-200" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[...Array(8)].map((_, i) => (
                  <Skeleton
                    key={i}
                    className="h-24 w-full rounded-2xl bg-slate-200"
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-lg md:mt-6 md:p-5">
            <Skeleton className="mb-3 h-4 w-32 bg-slate-200" />
            <Skeleton className="h-3 w-full bg-slate-200" />
          </div>
        </div>
      </div>
    );
  }

  const nextTokens = waitingTokens.slice(0, 8);
  const formatToken = (seq: number) => `T-${String(seq).padStart(3, "0")}`;

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-100 text-slate-900">
      <div className="pointer-events-none absolute -top-24 -left-16 h-72 w-72 rounded-full bg-cyan-300/40 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-24 h-96 w-96 rounded-full bg-blue-200/45 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-1/4 h-80 w-80 rounded-full bg-emerald-300/30 blur-3xl" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1600px] flex-col p-4 md:p-6 xl:p-8">
        <header className="mb-4 rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-lg backdrop-blur md:mb-6 md:p-7">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:items-center">
            <div className="text-center lg:text-left">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Qnect Kiosk
              </p>
              <h1 className="mt-1 text-2xl font-extrabold leading-tight text-slate-900 md:text-4xl">
                {snapshot.queue.name}
              </h1>
              <p className="mt-1 text-sm text-slate-600 md:text-base">
                {snapshot.queue.location}
              </p>
            </div>

            <div className="flex items-center justify-center gap-3">
              <span
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
                  snapshot.queue.status === "ACTIVE"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    snapshot.queue.status === "ACTIVE"
                      ? "bg-emerald-500"
                      : "bg-amber-500"
                  }`}
                />
                {snapshot.queue.status === "ACTIVE"
                  ? "Queue Open"
                  : "Queue Paused"}
              </span>
            </div>

            <div className="text-center lg:text-right">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Live Clock
              </p>
              <p className="mt-1 text-2xl font-extrabold text-slate-900 md:text-4xl">
                {now.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </p>
              <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-slate-900/90 px-3 py-1 text-xs font-medium text-white">
                <span
                  className={`h-2 w-2 rounded-full ${
                    isConnected ? "bg-emerald-400 animate-pulse" : "bg-red-400"
                  }`}
                />
                {isConnected
                  ? "Live updates connected"
                  : "Disconnected from live updates"}
              </div>
            </div>
          </div>
        </header>

        <main className="grid flex-1 grid-cols-1 gap-4 md:gap-6 xl:grid-cols-12">
          <section className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-lg md:p-8 xl:col-span-7">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Now Serving
            </p>

            <div className="rounded-3xl border border-sky-200 bg-gradient-to-br from-sky-50 to-cyan-100 p-6 md:p-8">
              <div className="text-center">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-600">
                  Current Token
                </p>
                <div className="mt-4 text-6xl font-black leading-none text-slate-900 drop-shadow-sm md:text-8xl xl:text-9xl">
                  {nowServing ? formatToken(nowServing.seq) : "--"}
                </div>
                <p className="mt-4 text-base font-medium text-slate-700 md:text-lg">
                  {nowServing
                    ? "Please proceed to the counter"
                    : "No active token right now"}
                </p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 md:mt-6 md:gap-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Waiting
                </p>
                <p className="mt-2 text-3xl font-black text-slate-900 md:text-4xl">
                  {waitingCount}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Capacity
                </p>
                <p className="mt-2 text-3xl font-black text-slate-900 md:text-4xl">
                  {capacity || "--"}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-lg md:p-8 xl:col-span-5">
            <div className="mb-4 flex items-center justify-between md:mb-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Upcoming Tokens
              </p>
              <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                {nextTokens.length}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 md:gap-4">
              {nextTokens.length === 0 ? (
                <div className="col-span-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm font-medium text-slate-500">
                  No one in line right now
                </div>
              ) : (
                nextTokens.map((token, index) => (
                  <div
                    key={token.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-500 hover:-translate-y-0.5 hover:shadow-md"
                    style={{ transitionDelay: `${index * 45}ms` }}
                  >
                    <div className="text-2xl font-black text-slate-900 md:text-3xl">
                      {formatToken(token.seq)}
                    </div>
                    <div className="mt-1 text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
                      #{index + 1} in queue
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </main>

        <footer className="mt-4 rounded-3xl border border-slate-200 bg-white/95 p-4 shadow-lg md:mt-6 md:p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Queue Occupancy
            </p>
            <p className="text-sm font-semibold text-slate-700">
              {waitingCount} / {capacity || "--"} waiting
            </p>
          </div>

          <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                isFull ? "bg-rose-500" : "bg-emerald-500"
              }`}
              style={{ width: `${occupancyPercent}%` }}
            />
          </div>

          {isFull && (
            <div className="mt-3 rounded-2xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
              Queue is currently full. Please wait for a slot to open.
            </div>
          )}

          {error && (
            <div className="mt-3 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
              {error}
            </div>
          )}
        </footer>
      </div>
    </div>
  );
}
