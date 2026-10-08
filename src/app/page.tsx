"use client";

import { useEffect, useState } from "react";

import ActivityHistory from "@/components/ActivityHistory";
import TrafficQueues from "@/components/TrafficQueues";
import TrafficSignals from "@/components/TrafficSignals";
import ManualControl from "@/components/ManualControl";
import DesiredVsActual from "@/components/DesiredVsActual";
import PendingCommand from "@/components/PendingCommand";

type Signal = "RED" | "YELLOW" | "GREEN";

type Direction = "NORTH" | "SOUTH" | "EAST" | "WEST";

type JunctionStatus = {
  junctionId: string;

  mode: string;

  phase: string;

  queues: Record<Direction, number>;

  desiredSignals: Record<Direction, Signal>;

  actualSignals: Record<Direction, Signal>;

  controllerStatus: string;

  pendingCommand: {
    command_id: string;

    status: string;

    desiredSignals: Record<Direction, Signal>;

    createdAt: string;
  } | null;
};

function getModeColor(mode: string) {
  if (mode === "AUTOMATIC") {
    return "bg-green-100 text-green-700";
  }

  if (mode === "EMERGENCY") {
    return "bg-red-100 text-red-700";
  }

  if (mode === "FAILURE") {
    return "bg-red-100 text-red-700";
  }

  if (mode === "MANUAL") {
    return "bg-blue-100 text-blue-700";
  }

  return "bg-gray-100 text-gray-700";
}

export default function Home() {
  const [status, setStatus] = useState<JunctionStatus | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  async function loadStatus() {
    try {
      const response = await fetch("/api/junctions/A/status", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to load junction status");
      }

      const data = await response.json();

      setStatus(data);
      setError(null);
    } catch (error) {
      console.error(error);

      setError("Unable to load junction status");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStatus();

    const interval = setInterval(loadStatus, 3000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  /*
   * Loading State
   */

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 p-6 text-gray-900 md:p-10">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
            <p className="text-lg font-medium text-gray-700">
              Loading junction status...
            </p>
          </div>
        </div>
      </main>
    );
  }

  /*
   * Error State
   */

  if (error || !status) {
    return (
      <main className="min-h-screen bg-gray-100 p-6 text-gray-900 md:p-10">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <h1 className="text-xl font-bold text-red-700">
              Factory Traffic Management System
            </h1>

            <p className="mt-2 text-red-600">
              {error ?? "Failed to load junction status."}
            </p>

            <button
              onClick={loadStatus}
              className="mt-4 rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-700"
            >
              Retry
            </button>
          </div>
        </div>
      </main>
    );
  }

  /*
   * Desired vs Actual Synchronization
   */

  const signalsMatch = Object.keys(status.desiredSignals).every((direction) => {
    const key = direction as Direction;

    return status.desiredSignals[key] === status.actualSignals[key];
  });

  return (
    <main className="min-h-screen bg-gray-100 p-6 text-gray-900 md:p-10">
      <div className="mx-auto max-w-7xl">
        {/* =========================
            HEADER
        ========================== */}

        <header className="mb-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                Factory Traffic Management System
              </h1>

              <p className="mt-2 text-gray-600">
                Junction {status.junctionId} Dashboard
              </p>
            </div>

            {/* Controller Status */}

            <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm ring-1 ring-gray-200">
              <span
                className={`h-3 w-3 rounded-full ${
                  status.controllerStatus === "ONLINE"
                    ? "bg-green-500"
                    : "bg-red-500"
                }`}
              />

              <span className="text-sm font-semibold text-gray-700">
                Controller {status.controllerStatus}
              </span>
            </div>
          </div>
        </header>

        {/* =========================
            ALERTS
        ========================== */}

        {status.mode === "EMERGENCY" && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-xl">
                ⚠️
              </div>

              <div>
                <p className="font-bold text-red-700">Emergency Mode Active</p>

                <p className="text-sm text-red-600">
                  Emergency traffic preemption is currently active.
                </p>
              </div>
            </div>
          </div>
        )}

        {status.mode === "FAILURE" && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-xl">
                ❌
              </div>

              <div>
                <p className="font-bold text-red-700">Junction Failure Mode</p>

                <p className="text-sm text-red-600">
                  Controller recovery is required.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* =========================
            OVERVIEW
        ========================== */}

        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Mode */}

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
            <p className="text-sm font-medium text-gray-500">Mode</p>

            <div className="mt-4">
              <span
                className={`inline-flex rounded-full px-3 py-1.5 text-sm font-bold ${getModeColor(
                  status.mode,
                )}`}
              >
                {status.mode}
              </span>
            </div>
          </div>

          {/* Phase */}

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
            <p className="text-sm font-medium text-gray-500">Current Phase</p>

            <p className="mt-4 text-xl font-bold text-gray-900">
              {status.phase.replace("_", " / ")}
            </p>
          </div>

          {/* Controller */}

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
            <p className="text-sm font-medium text-gray-500">
              Controller Status
            </p>

            <div className="mt-4 flex items-center gap-2">
              <span
                className={`h-3 w-3 rounded-full ${
                  status.controllerStatus === "ONLINE"
                    ? "bg-green-500"
                    : "bg-red-500"
                }`}
              />

              <span
                className={`text-xl font-bold ${
                  status.controllerStatus === "ONLINE"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {status.controllerStatus}
              </span>
            </div>
          </div>

          {/* Pending Command */}

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
            <p className="text-sm font-medium text-gray-500">Pending Command</p>

            <p className="mt-4 text-xl font-bold text-gray-900">
              {status.pendingCommand ? "YES" : "NO"}
            </p>

            {status.pendingCommand && (
              <p className="mt-1 truncate text-xs text-gray-500">
                {status.pendingCommand.command_id}
              </p>
            )}
          </div>
        </section>

        {/* =========================
            TRAFFIC QUEUES
        ========================== */}

        <TrafficQueues queues={status.queues} />

        {/* =========================
            TRAFFIC SIGNALS
        ========================== */}

        <TrafficSignals signals={status.actualSignals} />

        {/* =========================
            DESIRED VS ACTUAL
        ========================== */}

        <DesiredVsActual
          desiredSignals={status.desiredSignals}
          actualSignals={status.actualSignals}
        />

        {/* =========================
            PENDING COMMAND
        ========================== */}

        <PendingCommand command={status.pendingCommand} />

        {/* =========================
            MANUAL CONTROL
        ========================== */}

        <ManualControl mode={status.mode} onStatusChange={loadStatus} />

        {/* =========================
            ACTIVITY HISTORY
        ========================== */}

        <ActivityHistory />

        {/* =========================
            FOOTER
        ========================== */}

        <footer className="mt-10 border-t border-gray-200 pt-5 text-center text-sm text-gray-500">
          Automatic refresh every 3 seconds
        </footer>
      </div>
    </main>
  );
}
