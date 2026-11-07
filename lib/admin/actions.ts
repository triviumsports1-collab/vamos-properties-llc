"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  assignSchema,
  listingSchema,
  loginSchema,
  noteSchema,
  statusSchema,
  touchSchema,
  type AdminFormState,
  type LoginState,
} from "@/lib/admin/schema";
import { ADMIN_COOKIE, sealSession, sessionCookieOptions } from "@/lib/admin/session";
import { dummyPasswordHash, verifyPassword } from "@/lib/admin/password";
import { isLeadStatus } from "@/lib/admin/pipeline";
import { sendSellerFollowUp } from "@/lib/admin/mail";
import { allowLead } from "@/lib/leads/rate-limit";
import { addLeadNote, assignLead, changeLeadStatus, logLeadTouch, recordEmailEvent } from "@/lib/dal/admin";
import { storeListingPhotos } from "@/lib/admin/uploads";
import { saveListing } from "@/lib/dal/listings";
import { parseDollars } from "@/lib/listings/money";
import { bootstrapAdminIfEmpty, findUserForLogin } from "@/lib/dal/users";

function field(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function failed(message: string): AdminFormState {
  return { ok: false, message, stamp: Date.now() };
}

function saved(message: string): AdminFormState {
  return { ok: true, message, stamp: Date.now() };
}

function refreshLead(leadId: number) {
  revalidatePath("/admin");
  revalidatePath("/admin/pipeline");
  revalidatePath("/admin/bank");
  revalidatePath(`/admin/leads/${leadId}`);
}

function refreshListings(slug?: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/listings");
  revalidatePath("/listings");
  revalidatePath("/homes");
  if (slug) revalidatePath(`/listings/${slug}`);
}

export async function loginAdmin(_previous: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: field(formData, "email"),
    password: field(formData, "password"),
  });
  if (!parsed.success) {
    return { message: "Enter the email and password for this desk." };
  }

  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!allowLead(`login:${ip}`, 8, 15 * 60 * 1000)) {
    return { message: "Too many sign-in tries. Wait a few minutes and try again." };
  }

  try {
    await bootstrapAdminIfEmpty();
    const user = await findUserForLogin(parsed.data.email);
    const passwordOk = verifyPassword(parsed.data.password, user?.passwordHash ?? dummyPasswordHash);
    if (!user || !passwordOk) {
      return { message: "That email or password is not right." };
    }
    const token = sealSession(user.id);
    if (!token) {
      return { message: "Sign-in is not configured on this server." };
    }
    const jar = await cookies();
    jar.set(ADMIN_COOKIE, token, sessionCookieOptions());
  } catch (error) {
    console.error("admin_login_failed", {
      id: randomUUID(),
      name: error instanceof Error ? error.name : "Error",
      message: error instanceof Error ? error.message : String(error),
    });
    return { message: "Sign-in did not complete. Try again in a moment." };
  }

  redirect("/admin");
}

export async function logoutAdmin() {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE);
  redirect("/admin/login");
}

export async function updateLeadStatus(_previous: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const parsed = statusSchema.safeParse({
    leadId: field(formData, "leadId"),
    status: field(formData, "status"),
    lostReason: field(formData, "lostReason"),
  });
  if (!parsed.success || !isLeadStatus(parsed.data.status)) {
    return failed("Check the status and try again.");
  }

  try {
    const result = await changeLeadStatus(parsed.data.leadId, parsed.data.status, parsed.data.lostReason);
    if (result.ok) refreshLead(parsed.data.leadId);
    return result.ok ? saved(result.message) : failed(result.message);
  } catch (error) {
    console.error("admin_status_failed", {
      id: randomUUID(),
      name: error instanceof Error ? error.name : "Error",
    });
    return failed("That status did not save. Try again.");
  }
}

export async function saveLeadNote(_previous: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const parsed = noteSchema.safeParse({
    leadId: field(formData, "leadId"),
    body: field(formData, "body"),
  });
  if (!parsed.success) {
    return failed(parsed.error.issues[0]?.message ?? "Write a short note.");
  }

  try {
    const result = await addLeadNote(parsed.data.leadId, parsed.data.body);
    if (result.ok) refreshLead(parsed.data.leadId);
    return result.ok ? saved(result.message) : failed(result.message);
  } catch (error) {
    console.error("admin_note_failed", {
      id: randomUUID(),
      name: error instanceof Error ? error.name : "Error",
    });
    return failed("That note did not save. Try again.");
  }
}

export async function saveLeadAssignment(_previous: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const parsed = assignSchema.safeParse({
    leadId: field(formData, "leadId"),
    assignedToId: field(formData, "assignedToId"),
  });
  if (!parsed.success) {
    return failed("Pick a person on the team.");
  }

  const raw = parsed.data.assignedToId;
  const assignedToId = raw === "" ? null : Number(raw);
  if (assignedToId !== null && (!Number.isInteger(assignedToId) || assignedToId < 1)) {
    return failed("Pick a person on the team.");
  }

  try {
    const result = await assignLead(parsed.data.leadId, assignedToId);
    if (result.ok) refreshLead(parsed.data.leadId);
    return result.ok ? saved(result.message) : failed(result.message);
  } catch (error) {
    console.error("admin_assign_failed", {
      id: randomUUID(),
      name: error instanceof Error ? error.name : "Error",
    });
    return failed("That assignment did not save. Try again.");
  }
}

export async function saveLeadTouch(_previous: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const parsed = touchSchema.safeParse({
    leadId: field(formData, "leadId"),
    channel: field(formData, "channel"),
    direction: field(formData, "direction") || "out",
    subject: field(formData, "subject"),
    body: field(formData, "body"),
  });
  if (!parsed.success) {
    return failed(parsed.error.issues[0]?.message ?? "Check the message and try again.");
  }

  try {
    const result = await logLeadTouch(parsed.data.leadId, parsed.data);
    if (!result.ok) return failed(result.message);
    if (result.kind === "email") {
      const delivery = await sendSellerFollowUp({
        to: result.email,
        subject: parsed.data.subject,
        text: `${parsed.data.body}\n\nVamos Properties LLC\nAbout: ${result.address}`,
      });
      const note =
        delivery === "sent"
          ? `Sent to ${result.email}. Subject: ${parsed.data.subject}\n\n${parsed.data.body}`
          : delivery === "skipped"
            ? `Draft saved. Resend is not configured, so this was not sent.\nSubject: ${parsed.data.subject}\n\n${parsed.data.body}`
            : `Could not send to ${result.email}. Draft kept.\nSubject: ${parsed.data.subject}\n\n${parsed.data.body}`;
      await recordEmailEvent(parsed.data.leadId, note, delivery === "sent");
      refreshLead(parsed.data.leadId);
      return saved(delivery === "sent" ? "Email sent." : delivery === "skipped" ? "Draft saved. Email is not configured." : "Draft saved. The email did not send.");
    }
    refreshLead(parsed.data.leadId);
    return saved(result.message);
  } catch (error) {
    console.error("admin_touch_failed", {
      id: randomUUID(),
      name: error instanceof Error ? error.name : "Error",
    });
    return failed("That did not save. Try again.");
  }
}

export async function saveListingForm(_previous: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const parsed = listingSchema.safeParse({
    listingId: field(formData, "listingId"),
    title: field(formData, "title"),
    address: field(formData, "address"),
    city: field(formData, "city"),
    beds: field(formData, "beds"),
    baths: field(formData, "baths"),
    sqft: field(formData, "sqft"),
    yearBuilt: field(formData, "yearBuilt"),
    propertyType: field(formData, "propertyType"),
    price: field(formData, "price"),
    monthlyPayment: field(formData, "monthlyPayment"),
    terms: field(formData, "terms"),
    status: field(formData, "status"),
    featured: field(formData, "featured"),
    summary: field(formData, "summary"),
    description: field(formData, "description"),
    features: field(formData, "features"),
    neighborhood: field(formData, "neighborhood"),
    schools: field(formData, "schools"),
    metaTitle: field(formData, "metaTitle"),
    metaDescription: field(formData, "metaDescription"),
    keywords: field(formData, "keywords"),
    localTags: field(formData, "localTags"),
    photos: field(formData, "photos"),
    arv: field(formData, "arv"),
    driveFolderUrl: field(formData, "driveFolderUrl"),
  });
  if (!parsed.success) {
    return failed(parsed.error.issues[0]?.message ?? "Check the listing and try again.");
  }

  const priceText = parsed.data.price.trim();
  const listPrice = priceText ? parseDollars(priceText) : null;
  if (priceText && listPrice == null) {
    return failed("Enter the price in dollars, like 325000.");
  }
  const arvText = parsed.data.arv.trim();
  const arv = arvText ? parseDollars(arvText) : null;
  if (arvText && arv == null) {
    return failed("Enter the ARV in dollars, like 325000.");
  }
  const paymentText = parsed.data.monthlyPayment.trim();
  const monthlyPayment = paymentText ? parseDollars(paymentText) : null;
  if (paymentText && monthlyPayment == null) {
    return failed("Enter the monthly payment in dollars.");
  }

  const listingId = parsed.data.listingId ? Number(parsed.data.listingId) : null;
  if (listingId !== null && (!Number.isInteger(listingId) || listingId < 1)) {
    return failed("That listing is not in the inventory.");
  }

  const uploads = formData.getAll("uploads").filter((item): item is File => item instanceof File);
  let uploaded: string[] = [];
  try {
    uploaded = await storeListingPhotos(uploads);
  } catch (error) {
    console.error("admin_listing_photo_failed", {
      id: randomUUID(),
      name: error instanceof Error ? error.name : "Error",
    });
    return failed("Photos need to be JPG, PNG, or WebP, each under 4 MB.");
  }

  const photos = [...parsed.data.photos.split("\n").map((line) => line.trim()).filter(Boolean), ...uploaded];
  if (photos.length > 12) {
    return failed("Keep it to 12 photos.");
  }

  let result: Awaited<ReturnType<typeof saveListing>>;
  try {
    result = await saveListing(listingId, {
      title: parsed.data.title,
      address: parsed.data.address,
      city: parsed.data.city,
      beds: parsed.data.beds ? Number(parsed.data.beds) : null,
      baths: parsed.data.baths,
      sqft: parsed.data.sqft ? Number(parsed.data.sqft) : null,
      yearBuilt: parsed.data.yearBuilt ? Number(parsed.data.yearBuilt) : null,
      propertyType: parsed.data.propertyType,
      listPrice,
      monthlyPayment,
      terms: parsed.data.terms,
      status: parsed.data.status,
      featured: parsed.data.featured === "yes",
      summary: parsed.data.summary,
      description: parsed.data.description,
      features: parsed.data.features,
      neighborhood: parsed.data.neighborhood,
      schools: parsed.data.schools,
      metaTitle: parsed.data.metaTitle,
      metaDescription: parsed.data.metaDescription,
      keywords: parsed.data.keywords,
      localTags: parsed.data.localTags,
      photos: photos.join("\n"),
      arv,
      driveFolderUrl: parsed.data.driveFolderUrl,
    });
  } catch (error) {
    console.error("admin_listing_failed", {
      id: randomUUID(),
      name: error instanceof Error ? error.name : "Error",
    });
    return failed("That listing did not save. Try again.");
  }

  if (!result.ok) return failed(result.message);
  refreshListings(result.slug);
  revalidatePath(`/admin/listings/${result.id}`);
  redirect(`/admin/listings/${result.id}`);
}
