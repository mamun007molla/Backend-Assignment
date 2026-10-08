type Signal = "RED" | "YELLOW" | "GREEN";

type Direction = "NORTH" | "SOUTH" | "EAST" | "WEST";

type DesiredVsActualProps = {
  desiredSignals: Record<Direction, Signal>;
  actualSignals: Record<Direction, Signal>;
};

const directions: Direction[] = ["NORTH", "SOUTH", "EAST", "WEST"];

export default function DesiredVsActual({
  desiredSignals,
  actualSignals,
}: DesiredVsActualProps) {
  const signalsMatch = directions.every(
    (direction) => desiredSignals[direction] === actualSignals[direction],
  );

  return (
    <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-gray-900">Desired vs Actual</h2>

        <p className="mt-1 text-sm text-gray-500">
          Compare requested signal state with physical controller state
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] text-left">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-4 py-3 text-sm font-semibold text-gray-600">
                Direction
              </th>

              <th className="px-4 py-3 text-sm font-semibold text-gray-600">
                Desired
              </th>

              <th className="px-4 py-3 text-sm font-semibold text-gray-600">
                Actual
              </th>

              <th className="px-4 py-3 text-sm font-semibold text-gray-600">
                Status
              </th>
            </tr>
          </thead>

          <tbody>
            {directions.map((direction) => {
              const desired = desiredSignals[direction];

              const actual = actualSignals[direction];

              const matched = desired === actual;

              return (
                <tr
                  key={direction}
                  className="border-b border-gray-100 last:border-0"
                >
                  <td className="px-4 py-4 font-semibold text-gray-900">
                    {direction}
                  </td>

                  <td className="px-4 py-4 font-semibold text-gray-700">
                    {desired}
                  </td>

                  <td className="px-4 py-4 font-semibold text-gray-700">
                    {actual}
                  </td>

                  <td className="px-4 py-4">
                    {matched ? (
                      <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                        MATCH
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-700">
                        PENDING
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Synchronization status */}

      <div
        className={`mt-5 rounded-xl p-4 ${
          signalsMatch ? "bg-green-50" : "bg-yellow-50"
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-full ${
              signalsMatch ? "bg-green-100" : "bg-yellow-100"
            }`}
          >
            {signalsMatch ? "✓" : "!"}
          </div>

          <div>
            <p
              className={`font-bold ${
                signalsMatch ? "text-green-700" : "text-yellow-700"
              }`}
            >
              {signalsMatch
                ? "Controller state is synchronized"
                : "Controller state is not synchronized"}
            </p>

            <p className="text-sm text-gray-600">
              {signalsMatch
                ? "Desired and actual signals match."
                : "Waiting for the physical controller to acknowledge the desired state."}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
