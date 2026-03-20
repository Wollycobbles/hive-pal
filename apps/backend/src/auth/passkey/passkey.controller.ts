import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import type {
  PasskeyRegisterVerify,
  PasskeyAuthOptions,
  PasskeyAuthVerify,
  PasskeyResponse,
  AuthResponse,
  SuccessResponse,
} from 'shared-schemas';
import { PasskeyService } from './passkey.service.js';
import { JwtAuthGuard } from '../guards/jwt-auth.guard.js';
import { RequestWithUser } from '../interface/request-with-user.interface.js';
import { CustomLoggerService } from '../../logger/logger.service.js';

@ApiTags('passkeys')
@Controller('auth/passkey')
export class PasskeyController {
  constructor(
    private readonly passkeyService: PasskeyService,
    private readonly logger: CustomLoggerService,
  ) {
    this.logger.setContext('PasskeyController');
  }

  // ─── Registration ────────────────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard)
  @Post('register/options')
  @ApiResponse({ status: 200, description: 'Registration options generated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async registrationOptions(@Request() req: RequestWithUser) {
    this.logger.log(`Generating passkey registration options for user ${req.user.id}`);
    return this.passkeyService.generateRegistrationOptions(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('register/verify')
  @ApiResponse({ status: 201, description: 'Passkey registered successfully' })
  @ApiResponse({ status: 400, description: 'Verification failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async registrationVerify(
    @Request() req: RequestWithUser,
    @Body() body: PasskeyRegisterVerify,
  ): Promise<PasskeyResponse> {
    this.logger.log(`Verifying passkey registration for user ${req.user.id}`);
    return this.passkeyService.verifyRegistration(
      req.user.id,
      body.response,
      body.name,
    );
  }

  // ─── Authentication ──────────────────────────────────────────────────────────

  @Post('authenticate/options')
  @ApiResponse({ status: 200, description: 'Authentication options generated' })
  async authenticationOptions(
    @Body() body: PasskeyAuthOptions,
  ) {
    this.logger.log(`Generating passkey authentication options${body.email ? ` for ${body.email}` : ''}`);
    return this.passkeyService.generateAuthenticationOptions(body.email);
  }

  @Post('authenticate/verify')
  @ApiResponse({ status: 200, description: 'Authentication successful' })
  @ApiResponse({ status: 401, description: 'Authentication failed' })
  async authenticationVerify(
    @Body() body: PasskeyAuthVerify,
  ): Promise<AuthResponse> {
    this.logger.log('Verifying passkey authentication response');
    return this.passkeyService.verifyAuthentication(body.response);
  }

  // ─── Passkey management ──────────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiResponse({ status: 200, description: 'List of registered passkeys' })
  async listPasskeys(
    @Request() req: RequestWithUser,
  ): Promise<PasskeyResponse[]> {
    return this.passkeyService.listPasskeys(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiResponse({ status: 200, description: 'Passkey deleted' })
  @ApiResponse({ status: 404, description: 'Passkey not found' })
  async deletePasskey(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
  ): Promise<SuccessResponse> {
    this.logger.log(`Deleting passkey ${id} for user ${req.user.id}`);
    return this.passkeyService.deletePasskey(req.user.id, id);
  }
}
