<div align="center">

# Project Charter 

---
**Title:** Web FPGA - Project Charter

**Team:** Team 7

**Author:** Pierre GORIN

**Version:** 1.0

**Date:** 06/03/2025

---

</div>

<br><details>
<summary><h2 id="toc"> Table of Contents <i>(Click to expand)</i></h2></summary>

- [Project Charter](#project-charter)
  - [Project Objectives](#project-objectives)
    - [Primary Objectives:](#primary-objectives)
    - [Secondary Objectives (if time allows):](#secondary-objectives-if-time-allows)
  - [Scope](#scope)
    - [In-Scope](#in-scope)
    - [Out of Scope](#out-of-scope)
  - [Team \& Responsibilities](#team--responsibilities)
  - [Project Timeline \& Deliverables](#project-timeline--deliverables)
    - [Key Milestones \& Deadlines](#key-milestones--deadlines)
  - [Project Risks \& Mitigation Plan](#project-risks--mitigation-plan)
  - [Tools \& Technologies](#tools--technologies)
    - [Development Stack:](#development-stack)
    - [FPGA Simulation Tools:](#fpga-simulation-tools)
    - [Project Management \& Collaboration:](#project-management--collaboration)

</details>


The goal of this project is to develop a **web-based FPGA simulator** that helps students visualize **signal propagation** inside an FPGA. This tool will combine **a 2D visualization of the FPGA floorplan** with **real-time signal propagation simulation** based on Verilog applications.  

This project is part of an **educational initiative** by the CNES and will use the **NanoXplore NGultra FPGA** along with simulation tools such as **Impulse and ModelSim**.  

---

## Project Objectives
### Primary Objectives:
- Develop a **web interface** that allows users to visualize FPGA components (BELs) and signal routing.  
- Implement **real-time simulation playback controls** (play, pause, speed adjustment).  
- Provide a **backend to manage Verilog applications and testbenches**.  
- Enable **teachers to upload and manage educational FPGA applications**.  

### Secondary Objectives (if time allows):
- Support **open-source FPGA simulation tools** (e.g., Yosys, Nextpnr).  
- Improve UI/UX with **advanced visualization (zoom, highlighting, annotations, etc.)**.  

---

## Scope
### In-Scope
- Web-based visualization of FPGA floorplan (2D representation).  
- Simulation of **signal propagation over time**.  
- Backend service to **load, manage, and run Verilog testbenches**.
- Integration with **Impulse (synthesis/P&R) and ModelSim (timing simulation)**.  
- User roles:  
   - **Teacher**: Uploads applications and testbenches.  
   - **Student**: Selects applications and interacts with the simulator.  

### Out of Scope
- Development of a fully open-source simulation tool (this project depends on Impulse and ModelSim).  
- Support for **VHDL** (only Verilog will be used).  
- FPGA hardware implementation (this is purely a simulation tool).  

---

## Team & Responsibilities
| **Team Member**        | **Role**            | **Responsibilities**                                    |
| ---------------------- | ------------------- | ------------------------------------------------------- |
| **Pierre Gorin**       | Project Manager     | Planning, team coordination, documentation              |
| **Aurélien Fernandez** | Program Manager     | Writing functional specifications                       |
| **Abderrazaq Makran**  | Technical Lead      | Writing technical specifications, defining architecture |
| **Enzo Guillouche**    | Software Engineer 1 | Backend development (API, data handling)                |
| **Antoine Prevost**    | Software Engineer 2 | Frontend development (UI, visualization)                |
| **Guillaume Deramchi** | Quality Assurance   | Writing test plan, executing tests, validating features |
| **Max Bernard**        | Technical Writer    | Writing user manual, documentation                      |

---

## Project Timeline & Deliverables
### Key Milestones & Deadlines
| **Date**            | **Milestone**                      | **Deliverable**               |
| ------------------- | ---------------------------------- | ----------------------------- |
| **Wednesday 13/03** | Functional Specification completed | `FunctionalSpecifications.md` |
| **Monday 25/03**    | Technical Specification completed  | `TechnicalSpecifications.md`  |
| **Monday 25/03**    | Test Plan finalized                | `TestPlan.md`                 |
| **Monday 01/04**    | Code implementation completed      | Working software              |
| **Thursday 04/04**  | Final project presentation         | Oral presentation & demo      |

---

## Project Risks & Mitigation Plan
| **Risk**                                                 | **Likelihood** | **Impact** | **Mitigation Strategy**                              |
| -------------------------------------------------------- | -------------- | ---------- | ---------------------------------------------------- |
| **Delays in functional/technical specs**                 | Medium         | High       | Set **early review checkpoints** to validate specs   |
| **Technical issues with Impulse & ModelSim integration** | High           | High       | Allocate **extra development time** for debugging    |
| **Frontend visualization complexity**                    | Medium         | Medium     | Keep **UI design simple** and focus on core features |
| **Team communication gaps**                              | Medium         | High       | Weekly **check-ins & Slack updates**                 |
| **Limited testing time**                                 | High           | High       | Prioritize **critical tests** in QA plan             |

---

## Tools & Technologies
### Development Stack:
- **Backend:** [Framework] (e.g., FastAPI, Flask, Node.js)  
- **Frontend:** [Framework] (e.g., React, Vue.js, Svelte)  
- **Database:** SQLite / PostgreSQL (if needed)  

### FPGA Simulation Tools:
- **Synthesis & Place & Route:** **Impulse (NanoXplore)**  
- **Timing Simulation:** **ModelSim (Intel FPGA toolchain)**  
- **Alternative open-source tools (optional):** Yosys, Nextpnr  

### Project Management & Collaboration:
- **GitHub** (Version control)  
- **Trello** (Task management)  
- **Slack** (Team communication)  
- **Google Forms** (Weekly progress tracking)  
