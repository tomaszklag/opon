import { randomUUID } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  HttpCode,
  HttpStatus,
  MaxFileSizeValidator,
  OnModuleInit,
  Param,
  ParseFilePipe,
  ParseUUIDPipe,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiCookieAuth, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/types/jwt-payload.interface';
import { ProvidersService } from '../providers/providers.service';
import { PhotoResponseDto } from './dto/photo-response.dto';
import { UploadPhotoDto } from './dto/upload-photo.dto';
import { PhotosService } from './photos.service';

const UPLOADS_ROOT = path.join(process.cwd(), 'uploads');

@ApiTags('photos')
@Controller('v1/providers')
export class PhotosController implements OnModuleInit {
  constructor(
    private readonly photosService: PhotosService,
    private readonly providersService: ProvidersService,
  ) {}

  onModuleInit() {
    fs.mkdirSync(UPLOADS_ROOT, { recursive: true });
  }

  // ── POST /v1/providers/me/photos ─────────────────────────────────────────

  @Post('me/photos')
  @HttpCode(HttpStatus.CREATED)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Prześlij zdjęcie firmy' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, type: PhotoResponseDto })
  @ApiResponse({ status: 400, description: 'Nieprawidłowy plik lub przekroczono limit zdjęć' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          // Multer zapisuje plik tymczasowo do uploads/.
          // Handler przenosi go do uploads/providers/:providerId/ po autoryzacji.
          cb(null, UPLOADS_ROOT);
        },
        filename: (_req, file, cb) => {
          const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
          cb(null, `${randomUUID()}${ext}`);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async upload(
    @CurrentUser() user: JwtPayload,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({
            fileType: /^image\/(jpeg|png|webp)$/,
            skipMagicNumbersValidation: true,
          }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Body() dto: UploadPhotoDto,
  ): Promise<PhotoResponseDto> {
    let destPath: string | undefined;
    try {
      const provider = await this.providersService.getMyProvider(user.sub);

      const providerDir = path.join(UPLOADS_ROOT, 'providers', provider.id);
      fs.mkdirSync(providerDir, { recursive: true });

      destPath = path.join(providerDir, path.basename(file.path));
      fs.renameSync(file.path, destPath);

      const movedFile: Express.Multer.File = { ...file, path: destPath };
      return (await this.photosService.upload(
        provider.id,
        movedFile,
        dto.type,
      )) as unknown as PhotoResponseDto;
    } catch (err) {
      fs.unlink(destPath ?? file.path, () => {});
      throw err;
    }
  }

  // ── GET /v1/providers/me/photos ──────────────────────────────────────────

  @Get('me/photos')
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Lista zdjęć mojej firmy' })
  @ApiResponse({ status: 200, type: [PhotoResponseDto] })
  async getPhotos(@CurrentUser() user: JwtPayload): Promise<PhotoResponseDto[]> {
    const provider = await this.providersService.getMyProvider(user.sub);
    return this.photosService.findByProvider(provider.id) as unknown as Promise<PhotoResponseDto[]>;
  }

  // ── DELETE /v1/providers/me/photos/:id ───────────────────────────────────

  @Delete('me/photos/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Usuń zdjęcie firmy' })
  @ApiResponse({ status: 204, description: 'Zdjęcie usunięte' })
  @ApiResponse({ status: 404, description: 'Zdjęcie nie istnieje' })
  async deletePhoto(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    const provider = await this.providersService.getMyProvider(user.sub);
    await this.photosService.remove(provider.id, id);
  }

  // ── PATCH /v1/providers/me/photos/:id/primary ────────────────────────────

  @Patch('me/photos/:id/primary')
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Ustaw zdjęcie jako główne' })
  @ApiResponse({ status: 200, type: PhotoResponseDto })
  @ApiResponse({ status: 404, description: 'Zdjęcie nie istnieje' })
  async setPrimary(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PhotoResponseDto> {
    const provider = await this.providersService.getMyProvider(user.sub);
    return this.photosService.setPrimary(provider.id, id) as unknown as Promise<PhotoResponseDto>;
  }
}
