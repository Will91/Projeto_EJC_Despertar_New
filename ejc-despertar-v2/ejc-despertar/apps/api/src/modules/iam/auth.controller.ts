import { Body, Controller, Post } from '@nestjs/common';
import { AuthService, TokenPair } from './auth.service';
import { RegisterDto, LoginDto, RefreshTokenDto } from './dto'; // Ajuste o caminho dos DTOs

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto): Promise<TokenPair> {
    return this.authService.register(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginDto): Promise<TokenPair> {
    return this.authService.login(dto);
  }

  @Post('refresh')
  async refresh(@Body() dto: RefreshTokenDto): Promise<TokenPair> {
    return this.authService.refresh(dto);
  }
}
