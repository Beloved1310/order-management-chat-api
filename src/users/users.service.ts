import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { hash, compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { RegisterUserDto, LoginUserDto } from '../dtos/user.dto'; 

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async registerUser(registerUserDto: RegisterUserDto): Promise<{ message: string }> {
    const { email, password, role } = registerUserDto;

    // Check if the user already exists
    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new BadRequestException('Email is already in use.');
    }

    // Hash the password
    const hashedPassword = await hash(password, 10);

    // Create the user
    await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role,
      },
    });

    return { message: 'User registered successfully.' };
  }


  async loginUser(loginUserDto: LoginUserDto): Promise<{ accessToken: string }> {
    const { email, password } = loginUserDto;

    // Find the user
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    // Check the password
    const isPasswordValid = await compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    // Generate a JWT
    const payload = { userId: user.id, role: user.role };
    const accessToken = await this.jwtService.signAsync(payload, {
        expiresIn: '1d', 
      });
      
    return { accessToken };
  }
  
}
