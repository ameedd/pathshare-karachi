import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Firestore Security Rules Policy Verification', () => {
  const rulesPath = path.resolve(process.cwd(), 'firestore.rules');
  let rulesContent = '';

  beforeAll(() => {
    expect(fs.existsSync(rulesPath)).toBe(true);
    rulesContent = fs.readFileSync(rulesPath, 'utf8');
  });

  it('enforces rules_version 2 for granular document security', () => {
    expect(rulesContent).toMatch(/rules_version\s*=\s*'2';/);
  });

  it('declares essential authentication and ownership helper functions', () => {
    expect(rulesContent).toContain('function isAuthenticated()');
    expect(rulesContent).toContain('request.auth != null');

    expect(rulesContent).toContain('function isOwner(userId)');
    expect(rulesContent).toContain('request.auth.uid == userId');
  });

  it('implements robust Role-Based Access Control (RBAC) for administrators', () => {
    expect(rulesContent).toContain('function isAdmin()');
    // Checks custom token claim or database admins collection lookup
    expect(rulesContent).toMatch(/request\.auth\.token\.admin\s*==\s*true/);
    expect(rulesContent).toContain('exists(/databases/$(database)/documents/admins/$(request.auth.uid))');
  });

  it('enforces a catch-all default deny policy', () => {
    expect(rulesContent).toMatch(/match\s*\/\{document=\*\*\}\s*\{\s*allow\s*read,\s*write:\s*if\s*false;\s*\}/);
  });

  it('strictly locks down OTP verifications collection from direct client SDK access', () => {
    expect(rulesContent).toContain('match /otpVerifications/{otpId}');
    expect(rulesContent).toMatch(/match\s*\/otpVerifications\/\{otpId\}\s*\{\s*allow\s*read,\s*write:\s*if\s*false;\s*\}/);
  });

  it('protects user profiles and private subcollections with owner and admin RBAC', () => {
    expect(rulesContent).toContain('match /users/{userId}');
    expect(rulesContent).toContain('allow read: if isOwner(userId) || isAdmin();');
    expect(rulesContent).toContain('allow create: if isOwner(userId)');
    expect(rulesContent).toContain('allow update: if isAdmin() ||');
    expect(rulesContent).toContain('affectedKeys().hasAny([\'isAdmin\', \'isVerified\', \'isDriverVerified\'])');
    expect(rulesContent).toContain('allow delete: if isAdmin();');
    expect(rulesContent).toContain('match /tripHistory/{tripId}');
    expect(rulesContent).toContain('match /private/{docId}');
  });

  it('secures identity verification documents (CNIC, student/office IDs) to owner creation and admin review', () => {
    expect(rulesContent).toContain('match /verifications/{userId}');
    expect(rulesContent).toContain('allow read: if isOwner(userId) || isAdmin();');
    expect(rulesContent).toContain('allow create: if isOwner(userId);');
    expect(rulesContent).toContain('allow update, delete: if isAdmin();');
  });

  it('restricts carpool ride creation to authenticated drivers and prevents tampering', () => {
    expect(rulesContent).toContain('match /rides/{rideId}');
    expect(rulesContent).toContain('request.resource.data.driverUid == request.auth.uid');
    expect(rulesContent).toContain('resource.data.driverUid == request.auth.uid ||');
  });

  it('restricts ride booking requests to participating passengers, drivers, and admins', () => {
    expect(rulesContent).toContain('match /rideRequests/{requestId}');
    expect(rulesContent).toContain('resource.data.passengerUid == request.auth.uid');
    expect(rulesContent).toContain('resource.data.driverUid == request.auth.uid');
  });

  it('restricts chat threads strictly to conversation participants and authorized admins', () => {
    expect(rulesContent).toContain('match /chats/{chatId}');
    expect(rulesContent).toContain('request.auth.uid in resource.data.participants');
    expect(rulesContent).toContain('match /messages/{messageId}');
  });
});
