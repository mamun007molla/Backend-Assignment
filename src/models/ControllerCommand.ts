import mongoose, { Schema, Document } from "mongoose";

export interface IControllerCommand extends Document {
  command_id: string;
  junction_id: string;

  desiredSignals: {
    NORTH: string;
    SOUTH: string;
    EAST: string;
    WEST: string;
  };

  status: "PENDING" | "ACKNOWLEDGED" | "FAILED";

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
      },
      SOUTH: {
        type: String,
        required: true,
      },
      EAST: {
        type: String,
        required: true,
      },
      WEST: {
        type: String,
        required: true,
      },
    },

    status: {
      type: String,
      enum: ["PENDING", "ACKNOWLEDGED", "FAILED"],
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
