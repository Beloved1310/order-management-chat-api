import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { hash } from 'bcrypt';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';

import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  ...jest.requireActual('bcrypt'),
  compare: jest.fn(),
}));

describe('UsersService Integration Tests', () => {
  let usersService: UsersService;
  let usersController: UsersController;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        UsersService,
        PrismaService,
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockResolvedValue('fakeAccessToken'),
          },
        },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);
    usersController = module.get<UsersController>(UsersController);

    // Apply database migrations
    await prismaService.$connect();
  });

  afterAll(async () => {
    // Cleanup test database
    await prismaService.user.deleteMany({});
    await prismaService.$disconnect();
  });

  describe('registerUser', () => {
    it('should register a user successfully', async () => {
      const dto = { email: 'test@example.com', password: 'Password123', role: 'REGULAR' as 'REGULAR' };

      const result = await usersService.registerUser(dto);
      expect(result).toEqual({ message: 'User registered successfully.' });

      const user = await prismaService.user.findUnique({ where: { email: dto.email } });
      expect(user).toBeDefined();
      expect(user.password).not.toEqual(dto.password); // Ensure password is hashed
    });

    it('should throw an error if email is already in use', async () => {
      const dto = { email: 'test@example.com', password: 'Password123', role: 'REGULAR' as 'REGULAR' };

      await expect(usersService.registerUser(dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('loginUser', () => {
    it('should login a user successfully and return an access token', async () => {
      const dto = { email: 'test@example.com', password: 'Password123' };
      (bcrypt.compare as jest.Mock).mockResolvedValue(true); // Mock successful password comparison
  
      const result = await usersService.loginUser(dto);
      expect(result).toEqual({ accessToken: 'fakeAccessToken' });
    });
  
    it('should throw an error if email is not found', async () => {
      const dto = { email: 'notfound@example.com', password: 'Password123' };
      await expect(usersService.loginUser(dto)).rejects.toThrow(UnauthorizedException);
    });
  
    it('should throw an error if password is invalid', async () => {
      const dto = { email: 'test@example.com', password: 'WrongPassword' };
      (bcrypt.compare as jest.Mock).mockResolvedValue(false); // Mock failed password comparison
  
      await expect(usersService.loginUser(dto)).rejects.toThrow(UnauthorizedException);
    });
  });
});
