import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  PollenReferenceListQuery,
  pollenReferenceListQuerySchema,
} from './pollen-reference.query';
import { PollenReferencesService } from './pollen-references.service';

@ApiTags('pollen-references')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('pollen-references')
export class PollenReferencesController {
  constructor(private readonly service: PollenReferencesService) {}

  @Get()
  @ApiOperation({
    summary: 'List active pollen reference records for user lookup',
  })
  @ApiQuery({ name: 'scope', required: false, type: String })
  @ApiQuery({ name: 'region', required: false, type: String })
  @ApiQuery({ name: 'season', required: false, type: [String] })
  @ApiQuery({ name: 'colorGroup', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiOkResponse({ type: Object, description: 'Active pollen references' })
  listActive(
    @Query(new ZodValidationPipe(pollenReferenceListQuerySchema, 'query'))
    query: PollenReferenceListQuery,
  ) {
    return this.service.listActive(query);
  }
}
