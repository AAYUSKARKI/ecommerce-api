import type { ServerUser } from "@/api/user/userModel";
import type { UploadedFile } from "multer"; // If using multer

declare global {
  namespace Express {
    interface Request {
      user?: ServerUser; // Make user property optional
      file?: UploadedFile;
    }
  }
}
