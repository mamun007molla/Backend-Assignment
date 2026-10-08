type Signal = "RED" | "YELLOW" | "GREEN";

type Direction = "NORTH" | "SOUTH" | "EAST" | "WEST";

type TrafficSignalsProps = {
  signals: Record<Direction, Signal>;
};

const directions: Direction[] = ["NORTH", "SOUTH", "EAST", "WEST"];

function getSignalColor(signal: Signal) {
  if (signal === "GREEN") {
    return "bg-green-500";
  }

  if (signal === "YELLOW") {
    return "bg-yellow-400";
  }

  return "bg-red-500";
}

export default function TrafficSignals({ signals }: TrafficSignalsProps) {
  return (
    <section className="mt-8">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900">Traffic Signals</h2>

        <p className="mt-1 text-sm text-gray-500">
          Current physical controller state
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {directions.map((direction) => {
          const signal = signals[direction];

          return (
            <div
              key={direction}
              className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200"
            >
              <p className="font-semibold text-gray-700">{direction}</p>

              <div className="mt-6 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                  <div
                    className={`h-7 w-7 rounded-full shadow-sm ${getSignalColor(
                      signal,
                    )}`}
                  />
                </div>

                <div>
                  <p className="text-lg font-bold text-gray-900">{signal}</p>

                  <p className="text-xs text-gray-500">Actual signal</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
