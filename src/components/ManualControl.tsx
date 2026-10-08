"use client";

type Direction = "NORTH" | "SOUTH" | "EAST" | "WEST";

type ManualControlProps = {
  mode: string;
  onStatusChange: () => void;
};

const directions: Direction[] = ["NORTH", "SOUTH", "EAST", "WEST"];

export default function ManualControl({
  mode,
  onStatusChange,
}: ManualControlProps) {
  async function requestGreen(direction: Direction) {
    try {
      const response = await fetch("/api/junctions/A/commands", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          command: "MANUAL_GREEN_REQUEST",
          direction,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Manual command failed");
        return;
      }

      onStatusChange();
    } catch (error) {
      console.error(error);

      alert("Failed to send manual command");
    }
  }

  async function returnToAutomatic() {
    try {
      const response = await fetch("/api/junctions/A/commands", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          command: "RETURN_TO_AUTOMATIC",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Unable to return to automatic mode");
        return;
      }

      onStatusChange();
    } catch (error) {
      console.error(error);

      alert("Failed to return to automatic mode");
    }
  }

  return (
    <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
      {/* Header */}

      <div className="mb-5">
        <h2 className="text-xl font-bold text-gray-900">Manual Control</h2>

        <p className="mt-1 text-sm text-gray-500">
          Request a safe manual green phase for a direction.
        </p>
      </div>

      {/* Direction Buttons */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {directions.map((direction) => (
          <button
            key={direction}
            onClick={() => requestGreen(direction)}
            disabled={mode === "FAILURE"}
            className="rounded-xl border border-gray-200 bg-gray-50 px-5 py-4 text-left transition hover:border-blue-400 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="block text-sm font-medium text-gray-500">
              Request Green
            </span>

            <span className="mt-1 block text-lg font-bold text-gray-900">
              {direction}
            </span>
          </button>
        ))}
      </div>

      {/* Return Automatic */}

      <div className="mt-5 flex items-center gap-4">
        <button
          onClick={returnToAutomatic}
          className="rounded-xl bg-gray-900 px-5 py-3 font-semibold text-white transition hover:bg-gray-700"
        >
          Return to Automatic
        </button>

        <span className="text-sm text-gray-500">
          Current mode:{" "}
          <span className="font-semibold text-gray-900">{mode}</span>
        </span>
      </div>
    </section>
  );
}
