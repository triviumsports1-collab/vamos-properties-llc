"use client";

import { type FormEvent, useState } from "react";
import { AddressAutocomplete } from "@/components/marketing/address-autocomplete";

export function AddressLookup() {
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");

  function go(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    send(address);
  }

  function send(raw: string) {
    const value = raw.trim();
    if (value.length < 5) {
      setError("Enter the street address so we know which house.");
      return;
    }
    setError("");
    sessionStorage.setItem("vamos-address", value);
    window.dispatchEvent(new CustomEvent("vamos-address", { detail: value }));
    document.getElementById("offer")?.scrollIntoView({ behavior: "smooth" });
    window.setTimeout(() => {
      document.getElementById("name")?.focus();
    }, 350);
  }

  return (
    <form onSubmit={go} className="mx-auto mt-8 w-full max-w-2xl text-left">
      <label htmlFor="hero-address" className="block text-sm text-white/90">
        Your address
      </label>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        {/* The box is always white, so its text uses fixed dark colors instead of theme tokens (which turn light in dark mode). */}
        <AddressAutocomplete
          id="hero-address"
          value={address}
          onChange={setAddress}
          onSelect={send}
          tone="hero"
          placeholder="1234 W Example Ave, Phoenix"
          className="min-h-14 w-full bg-white px-4 text-base text-[#142033] caret-[#142033] [color-scheme:light] placeholder:text-[#5c6b7c]"
        />
        <button
          type="submit"
          className="min-h-14 shrink-0 bg-amber px-7 text-base font-semibold text-amber-ink"
        >
          Get your cash offer
        </button>
      </div>
      {error ? (
        <p className="mt-2 text-sm text-amber" role="alert">
          {error}
        </p>
      ) : (
        <p className="mt-2 text-sm text-white/70">No fee to ask. You can say no.</p>
      )}
    </form>
  );
}
