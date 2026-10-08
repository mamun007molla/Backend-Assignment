import mongoose, { Document, Schema } from "mongoose";

type AuditEventType =
  | "SENSOR_EVENT"
  | "EMERGENCY"
  | "MANUAL_COMMAND"
  | "MODE_CHANGE"
  | "CONTROLLER_ACKNOWLEDGED"
  | "CONTROLLER_FAILED"
  | "CONTROLLER_RECONNECTED";

export interface IAuditLog extends Document {
  junction_id: string;
  event_type: AuditEventType;
  message: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    junction_id: {
      type: String,
      required: true,
    },

    event_type: {
      type: String,
      required: true,
      enum: [
        "SENSOR_EVENT",
        "EMERGENCY",
        "MANUAL_COMMAND",
        "MODE_CHANGE",
        "CONTROLLER_ACKNOWLEDGED",
        "CONTROLLER_FAILED",
        "CONTROLLER_RECONNECTED",
      ],
    },

    message: {
      type: String,
      required: true,
    },

    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  },
);

export const AuditLog =
  mongoose.models.AuditLog ||
  mongoose.model<IAuditLog>("AuditLog", auditLogSchema);
