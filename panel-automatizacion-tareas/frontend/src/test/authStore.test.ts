import { describe, it, expect } from 'vitest';
import { useAuthStore } from '../features/auth/store/authStore';

describe('authStore', () => {
  it('hasRole returns false when not authenticated', () => {
    useAuthStore.getState().logout();
    expect(useAuthStore.getState().hasRole('ADMIN')).toBe(false);
  });

  it('hasRole returns true for matching role', () => {
    useAuthStore.getState().setAuth('token', {
      id: 1,
      email: 'test@test.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'ADMIN',
      mustChangePassword: false,
    });
    expect(useAuthStore.getState().hasRole('ADMIN')).toBe(true);
    expect(useAuthStore.getState().hasRole('VIEWER')).toBe(false);
  });
});
