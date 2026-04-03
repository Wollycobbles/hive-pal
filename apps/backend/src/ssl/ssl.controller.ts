import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { z } from 'zod';
import { SslService } from './ssl.service.js';
import { JwtAuthGuard, Roles, Role, RolesGuard } from '../auth/guards/jwt-auth.guard.js';
import { CustomLoggerService } from '../logger/logger.service.js';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';

const uploadCertSchema = z.object({
  certPem: z.string().min(1, 'certPem is required').startsWith('-----BEGIN', {
    message: 'certPem must be a PEM-encoded certificate',
  }),
  keyPem: z.string().min(1, 'keyPem is required').startsWith('-----BEGIN', {
    message: 'keyPem must be a PEM-encoded private key',
  }),
});

type UploadCertDto = z.infer<typeof uploadCertSchema>;

@ApiTags('ssl')
@Controller('admin/ssl')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class SslController {
  constructor(
    private readonly sslService: SslService,
    private readonly logger: CustomLoggerService,
  ) {
    this.logger.setContext('SslController');
  }

  @Post('upload')
  @ApiResponse({ status: 200, description: 'Certificate uploaded and Traefik config updated' })
  @ApiResponse({ status: 400, description: 'Invalid certificate or key' })
  @ApiResponse({ status: 403, description: 'Admin only' })
  async uploadCertificate(
    @Body(new ZodValidationPipe(uploadCertSchema)) body: UploadCertDto,
  ) {
    this.logger.log('Admin uploading SSL certificate');
    return this.sslService.uploadCertificate(body.certPem, body.keyPem);
  }

  @Get('info')
  @ApiResponse({ status: 200, description: 'Current certificate info, or null if none uploaded' })
  async getCertificateInfo() {
    return this.sslService.getCertificateInfo();
  }

  @Delete('certificate')
  @ApiResponse({ status: 200, description: 'Certificate removed, Traefik reverts to Let\'s Encrypt' })
  async removeCertificate() {
    this.logger.log('Admin removing SSL certificate');
    await this.sslService.removeCertificate();
    return { message: 'Custom certificate removed. Traefik will fall back to Let\'s Encrypt.' };
  }
}
