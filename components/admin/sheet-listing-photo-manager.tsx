"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FormNotice, Spinner } from "@/components/admin/status-form";
import { idleForm } from "@/lib/admin/schema";
import { saveSheetListingPhotosForm } from "@/lib/gdoc-listings/admin-actions";
import { MAX_LISTING_PHOTOS } from "@/lib/gdoc-listings/admin-schema";
import type { SheetListingAdminDetail } from "@/lib/gdoc-listings/types";
import { uploadImageToLibrary } from "@/lib/media/upload-client";

type Photo = { id: string; url: string };

type UploadRow = { id: string; name: string; label: string; percent: number; error: string };

const UPLOAD_FOLDER = "Listings";

export function SheetListingPhotoManager({
  listing,
  storageReady,
}: {
  listing: SheetListingAdminDetail;
  storageReady: boolean;
}) {
  const router = useRouter();
  const [state, action, pending] = useActionState(saveSheetListingPhotosForm, idleForm);
  const [photos, setPhotos] = useState<Photo[]>(() => listing.photos.map((url) => ({ id: newId(), url })));
  const [keepOnSync, setKeepOnSync] = useState(
    // First desk edit defaults to protecting the photos; after that, respect the saved choice.
    listing.photosUpdatedAt ? listing.photosOverride : true,
  );
  const [dirty, setDirty] = useState(false);
  const [linkText, setLinkText] = useState("");
  const [notice, setNotice] = useState("");
  const [uploads, setUploads] = useState<UploadRow[]>([]);
  const [replacing, setReplacing] = useState<string | null>(null);
  const [replaceLink, setReplaceLink] = useState("");
  const [dragId, setDragId] = useState<string | null>(null);
  const [dropping, setDropping] = useState(false);
  const [broken, setBroken] = useState<Set<string>>(() => new Set());
  const replaceFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // The page remounts this panel (keyed on photosUpdatedAt) after refresh, which clears `dirty`.
    if (state.stamp && state.ok) router.refresh();
  }, [state.stamp, state.ok, router]);

  function update(next: (current: Photo[]) => Photo[]) {
    setPhotos(next);
    setDirty(true);
  }

  function hasRoom(extra = 1) {
    if (photos.length + extra > MAX_LISTING_PHOTOS) {
      setNotice(`A home can show up to ${MAX_LISTING_PHOTOS} photos. Remove some first.`);
      return false;
    }
    return true;
  }

  function addLinks() {
    const links = linkText
      .split(/[\n,\s]+/)
      .map((item) => item.trim())
      .filter(Boolean);
    if (links.length === 0) return;
    const bad = links.find((item) => !looksLikeImageLink(item));
    if (bad) {
      setNotice("Use full https links, like https://example.com/photo.jpg.");
      return;
    }
    if (!hasRoom(links.length)) return;
    setNotice("");
    update((current) => [...current, ...links.map((url) => ({ id: newId(), url }))]);
    setLinkText("");
  }

  function patchUpload(id: string, next: Partial<UploadRow>) {
    setUploads((current) => current.map((row) => (row.id === id ? { ...row, ...next } : row)));
  }

  async function uploadOne(file: File) {
    const id = newId();
    setUploads((current) => [{ id, name: file.name, label: "Checking the file", percent: 0, error: "" }, ...current]);
    const result = await uploadImageToLibrary(file, {
      folder: UPLOAD_FOLDER,
      onStage: (label, percent) => patchUpload(id, { label, percent }),
    });
    if (!result.ok) {
      patchUpload(id, { label: "Not added", error: result.message });
      return null;
    }
    patchUpload(id, { label: "Added — save photos to publish", percent: 100 });
    return result.url;
  }

  async function onFiles(list: FileList | File[]) {
    if (!storageReady) {
      setNotice("Add the AWS storage settings before uploading. You can still add photo links.");
      return;
    }
    const files = [...list].filter((file) => file.size > 0);
    if (files.length === 0 || !hasRoom(files.length)) return;
    setNotice("");
    for (const file of files) {
      const url = await uploadOne(file);
      if (url) update((current) => [...current, { id: newId(), url }]);
    }
  }

  async function replaceWithFile(file: File | undefined) {
    const target = replacing;
    if (!file || !target) return;
    if (!storageReady) {
      setNotice("Add the AWS storage settings before uploading. You can still replace with a link.");
      return;
    }
    const url = await uploadOne(file);
    if (!url) return;
    update((current) => current.map((photo) => (photo.id === target ? { id: newId(), url } : photo)));
    setReplacing(null);
  }

  function replaceWithLink() {
    const url = replaceLink.trim();
    if (!replacing || !url) return;
    if (!looksLikeImageLink(url)) {
      setNotice("Use a full https link, like https://example.com/photo.jpg.");
      return;
    }
    setNotice("");
    const target = replacing;
    update((current) => current.map((photo) => (photo.id === target ? { id: newId(), url } : photo)));
    setReplacing(null);
    setReplaceLink("");
  }

  function move(id: string, offset: number) {
    update((current) => {
      const from = current.findIndex((photo) => photo.id === id);
      const to = from + offset;
      if (from < 0 || to < 0 || to >= current.length) return current;
      const next = [...current];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  }

  function moveTo(id: string, targetId: string) {
    if (id === targetId) return;
    update((current) => {
      const from = current.findIndex((photo) => photo.id === id);
      const to = current.findIndex((photo) => photo.id === targetId);
      if (from < 0 || to < 0) return current;
      const next = [...current];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  }

  function remove(id: string) {
    update((current) => current.filter((photo) => photo.id !== id));
    if (replacing === id) setReplacing(null);
  }

  return (
    <section className="mt-8 border border-line bg-panel p-5" aria-labelledby="listing-photos-heading">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="listing-photos-heading" className="text-lg font-semibold text-ink">
          Photos
        </h2>
        <p className="text-sm text-muted">
          {photos.length} of {MAX_LISTING_PHOTOS}
          {dirty ? " · unsaved changes" : ""}
        </p>
      </div>
      <p className="mt-1 text-sm text-muted">
        The first photo is the cover on the catalog card and the large photo on the home page. Drag photos or use the
        arrows to reorder.
      </p>

      <form action={action} className="mt-4 grid gap-4" aria-busy={pending}>
        <FormNotice state={state} />
        {notice ? (
          <p role="alert" className="border border-line bg-mist px-3 py-2 text-sm text-ink">
            {notice}
          </p>
        ) : null}
        <input type="hidden" name="slug" value={listing.id} />
        <input type="hidden" name="photos" value={JSON.stringify(photos.map((photo) => photo.url))} />

        {photos.length === 0 ? (
          <p className="grid min-h-32 place-items-center border border-dashed border-line bg-paper px-4 text-center text-base text-muted">
            No photos yet. Upload photos or add image links below.
          </p>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {photos.map((photo, index) => (
              <li
                key={photo.id}
                draggable
                onDragStart={() => setDragId(photo.id)}
                onDragEnd={() => setDragId(null)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  if (dragId) moveTo(dragId, photo.id);
                  setDragId(null);
                }}
                className={`flex flex-col border bg-paper ${dragId === photo.id ? "border-amber opacity-60" : "border-line"}`}
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-mist">
                  {broken.has(photo.url) ? (
                    <span className="grid h-full place-items-center px-2 text-center text-sm text-muted">
                      Preview did not load. Check the link.
                    </span>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element -- admin preview of arbitrary remote photos
                    <img
                      src={photo.url}
                      alt={`Photo ${index + 1}`}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      onError={() => setBroken((current) => new Set(current).add(photo.url))}
                      className="h-full w-full object-cover"
                    />
                  )}
                  <span className="absolute left-2 top-2 bg-ink/80 px-2 py-0.5 text-xs font-semibold text-white">
                    {index === 0 ? "Cover" : index + 1}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 p-2">
                  {index > 0 ? (
                    <SmallButton onClick={() => move(photo.id, -index)} label="Make cover" />
                  ) : null}
                  <SmallButton onClick={() => move(photo.id, -1)} label="←" title="Move earlier" disabled={index === 0} />
                  <SmallButton
                    onClick={() => move(photo.id, 1)}
                    label="→"
                    title="Move later"
                    disabled={index === photos.length - 1}
                  />
                  <SmallButton
                    onClick={() => {
                      setReplacing(replacing === photo.id ? null : photo.id);
                      setReplaceLink("");
                    }}
                    label="Replace"
                  />
                  <SmallButton onClick={() => remove(photo.id)} label="Remove" />
                </div>
                {replacing === photo.id ? (
                  <div className="grid gap-2 border-t border-line p-2">
                    <label className="text-xs text-ink" htmlFor={`replace-${photo.id}`}>
                      New image link
                    </label>
                    <input
                      id={`replace-${photo.id}`}
                      value={replaceLink}
                      onChange={(event) => setReplaceLink(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          replaceWithLink();
                        }
                      }}
                      placeholder="https://…"
                      className="min-h-10 w-full border border-line bg-paper px-2 text-sm text-ink"
                    />
                    <div className="flex flex-wrap gap-1">
                      <SmallButton onClick={replaceWithLink} label="Use link" />
                      <SmallButton onClick={() => replaceFileRef.current?.click()} label="Upload file" disabled={!storageReady} />
                    </div>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}

        <input
          ref={replaceFileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
          className="sr-only"
          tabIndex={-1}
          onChange={(event) => {
            void replaceWithFile(event.target.files?.[0]);
            event.target.value = "";
          }}
        />

        <label
          htmlFor="listing-photo-files"
          onDragOver={(event) => {
            if (dragId) return;
            event.preventDefault();
            setDropping(true);
          }}
          onDragLeave={() => setDropping(false)}
          onDrop={(event) => {
            if (dragId) return;
            event.preventDefault();
            setDropping(false);
            void onFiles(event.dataTransfer.files);
          }}
          className={`flex min-h-24 cursor-pointer flex-col items-center justify-center border border-dashed px-4 py-5 text-center ${dropping ? "border-amber bg-amber/10" : "border-line bg-paper"}`}
        >
          <span className="text-base font-semibold text-ink">Upload photos</span>
          <span className="mt-1 text-sm text-muted">
            {storageReady
              ? "Drop JPEG, PNG, WebP, or HEIC files here, or tap to choose. They also go into the media library."
              : "Media storage is not configured. Add photo links instead."}
          </span>
          <input
            id="listing-photo-files"
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
            disabled={!storageReady}
            className="sr-only"
            onChange={(event) => {
              if (event.target.files) void onFiles(event.target.files);
              event.target.value = "";
            }}
          />
        </label>

        {uploads.length > 0 ? (
          <ul className="grid gap-1 text-sm">
            {uploads.map((row) => (
              <li key={row.id} className="flex flex-wrap justify-between gap-2 border border-line bg-paper px-3 py-2">
                <span className="truncate text-ink">{row.name}</span>
                <span className={row.error ? "text-ink" : "text-muted"}>
                  {row.error ? `${row.label}: ${row.error}` : row.label === "Uploading" ? `Uploading ${row.percent}%` : row.label}
                </span>
              </li>
            ))}
          </ul>
        ) : null}

        <div>
          <label className="block text-sm text-ink" htmlFor="listing-photo-links">
            Add image links
          </label>
          <textarea
            id="listing-photo-links"
            rows={2}
            value={linkText}
            onChange={(event) => setLinkText(event.target.value)}
            placeholder="One https link per line. Google Drive file links work too."
            className="mt-1 w-full border border-line bg-paper px-3 py-3 text-base text-ink"
          />
          <button
            type="button"
            onClick={addLinks}
            className="mt-2 inline-flex min-h-11 items-center border border-line bg-paper px-4 text-base text-ink"
          >
            Add links
          </button>
        </div>

        <label className="flex min-h-12 items-center gap-3 text-base text-ink">
          <input
            type="checkbox"
            name="keepOnSync"
            value="yes"
            checked={keepOnSync}
            onChange={(event) => {
              setKeepOnSync(event.target.checked);
              setDirty(true);
            }}
            className="size-5"
          />
          Keep these photos when the Google Sheet is copied again
        </label>
        <p className="-mt-2 text-sm text-muted">
          {listing.photosOverride
            ? "This home uses desk photos. Turn this off and save to let the next sheet copy bring back the sheet's photos."
            : "Leave this on so the sheet copy does not overwrite your photo changes. Other sheet fields still update."}
        </p>

        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-12 items-center justify-center gap-2 bg-amber px-4 text-base font-semibold text-amber-ink disabled:opacity-60"
        >
          {pending ? <Spinner label="Saving…" /> : "Save photos"}
        </button>
      </form>
    </section>
  );
}

function SmallButton({
  onClick,
  label,
  title,
  disabled = false,
}: {
  onClick: () => void;
  label: string;
  title?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title ?? label}
      disabled={disabled}
      className="inline-flex min-h-9 items-center border border-line bg-paper px-2 text-sm text-ink disabled:opacity-40"
    >
      {label}
    </button>
  );
}

function looksLikeImageLink(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function newId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
