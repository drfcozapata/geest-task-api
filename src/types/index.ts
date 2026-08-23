import { Request, Response, NextFunction } from 'express';

export interface User {
  id: number;
  name: string;
  lastName: string;
  email: string;
  createdAt: Date;
  deletedAt: Date | null;
}

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: 'open' | 'archived';
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface TaskAssignment {
  id: number;
  taskId: number;
  userId: number;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: number;
  taskId: number;
  attempt: number;
  httpStatus: number | null;
  payload: object;
  createdAt: Date;
}

export interface IdempotencyKey {
  key: string;
  response: object;
  statusCode: number;
  createdAt: Date;
}

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
  };
}

export interface CreateUserRequest {
  name: string;
  lastName: string;
  email: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
}

export interface AssignTaskRequest {
  userIds: number[];
}

export interface CompleteTaskRequest {
  userId: number;
}

export type QueryStatus = 'open' | 'archived';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ErrorResponse['error'];
}
