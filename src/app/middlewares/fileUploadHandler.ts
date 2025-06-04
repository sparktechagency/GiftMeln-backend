import { Request } from 'express';
import fs from 'fs';
import { StatusCodes } from 'http-status-codes';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import ApiError from '../../errors/ApiError';

const fileUploadHandler = () => {
  //create upload folder
  const baseUploadDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(baseUploadDir)) {
    fs.mkdirSync(baseUploadDir);
  }

  //folder create for different file
  const createDir = (dirPath: string) => {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath);
    }
  };

  //create filename
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      let uploadDir;
      switch (file.fieldname) {
        case 'feature':
          uploadDir = path.join(baseUploadDir, 'feature');
          break;
        case 'image':
          uploadDir = path.join(baseUploadDir, 'image');
          break;
        case 'additional':
          uploadDir = path.join(baseUploadDir, 'additional');
          break;

        case 'media':
          uploadDir = path.join(baseUploadDir, 'media');
          break;
        case 'doc':
          uploadDir = path.join(baseUploadDir, 'doc');
          break;
        case 'csv':
          uploadDir = path.join(baseUploadDir, 'csv');
          break;
        default:
          throw new ApiError(StatusCodes.BAD_REQUEST, 'File is not supported');
      }
      createDir(uploadDir);
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const fileExt = path.extname(file.originalname);
      const fileName =
        file.originalname
          .replace(fileExt, '')
          .toLowerCase()
          .split(' ')
          .join('-') +
        '-' +
        Date.now();
      cb(null, fileName + fileExt);
    },
  });

  //file filter
  const filterFilter = (req: Request, file: any, cb: FileFilterCallback) => {
    if (
      file.fieldname === 'image' ||
      file.fieldname === 'feature' ||
      file.fieldname === 'additional' ||
      file.fieldname === 'csv'
    ) {
      if (file.mimetype.startsWith('image')) {
        cb(null, true);
      } else if (file?.fieldname === 'csv') {
        if (file.mimetype === 'text/csv') {
          cb(null, true);
        } else {
          cb(new ApiError(StatusCodes.BAD_REQUEST, 'Only .csv file supported'));
        }
      } else {
        cb(
          new ApiError(
            'Only .jpeg, .png, .jpg file supported',
          ),
        );
      }
    } else if (file.fieldname === 'media') {
      if (
        file.mimetype === 'video/mp4' ||
        file.mimetype === 'audio/mpeg' ||
        file.mimetype === 'csv'
      ) {
        cb(null, true);
      } else {
        cb(
          new ApiError(
            StatusCodes.BAD_REQUEST,
            'Only .mp4, .mp3, file supported',
          ),
        );
      }
    } else if (file.fieldname === 'doc') {
      if (file.mimetype === 'application/pdf') {
        cb(null, true);
      } else {
        cb(new ApiError(StatusCodes.BAD_REQUEST, 'Only pdf supported'));
      }
    } else {
      cb(new ApiError(StatusCodes.BAD_REQUEST, 'This file is not supported'));
    }
  };

  const upload = multer({
    storage: storage,
    // @ts-ignore
    fileFilter: filterFilter,
  }).fields([
    { name: 'image', maxCount: 3 },
    { name: 'media', maxCount: 3 },
    { name: 'doc', maxCount: 3 },
    { name: 'feature', maxCount: 1 },
    { name: 'additional', maxCount: 5 },
    { name: 'csv', maxCount: 1 },
  ]);
  return upload;
};

export default fileUploadHandler;
