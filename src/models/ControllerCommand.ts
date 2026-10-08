import mongoose, { Document, Schema } from "mongoose";

type SignalState = "RED" | "YELLOW" | "GREEN";

type ControllerCommandStatus =
  | "PENDING"
  | "ACKNOWLEDGED"
  | "FAILED"
  | "SUPERSEDED";

type DesiredSignals = {
  NORTH: SignalState;
  SOUTH: SignalState;
  EAST: SignalState;
  WEST: SignalState;
};

export interface IControllerCommand extends Document {
  command_id: string;
  junction_id: string;
  desiredSignals: DesiredSignals;
  status: ControllerCommandStatus;
  createdAt: Date;
  acknowledgedAt?: Date;
  errorMessage?: string;
}

const controllerCommandSchema = new Schema<IControllerCommand>(
  {
    command_id: {
      type: String,
      required: true,
      unique: true,
    },

    junction_id: {
      type: String,
      required: true,
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

    status: {
      type: String,
      enum: ["PENDING", "ACKNOWLEDGED", "FAILED", "SUPERSEDED"],
      default: "PENDING",
    },

    acknowledgedAt: {
      type: Date,
    },

    errorMessage: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

export const ControllerCommand =
  mongoose.models.ControllerCommand ||
  mongoose.model<IControllerCommand>(
    "ControllerCommand",
    controllerCommandSchema,
  );
