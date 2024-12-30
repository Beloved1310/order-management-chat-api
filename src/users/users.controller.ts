import { Controller, Post, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterUserDto, LoginUserDto } from '../dto/user.dto';

@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  @Post('/register')
  async create(
    @Body()
    registerUserDto: RegisterUserDto,
  ) {
    return await this.userService.registerUser(registerUserDto);
  }

  @Post('/login')
  async login(
    @Body()
    loginUserDto: LoginUserDto,
  ) {
    return await this.userService.loginUser(loginUserDto);
  }
}
