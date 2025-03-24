import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma-service';
import {v2 as cloudinary} from 'cloudinary'
import * as fs from 'fs';
import { resolve } from 'path';
import { rejects } from 'assert';
@Injectable()
export class FileUploadService {
    constructor(private prisma:PrismaService){
        //coludinary Configuration
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key : process.env.CLOUDINARY_CLOUD_API_KEY,
            api_secret: process.env.CLOUDINARY_CLOUD_API_SECRET
        });
    };
    async uploadFile(file : Express.Multer.File ){
        try {
            
            const uploadResult = await this.uploadToCloudinary(file.path)

            //Saving to DB
            const newnlySavedFile = await this.prisma.file.create({
                data : {
                    filename : file.originalname,
                    publicId : uploadResult.public_id,
                    url: uploadResult.secure_url
                }
            })

            // fs.unlinkSync(file.path);

            return newnlySavedFile;
        } catch (error) {
            //removing the uploaded file from local storgae incase of any error
            if(file.path && fs.existsSync(file.path)){
                fs.unlinkSync(file.path)
            }
            console.error(error);
            throw new InternalServerErrorException('File upload failed.Please try again later !',);  
            
        }
    }
    private uploadToCloudinary(filePath : string) : Promise<any> {
        return new Promise((resolve,reject)=>{
            cloudinary.uploader.upload(filePath,(error,result)=>{
                if(error){
                    reject(error)
                }else{
                    resolve(result)
                }
            })
        })
    }
}
