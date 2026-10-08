import mongoose, { Document, Schema } from "mongoose";

type JunctionMode =
  | "AUTOMATIC"
  | "MANUAL"
  | "EMERGENCY"
  | "DEGRADED"
  | "FAILURE";

type JunctionPhase = "NORTH_SOUTH" | "EAST_WEST";

type SignalState = "RED" | "YELLOW" | "GREEN";

type ControllerStatus = "ONLINE" | "OFFLINE";

type DirectionQueues = {
  NORTH: number;
  SOUTH: number;
  EAST: number;
  WEST: number;
};

type SignalStates = {
  NORTH: SignalState;
  SOUTH: SignalState;
  EAST: SignalState;
  WEST: SignalState;
};

export interface IJunction extends Document {
  junctionId: string;
  mode: JunctionMode;
  phase: JunctionPhase;
  queues: DirectionQueues;
  desiredSignals: SignalStates;
  actualSignals: SignalStates;
  controllerStatus: ControllerStatus;
}

const junctionSchema = new Schema<IJunction>(
  {
    junctionId: {
      type: String,
      required: true,
      unique: true,
    },

    mode: {
      type: String,
      required: true,
      enum: ["AUTOMATIC", "MANUAL", "EMERGENCY", "DEGRADED", "FAILURE"],
    },

    phase: {
      type: String,
      required: true,
      enum: ["NORTH_SOUTH", "EAST_WEST"],
    },

    queues: {
      NORTH: {
        type: Number,
        default: 0,
        min: 0,
      },

      SOUTH: {
        type: Number,
        default: 0,
        min: 0,
      },

      EAST: {
        type: Number,
        default: 0,
        min: 0,
      },

      WEST: {
        type: Number,
        default: 0,
        min: 0,
      },
    },

    desiredSignals: {
      NORTH: {
        type: String,
        required: true,
        enum: ["RED", "YELLOW", "GREEN"],
      },

      SOUTH: {
        type: String,
        required: true,
        enum: ["RED", "YELLOW", "GREEN"],
      },

      EAST: {
        type: String,
        required: true,
        enum: ["RED", "YELLOW", "GREEN"],
      },

      WEST: {
        type: String,
        required: true,
        enum: ["RED", "YELLOW", "GREEN"],
      },
    },

    actualSignals: {
      NORTH: {
        type: String,
        required: true,
        enum: ["RED", "YELLOW", "GREEN"],
      },

      SOUTH: {
        type: String,
        required: true,
        enum: ["RED", "YELLOW", "GREEN"],
      },

      EAST: {
        type: String,
        required: true,
        enum: ["RED", "YELLOW", "GREEN"],
      },

      WEST: {
        type: String,
        required: true,
        enum: ["RED", "YELLOW", "GREEN"],
      },
    },

    controllerStatus: {
      type: String,
      required: true,
      enum: ["ONLINE", "OFFLINE"],
    },
  },
  {
    timestamps: true,
  },
);

export const Junction =
  mongoose.models.Junction ||
  mongoose.model<IJunction>("Junction", junctionSchema);
