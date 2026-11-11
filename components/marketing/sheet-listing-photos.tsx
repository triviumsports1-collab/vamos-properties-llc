"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ListingPhoto } from "@/components/marketing/listing-photo";
import { propertyListingStrings } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/routes";

export function SheetListingPhotos({
  photos,
  title,
  children,
  locale,
}: {
  photos: string[];
  title: string;
  children: ReactNode;
  locale: Locale;
}) {
  const [open, setOpen] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const copy = propertyListingStrings[locale];
  const side = photos.slice(1, 5);
  const gallery = photos.slice(1 + side.length);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open == null) {
      if (dialog.open) dialog.close();
      return;
    }
    if (!dialog.open) dialog.showModal();
  }, [open]);

  useEffect(() => {
    if (open == null) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "ArrowRight") setOpen((current) => nextIndex(current, photos.length, 1));
      if (event.key === "ArrowLeft") setOpen((current) => nextIndex(current, photos.length, -1));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, photos.length]);

  return (
    <>
      {photos.length === 0 ? (
        <div className="mt-4 grid aspect-[4/3] place-items-center rounded-2xl border border-line bg-mist text-base text-muted md:aspect-[16/9]">
          {copy.photosEmpty}
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-2 sm:h-[28rem] sm:grid-cols-6 sm:grid-rows-2 md:h-[32rem]">
          <PhotoTile
            photo={photos[0]}
            alt={copy.photoAlt(title, 1, photos.length)}
            onOpen={() => setOpen(0)}
            priority
            className={side.length > 0 ? "rounded-2xl sm:col-span-4 sm:row-span-2" : "rounded-2xl sm:col-span-6 sm:row-span-2"}
            label={photos.length > 1 ? copy.nPhotos(photos.length) : undefined}
            labelOn="mobile"
          />
          {side.map((photo, index) => {
            const photoIndex = index + 1;
            const isLast = index === side.length - 1 && gallery.length > 0;
            const sideClass =
              side.length === 1
                ? "hidden rounded-2xl sm:col-span-2 sm:row-span-2 sm:block"
                : side.length === 2
                  ? "hidden rounded-xl sm:col-span-2 sm:block"
                  : "hidden rounded-xl sm:block";
            return (
              <PhotoTile
                key={`${photo}-${photoIndex}`}
                photo={photo}
                alt={copy.photoAlt(title, photoIndex + 1, photos.length)}
                onOpen={() => setOpen(photoIndex)}
                className={sideClass}
                label={isLast ? copy.allPhotos(photos.length) : undefined}
                labelOn="always"
              />
            );
          })}
        </div>
      )}

      {children}

      {gallery.length > 0 ? (
        <section className="mt-12">
          <div className="flex items-end justify-between gap-3">
            <h2 className="text-xl font-semibold text-ink">{copy.photos}</h2>
            <button
              type="button"
              onClick={() => setOpen(0)}
              className="inline-flex min-h-11 items-center text-sm font-semibold text-pine"
            >
              {copy.viewAll(photos.length)}
            </button>
          </div>
          <ul className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-3">
            {gallery.slice(0, 9).map((photo, index) => {
              const photoIndex = index + 1 + side.length;
              return (
                <li key={`${photo}-${photoIndex}`}>
                  <button
                    type="button"
                    onClick={() => setOpen(photoIndex)}
                    className="block w-full overflow-hidden rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber"
                  >
                    <span className="relative block aspect-[4/3] bg-mist">
                      <ListingPhoto
                        src={photo}
                        alt={copy.photoAlt(title, photoIndex + 1, photos.length)}
                        sizes="(max-width: 768px) 50vw, 33vw"
                      />
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      <dialog
        ref={dialogRef}
        onClose={() => setOpen(null)}
        className="fixed inset-0 z-50 m-0 h-dvh max-h-none w-full max-w-none border-0 bg-transparent p-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] text-ink backdrop:bg-navy/85 open:flex open:items-center open:justify-center"
        aria-label={copy.photos}
      >
        {open != null && photos[open] ? (
          <div className="grid w-full max-w-5xl gap-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-white">{copy.photoOf(open + 1, photos.length)}</p>
              <button
                type="button"
                onClick={() => setOpen(null)}
                className="inline-flex min-h-11 items-center rounded-lg bg-panel px-4 text-sm font-semibold text-ink"
              >
                {copy.close}
              </button>
            </div>
            <div className="relative flex min-h-[12rem] items-center justify-center rounded-2xl bg-navy/40 p-2 md:p-4">
              <img
                src={photos[open]}
                alt={copy.photoAlt(title, open + 1, photos.length)}
                referrerPolicy="no-referrer"
                className="max-h-[min(72vh,40rem)] w-auto max-w-full rounded-lg object-contain"
              />
            </div>
            {photos.length > 1 ? (
              <div className="flex justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(nextIndex(open, photos.length, -1))}
                  className="inline-flex min-h-11 items-center rounded-lg bg-panel px-4 text-sm font-semibold text-ink"
                >
                  {copy.previous}
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(nextIndex(open, photos.length, 1))}
                  className="inline-flex min-h-11 items-center rounded-lg bg-panel px-4 text-sm font-semibold text-ink"
                >
                  {copy.next}
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </dialog>
    </>
  );
}

function PhotoTile({
  photo,
  alt,
  onOpen,
  className,
  label,
  labelOn,
  priority = false,
}: {
  photo: string;
  alt: string;
  onOpen: () => void;
  className?: string;
  label?: string;
  labelOn?: "mobile" | "always";
  priority?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={`relative block aspect-[4/3] min-h-11 overflow-hidden bg-mist focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber sm:aspect-auto sm:h-full ${className ?? ""}`}
    >
      <ListingPhoto
        src={photo}
        alt={alt}
        priority={priority}
        sizes={priority ? "(max-width: 640px) 100vw, 66vw" : "(max-width: 640px) 100vw, 33vw"}
        className="object-cover"
      />
      {label ? (
        <span
          className={`absolute bottom-3 right-3 inline-flex min-h-8 items-center rounded-full bg-navy/85 px-3 text-xs font-semibold text-white ${
            labelOn === "mobile" ? "sm:hidden" : ""
          }`}
        >
          {label}
        </span>
      ) : null}
    </button>
  );
}

function nextIndex(current: number | null, length: number, step: number) {
  if (current == null || length < 1) return 0;
  return (current + step + length) % length;
}
