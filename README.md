অবশ্যই। নিচেরটা **একদম complete final `README.md`**।  
তুমি শুধু **পুরোটা copy → `README.md`-এ paste → save** করবে। শেষে আমার কোনো extra instruction নেই।

```md
# Factory Traffic Management System

Backend Developer Intern Assessment V2

An event-driven factory traffic management system built with Next.js, TypeScript, MongoDB, and Mongoose.

The system manages traffic signals at a factory junction based on sensor events, vehicle priority, queue size, waiting time, emergency vehicles, manual commands, and physical controller state.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Junction Model](#junction-model)
- [Traffic Queue and Vehicle Priority](#traffic-queue-and-vehicle-priority)
- [Sensor Events](#sensor-events)
- [Automatic Traffic Control](#automatic-traffic-control)
- [Safe Signal Transition](#safe-signal-transition)
- [Emergency Preemption](#emergency-preemption)
- [Manual Control](#manual-control)
- [Desired vs Actual Signal State](#desired-vs-actual-signal-state)
- [Controller Simulation](#controller-simulation)
- [Controller Command Lifecycle](#controller-command-lifecycle)
- [Failure Recovery](#failure-recovery)
- [API Endpoints](#api-endpoints)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Testing and Verification](#testing-and-verification)
- [Assumptions / Questions / Requirement Issues](#assumptions--questions--requirement-issues)
- [Dashboard](#dashboard)
- [Audit History](#audit-history)
- [Error Handling](#error-handling)
- [Database Models](#database-models)
- [AI / Tool Usage](#ai--tool-usage)
- [Future Improvements](#future-improvements)
- [Final Status](#final-status)
- [License](#license)

---

# Overview

The Factory Traffic Management System is an event-driven traffic management application designed to control traffic flow inside a factory environment.

The system supports:

- Automatic traffic scheduling
- Manual traffic control
- Emergency vehicle preemption
- Vehicle priority
- Queue management
- Sensor event processing
- Controller acknowledgement and failure handling
- Desired vs actual signal state tracking
- Controller recovery and reconciliation
- Audit history
- Dashboard monitoring

The system is designed around the principle that clients request traffic-management intents rather than directly forcing arbitrary signal states.

---

# Features

- Automatic traffic signal scheduling
- Manual traffic control
- Emergency vehicle preemption
- Vehicle priority handling
- Vehicle arrival and clearance events
- Duplicate sensor event protection
- Queue management
- Queue negative-value protection
- Desired vs actual signal state separation
- Physical controller simulation through REST APIs
- Controller ACK handling
- Controller failure handling
- Controller reconnect handling
- Controller state reconciliation
- Failure mode
- Automatic recovery
- Audit/history logging
- Pending controller command tracking
- Dashboard for junction monitoring
- Safe phase transition logic

---

# Tech Stack

## Backend

- Next.js 16
- TypeScript
- Next.js App Router
- REST API

## Database

- MongoDB
- Mongoose
- MongoDB Atlas

## Frontend

- Next.js
- React
- Tailwind CSS

## Development

- Node.js
- npm
- Git

---

# Architecture

The application separates API handling from the traffic-management business logic.

```text
                         +----------------------+
                         |   Dashboard / Client  |
                         +----------+-----------+
                                    |
                                    v
                         +----------------------+
                         |    Next.js API Layer |
                         +----------+-----------+
                                    |
                                    v
                         +----------------------+
                         |    Service Layer     |
                         |                      |
                         | Sensor Event Service |
                         | Automatic Service    |
                         | Scheduler Service    |
                         | Emergency Service    |
                         | Manual Service       |
                         | Signal Service       |
                         | Controller Service   |
                         | Audit Service        |
                         +----------+-----------+
                                    |
                       +------------+------------+
                       |                         |
                       v                         v
              +----------------+       +------------------+
              |    MongoDB     |       | Controller       |
              |   Persistence  |       | Simulator / API  |
              +----------------+       +------------------+
```

## API Layer

The API layer is responsible for:

- Request parsing
- Input validation
- Calling service functions
- Returning appropriate HTTP status codes
- Handling API-level errors

The API routes do not contain the main traffic scheduling logic.

## Service Layer

The service layer contains the core application behavior:

- Sensor event processing
- Queue updates
- Automatic scheduling
- Signal transitions
- Emergency handling
- Manual commands
- Controller commands
- Controller recovery
- Audit logging

## Persistence Layer

MongoDB stores:

- Junction configuration
- Traffic queues
- Sensor events
- Controller commands
- Desired signal states
- Actual signal states
- Controller status
- Audit history

---

# Project Structure

```text
src/
├── app/
│   ├── api/
│   │   ├── controller-events/
│   │   │   └── route.ts
│   │   │
│   │   ├── junctions/
│   │   │   ├── route.ts
│   │   │   │
│   │   │   └── [id]/
│   │   │       ├── route.ts
│   │   │       ├── commands/
│   │   │       │   └── route.ts
│   │   │       ├── history/
│   │   │       │   └── route.ts
│   │   │       └── status/
│   │   │           └── route.ts
│   │   │
│   │   └── sensor-events/
│   │       └── route.ts
│   │
│   └── page.tsx
│
├── components/
│   ├── ActivityHistory.tsx
│   ├── DesiredVsActual.tsx
│   ├── ManualControl.tsx
│   ├── PendingCommand.tsx
│   ├── TrafficQueues.tsx
│   └── TrafficSignals.tsx
│
├── lib/
│   └── mongodb.ts
│
├── models/
│   ├── AuditLog.ts
│   ├── ControllerCommand.ts
│   ├── Junction.ts
│   └── SensorEvent.ts
│
└── services/
    ├── auditService.ts
    ├── automaticService.ts
    ├── controllerService.ts
    ├── emergencyService.ts
    ├── manualService.ts
    ├── schedulerService.ts
    ├── sensorEventService.ts
    └── signalService.ts
```

---

# Junction Model

The system currently supports Junction `A`.

Each junction contains:

```text
junctionId
mode
phase
queues
desiredSignals
actualSignals
controllerStatus
```

## Junction Modes

```text
AUTOMATIC
MANUAL
EMERGENCY
DEGRADED
FAILURE
```

## Junction Phases

```text
NORTH_SOUTH
EAST_WEST
```

## Signal States

```text
RED
YELLOW
GREEN
```

## Controller Status

```text
ONLINE
OFFLINE
```

---

# Traffic Queue and Vehicle Priority

Each direction maintains an independent traffic queue.

```text
NORTH
SOUTH
EAST
WEST
```

Queues cannot become negative.

## Vehicle Types

```text
FORKLIFT
TRUCK
EMPLOYEE_VEHICLE
EMERGENCY
```

## Vehicle Priority

The scheduler uses the following priority values:

```text
EMERGENCY        = 100
TRUCK             = 50
FORKLIFT          = 30
EMPLOYEE_VEHICLE  = 10
```

The scheduler considers:

1. Vehicle priority
2. Queue size
3. Waiting time
4. Current phase

Waiting vehicles receive an additional waiting-time score so that lower-priority vehicles are not indefinitely ignored.

---

# Sensor Events

The system supports two sensor event types:

```text
VEHICLE_ARRIVED
VEHICLE_CLEARED
```

Each event contains:

```text
event_id
vehicle_id
junction_id
direction
event_type
vehicle_type
timestamp
```

Example:

```json
{
  "event_id": "event-001",
  "vehicle_id": "vehicle-001",
  "junction_id": "A",
  "direction": "NORTH",
  "event_type": "VEHICLE_ARRIVED",
  "vehicle_type": "TRUCK",
  "timestamp": "2026-10-08T10:00:00.000Z"
}
```

## Duplicate Sensor Events

Every sensor event has a unique `event_id`.

If the same event is received more than once, the system rejects the duplicate instead of changing the traffic queue again.

Example:

```text
First event:
event_id = event-001
Result = Processed

Second event:
event_id = event-001
Result = Rejected as duplicate
```

This prevents the same physical event from increasing or decreasing a queue multiple times.

## Vehicle Clearance

A vehicle cannot be cleared unless an arrival event exists.

Example:

```text
VEHICLE_ARRIVED
       |
       v
Vehicle becomes active
       |
       v
VEHICLE_CLEARED
       |
       v
Vehicle becomes inactive
```

A vehicle cannot be cleared more than once.

If a vehicle has already been cleared, another clearance event is rejected.

---

# Automatic Traffic Control

When a junction is in `AUTOMATIC` mode, the scheduler evaluates the current traffic state.

The scheduler considers:

- Queue size
- Vehicle priority
- Waiting time
- Current phase

The scheduler calculates a score for each traffic phase.

```text
NORTH + SOUTH
      vs
EAST + WEST
```

The phase with the higher score becomes the preferred next phase.

If the current phase is already the best phase, the system avoids an unnecessary transition.

This reduces unnecessary switching and helps prevent starvation.

---

# Safe Signal Transition

Conflicting directions should never intentionally be GREEN at the same time.

The transition policy is:

```text
Current GREEN
      |
      v
   YELLOW
      |
      v
  ALL_RED
      |
      v
 Next GREEN
```

For example:

```text
NORTH/SOUTH GREEN
        |
        v
NORTH/SOUTH YELLOW
        |
        v
ALL RED
        |
        v
EAST/WEST GREEN
```

The signal service is responsible for applying this transition policy.

---

# Emergency Preemption

Emergency vehicles have the highest priority.

When an emergency vehicle arrives:

```text
vehicle_type = EMERGENCY
```

the junction enters:

```text
EMERGENCY
```

mode.

The emergency request does not directly force a conflicting direction to GREEN.

Instead, the system uses the safe transition mechanism.

Example:

```text
NORTH/SOUTH GREEN
        |
        v
     YELLOW
        |
        v
     ALL_RED
        |
        v
EAST/WEST GREEN
```

The emergency command is then sent to the controller.

The actual physical state changes only after the controller acknowledges the command.

## Emergency Mode Policy

Once an emergency is detected, the junction remains in:

```text
EMERGENCY
```

until an explicit:

```text
RETURN_TO_AUTOMATIC
```

command is received.

This prevents normal automatic scheduling from immediately overriding the emergency state.

---

# Manual Control

The system supports two manual commands.

## MANUAL_GREEN_REQUEST

Example:

```json
{
  "command": "MANUAL_GREEN_REQUEST",
  "direction": "NORTH"
}
```

The direction is converted into its corresponding phase.

```text
NORTH -> NORTH_SOUTH
SOUTH -> NORTH_SOUTH
EAST  -> EAST_WEST
WEST  -> EAST_WEST
```

The request still uses the safe signal transition logic.

After the command is accepted, the junction enters:

```text
MANUAL
```

mode.

## RETURN_TO_AUTOMATIC

Example:

```json
{
  "command": "RETURN_TO_AUTOMATIC"
}
```

The junction can return to automatic mode only when:

```text
controllerStatus = ONLINE
```

and:

```text
actualSignals = desiredSignals
```

This prevents automatic control from resuming while the physical controller is still in an unknown or inconsistent state.

---

# Desired vs Actual Signal State

The system intentionally separates:

```text
desiredSignals
```

from:

```text
actualSignals
```

## Desired Signals

`desiredSignals` represent the signal state that the traffic-management system wants the physical controller to execute.

## Actual Signals

`actualSignals` represent the state reported by the physical controller.

Example:

```text
Desired:

NORTH = GREEN
SOUTH = GREEN
EAST  = RED
WEST  = RED
```

while the controller may still report:

```text
Actual:

NORTH = RED
SOUTH = RED
EAST  = GREEN
WEST  = GREEN
```

This difference is important because sending a command to a physical controller does not guarantee that the command has already been executed.

---

# Controller Simulation

A real physical traffic-light controller is not connected in this assessment.

The project uses REST APIs to simulate controller communication.

Every controller command receives a unique:

```text
command_id
```

The controller command lifecycle is persisted in MongoDB.

Supported controller events include:

```text
ACKNOWLEDGED
FAILED
RECONNECTED
```

## Controller ACK

When the physical controller successfully executes a command, it sends:

```text
ACKNOWLEDGED
```

Example:

```json
{
  "command_id": "command-001",
  "status": "ACKNOWLEDGED",
  "actualSignals": {
    "NORTH": "GREEN",
    "SOUTH": "GREEN",
    "EAST": "RED",
    "WEST": "RED"
  }
}
```

The system then:

1. Updates `actualSignals`
2. Sets controller status to `ONLINE`
3. Marks the command as `ACKNOWLEDGED`
4. Stores the acknowledgement time
5. Creates an audit log

## Controller Failure

If the controller fails to execute a command:

```json
{
  "command_id": "command-001",
  "status": "FAILED",
  "errorMessage": "Controller failed to execute command"
}
```

the system sets:

```text
command.status = FAILED
controllerStatus = OFFLINE
mode = FAILURE
```

The actual signal state is not blindly changed.

The last known physical state remains stored.

## Controller Reconnection

When the controller reconnects, it reports its actual physical signal state.

Example:

```json
{
  "junction_id": "A",
  "status": "RECONNECTED",
  "actualSignals": {
    "NORTH": "RED",
    "SOUTH": "RED",
    "EAST": "GREEN",
    "WEST": "GREEN"
  }
}
```

The system compares:

```text
desiredSignals
```

with:

```text
actualSignals
```

---

# State Reconciliation

If the states match:

```text
desired = actual
```

the controller is considered reconciled.

If they do not match:

```text
desired != actual
```

the system creates a new reconciliation command.

Example:

```text
Controller reconnects
        |
        v
Compare desired and actual
        |
        +-------------------+
        |                   |
        v                   v
     MATCH              DIFFERENT
        |                   |
        v                   v
 Reconciled          Create PENDING
                     reconciliation
                       command
```

---

# Controller Command Lifecycle

Controller commands use the following states:

```text
PENDING
ACKNOWLEDGED
FAILED
SUPERSEDED
```

Lifecycle:

```text
             +----------------+
             |     PENDING    |
             +--------+-------+
                      |
             +--------+--------+
             |                 |
             v                 v
      ACKNOWLEDGED          FAILED
```

A pending command may also become:

```text
SUPERSEDED
```

when a newer controller command replaces it.

Only the latest pending command for a junction remains active.

---

# Failure Recovery

The complete recovery flow is:

```text
Controller Command
       |
       v
    FAILED
       |
       v
Mode = FAILURE
Controller = OFFLINE
       |
       v
Controller Reconnects
       |
       v
Compare Desired vs Actual
       |
       v
Create Reconciliation Command
       |
       v
Controller ACK
       |
       v
Actual = Desired
       |
       v
RETURN_TO_AUTOMATIC
       |
       v
Mode = AUTOMATIC
```

This flow ensures that the system does not blindly assume that the physical controller has recovered to the desired state.

---

# API Endpoints

## Get All Junctions

```http
GET /api/junctions
```

Returns the available junctions.

## Create Junction

```http
POST /api/junctions
```

Creates a new junction configuration.

## Get Junction

```http
GET /api/junctions/:id
```

Example:

```http
GET /api/junctions/A
```

Returns the details of a specific junction.

## Get Junction Status

```http
GET /api/junctions/:id/status
```

Example:

```http
GET /api/junctions/A/status
```

Returns:

- Junction ID
- Mode
- Phase
- Queues
- Desired signals
- Actual signals
- Controller status
- Pending controller command

## Sensor Events

```http
POST /api/sensor-events
```

Example:

```json
{
  "event_id": "event-001",
  "vehicle_id": "vehicle-001",
  "junction_id": "A",
  "direction": "NORTH",
  "event_type": "VEHICLE_ARRIVED",
  "vehicle_type": "TRUCK",
  "timestamp": "2026-10-08T10:00:00.000Z"
}
```

## Manual Commands

```http
POST /api/junctions/:id/commands
```

Example:

```json
{
  "command": "MANUAL_GREEN_REQUEST",
  "direction": "NORTH"
}
```

Return to automatic mode:

```json
{
  "command": "RETURN_TO_AUTOMATIC"
}
```

## Controller Events

```http
POST /api/controller-events
```

Supports:

```text
ACKNOWLEDGED
FAILED
RECONNECTED
```

## Junction History

```http
GET /api/junctions/:id/history
```

Example:

```http
GET /api/junctions/A/history
```

Returns the audit history for the junction.

---

# Getting Started

## 1. Clone the Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd factory-traffic-management
```

Replace `<YOUR_GITHUB_REPOSITORY_URL>` with the actual GitHub repository URL.

## 2. Install Dependencies

```bash
npm install
```

## 3. Environment Variables

Create a file named:

```text
.env.local
```

Add:

```env
MONGODB_URI=your_mongodb_connection_string
```

Example:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/factory_traffic
```

Do not commit `.env.local` to GitHub.

## 4. Run the Development Server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

# Environment Variables

The application requires the following environment variable:

```env
MONGODB_URI=your_mongodb_connection_string
```

The MongoDB connection string should point to the MongoDB database used by the application.

---

# Production Build

To verify the production build:

```bash
npm run build
```

The project has been successfully verified using the production build.

The build completes successfully with TypeScript checking enabled.

---

# Testing and Verification

The implementation was manually tested against the main functional scenarios.

## Normal Traffic

```text
Vehicle arrival
       |
       v
Queue increases
```

Result:

```text
PASS
```

## Duplicate Sensor Event

```text
Same event_id submitted twice
```

Result:

```text
First request  -> Processed
Second request -> Rejected
```

Result:

```text
PASS
```

## Vehicle Clearance

```text
Vehicle arrives
      |
      v
Queue +1
      |
      v
Vehicle clears
      |
      v
Queue -1
```

Result:

```text
PASS
```

## Invalid Clearance

A clearance event for a vehicle with no matching arrival event is rejected.

Result:

```text
PASS
```

## Queue Negative Protection

A clearance event cannot reduce a queue below zero.

Result:

```text
PASS
```

## Emergency Preemption

Emergency vehicle detection was tested from different directions.

The system:

- Enters emergency mode
- Selects the correct emergency phase
- Applies safe transition logic
- Creates a controller command
- Waits for controller acknowledgement

Result:

```text
PASS
```

## Manual Control

Manual green requests were tested.

The system:

- Selects the correct phase
- Applies safe transition logic
- Enters MANUAL mode
- Creates a controller command

Result:

```text
PASS
```

## Manual Control Restriction

Manual commands are rejected while the junction is in:

```text
FAILURE
```

or:

```text
EMERGENCY
```

Result:

```text
PASS
```

## Controller ACK

Controller acknowledgement was tested.

The system:

- Updates actual signal state
- Marks command as ACKNOWLEDGED
- Keeps controller ONLINE
- Creates audit history

Result:

```text
PASS
```

## Duplicate Controller ACK

Sending the same terminal ACK again is rejected.

Result:

```text
PASS
```

## Controller Failure

Controller failure was tested.

Expected result:

```text
command = FAILED
controller = OFFLINE
mode = FAILURE
```

Result:

```text
PASS
```

## Controller Reconnect

Controller reconnect was tested with a physical state that differed from the desired state.

The system created a reconciliation command.

Result:

```text
PASS
```

## State Reconciliation

The reconciliation command was acknowledged.

After ACK:

```text
actualSignals = desiredSignals
```

Result:

```text
PASS
```

## Return to Automatic

The junction was returned to automatic mode after:

```text
controllerStatus = ONLINE
```

and:

```text
actualSignals = desiredSignals
```

Result:

```text
PASS
```

## Audit History

The history API was tested successfully.

The test database contained multiple persisted audit records covering:

- Sensor events
- Manual commands
- Emergency events
- Controller ACK
- Controller failure
- Controller reconnect
- Mode changes

Result:

```text
PASS
```

---

# Assumptions / Questions / Requirement Issues

## 1. Signal Transition Timing

The assessment specifies approximately:

```text
GREEN  = 30 seconds
YELLOW = 5 seconds
```

The current implementation does not use blocking `sleep()` calls inside request handlers.

Instead, the transition is represented as a logical safe sequence:

```text
GREEN -> YELLOW -> ALL_RED -> GREEN
```

The desired final state is persisted and a controller command is generated.

A production implementation should use a background scheduler/state machine to persist and execute timed YELLOW and ALL_RED phases.

This avoids blocking HTTP request handlers while still allowing real-time signal timing.

## 2. Timestamp Policy

Sensor event timestamps are persisted in MongoDB.

The scheduler uses the event timestamp when calculating waiting time.

Therefore, the event timestamp is preferred over database insertion time for waiting-time calculations.

## 3. Event Ordering

The current implementation uses event timestamps for scheduling decisions.

The API does not currently require a separate sequence number.

For a distributed production environment, a monotonic sequence number or message-broker ordering mechanism could provide stronger ordering guarantees.

## 4. Duplicate Event Policy

`event_id` is treated as the unique identifier of a sensor event.

The database schema also enforces uniqueness on `event_id`.

Repeated events with the same ID are rejected.

This prevents duplicate events from changing queue state multiple times.

## 5. Vehicle Lifecycle

The implementation assumes one active vehicle lifecycle per `vehicle_id` at a junction.

The lifecycle is:

```text
VEHICLE_ARRIVED
        |
        v
     ACTIVE
        |
        v
VEHICLE_CLEARED
        |
        v
    INACTIVE
```

## 6. Emergency Policy

The current emergency policy keeps the junction in `EMERGENCY` mode until:

```text
RETURN_TO_AUTOMATIC
```

is requested.

Automatic scheduling does not override the emergency state.

An automatic emergency timeout is not currently implemented.

## 7. Manual Policy

Manual commands use the same safe signal transition mechanism as automatic and emergency transitions.

The client cannot directly set arbitrary conflicting signal states.

Manual commands are restricted while the junction is in:

```text
FAILURE
```

or:

```text
EMERGENCY
```

## 8. Controller Simulation

A real physical traffic controller is outside the scope of this implementation.

The project therefore uses REST APIs to simulate:

```text
ACKNOWLEDGED
FAILED
RECONNECTED
```

controller events.

The architecture separates controller communication from the traffic-management logic so that another transport such as MQTT can be introduced later.

## 9. Desired vs Actual State

The system never assumes that sending a command means that the physical controller has executed it.

Therefore:

```text
desiredSignals
```

and:

```text
actualSignals
```

are stored independently.

The controller must report its actual state through controller events.

## 10. Controller Recovery

After a controller failure, the junction enters:

```text
FAILURE
```

mode.

When the controller reconnects, `actualSignals` are compared with `desiredSignals`.

If they differ, a reconciliation command is created.

The junction is allowed to return to automatic operation only after the physical state has been reconciled.

## 11. Concurrency

The implementation is designed with serialized junction processing in mind.

MongoDB uniqueness protects the `event_id` field from duplicate persistence.

For high-scale production deployment, stronger concurrency controls could be introduced, such as:

- MongoDB transactions
- Atomic queue updates
- Distributed locks
- Per-junction event queues
- Message brokers

## 12. MQTT

MQTT was not implemented because the assessment allows REST-based controller simulation.

The core traffic-management logic does not depend directly on MQTT.

Therefore MQTT could be added later as a controller communication adapter.

## 13. Long Blocking Operations

The API request handlers do not use long blocking `sleep()` operations for signal timing.

The current implementation keeps API requests responsive.

A production implementation would move timed signal transitions into a background state-machine/scheduler.

---

# Dashboard

The application includes a dashboard for monitoring Junction A.

The dashboard displays:

- Junction mode
- Current phase
- Traffic queues
- Traffic signals
- Desired signal state
- Actual signal state
- Controller status
- Pending controller command
- Manual controls
- Activity history
- Emergency state
- Failure state

The dashboard periodically polls the backend APIs to refresh the displayed state.

---

# Audit History

Important system actions are persisted as audit records.

Audit event types include:

```text
SENSOR_EVENT
EMERGENCY
MANUAL_COMMAND
MODE_CHANGE
CONTROLLER_ACKNOWLEDGED
CONTROLLER_FAILED
CONTROLLER_RECONNECTED
```

This provides traceability for important traffic-control decisions.

---

# Error Handling

The API returns appropriate HTTP status codes for common error cases.

Examples:

```text
400 Bad Request
404 Not Found
409 Conflict
500 Internal Server Error
```

Examples of handled conflicts include:

- Duplicate sensor event
- Invalid vehicle clearance
- Vehicle already cleared
- Queue already zero
- Controller offline
- Controller state not reconciled
- Invalid manual command
- Duplicate controller acknowledgement
- Manual command during restricted mode

---

# Database Models

The application uses four main MongoDB models.

## Junction

Stores:

- Junction configuration
- Mode
- Current phase
- Traffic queues
- Desired signals
- Actual signals
- Controller status

## SensorEvent

Stores:

- Event ID
- Vehicle ID
- Junction ID
- Direction
- Event type
- Vehicle type
- Event timestamp

## ControllerCommand

Stores:

- Command ID
- Junction ID
- Desired signal state
- Command status
- Acknowledgement time
- Error message

## AuditLog

Stores:

- Junction ID
- Event type
- Message
- Metadata
- Timestamp

---

# AI / Tool Usage

AI tools were used as development assistance during the implementation.

They were used for:

- Understanding the assessment requirements
- Discussing architecture options
- Generating initial code structures
- Reviewing and improving TypeScript code
- Debugging API and TypeScript issues
- Designing test scenarios
- Reviewing edge cases
- Improving documentation

The generated code was reviewed, modified, tested, and debugged during development.

AI was used as a development assistant and not as a replacement for understanding the system behavior.

The final implementation was manually tested against the required functional scenarios.

---

# Future Improvements

The following improvements could be added in a production version.

## Real Controller Integration

Replace the REST controller simulator with a real physical controller integration.

Possible transport:

```text
MQTT
```

## Background Signal State Machine

Implement a background state machine for:

```text
GREEN
  |
  v
YELLOW
  |
  v
ALL_RED
  |
  v
GREEN
```

with configurable durations.

## Real-Time Dashboard

Replace polling with:

```text
WebSocket
```

or:

```text
Server-Sent Events
```

for real-time updates.

## Stronger Concurrency

Introduce:

- MongoDB transactions
- Atomic updates
- Distributed locks
- Event queues

for high-volume sensor traffic.

## Authentication

Add:

- User authentication
- Role-based authorization
- Admin permissions
- Operator permissions

## Automated Tests

Add:

- Unit tests
- Integration tests
- API tests
- End-to-end tests
- Scheduler tests
- Controller recovery tests

## Event Replay

Store and replay historical events for:

- Debugging
- Simulation
- Incident analysis
- Testing new scheduling algorithms

## Metrics

Add monitoring for:

- Average waiting time
- Queue size
- Emergency events
- Controller failures
- Phase changes
- Command latency
- Sensor event rate

## Multiple Junctions

Extend the system to support multiple factory junctions and coordinate traffic between them.

## Configurable Vehicle Priorities

Move vehicle priorities into database configuration instead of hard-coded values.

---

# Final Status

The current implementation has been tested against the major functional scenarios required by the assessment.

Final verified Junction A state:

```text
junctionId       = A
mode             = AUTOMATIC
phase            = NORTH_SOUTH

queues:
NORTH            = 6
SOUTH            = 0
EAST             = 7
WEST             = 0

desiredSignals:
NORTH            = GREEN
SOUTH            = GREEN
EAST             = RED
WEST             = RED

actualSignals:
NORTH            = GREEN
SOUTH            = GREEN
EAST             = RED
WEST             = RED

controllerStatus = ONLINE
pendingCommand   = null
```

The desired and actual controller states are synchronized and the junction is operating in `AUTOMATIC` mode.

---

# License

This project was developed as part of a Backend Developer Intern Assessment.
```