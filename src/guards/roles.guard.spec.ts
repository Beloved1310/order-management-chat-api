import { RolesGuard } from './roles.guard';
import { Reflector } from '@nestjs/core';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflectorMock: Partial<Reflector>;

  beforeEach(() => {
    reflectorMock = {
      get: jest.fn(), // Mock the get method of Reflector
    };

    guard = new RolesGuard(reflectorMock as Reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });
});
