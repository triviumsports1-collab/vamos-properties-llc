import Image from "next/image";

export function ListingPhoto({
  src,
  alt,
  priority = false,
  sizes,
  className = "object-cover",
}: {
  src: string;
  alt: string;
  priority?: boolean;
  sizes: string;
  className?: string;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      unoptimized
      referrerPolicy="no-referrer"
      className={className}
    />
  );
}
