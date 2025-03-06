<div align="center">

# Technical Specifications

---

**Title:** Web FPGA - Technical Specifications  
**Team:** Team 7  
**Author:** Abderrazaq MAKRAN  
**Version:** 0.1

---

</div>

<details>
<summary><h2 id="toc">Table of Contents <i>(Click to expand)</i></h2></summary>

<!-- Write the Table of Contents here -->
- [Technical Specifications](#technical-specifications)
  - [1. Introduction](#1-introduction)
  - [2. Glossary](#2-glossary)
  - [3. Project Scope \& Objectives](#3-project-scope--objectives)
    - [Primary Focus](#primary-focus)
    - [Secondary Focus](#secondary-focus)
    - [Out of Scope](#out-of-scope)
  - [4. System Architecture](#4-system-architecture)
    - [4.1. Frontend (Student \& Teacher UI)](#41-frontend-student--teacher-ui)
    - [4.2. Backend (FastAPI)](#42-backend-fastapi)
    - [4.3. Data Model](#43-data-model)
      - [4.3.1. FPGA Visualization JSON](#431-fpga-visualization-json)
      - [4.3.2. Rooms \& Session Management](#432-rooms--session-management)
    - [4.4. Real-Time Communication (WebSockets)](#44-real-time-communication-websockets)
  - [5. Functional Requirements](#5-functional-requirements)
    - [5.1. Student Interface](#51-student-interface)
    - [5.2. Teacher Interface](#52-teacher-interface)
    - [5.3. Rooms Feature (Teacher-Student Collaboration)](#53-rooms-feature-teacher-student-collaboration)
    - [5.4. Simulation Engine](#54-simulation-engine)
  - [6. Error Handling and Logging](#6-error-handling-and-logging)
    - [6.1. Frontend Error Handling](#61-frontend-error-handling)
    - [6.2. Backend Error Handling](#62-backend-error-handling)
  - [7. Wireframes \& User Flows](#7-wireframes--user-flows)
    - [7.1. Landing Page](#71-landing-page)
    - [7.2. Room Creation (Teacher)](#72-room-creation-teacher)
    - [7.3. Room Join (Student)](#73-room-join-student)
    - [7.4. Homepage - Teacher](#74-homepage---teacher)
    - [7.5. Homepage - Student](#75-homepage---student)
  - [8. Project Roadmap \& Timeline](#8-project-roadmap--timeline)
  - [9. Deployment Strategy](#9-deployment-strategy)
  - [10. Testing \& Validation](#10-testing--validation)
  - [11. Conclusion](#11-conclusion)


</details>

---

## 1. Introduction

This document specifies the design and development of a **web-based FPGA signal propagation simulator**. The simulator enables students and teachers to interact with an FPGA layout and observe real-time signal behavior. Additionally, a **Rooms** feature facilitates collaborative learning sessions by allowing teachers to create virtual rooms and students to join using a unique code with optional password protection and by providing their name.

---

## 2. Glossary

- **FPGA (Field-Programmable Gate Array):** A reconfigurable integrated circuit consisting of configurable logic blocks and routing.
- **Basic Element (BEL):** A fundamental hardware unit within an FPGA (e.g., LUT, flip-flop, Block RAM).
- **Application:** Verilog code that describes a function or algorithm for the FPGA.
- **Synthesis:** The process of translating Verilog code into an electrical netlist.
- **P&R (Place and Route):** The mapping of netlist components onto FPGA BELs and the determination of routing paths for signals.
- **Simulator:** A tool (e.g., ModelSim) that compiles Verilog testbenches and applications, showing time-evolving signal behavior.
- **Software (This Project):** The web application that visualizes the FPGA floorplan and simulates signal propagation in real time.
- **Rooms:** A collaborative session mechanism where teachers and students share the same simulation environment.

---

## 3. Project Scope & Objectives

### Primary Focus
- **Web Application Development** (Frontend & Backend)
- **FPGA Visualization** (using pre-provided Verilog netlists and SDF files)

### Secondary Focus
- **Real-Time Collaboration** via Rooms
- **Integration of FPGA Concepts & Timing Information** for educational purposes

### Out of Scope
- Running the entire FPGA toolchain (synthesis, place & route, etc.) in the browser.  
  *Instead, the teacher or project maintainers provide the required Verilog netlist and SDF files.*

---

## 4. System Architecture

The system is divided into a **Frontend** (React + Vite) for user interaction and a **Backend** (FastAPI) for file processing, session management, and real-time updates via WebSockets.

### 4.1. Frontend (Student & Teacher UI)

- **Frameworks:**  
    - **Vite + React** for fast, lightweight development.  
    - ( **D3.js** or **Chart.js** for 2D visualization of the FPGA floorplan and signals.) ~~~~~ 
    - **Socket.io** for real-time synchronization with the backend.

- **Key Components:**  
    1. **Landing Page:** Role selection (Teacher or Student).  
    2. **Room Creation (Teacher):** Form to create a new room and generate a unique room code, including fields for Room Name and an optional Password.  
    3. **Room Join (Student):** Form to join an existing room using the provided code, including fields for Room ID/Code, an optional Password, and "Your Name".  
    4. **Dashboard (Teacher & Student):** Main interface displaying the FPGA layout, code panels, and simulation controls. The dashboard features a split layout with a code panel on the left (editable for teachers, read-only for students) and the FPGA schematic/simulation on the right.

### 4.2. Backend (FastAPI)

- **Endpoints:**  
    - **POST /rooms:** Creates a new room with a unique code and optional password.  
    - **GET /rooms/{roomCode}:** Validates a room code and returns room details.  
    - **POST /files/upload:** (Phase 2+) Allows teachers to upload Verilog and SDF files.  
    - **GET /simulation-data/{roomCode}:** Retrieves processed JSON data for FPGA visualization.

- **Session & State Management:**  
    - Stores active rooms, participants, and simulation states.
    - Handles real-time updates over WebSockets (e.g., start/stop simulation, highlighting signals, etc.).

### 4.3. Data Model

#### 4.3.1. FPGA Visualization JSON

A unified JSON format for describing the FPGA’s BELs, their connections, and timing delays derived from the netlist (Verilog) and SDF files. For example:
```json
{
    "elements": [
        {
            "id": 0,
            "name": "LUT4",
            "type": "logic_gate",
            "innerText": "AND",
            "icon": "path-to-img",
            "clicked": false,
            "inputs": [
                { "connectionId": 1, "name": "A" },
                { "connectionId": 2, "name": "B" }
            ],
            "outputs": [
                { "connectionId": 3, "name": "OUT" }
            ]
        }
    ],
    "connections": [
        {
            "id": 1,
            "from": "input_id_A",
            "fromLabel": "A",
            "to": "output_id_BEL1",
            "toLabel": "Input_B",
            "color": "blue",
            "time": 2
        }
    ]
}
```

**Key Fields:**  
- **`elements`**: Array of FPGA BELs, each with an ID, type, inputs, outputs, etc.  
- **`connections`**: Array of signal connections between BELs, including timing data.

#### 4.3.2. Rooms & Session Management

To support multi-user collaboration, each **Room** is represented as follows:

```json
{
  "roomId": "string (UUID or short code)",
  "roomName": "string",
  "teacherId": "string",
  "participants": [
    {
      "userId": "string",
      "role": "teacher" or "student"
    }
    // ...
  ],
  "simulationState": {
    "status": "running | paused | stopped",
    "speed": 1,
    "timeIndex": 0
    // ...
  }
}
```

- **roomId / roomName:** Unique code and human-readable name for the room.  
- **participants:** List of active users (teacher and students).  
- **simulationState:** Current simulation status, speed, and time index for synchronization.

### 4.4. Real-Time Communication (WebSockets)

- **Channel per Room:** Each room has its own Socket.io namespace or channel for updates.  
- **Message Types:**  
  - **SIMULATION_UPDATE:** Broadcasts changes in signal values, time index, or highlight states.  
  - **CODE_CHANGE (teacher only):** For real-time updates if the teacher modifies the code.  
  - **FOCUS_ELEMENT:** Teacher highlights a specific FPGA element or connection.

---

## 5. Functional Requirements

### 5.1. Student Interface

1. **Room Join:**  
   - Students enter a valid room code to access the shared simulation.  
   - The join form includes fields for Room ID/Code, an optional Password, and "Your Name".  
2. **FPGA Visualization:**  
   - Display the BELs and signal routes as defined by the teacher’s loaded design.  
3. **Simulation Playback (Read-Only):**  
   - Observe the teacher’s simulation control (play, pause, step, speed).  
4. **Code Panel (Read-Only):**  
   - View the Verilog/SDF code if the teacher chooses to share it.

### 5.2. Teacher Interface

1. **Room Creation & Management:**  
   - Create a room, generating a unique code with an optional password.  
   - Manage participants by viewing who has joined the room.  
2. **File Upload & Processing (Phase 2+):**  
   - Upload Verilog netlist and SDF file.  
   - The backend parses these files into JSON for FPGA visualization.  
3. **Simulation Controls:**  
   - Provide controls for Play, Pause, Resume, Step, and Speed adjustment.  
   - Broadcast real-time updates, including code changes and focus highlights, to students.  
4. **Code Panel (Editable):**  
   - Display the Verilog/SDF code or JSON data in an editable panel for the teacher.

### 5.3. Rooms Feature (Teacher-Student Collaboration)

- **Synchronized State:**  
  - All participants in a room share the same simulation state and view.  
- **Real-Time Broadcast:**  
  - Any teacher action (e.g., highlight, speed change) is immediately reflected in every student’s view.  
- **Session Lifecycle:**  
  - Create Room → Join Room → Run Simulation → End Session  
- **Optional Enhancements:**  
  - Chat/Q&A: Simple text-based communication can be added.  
  - Co-Teacher Role: The teacher can grant temporary control to a student.

### 5.4. Simulation Engine

- **Data Input:**  
  - Uses the JSON generated from the provided Verilog/SDF files without running the full synthesis/P&R toolchain.  
- **Animation & Timing:**  
  - Animates signals based on delays specified in the SDF.  
- **Controls:**  
  - **Play:** Start simulation time progression.  
  - **Pause:** Halt simulation time progression.  
  - **Step:** Advance by a single time unit or cycle.  
  - **Speed:** Adjust simulation speed (e.g., x1, x2, x4).

---

## 6. Error Handling and Logging

### 6.1. Frontend Error Handling

- **User Input Validation:**  
  - Validate room codes, file uploads, and form inputs with immediate feedback.  
  - Display clear error messages (e.g., "Invalid room code", "File format not supported").  
- **UI Fallbacks:**  
  - Show fallback views or alerts if WebSocket connections fail or if data cannot be loaded.  
  - Use global error boundaries in React to catch unexpected exceptions and display a user-friendly message.  
- **Logging:**  
  - Capture client-side errors using a logging framework (e.g., Sentry) for debugging purposes.

### 6.2. Backend Error Handling

- **HTTP Error Responses:**  
  - Return appropriate HTTP status codes (e.g., 400 for bad requests, 404 for not found, 500 for server errors).  
  - Provide meaningful error messages in JSON responses (e.g., { "error": "Room not found" }).  
- **File Parsing & Processing:**  
  - Validate the format of Verilog and SDF files during upload.  
  - If parsing fails, return an error with details to guide the teacher in correcting file issues.  
- **WebSocket Error Management:**  
  - Monitor WebSocket connections and automatically attempt reconnection if dropped.  
  - Gracefully handle invalid or malformed messages and log them for review.  
- **Logging and Monitoring:**  
  - Use centralized logging (e.g., ELK stack) for critical backend errors.  
  - Log all exceptions with context (e.g., room IDs, user identifiers) to ease debugging.  
- **Fallback Strategies:**  
  - For non-critical errors (e.g., temporary network issues), provide default simulation data and alert users with a retry option.

---

## 7. Wireframes & User Flows

### 7.1. Landing Page

- **Buttons:**  
  - “I’m a Teacher” → Navigates to the Room Creation page.  
  - “I’m a Student” → Navigates to the Room Join page.

### 7.2. Room Creation (Teacher)

1. **Form:**  
   - Teacher inputs a Room Name (and optionally a Password).  
2. **Create:**  
   - The system generates a unique Room Code.  
3. **Redirect:**  
   - The teacher is taken to the Homepage - Teacher for the newly created room.

### 7.3. Room Join (Student)

1. **Form:**  
   - Student enters the Room ID/Code, an optional Password, and "Your Name".  
2. **Validation:**  
   - The system checks if the room is active and verifies the password if provided.  
3. **Redirect:**  
   - The student is directed to the Homepage - Student for that room.

### 7.4. Homepage - Teacher

- **Code Panel (Editable):**  
  - Displays Verilog/SDF code or JSON data, allowing for editing and annotations.  
- **FPGA Visualization:**  
  - A 2D floorplan with clickable BELs and routes.  
- **Simulation Controls:**  
  - Buttons for Play, Pause, Step, and Speed adjustments.  
- **Focus Participants:**  
  - Teacher can highlight specific signals or code lines, which are broadcast to all participants.

### 7.5. Homepage - Student

- **Code Panel (Read-Only):**  
  - Displays the teacher’s code without allowing modifications.  
- **FPGA Visualization:**  
  - Mirrors the teacher’s layout, including any highlights.  
- **Simulation Controls (Mirrored):**  
  - Students observe the simulation state as controlled by the teacher.

---

## 8. Project Roadmap & Timeline

| **Phase**                                 | **Features**                                                                                                                                                          | **Deadline** |
|-------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------|
| **Phase 1: Visualizing Provided Examples**| - Static UI with FPGA visualization (Flip-Flop, LUT4 examples)<br>- Basic simulation controls (Play, Pause, Step, Speed)<br>- Basic Rooms setup (Create/Join) with sample data | **13/3**     |
| **Phase 2: Teacher File Upload**          | - File upload & parsing (Verilog + SDF)<br>- Convert files to JSON for FPGA layout<br>- Advanced Rooms management (list participants, improved UI)<br>- Enhanced real-time sync (highlight/focus) | **25/3**     |
| **Phase 3: Full Automation (Optional)**   | - Automate FPGA processing (synthesis, P&R) if time allows<br>- Integrate open-source FPGA tools (yosys, nextpnr, etc.)                                                | **1/4**      |

---

## 9. Deployment Strategy

1. **Hosting:** AWS EC2 (Ubuntu 22.04 LTS) or a similar environment.  
2. **Containerization:** Docker images for both Frontend and Backend, potentially orchestrated with Kubernetes.  
3. **Frontend Deployment:**  
   - AWS Amplify or Vercel for a straightforward build and deploy pipeline.  
4. **Backend Deployment:**  
   - FastAPI app container deployed on AWS EC2, behind a load balancer if needed.  
5. **CI/CD:**  
   - GitHub Actions for automated testing, building, and deployment triggers.

---

## 10. Testing & Validation

- **Unit Tests:**  
  - File parsing logic (Verilog & SDF → JSON).  
  - Room creation & join (ensuring unique room codes and proper password validation).  
  - Error handling cases (invalid inputs, file format errors).

- **Integration Tests:**  
  - Teacher actions are correctly broadcast to students in real time.  
  - WebSocket message consistency and proper error responses/fallbacks.

- **User Acceptance Tests (UAT):**  
  - Real teachers and students perform typical tasks (creating/joining rooms, viewing simulations).  
  - Validate that error messages and UI feedback are clear and consistent.

- **Performance Tests:**  
  - Ensure smooth visualization for moderately sized FPGA designs.  
  - Test concurrent access with multiple students in a single room.

---

## 11. Conclusion

This unified technical specification outlines a comprehensive solution for a **web-based FPGA signal propagation simulator** with a **Rooms** feature for collaborative, teacher-led sessions. The design includes robust error handling and logging mechanisms that ensure a resilient system across both client and server environments. Key deliverables include:

- Source code (frontend + backend) on GitHub.  
- Detailed documentation (setup instructions, adding new examples).  
- Two example FPGA applications (Flip-Flop, LUT4).  
- Core Rooms functionality for synchronized teacher-student collaboration with integrated error management.

The roadmap details the phased development from basic visualization to advanced file upload capabilities and optional automation, with comprehensive error handling built into every layer of the system.

---

**End of Document**
