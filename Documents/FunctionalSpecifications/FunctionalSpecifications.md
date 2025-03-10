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
    - [1.1. Project overview](#11-project-overview)
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
      - [1.4. Project plan](#14-project-plan)
  - [2. Personas and use cases](#2-personas-and-use-cases)
    - [2.1. Personas](#21-personas)
      - [2.1.1.](#211)

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

| Deliverable               | Purpose                                                                                                                                                       |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Functional specifications | Detailed documentation of the features used and their non-technical aspects.                                                                                  |
| Technical specifications  | Detailed documentation on the technical implementation of software.                                                                                           |
| Source code               | The source code of the program.                                                                                                                               |
| Test plan & Test cases    | A set of scenarios validating the software's performance, and responsivity along with the UI with a defined strategy to run tests more accurately and efficiently. |
| Project charter           | A document to organize a project's objectives and deadlines.                                                                                                  |
| Weekly reports            | A group of documents written at the end of each week to report the progress made during a week.                                                               |
| User manual               | The end-user documentation for the software.                                                                                                                  |

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

| Role            | Representative | Expectations                                                                   |
| --------------- | -------------- | ------------------------------------------------------------------------------ |
| Client          | Florent MANNI  | Finished project meeting [requirements](https://github.com/LeFl0w/ALGOSUP_POC). |
| School director | Franck JEANNIN | Clear documentation and management based on the skills learnt in class.         |

#### 1.3.2. Project reviewers

External project reviewers have been appointed by the school director to review our specifications and provide us with feedback.

#### 1.4. Project Plan


## 2. Personas and use cases

### 2.1. Personas

#### 2.1.1. William
![William](https://github.com/user-attachments/assets/b8028eb3-a2f4-4e13-8510-7b0d720c89e4)

#### 2.1.2. Julie
![Julie](https://github.com/user-attachments/assets/b7e9e88a-e2b9-4bfc-9d95-87d8e725485b)

#### 2.1.3. Justin
![Justin](https://github.com/user-attachments/assets/adcc5793-bf1c-4352-9718-61f0986151f5)


