"use client";

import { useState } from "react";

export type SheetGalleryGroup = {
  id: string;
  label: string;
  photos: string[];
};

export function SheetListingGalleries({
  galleries,
  title,
}: {
  galleries: SheetGalleryGroup[];
  title: string;
}) {
  if (galleries.length === 0) {
    return (
      <p className="grid aspect-[16/10] place-items-center border border-line bg-mist text-base text-muted">
        Photos are not up yet.
      </p>
    );
  }

  return (
    <div className="grid gap-6">
      {galleries.map((gallery) => (
        <SheetGallery key={gallery.id} gallery={gallery} title={title} showLabel={galleries.length > 1} />
      ))}
    </div>
  );
}

function SheetGallery({
  gallery,
  title,
  showLabel,
}: {
  gallery: SheetGalleryGroup;
  title: string;
  showLabel: boolean;
}) {
  const [index, setIndex] = useState(0);
  const current = gallery.photos[index] ?? gallery.photos[0];
  if (!current) return null;

  return (
    <div>
      {showLabel ? <p className="mb-2 text-sm font-semibold uppercase tracking-[0.16em] text-link">{gallery.label}</p> : null}
      <a href={current} target="_blank" rel="noreferrer" className="block">
        <img
          src={current}
          alt={`${title}, ${gallery.label.toLowerCase()} ${index + 1} of ${gallery.photos.length}`}
          referrerPolicy="no-referrer"
          className="aspect-[16/10] w-full bg-mist object-cover"
        />
      </a>
      {gallery.photos.length > 1 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {gallery.photos.map((photo, photoIndex) => (
            <a
              key={`${gallery.id}-${photo}`}
              href={photo}
              target="_blank"
              rel="noreferrer"
              aria-current={photoIndex === index ? "true" : undefined}
              aria-label={`${gallery.label} photo ${photoIndex + 1}`}
              onClick={(event) => {
                event.preventDefault();
                setIndex(photoIndex);
              }}
              className={`inline-flex h-16 min-h-11 w-24 shrink-0 border ${photoIndex === index ? "border-navy" : "border-line"}`}
            >
              <img src={photo} alt="" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
            </a>
          ))}
        </div>
      ) : null}
    </div>
  );
}
