import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  PollenReferenceCreate,
  PollenReferenceUpdate,
  pollenReferenceCreateSchema,
  pollenReferenceUpdateSchema,
} from 'shared-schemas';
import {
  JwtAuthGuard,
  Role,
  Roles,
  RolesGuard,
} from '../auth/guards/jwt-auth.guard';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { PollenReferencesService } from './pollen-references.service';

@ApiTags('admin/pollen-references')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin/pollen-references')
export class AdminPollenReferencesController {
  constructor(private readonly service: PollenReferencesService) {}

  @Get()
  @ApiOperation({ summary: 'List all pollen reference records (admin)' })
  @ApiOkResponse({ type: Object, description: 'All pollen references' })
  listAll() {
    return this.service.listAllAdmin();
  }

  @Post()
  @ApiOperation({ summary: 'Create a pollen reference record (admin)' })
  @ApiBody({ type: Object })
  @ApiCreatedResponse({ type: Object, description: 'Created pollen reference' })
  create(
    @Body(new ZodValidationPipe(pollenReferenceCreateSchema))
    body: PollenReferenceCreate,
  ) {
    return this.service.create(body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a pollen reference record (admin)' })
  @ApiBody({ type: Object })
  @ApiOkResponse({ type: Object, description: 'Updated pollen reference' })
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(pollenReferenceUpdateSchema))
    body: PollenReferenceUpdate,
  ) {
    if (body.id !== id) {
      throw new BadRequestException('Route id and payload id must match');
    }

    return this.service.update(id, body);
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'Activate a pollen reference record (admin)' })
  activate(@Param('id') id: string) {
    return this.service.activate(id);
  }

  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate a pollen reference record (admin)' })
  deactivate(@Param('id') id: string) {
    return this.service.deactivate(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a pollen reference record (admin)' })
  @ApiOkResponse({ type: Object, description: 'Deleted pollen reference' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
