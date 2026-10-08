import mongoose, { Schema, Document } from "mongoose";

export interface ISensorEvent extends Document {
  event_id: string;
  junction_id: string;
  direction: string;
  event_type: string;
  vehicle_type: string;
  timestamp: Date;
}
const sensorEventSchema = new Schema<ISensorEvent>(
  {
    event_id: {
      type: String,
      required: true,
      unique: true,
    },

    junction_id: {
      type: String,
      required: true,
    },

    direction: {
      type: String,
      required: true,
      enum: ["NORTH", "SOUTH", "EAST", "WEST"],
    },

    event_type: {
      type: String,
      required: true,
      enum: ["VEHICLE_ARRIVED", "VEHICLE_CLEARED"],
    },

    vehicle_type: {
      type: String,
      required: true,
      enum: ["FORKLIFT", "TRUCK", "EMPLOYEE_VEHICLE", "EMERGENCY"],
    },

    timestamp: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export const SensorEvent =
  mongoose.models.SensorEvent ||
  mongoose.model<ISensorEvent>("SensorEvent", sensorEventSchema);