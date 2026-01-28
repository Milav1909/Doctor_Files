import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractToken, UserRole, JWTPayload } from '@/lib/auth';

export interface AuthenticatedRequest extends NextRequest {
    user?: JWTPayload;
}

// Authenticate user from JWT token
export async function authenticate(
    request: NextRequest
): Promise<{ user: JWTPayload } | { error: NextResponse }> {
    const authHeader = request.headers.get('authorization');
    const token = extractToken(authHeader);

    if (!token) {
        return {
            error: NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            )
        };
    }

    const payload = verifyToken(token);
    if (!payload) {
        return {
            error: NextResponse.json(
                { error: 'Invalid or expired token' },
                { status: 401 }
            )
        };
    }

    return { user: payload };
}

// Check if user has required role
export function requireRole(
    user: JWTPayload,
    allowedRoles: UserRole[]
): NextResponse | null {
    if (!allowedRoles.includes(user.role)) {
        return NextResponse.json(
            { error: 'Access denied. Insufficient permissions.' },
            { status: 403 }
        );
    }
    return null;
}

// Combined auth and role check helper
export async function authenticateAndAuthorize(
    request: NextRequest,
    allowedRoles: UserRole[]
): Promise<{ user: JWTPayload } | { error: NextResponse }> {
    const authResult = await authenticate(request);

    if ('error' in authResult) {
        return authResult;
    }

    const roleError = requireRole(authResult.user, allowedRoles);
    if (roleError) {
        return { error: roleError };
    }

    return authResult;
}

// Standard error response helper
export function errorResponse(message: string, status: number = 500): NextResponse {
    return NextResponse.json({ error: message }, { status });
}

// Standard success response helper
export function successResponse<T>(data: T, status: number = 200): NextResponse {
    return NextResponse.json(data, { status });
}
