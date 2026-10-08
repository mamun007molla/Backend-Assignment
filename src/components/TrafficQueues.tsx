type Direction = "NORTH" | "SOUTH" | "EAST" | "WEST";

type TrafficQueuesProps = {
  queues: Record<Direction, number>;
};

const directions: Direction[] = ["NORTH", "SOUTH", "EAST", "WEST"];

export default function TrafficQueues({ queues }: TrafficQueuesProps) {
  return (
    <section className="mt-8">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900">Traffic Queues</h2>

        <p className="mt-1 text-sm text-gray-500">
          Current vehicles waiting at each direction
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {directions.map((direction) => (
          <div
            key={direction}
            className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200"
          >
            <div className="flex items-center justify-between">
              <p className="font-semibold text-gray-700">{direction}</p>

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-600">
                {direction[0]}
              </div>
            </div>

            <p className="mt-5 text-4xl font-bold text-gray-900">
              {queues[direction]}
            </p>

            <p className="mt-1 text-sm text-gray-500">vehicles</p>
          </div>
        ))}
      </div>
    </section>
  );
}
