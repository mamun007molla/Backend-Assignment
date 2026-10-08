import { AuditLog } from "@/models/AuditLog";

export async function createAuditLog(
  junctionId: string,
  eventType: string,
  message: string,
  metadata?: Record<string, unknown>,
) {
  const auditLog = await AuditLog.create({
    junction_id: junctionId,
    event_type: eventType,
    message,
    metadata,
  });

  return auditLog;
}
