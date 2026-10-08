type Signal = "RED" | "YELLOW" | "GREEN";

type Direction = "NORTH" | "SOUTH" | "EAST" | "WEST";

type PendingCommandData = {
  command_id: string;
  status: string;
  desiredSignals: Record<Direction, Signal>;
  createdAt: string;
};

type PendingCommandProps = {
  command: PendingCommandData | null;
};

export default function PendingCommand({ command }: PendingCommandProps) {
  if (!command) {
    return null;
  }

  return (
    <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Pending Controller Command
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Command waiting for controller acknowledgement
          </p>
        </div>

        <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-700">
          {command.status}
        </span>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {/* Command ID */}

        <div className="rounded-xl bg-gray-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Command ID
          </p>

          <p className="mt-2 break-all text-sm font-semibold text-gray-900">
            {command.command_id}
          </p>
        </div>

        {/* Created At */}

        <div className="rounded-xl bg-gray-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Created At
          </p>

          <p className="mt-2 text-sm font-semibold text-gray-900">
            {new Date(command.createdAt).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Desired Signals */}

      <div className="mt-5">
        <p className="mb-3 text-sm font-semibold text-gray-700">
          Desired Signals
        </p>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {(
            Object.entries(command.desiredSignals) as [Direction, Signal][]
          ).map(([direction, signal]) => (
            <div
              key={direction}
              className="rounded-xl border border-gray-200 p-4"
            >
              <p className="text-sm font-semibold text-gray-700">{direction}</p>

              <p
                className={`mt-2 text-sm font-bold ${
                  signal === "GREEN"
                    ? "text-green-600"
                    : signal === "YELLOW"
                      ? "text-yellow-600"
                      : "text-red-600"
                }`}
              >
                {signal}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
