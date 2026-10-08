import mongoose, { Document, Schema } from "mongoose";

type Direction = "NORTH" | "SOUTH" | "EAST" | "WEST";

type SensorEventType = "VEHICLE_ARRIVED" | "VEHICLE_CLEARED";

type VehicleType = "FORKLIFT" | "TRUCK" | "EMPLOYEE_VEHICLE" | "EMERGENCY";

export interface ISensorEvent extends Document {
  event_id: string;
  vehicle_id: string;
  junction_id: string;
  direction: Direction;
  event_type: SensorEventType;
  vehicle_type: VehicleType;
  timestamp: Date;
}

const sensorEventSchema = new Schema<ISensorEvent>(
  {
    event_id: {
      type: String,
      required: true,
      unique: true,
    },

    vehicle_id: {
      type: String,
      required: true,
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
