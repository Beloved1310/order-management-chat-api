# Order Management & Chat System API

## Overview

This repository contains the solution for the backend assessment, where the goal was to develop a robust API using **TypeScript** and **NestJS**. The API provides the following functionalities:

1. **Order Management** – Regular Users can create and manage orders.
2. **Chat System** – A real-time chat is created for each order, allowing Regular Users and Admins to communicate.
3. **Order Status** – Admins can update the status of an order from `Review` to `Processing` to `Completed`.

The solution demonstrates proficiency in building APIs, handling real-time communication, validating inputs, and ensuring proper error handling.

## Features

- **Order Management**: 
  - Create and update orders with descriptions, specifications, and quantities.
  - Manage the status of orders.
  
- **Chat System**: 
  - Automatic creation of a unique chat room for each order.
  - Real-time messaging between Regular Users and Admins.
  - Admins can close chat rooms and provide a summary.

- **Order Status**: 
  - Orders transition from `Review` to `Processing` when a chat room is closed.
  - Admins can mark orders as `Completed`.

## Table of Contents

- [Order Management \& Chat System API](#order-management--chat-system-api)
  - [Overview](#overview)
  - [Features](#features)
  - [Table of Contents](#table-of-contents)
  - [System Requirements](#system-requirements)
  - [Functional Requirements](#functional-requirements)
    - [Order Management](#order-management)
    - [Chat System](#chat-system)
    - [Order Status](#order-status)
  - [Technical Requirements](#technical-requirements)
  - [Installation](#installation)
    - [1. Clone the Repository](#1-clone-the-repository)
  - [Installation](#installation-1)
    - [2. Install Dependencies](#2-install-dependencies)
    - [2. Setup Database](#2-setup-database)
    - [3. Run Prisma migrations to create the database schema](#3-run-prisma-migrations-to-create-the-database-schema)
    - [4. Start the Application](#4-start-the-application)
    - [5. Testing](#5-testing)

## System Requirements

The system supports two types of users:
- **Admin Users**: Can access all orders and chat rooms, and close chat rooms with summaries.
- **Regular Users**: Can create orders and participate in chats for their orders only.

## Functional Requirements

### Order Management
Regular Users can create an order containing:
- **Description**
- **Specifications**
- **Quantity**
- **Other relevant metadata**

### Chat System
- When a Regular User creates an order, a unique chat room is created between the user and an Admin for that order.
- Admins can access and chat in any chat room, while Regular Users can only access rooms associated with their own orders.
- Messages are stored persistently in the database.
- Admins can close chat rooms, and provide a concluding message summarizing the discussion.
- After closing, no new messages can be sent, but both parties can still view the chat history and summary.

### Order Status
- Orders start in the `Review` state.
- Once the chat room is closed, the order status moves to `Processing`.
- Admins can move an order to the `Completed` state after processing.

## Technical Requirements

- **API Development**: The API is built with **TypeScript** and **NestJS**.
- **Database**: The system uses an **SQL database** with **Prisma ORM** for database interaction.
- **Real-Time Chat**: WebSockets are used for real-time communication.
- **Error Handling**: All requests are validated, and error messages are returned in a standardized format.
- **Testing**: Comprehensive integration tests have been implemented to verify the functionality of the APIs.

## Installation

To get started with this project locally, follow these steps:

### 1. Clone the Repository

```bash
git clone https://github.com/Beloved1310/order-management-chat-api
cd order-management-chat-api

## Installation

### 2. Install Dependencies
Ensure you have **Node.js** (v14 or higher) and **npm** installed. Then, install the required dependencies:

```bash
npm install

### 2. Setup Database

```bash
DATABASE_URL=postgresql://user:password@localhost:5432/order_chat_db

### 3. Run Prisma migrations to create the database schema

```bash
npx prisma migrate deploy

### 4. Start the Application

```bash
npm run start:dev

### 5. Testing

```bash
npm run test






