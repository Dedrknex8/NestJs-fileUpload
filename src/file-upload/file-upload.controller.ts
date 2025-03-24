import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileUploadService } from './file-upload.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('file-upload')
export class FileUploadController{ 
    constructor(private readonly fileUploadService :FileUploadService){}

    @Post()
    @UseInterceptors(
        FileInterceptor('file',{
            storage : diskStorage({
                destination : './uploads',
                filename : (req,file,callback)=>{
                    const uniqSuffix = Date.now  + '-' + Math.round(Math.random()* 1e9);
                    const ext = extname(file.originalname)
                    const filename = `${uniqSuffix}${ext}`
                    callback(null,filename)
                }
            })
        })
    )

    async  uploadFile(@UploadedFile() file : Express.Multer.File ){
        return this.fileUploadService.uploadFile(file)
    }

}
