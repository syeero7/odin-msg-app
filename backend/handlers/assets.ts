import { asyncHandler } from "@/lib/async-handler.js";
import { uploadFile } from "@/lib/cloudinary.js";
import { upload } from "@/lib/multer.js";

export const uploadImage = [
  upload.single("image"),
  asyncHandler(async (req, res) => {
    if (!req.file) return res.sendStatus(400);
    const userId = req.user!.id;
    const url = await uploadFile(req.file, `u-${userId}`);
    res.status(201).json({ url });
  }),
];
