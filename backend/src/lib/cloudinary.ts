import { v2 as cloudinary } from "cloudinary";
import type { Request } from "express";

const FOLDER = "msg_app";

export async function uploadFile(
  file: Required<Request>["file"],
  foldername: string,
) {
  const { buffer, mimetype } = file;
  const base64 = Buffer.from(buffer).toString("base64");
  const dataURI = `data:${mimetype};base64,${base64}`;
  const folder = `${FOLDER}/${foldername}`;
  const { secure_url } = await cloudinary.uploader.upload(dataURI, { folder });

  return secure_url;
}
