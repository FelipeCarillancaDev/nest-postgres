export const FileFilter = (req: Express.Request, file: Express.Multer.File, callback: Function) => {
  if (!file) return callback(new Error('OFile is empty!'), false);

  const fileExtension = file.mimetype.split('/')[1];
  const validExtensions = ['jpg', 'jpeg', 'png', 'gif'];
  if (validExtensions.includes(fileExtension)) {
    return callback(null, true);
  }
  callback(null, false);
};
