import mongoose, { Schema, Document } from "mongoose";

export interface IJunction extends Document {
  junctionId: string;
  mode: string;
  phase: string;

  queues: {
    NORTH: number;
    SOUTH: number;
    EAST: number;
    WEST: number;
  };

  desiredSignals: {
    NORTH: string;
    SOUTH: string;
    EAST: string;
    WEST: string;
  };

  actualSignals: {
    NORTH: string;
    SOUTH: string;
    EAST: string;
    WEST: string;
  };

  controllerStatus: string;
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
    },

    phase: {
      type: String,
      required: true,
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

    actualSignals: {
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

    controllerStatus: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export const Junction =
  mongoose.models.Junction ||
  mongoose.model<IJunction>("Junction", junctionSchema);
