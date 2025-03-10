<div align="center">

# Functional Specifications 

---
**Title:** Web FPGA - Functional Specifications

**Team:** Team 7

**Author:** Aurélien FERNANDEZ

**Version:** 0.1

---

</div>


<br><details>
<summary><h2 id="toc"> Table of Contents</h2></summary>

- [Functional Specifications](#functional-specifications)
  - [1. Introduction](#1-introduction)
    - [1.1. Project Overview](#11-project-overview)
    - [1.2. Project Definitions](#12-project-definitions)
      - [1.2.1. Vision](#121-vision)
      - [1.2.2 Objectives](#122-objectives)
      - [1.2.3. Scope](#123-scope)
      - [1.2.4. Target audience](#124-target-audience)
      - [1.2.5. Deliverables](#125-deliverables)
    - [1.3. Project organisation](#13-project-organisation)
      - [1.3.1. Project representatives](#131-project-representatives)
      - [1.3.2. Stakeholders](#132-stakeholders)
      - [1.3.2. Project reviewers](#132-project-reviewers)
  - [2. Personas and use cases](#2-personas-and-use-cases)
    - [2.1. Personas](#21-personas)
      - [2.1.1. William](#211-william)
      - [2.1.2. Julie](#212-julie)
      - [2.1.3. Justin](#213-justin)
    - [2.2. Use Cases](#22-use-cases)
  - [3. Functional Requirements](#3-functional-requirements)
    - [3.1. Examples](#31-examples)
      - [3.2.1. Overview](#321-overview)
      - [3.1.2. Scenarios](#312-scenarios)
    - [3.2. FPGA display](#32-fpga-display)
      - [3.2.1. Overview](#321-overview-1)
      - [3.2.2. Scenarios](#322-scenarios)
    - [3.3. Code display](#33-code-display)
      - [3.3.1 Overview](#331-overview)

</details>


## 1. Introduction 

### 1.1. Project Overview

This project focuses on developing a web interface that allows users to learn FPGA concepts through a simulated environment.

### 1.2. Project Definitions

#### 1.2.1. Vision
Our goal is to deliver an intuitive and reliable platform that accurately represents the inner workings of an FPGA. 

#### 1.2.2 Objectives

- Web interface: The software must be accessible through a web interface.
- Role system: The software must be separated into two distinct roles:
  - Student
  - Teacher
- Representation of an FPGA board along with elements such as LEDs, buttons and wires in order to interact with it.

#### 1.2.3. Scope

This software must include:
- An interface to display and simulate the different elements in an FPGA board or connected to it.
- An interface to allow users to write and run their code.
- A teacher's role allows the creation of "rooms" to share with their student. This role should also be able to import their own examples to the "rooms".
- A student role able to add, read, update and delete elements from either the code or the simulation interface.

#### 1.2.4. Target audience

The target audience includes:
- IT teachers and their students,
- FPGA programmers looking to test their program,

#### 1.2.5. Deliverables

| Deliverable               | Purpose                                                                                                                                                            |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Functional specifications | Detailed documentation of the features used and their non-technical aspects.                                                                                       |
| Technical specifications  | Detailed documentation on the technical implementation of software.                                                                                                |
| Source code               | The source code of the program.                                                                                                                                    |
| Test plan & Test cases    | A set of scenarios validating the software's performance, and responsivity along with the UI with a defined strategy to run tests more accurately and efficiently. |
| Project charter           | A document to organize a project's objectives and deadlines.                                                                                                       |
| Weekly reports            | A group of documents written at the end of each week to report the progress made during a week.                                                                    |
| User manual               | The end-user documentation for the software.                                                                                                                       |

### 1.3. Project organisation

#### 1.3.1. Project representatives

| Full Name                            | Role               | Role Description                                                                                                                                                        |
| ------------------------------------ | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pierre GORIN                         | Project manager    | Responsible for the overall planning, execution, and success of the project.                                                                                            |
| Aurélien FERNANDEZ                   | Program manager    | Ensures the project meets expectations. <br> Is in charge of design. <br> Responsible for writing the Functional Specifications.                                        |
| Abderrazaq MAKRAN                    | Tech lead          | Makes technical decisions for the project. <br> Translates the Functional Specification into Technical Specifications. <br> Performs code review.                       |
| Enzo GUILLOUCHE <br> Antoine PREVOST | Software engineers | Writes the code. <br> Writes documentation. <br> Participates in the technical design.                                                                                  |  |
| Guillaume DERAMCHI                   | Quality assurance  | Tests all the functionalities of a product to find bugs and issues. <br> Documents bugs and issues. <br> Writes the test plan. <br> Checks that issues have been fixed. |
| Max BERNARD                          | Technical writer   | Responsible for creating and maintaining the project's documentation.                                                                                                   |

#### 1.3.2. Stakeholders

| Role            | Representative | Expectations                                                                    |
| --------------- | -------------- | ------------------------------------------------------------------------------- |
| Client          | Florent MANNI  | Finished project meeting [requirements](https://github.com/LeFl0w/ALGOSUP_POC). |
| School director | Franck JEANNIN | Clear documentation and management based on the skills learnt in class.         |

#### 1.3.2. Project reviewers

External project reviewers have been appointed by the school director to review our specifications and provide us with feedback.

## 2. Personas and use cases

### 2.1. Personas

#### 2.1.1. William
![William](https://github.com/user-attachments/assets/b8028eb3-a2f4-4e13-8510-7b0d720c89e4)

#### 2.1.2. Julie
![Julie](https://github.com/user-attachments/assets/b7e9e88a-e2b9-4bfc-9d95-87d8e725485b)

#### 2.1.3. Justin
![Justin](https://github.com/user-attachments/assets/adcc5793-bf1c-4352-9718-61f0986151f5)


### 2.2. Use Cases

| **ID** | **Title**                          | **Description**                                                                                        |
| ------ | ---------------------------------- | ------------------------------------------------------------------------------------------------------ |
| 01     | Select an FPGA Application         | Users can browse and selects one of the preloaded FPGA application examples through the web interface. |
| 02     | View 2D FPGA Layout                | Users can see a 2D representation of the FPGA, highlighting the used BELs and signal routes.           |
| 03     | Navigate FPGA Layout               | Users can zoom in, zooms out, and moves around the FPGA layout for better visualization.               |
| 04     | Simulate Signal Propagation        | Users can play the simulation to observe how signals propagate through the FPGA over time.             |
| 05     | Adjust Simulation Speed            | Users can change the simulation speed (e.g., x1, x2, x4) for better understanding.                     |
| 06     | Step Through Simulation            | Users can advance the simulation step by step to analyze signal changes in detail.                     |
| 07     | Pause and Resume Simulation        | Users can pause and resume the simulation as needed.                                                   |
| 08     | View Documentation & How-To Guides | Users can access documentation on how to use the system, run simulations, and add new FPGA designs.    |

## 3. Functional Requirements

### 3.1. Examples

#### 3.2.1. Overview

Prebuild examples are available for the user to use. The user can also import its own examples.

#### 3.1.2. Scenarios

| Scenario                     | Description                                                     | Software Response                                                                             |
| ---------------------------- | --------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Loading of a example         | The user loads a prebuild example.                              | The code and the simulation of the example will appear and can be run or updated by the user. |
| Importing of a example       | The user uploads a .V file and a .SDF file.                     | The components and the connections will be created on the simulation side.                    |
| Importing of an invalid file | The user uploads a file that is not one of the required format. | The system displays an error message specifying the unsupported file type.                    |

### 3.2. FPGA display
  
#### 3.2.1. Overview

The display of FPGA components allows users to visually identify the different components of an example. Users can also move or changes the connections of a component.

#### 3.2.2. Scenarios
| Scenario                 | Description                                                 | Software Response                                                                      |
| ------------------------ | ----------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Dragging of a component  | The user clicks and drags a component using the mouse       | The component moves along with the cursor until released.                              |
|                          |
| Connection removal       | A user selects a wire and presses the delete key.           | The wire disappears, and the FPGA layout updates accordingly.                          |
| Creation of a connection | A user clicks on a connection node and drags it on another. | A new wire will appear connecting the two components.                                  |
| Invalid connection       | The user attempts to create an unsupported connection.      | The system prevents the connection and displays an error message explaining the issue. |

### 3.3. Code display

#### 3.3.1 Overview

The code can be displayed, updated and run by the user.
| Scenario                    | Description                                                | Software response                                                                        |
| --------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Run simulation              | The user presses the "Run" button.                         | The simulation executes, showing signal propagation and changes in the FPGA layout.      |
| Modify and run updated code | The user edits the Verilog code and reruns the simulation. | The system compiles the new code and updates the FPGA visualization accordingly.         |
| Run code with errors        | The user runs code that contains syntax errors.            | The system halts execution and highlights the error location with a descriptive message. |
