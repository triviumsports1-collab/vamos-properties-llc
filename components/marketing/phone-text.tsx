import { Fragment } from "react";
import { site } from "@/lib/site";

/**
 * Renders a plain string with every appearance of the business number turned into a
 * tap-to-call link. Use it wherever copy or server messages mention the phone as text,
 * so no visible instance of the number is left unclickable. Hook-free: works in server
 * and client components alike.
 */
export function PhoneText({ text, linkClassName = "font-semibold text-link underline" }: { text: string; linkClassName?: string }) {
  const parts = text.split(site.phoneDisplay);
  if (parts.length === 1) return <>{text}</>;
  return (
    <>
      {parts.map((part, index) => (
        <Fragment key={index}>
          {part}
          {index < parts.length - 1 ? (
            <a href={site.phoneTel} className={linkClassName}>
              {site.phoneDisplay}
            </a>
          ) : null}
        </Fragment>
      ))}
    </>
  );
}
