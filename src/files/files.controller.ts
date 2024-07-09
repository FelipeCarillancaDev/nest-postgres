import { BadRequestException, Controller, Get, Param, Post, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileFilter } from './helpers/fileFilter.helper';
import { diskStorage } from 'multer';
import { FileNamer } from './helpers/fileName.helper';
import { Response } from 'express';

@Controller('files')
export class FilesController {
    constructor(private readonly filesService: FilesService) {}

    @Get('product/:imageName')
    findProductImage(@Res() res: Response, @Param('imageName') imageName: string) {
        console.log(imageName);
        const path = this.filesService.getStaticProductImage(imageName);
        console.log(path);
        res.sendFile(path);
    }

    @Post('product')
    @UseInterceptors(
        FileInterceptor('file', {
            fileFilter: FileFilter, storage: diskStorage({
                destination: './static/products',
                filename: FileNamer,
            }),
        }),
    )
    uploadProductImage(@UploadedFile() file: Express.Multer.File) {
        if (!file) throw new BadRequestException('Make sure that the file is an image');
        const secureUrl = `${file.filename}`;
        return { secureUrl };
    }
}
