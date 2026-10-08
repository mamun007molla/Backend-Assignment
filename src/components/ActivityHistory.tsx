"use client";

import { useEffect, useState } from "react";

type HistoryItem = {
  _id: string;
  junction_id: string;
  event_type: string;
  message: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
};

type HistoryResponse = {
  junctionId: string;
  count: number;
  history: HistoryItem[];
};

function getEventStyle(eventType: string) {
  switch (eventType) {
    case "EMERGENCY":
      return "bg-red-100 text-red-700";

    case "CONTROLLER_FAILED":
      return "bg-red-100 text-red-700";

    case "CONTROLLER_ACKNOWLEDGED":
      return "bg-green-100 text-green-700";

    case "MANUAL_COMMAND":
      return "bg-blue-100 text-blue-700";

    case "MODE_CHANGE":
      return "bg-purple-100 text-purple-700";

    case "SENSOR_EVENT":
      return "bg-gray-100 text-gray-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
}

export default function ActivityHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  async function loadHistory() {
    try {
      const response = await fetch("/api/junctions/A/history", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to load history");
      }

      const data: HistoryResponse = await response.json();

      setHistory(data.history);
      setError(null);
    } catch (error) {
      console.error(error);

      setError("Unable to load activity history");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHistory();

    const interval = setInterval(loadHistory, 5000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Activity History</h2>

          <p className="mt-1 text-sm text-gray-500">
            Recent junction events and system activity
          </p>
        </div>

        <button
          onClick={loadHistory}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
        >
          Refresh
        </button>
      </div>

      {loading && (
        <p className="py-6 text-center text-sm text-gray-500">
          Loading activity...
        </p>
      )}

      {error && (
        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {!loading && !error && history.length === 0 && (
        <div className="rounded-xl bg-gray-50 p-6 text-center text-sm text-gray-500">
          No activity found.
        </div>
      )}

      {!loading && !error && history.length > 0 && (
        <div className="space-y-3">
          {history.map((item) => (
            <div
              key={item._id}
              className="rounded-xl border border-gray-100 p-4 transition hover:bg-gray-50"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-3">
                  <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-gray-400" />

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-bold ${getEventStyle(
                          item.event_type,
                        )}`}
                      >
                        {item.event_type}
                      </span>

                      <span className="text-xs text-gray-400">
                        {new Date(item.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <p className="mt-2 text-sm font-semibold text-gray-900">
                      {item.message}
                    </p>
                  </div>
                </div>
              </div>

              {/* Metadata */}

              {item.metadata && Object.keys(item.metadata).length > 0 && (
                <div className="mt-3 rounded-lg bg-gray-50 p-3">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Details
                  </p>

                  <div className="grid gap-2 sm:grid-cols-2">
                    {Object.entries(item.metadata).map(([key, value]) => (
                      <div key={key} className="text-xs">
                        <span className="font-semibold text-gray-600">
                          {key}:{" "}
                        </span>

                        <span className="text-gray-500">
                          {typeof value === "object"
                            ? JSON.stringify(value)
                            : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
