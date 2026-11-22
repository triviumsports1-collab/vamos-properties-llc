"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { prepareMediaUpload, removeMedia, saveMediaUpload } from "@/lib/admin/media-actions";
import type { MediaAssetView } from "@/lib/dal/media";
import { formatBytes, isHeic, mediaRule } from "@/lib/media/files";
import { putFile } from "@/lib/media/upload-client";

type UploadRow = {
  id: string;
  name: string;
  percent: number;
  label: string;
  error: string;
};

export function MediaLibrary({
  assets,
  configured,
  query,
  kind,
}: {
  assets: MediaAssetView[];
  configured: boolean;
  query: string;
  kind: string;
}) {
  const router = useRouter();
  const [folder, setFolder] = useState("");
  const [dragging, setDragging] = useState(false);
  const [rows, setRows] = useState<UploadRow[]>([]);
  const [notice, setNotice] = useState("");
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const folders = useMemo(() => {
    const names = new Set<string>();
    for (const asset of assets) {
      if (asset.folder) names.add(asset.folder);
    }
    return [...names].sort();
  }, [assets]);

  function patch(id: string, next: Partial<UploadRow>) {
    setRows((current) => current.map((row) => (row.id === id ? { ...row, ...next } : row)));
  }

  async function uploadFile(file: File, folderName: string) {
    const id = crypto.randomUUID();
    setRows((current) => [{ id, name: file.name, percent: 0, label: "Checking the file", error: "" }, ...current]);
    let upload = file;
    if (isHeic(file.name, file.type)) {
      patch(id, { label: "Converting HEIC" });
      try {
        const heic2any = (await import("heic2any")).default;
        const converted = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.9 });
        const blob = Array.isArray(converted) ? converted[0] : converted;
        const name = file.name.replace(/\.hei[cf]$/i, "") + ".jpg";
        upload = new File([blob], name, { type: "image/jpeg" });
      } catch {
        patch(id, { label: "Could not convert", error: "Export this HEIC file as a JPEG and try again." });
        return;
      }
    }
    const rule = mediaRule(upload.type);
    if (!rule) {
      patch(id, { label: "Skipped", error: "Use a JPEG, PNG, WebP, MP4, MOV, PDF, or HEIC photo." });
      return;
    }
    if (upload.size > rule.maxBytes) {
      patch(id, { label: "Too large", error: "That file is larger than this library accepts." });
      return;
    }
    const prepared = await prepareMediaUpload({
      fileName: upload.name,
      contentType: upload.type,
      sizeBytes: upload.size,
      folder: folderName,
    });
    if (!prepared.ok) {
      patch(id, { label: "Not stored", error: prepared.message });
      return;
    }
    patch(id, { label: "Uploading", percent: 0 });
    try {
      await putFile(prepared.uploadUrl, upload, (percent) => patch(id, { percent }));
    } catch {
      patch(id, { label: "Upload failed", error: "Storage did not accept the file. Check the bucket CORS rule for PUT." });
      return;
    }
    patch(id, { label: "Saving", percent: 100 });
    const saved = await saveMediaUpload({
      key: prepared.key,
      fileName: prepared.fileName,
      contentType: prepared.contentType,
      sizeBytes: upload.size,
      folder: prepared.folder,
    });
    if (!saved.ok) {
      patch(id, { label: "Not saved", error: saved.message });
      return;
    }
    patch(id, { label: "In the library", percent: 100 });
    router.refresh();
  }

  async function onFiles(list: FileList | File[]) {
    if (!configured) {
      setNotice("Add the AWS storage settings before uploading.");
      return;
    }
    const folderName = folder.trim();
    if (folderName && !/^[a-z0-9][a-z0-9 -]*$/i.test(folderName)) {
      setNotice("Use letters, numbers, and spaces for the folder.");
      return;
    }
    setNotice("");
    const files = [...list].filter((file) => file.size > 0);
    for (const file of files) {
      await uploadFile(file, folderName);
    }
  }

  async function copyLink(asset: MediaAssetView) {
    try {
      await navigator.clipboard.writeText(asset.url);
      setCopiedId(asset.id);
      window.setTimeout(() => setCopiedId((current) => (current === asset.id ? null : current)), 1500);
    } catch {
      setNotice("The link could not be copied. Select it from the open page instead.");
    }
  }

  async function remove(asset: MediaAssetView) {
    if (!window.confirm(`Remove ${asset.fileName} from the library?`)) return;
    const result = await removeMedia(asset.id);
    setNotice(result.message);
    if (result.ok) router.refresh();
  }

  return (
    <div>
      <form className="grid gap-3 border border-line bg-panel p-4 sm:grid-cols-[minmax(0,1fr)_12rem_auto]" action="/admin/media">
        <div>
          <label htmlFor="media-search" className="text-sm text-ink">
            Search
          </label>
          <input
            id="media-search"
            name="q"
            defaultValue={query}
            placeholder="File name or folder"
            className="mt-1 w-full border border-line bg-paper px-3 py-3 text-base text-ink"
          />
        </div>
        <div>
          <label htmlFor="media-kind" className="text-sm text-ink">
            Type
          </label>
          <select id="media-kind" name="kind" defaultValue={kind} className="mt-1 w-full border border-line bg-paper px-3 py-3 text-base text-ink">
            <option value="">Everything</option>
            <option value="image">Images</option>
            <option value="video">Videos</option>
            <option value="document">Documents</option>
          </select>
        </div>
        <button type="submit" className="inline-flex min-h-12 items-end self-end bg-navy px-4 text-base font-semibold text-white">
          Search
        </button>
      </form>

      <div className="mt-4 border border-line bg-panel p-4">
        <label htmlFor="media-folder" className="text-sm text-ink">
          Folder for the next upload
        </label>
        <input
          id="media-folder"
          value={folder}
          onChange={(event) => setFolder(event.target.value)}
          list="media-folders"
          placeholder="Listings, or leave blank"
          className="mt-1 w-full border border-line bg-paper px-3 py-3 text-base text-ink"
        />
        <datalist id="media-folders">
          {folders.map((name) => (
            <option key={name} value={name} />
          ))}
        </datalist>
        <label
          htmlFor="media-files"
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            void onFiles(event.dataTransfer.files);
          }}
          className={`mt-4 flex min-h-32 cursor-pointer flex-col items-center justify-center border border-dashed px-4 py-6 text-center ${dragging ? "border-amber bg-amber/10" : "border-line"}`}
        >
          <span className="text-base font-semibold text-ink">Drop files here, or choose them</span>
          <span className="mt-2 max-w-md text-sm leading-6 text-muted">
            JPEG, PNG, WebP, HEIC, MP4, MOV, and PDF. HEIC photos are converted to JPEG in the browser before they go to storage.
          </span>
          <input
            id="media-files"
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif,video/mp4,video/quicktime,.mov,application/pdf"
            className="sr-only"
            onChange={(event) => {
              if (event.target.files) void onFiles(event.target.files);
              event.target.value = "";
            }}
          />
        </label>
        {configured ? null : (
          <p className="mt-3 text-sm leading-6 text-muted">
            Add AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, and AWS_BUCKET_NAME before uploading. Public links need GetObject on the media prefix, and the bucket CORS rule needs to allow PUT from this site.
          </p>
        )}
        {notice ? <p className="mt-3 text-sm text-ink">{notice}</p> : null}
        {rows.length > 0 ? (
          <ul className="mt-4 grid gap-2">
            {rows.map((row) => (
              <li key={row.id} className="border border-line px-3 py-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-ink">{row.name}</p>
                  <p className="text-sm text-muted">{row.label}</p>
                </div>
                <div className="mt-2 h-1.5 bg-mist">
                  <div className="h-full bg-amber" style={{ width: `${row.percent}%` }} />
                </div>
                {row.error ? <p className="mt-2 text-sm text-ink">{row.error}</p> : null}
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {assets.length === 0 ? (
        <p className="mt-6 border border-line bg-panel px-4 py-6 text-base text-ink">
          {query || kind ? "Nothing in the library matches that search." : "The library is empty. Drop a file above to add the first one."}
        </p>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {assets.map((asset) => (
            <li key={asset.id} className="border border-line bg-panel">
              <div className="flex h-40 items-center justify-center bg-mist">
                {asset.kind === "image" ? (
                  // S3 hosts are configured per bucket, so the admin preview stays a plain image.
                  <img src={asset.url} alt={asset.alt || asset.fileName} className="h-full w-full object-contain" />
                ) : asset.kind === "video" ? (
                  <video src={asset.url} className="h-full w-full object-contain" muted preload="metadata" />
                ) : (
                  <span className="text-sm font-semibold tracking-wide text-ink">PDF</span>
                )}
              </div>
              <div className="p-4">
                <p className="truncate text-base font-semibold text-ink">{asset.fileName}</p>
                <p className="mt-1 text-sm text-muted">
                  {asset.kind} · {formatBytes(asset.sizeBytes)}
                  {asset.folder ? ` · ${asset.folder}` : ""}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button" onClick={() => void copyLink(asset)} className="inline-flex min-h-11 items-center border border-line px-3 text-sm font-semibold text-ink">
                    {copiedId === asset.id ? "Copied" : "Copy link"}
                  </button>
                  <a href={asset.url} className="inline-flex min-h-11 items-center px-3 text-sm font-semibold text-link" target="_blank" rel="noreferrer">
                    Open
                  </a>
                  <button type="button" onClick={() => void remove(asset)} className="inline-flex min-h-11 items-center px-3 text-sm text-ink">
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
