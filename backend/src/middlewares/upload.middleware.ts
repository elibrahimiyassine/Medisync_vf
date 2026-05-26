import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { AppError } from './error.middleware';

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, 'uploads/'),
  filename: (_, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const fileFilter = (_: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
<<<<<<< HEAD
  const allowed = [
    'image/jpeg', 'image/png', 'image/webp', 'application/pdf',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/dicom', 'image/dicom',
  ];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Type de fichier non autorisé', 400));
=======
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('File type not allowed', 400));
>>>>>>> 70d4349ce362b98ae279bafeba0f294995e85567
  }
};

export const upload = multer({
  storage,
  fileFilter,
<<<<<<< HEAD
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 Mo (CDC §3.1.3)
=======
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
>>>>>>> 70d4349ce362b98ae279bafeba0f294995e85567
});
