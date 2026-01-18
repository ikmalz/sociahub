import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ensureUploadsDir = () => {
  const uploadsDir = path.join(__dirname, "../uploads");

  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log("📁 Created uploads directory at:", uploadsDir);
  }
  
  return uploadsDir;
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadsDir = ensureUploadsDir();
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, "post-" + uniqueSuffix + ext);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedImage = /jpeg|jpg|png|gif|webp/;
  const allowedVideo = /mp4|mov|avi|mkv|webm/;

  const ext = path.extname(file.originalname).toLowerCase().replace(".", "");
  const mime = file.mimetype;

  const isImage = allowedImage.test(ext) && mime.startsWith("image/");
  const isVideo = allowedVideo.test(ext) && mime.startsWith("video/");

  if (isImage || isVideo) {
    return cb(null, true);
  }

  cb(new Error("Only image or video files are allowed!"));
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024,
  },

  fileFilter: fileFilter,
});

export default upload;
