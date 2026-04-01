/**
 * Test Helpers
 * ------------
 * Shared utilities for creating mock Next.js requests,
 * generating JWT tokens, and constructing mock objects.
 */

import { NextRequest } from 'next/server';
import { generateToken, JWTPayload } from '@/lib/auth';
import mongoose from 'mongoose';

// ───────────────────────────────────────────────
// Mock Request Factory
// ───────────────────────────────────────────────

interface MockRequestOptions {
  method?: string;
  body?: Record<string, unknown>;
  headers?: Record<string, string>;
  searchParams?: Record<string, string>;
}

export function createMockRequest(
  url: string = 'http://localhost:3000/api/test',
  options: MockRequestOptions = {}
): NextRequest {
  const { method = 'GET', body, headers = {}, searchParams } = options;

  let fullUrl = url;
  if (searchParams) {
    const params = new URLSearchParams(searchParams);
    fullUrl = `${url}?${params.toString()}`;
  }

  const requestInit: RequestInit = {
    method,
    headers: new Headers(headers),
  };

  if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    requestInit.body = JSON.stringify(body);
    (requestInit.headers as Headers).set('Content-Type', 'application/json');
  }

  return new NextRequest(fullUrl, requestInit as RequestInit & { signal?: AbortSignal });
}

// ───────────────────────────────────────────────
// Token / Auth Helpers
// ───────────────────────────────────────────────

export function createPatientToken(overrides: Partial<JWTPayload> = {}): string {
  return generateToken({
    userId: new mongoose.Types.ObjectId().toString(),
    email: 'patient@test.com',
    role: 'patient',
    name: 'Test Patient',
    ...overrides,
  });
}

export function createDoctorToken(overrides: Partial<JWTPayload> = {}): string {
  return generateToken({
    userId: new mongoose.Types.ObjectId().toString(),
    email: 'doctor@test.com',
    role: 'doctor',
    name: 'Dr. Test',
    ...overrides,
  });
}

export function createAdminToken(overrides: Partial<JWTPayload> = {}): string {
  return generateToken({
    userId: new mongoose.Types.ObjectId().toString(),
    email: 'admin@test.com',
    role: 'admin',
    name: 'Test Admin',
    ...overrides,
  });
}

export function createAuthenticatedRequest(
  url: string,
  token: string,
  options: MockRequestOptions = {}
): NextRequest {
  return createMockRequest(url, {
    ...options,
    headers: {
      ...options.headers,
      authorization: `Bearer ${token}`,
    },
  });
}

// ───────────────────────────────────────────────
// Response Helpers
// ───────────────────────────────────────────────

export async function parseResponse(response: Response) {
  const json = await response.json();
  return {
    status: response.status,
    body: json,
  };
}

// ───────────────────────────────────────────────
// Object ID Generator
// ───────────────────────────────────────────────

export function generateObjectId(): string {
  return new mongoose.Types.ObjectId().toString();
}
