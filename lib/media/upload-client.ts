"use client";

import { prepareMediaUpload, saveMediaUpload } from "@/lib/admin/media-actions";
import { isHeic, mediaRule } from "@/lib/media/files";

export function putFile(url: string, file: File, onProgress: (percent: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error("upload"));
    };
    xhr.onerror = () => reject(new Error("upload"));
    xhr.send(file);
  });
}

export type ImageUploadResult = { ok: true; url: string } | { ok: false; message: string };

/**
 * Uploads one image to S3 through the media library (presigned PUT, then registered as a
 * MediaAsset), converting HEIC to JPEG first. Only JPEG, PNG, and WebP are accepted.
 */
export async function uploadImageToLibrary(
  file: File,
  options: { folder: string; onStage?: (label: string, percent: number) => void },
): Promise<ImageUploadResult> {
  const stage = options.onStage ?? (() => undefined);
  let upload = file;
  if (isHeic(file.name, file.type)) {
    stage("Converting HEIC", 0);
    try {
      const heic2any = (await import("heic2any")).default;
      const converted = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.9 });
      const blob = Array.isArray(converted) ? converted[0] : converted;
      upload = new File([blob], file.name.replace(/\.hei[cf]$/i, "") + ".jpg", { type: "image/jpeg" });
    } catch {
      return { ok: false, message: "Export this HEIC file as a JPEG and try again." };
    }
  }
  const rule = mediaRule(upload.type);
  if (!rule || rule.kind !== "image") {
    return { ok: false, message: "Use a JPEG, PNG, WebP, or HEIC photo." };
  }
  if (upload.size > rule.maxBytes) {
    return { ok: false, message: "That photo is larger than the library accepts." };
  }
  const prepared = await prepareMediaUpload({
    fileName: upload.name,
    contentType: upload.type,
    sizeBytes: upload.size,
    folder: options.folder,
  });
  if (!prepared.ok) return { ok: false, message: prepared.message };
  stage("Uploading", 0);
  try {
    await putFile(prepared.uploadUrl, upload, (percent) => stage("Uploading", percent));
  } catch {
    return { ok: false, message: "Storage did not accept the file. Check the bucket CORS rule for PUT." };
  }
  stage("Saving", 100);
  const saved = await saveMediaUpload({
    key: prepared.key,
    fileName: prepared.fileName,
    contentType: prepared.contentType,
    sizeBytes: upload.size,
    folder: prepared.folder,
  });
  if (!saved.ok) return { ok: false, message: saved.message };
  return { ok: true, url: saved.asset.url };
}
