/**
 * 前端文件，直接引用
 * uploaded files validation including type, extension and size validation
 * type可以查看mdn MIME
 */
import z from 'zod';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/x-icon', 'application/json', 'image/svg+xml'] as const;
const ALLOWED_FILE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.json', '.svg'] as const; 

export const fileSchema = z.object({
    type: z.enum(ALLOWED_FILE_TYPES),
    name: z.enum(ALLOWED_FILE_EXTENSIONS),
    size: z.number().lt(MAX_FILE_SIZE, {message: '上传文件不可超过2M'})
})

export const modifyAndValidate = (file: File) => {
    const modified = new File([file], '.'.concat(file.name.split('.').reverse()[0]), {type: file.type});
    console.log(modified);
    return fileSchema.safeParse(modified);
}