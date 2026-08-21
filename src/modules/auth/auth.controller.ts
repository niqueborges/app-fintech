import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service.js';
import { RegisterDto, LoginDto, VerifyMfaDto, RefreshTokenDto } from './dto/auth.dto.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { CurrentUser, type CurrentUserPayload } from './decorators/current-user.decorator.js';

@ApiTags('Auth & MFA')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Auto-cadastro de novo cliente com abertura de conta digital' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login com email e senha' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('mfa/setup')
  @ApiOperation({ summary: 'Gera chave TOTP e QR Code para ativacao de 2FA' })
  setupMfa(@CurrentUser() user: CurrentUserPayload) {
    return this.authService.setupMfa(user.id);
  }

  @Post('mfa/verify')
  @ApiOperation({ summary: 'Valida codigo TOTP de 6 digitos e conclui autenticacao' })
  verifyMfa(@Body() dto: VerifyMfaDto) {
    return this.authService.verifyMfa(dto);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Renovacao de access token via refresh token' })
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('me')
  @ApiOperation({ summary: 'Retorna perfil e contas do usuario logado' })
  getProfile(@CurrentUser() user: CurrentUserPayload) {
    return user;
  }
}
