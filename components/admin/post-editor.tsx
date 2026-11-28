"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Node } from "@tiptap/core";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { PostSeoPanel } from "@/components/admin/post-seo-panel";
import { deletePost, savePost } from "@/lib/admin/blog-actions";
import { slugify } from "@/lib/blog/content";
import { analyzePost } from "@/lib/blog/seo-check";
import type { AdminPost, CategoryView, PostStatus } from "@/lib/dal/blog";
import type { MediaKind } from "@/lib/media/files";
import { uploadImageToLibrary } from "@/lib/media/upload-client";

type MediaChoice = {
  id: number;
  url: string;
  fileName: string;
  kind: MediaKind;
  alt: string | null;
};

type Picker = "image" | "video" | "document" | "featured" | "og";

type Fields = {
  title: string;
  slug: string;
  excerpt: string;
  html: string;
  featuredImageUrl: string;
  featuredImageAlt: string;
  metaTitle: string;
  metaDescription: string;
  canonicalUrl: string;
  ogImageUrl: string;
  categoryIds: number[];
  tags: string[];
};

type SaveState = { kind: "idle" | "saving" | "saved" | "error"; text: string };

const fieldClass = "mt-2 w-full border border-line bg-paper px-3 py-3 text-base text-ink";
const AUTOSAVE_MS = 20_000;
const BACKUP_MS = 1_000;
const PHOENIX_OFFSET_MS = 7 * 60 * 60 * 1000; // Arizona does not observe daylight saving time.

const statusLabel: Record<PostStatus, string> = { draft: "Draft", scheduled: "Scheduled", published: "Published" };

/** ISO → value for <input type="datetime-local">, in Arizona time. */
function toPhoenixInput(iso: string | null) {
  if (!iso) return "";
  const time = new Date(iso).getTime();
  if (Number.isNaN(time)) return "";
  return new Date(time - PHOENIX_OFFSET_MS).toISOString().slice(0, 16);
}

/** <input type="datetime-local"> value in Arizona time → ISO. */
function fromPhoenixInput(value: string) {
  if (!value) return "";
  const date = new Date(`${value}:00-07:00`);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

function formatPhoenix(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Phoenix",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

function clockTime(date: Date) {
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(date);
}

function snapshotOf(fields: Fields) {
  return JSON.stringify({ ...fields, categoryIds: [...fields.categoryIds].sort((a, b) => a - b) });
}

function validLink(href: string) {
  if (href.startsWith("/") && !href.startsWith("//")) return true;
  try {
    const url = new URL(href);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

const VideoEmbed = Node.create({
  name: "videoEmbed",
  group: "block",
  atom: true,
  draggable: true,
  addAttributes() {
    return {
      src: { default: "" },
      caption: { default: "" },
    };
  },
  parseHTML() {
    return [
      {
        tag: "figure[data-video]",
        getAttrs: (element) => {
          if (!(element instanceof HTMLElement)) return false;
          return {
            src: element.querySelector("video")?.getAttribute("src") ?? "",
            caption: element.querySelector("figcaption")?.textContent ?? "",
          };
        },
      },
    ];
  },
  renderHTML({ node }) {
    const children: [string, Record<string, string>, string?][] = [
      ["video", { src: String(node.attrs.src ?? ""), controls: "true", preload: "metadata" }],
    ];
    const caption = String(node.attrs.caption ?? "");
    if (caption) children.push(["figcaption", {}, caption]);
    return ["figure", { "data-video": "" }, ...children];
  },
});

const FileEmbed = Node.create({
  name: "fileEmbed",
  group: "block",
  atom: true,
  draggable: true,
  addAttributes() {
    return {
      href: { default: "" },
      label: { default: "Download" },
    };
  },
  parseHTML() {
    return [
      {
        tag: "p[data-file]",
        getAttrs: (element) => {
          if (!(element instanceof HTMLElement)) return false;
          const link = element.querySelector("a");
          return { href: link?.getAttribute("href") ?? "", label: link?.textContent || "Download" };
        },
      },
    ];
  },
  renderHTML({ node }) {
    return ["p", { "data-file": "" }, ["a", { href: String(node.attrs.href ?? ""), download: "" }, String(node.attrs.label || "Download")]];
  },
});

function ToolButton({
  label,
  title,
  pressed,
  disabled,
  onClick,
}: {
  label: ReactNode;
  title: string;
  pressed?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={pressed}
      disabled={disabled}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={`inline-flex min-h-11 min-w-11 items-center justify-center px-2 text-sm font-semibold disabled:opacity-40 ${pressed ? "bg-navy text-white" : "text-ink hover:bg-mist"}`}
    >
      {label}
    </button>
  );
}

function Divider() {
  return <span className="mx-1 my-2 w-px self-stretch bg-line" aria-hidden="true" />;
}

function SideCard({ title, children, defaultOpen = true }: { title: string; children: ReactNode; defaultOpen?: boolean }) {
  return (
    <details open={defaultOpen} className="group border border-line bg-panel">
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between px-4 text-sm font-semibold uppercase tracking-[0.14em] text-muted [&::-webkit-details-marker]:hidden">
        {title}
        <span aria-hidden="true" className="text-lg leading-none group-open:rotate-45">+</span>
      </summary>
      <div className="border-t border-line p-4">{children}</div>
    </details>
  );
}

export function PostEditor({
  post,
  categories,
  media,
  tagSuggestions,
  siteHost,
}: {
  post: AdminPost | null;
  categories: CategoryView[];
  media: MediaChoice[];
  tagSuggestions: string[];
  siteHost: string;
}) {
  const router = useRouter();
  const initial: Fields = useMemo(
    () => ({
      title: post?.title ?? "",
      slug: post?.slug ?? "",
      excerpt: post?.excerpt ?? "",
      html: post?.html ?? "",
      featuredImageUrl: post?.featuredImageUrl ?? "",
      featuredImageAlt: post?.featuredImageAlt ?? "",
      metaTitle: post?.metaTitle ?? "",
      metaDescription: post?.metaDescription ?? "",
      canonicalUrl: post?.canonicalUrl ?? "",
      ogImageUrl: post?.ogImageUrl ?? "",
      categoryIds: post?.categoryIds ?? [],
      tags: post?.tagNames ?? [],
    }),
    [post],
  );

  const [fields, setFields] = useState<Fields>(initial);
  const [postId, setPostId] = useState<number | null>(post?.id ?? null);
  const [savedStatus, setSavedStatus] = useState<PostStatus | null>(post?.status ?? null);
  const [savedSlug, setSavedSlug] = useState(post?.slug ?? "");
  const [publishedAt, setPublishedAt] = useState<string | null>(post?.publishedAt ?? null);
  const [lastSnapshot, setLastSnapshot] = useState(() => snapshotOf(initial));
  const [slugTouched, setSlugTouched] = useState(Boolean(post));
  const [publishMode, setPublishMode] = useState<"now" | "schedule">(post?.status === "scheduled" ? "schedule" : "now");
  const [scheduleInput, setScheduleInput] = useState(post?.status === "scheduled" ? toPhoenixInput(post.publishedAt) : "");
  const [publishedInput, setPublishedInput] = useState(post?.status === "published" ? toPhoenixInput(post.publishedAt) : "");
  const [keyphrase, setKeyphrase] = useState("");
  const [tagDraft, setTagDraft] = useState("");
  const [picker, setPicker] = useState<Picker | null>(null);
  const [pickerQuery, setPickerQuery] = useState("");
  const [library, setLibrary] = useState<MediaChoice[]>(media);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkNewTab, setLinkNewTab] = useState(false);
  const [linkError, setLinkError] = useState("");
  const [uploading, setUploading] = useState("");
  const [saveState, setSaveState] = useState<SaveState>({ kind: "idle", text: post ? "All changes saved" : "Not saved yet" });
  const [backup, setBackup] = useState<{ fields: Fields; at: number } | null>(null);
  const selection = useRef<{ from: number; to: number } | null>(null);
  const inFlight = useRef(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const uploadRef = useRef<(files: File[], at?: number) => Promise<void>>(async () => undefined);

  const backupKey = `vamos:post-backup:${postId ?? "new"}`;
  const keyphraseKey = `vamos:post-keyphrase:${postId ?? "new"}`;
  const snapshot = snapshotOf(fields);
  const dirty = snapshot !== lastSnapshot;

  const set = useCallback(<K extends keyof Fields>(key: K, value: Fields[K]) => {
    setFields((current) => ({ ...current, [key]: value }));
  }, []);

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: {
          openOnClick: false,
          autolink: true,
          defaultProtocol: "https",
          // Only links the author marks "open in new tab" get a target.
          HTMLAttributes: { target: null, rel: null },
        },
      }),
      Placeholder.configure({ placeholder: "Start writing. Paste or drop photos straight into the article." }),
      Image.configure({ allowBase64: false }),
      VideoEmbed,
      FileEmbed,
    ],
    content: initial.html,
    editorProps: {
      attributes: { class: "px-4 py-6 sm:px-8", "aria-label": "Article body" },
      handlePaste: (_view, event) => {
        const files = [...(event.clipboardData?.files ?? [])].filter((file) => file.type.startsWith("image/") || /\.hei[cf]$/i.test(file.name));
        if (files.length === 0) return false;
        event.preventDefault();
        void uploadRef.current(files);
        return true;
      },
      handleDrop: (view, event, _slice, moved) => {
        if (moved) return false;
        const files = [...(event.dataTransfer?.files ?? [])].filter((file) => file.type.startsWith("image/") || /\.hei[cf]$/i.test(file.name));
        if (files.length === 0) return false;
        event.preventDefault();
        const at = view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos;
        void uploadRef.current(files, at);
        return true;
      },
    },
    onUpdate: ({ editor: current }) => {
      setFields((value) => ({ ...value, html: current.isEmpty ? "" : current.getHTML() }));
    },
  });

  const report = useMemo(
    () =>
      analyzePost({
        title: fields.title,
        metaTitle: fields.metaTitle,
        metaDescription: fields.metaDescription,
        excerpt: fields.excerpt,
        slug: fields.slug,
        html: fields.html,
        featuredImageUrl: fields.featuredImageUrl,
        featuredImageAlt: fields.featuredImageAlt,
        keyphrase,
        siteHost,
      }),
    [fields, keyphrase, siteHost],
  );

  // ---------- local backup + restore ----------
  // Reads this device's storage once after mount (it does not exist during server rendering).
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const raw = window.localStorage.getItem(`vamos:post-backup:${post?.id ?? "new"}`);
        const kp = window.localStorage.getItem(`vamos:post-keyphrase:${post?.id ?? "new"}`);
        if (kp) setKeyphrase(kp);
        if (!raw) return;
        const parsed = JSON.parse(raw) as { fields: Fields; at: number };
        const serverTime = post?.updatedAt ? Date.parse(post.updatedAt) : 0;
        if (parsed.at > serverTime && snapshotOf(parsed.fields) !== snapshotOf(initial)) setBackup(parsed);
      } catch {
        // A broken backup is not worth surfacing.
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [post, initial]);

  useEffect(() => {
    if (!dirty) return;
    const timer = window.setTimeout(() => {
      try {
        window.localStorage.setItem(backupKey, JSON.stringify({ fields, at: Date.now() }));
      } catch {
        // Storage full or blocked: the server autosave still runs.
      }
    }, BACKUP_MS);
    return () => window.clearTimeout(timer);
  }, [dirty, fields, backupKey]);

  useEffect(() => {
    try {
      if (keyphrase) window.localStorage.setItem(keyphraseKey, keyphrase);
      else window.localStorage.removeItem(keyphraseKey);
    } catch {
      // ignore
    }
  }, [keyphrase, keyphraseKey]);

  function restoreBackup() {
    if (!backup || !editor) return;
    setFields(backup.fields);
    editor.commands.setContent(backup.fields.html || "", { emitUpdate: false });
    setSlugTouched(true);
    setBackup(null);
  }

  function discardBackup() {
    try {
      window.localStorage.removeItem(backupKey);
    } catch {
      // ignore
    }
    setBackup(null);
  }

  // ---------- saving ----------
  const persist = useCallback(
    async (target: PostStatus, options: { autosave?: boolean; publishAt?: string } = {}) => {
      if (!editor || inFlight.current) return null;
      if (!fields.title.trim()) {
        if (!options.autosave) setSaveState({ kind: "error", text: "Add a title first." });
        return null;
      }
      inFlight.current = true;
      const sent = fields;
      setSaveState({ kind: "saving", text: options.autosave ? "Autosaving…" : "Saving…" });
      const result = await savePost({
        id: postId,
        title: sent.title,
        slug: sent.slug,
        excerpt: sent.excerpt,
        status: target,
        publishAt: options.publishAt ?? "",
        autosave: Boolean(options.autosave && postId),
        html: editor.getHTML(),
        featuredImageUrl: sent.featuredImageUrl,
        featuredImageAlt: sent.featuredImageAlt,
        metaTitle: sent.metaTitle,
        metaDescription: sent.metaDescription,
        canonicalUrl: sent.canonicalUrl,
        ogImageUrl: sent.ogImageUrl,
        categoryIds: sent.categoryIds,
        tagNames: sent.tags,
      }).catch(() => ({ ok: false as const, message: "Could not reach the server. Your work is kept on this device." }));
      inFlight.current = false;

      if (!result.ok) {
        setSaveState({ kind: "error", text: result.message });
        return null;
      }
      const wasNew = postId == null;
      setPostId(result.id);
      setSavedStatus(result.status);
      setSavedSlug(result.slug);
      setPublishedAt(result.publishedAt);
      if (!slugTouched || sent.slug !== result.slug) {
        setFields((current) => (current.slug === sent.slug ? { ...current, slug: result.slug } : current));
      }
      setLastSnapshot(snapshotOf({ ...sent, slug: result.slug }));
      if (result.status === "published") setPublishedInput(toPhoenixInput(result.publishedAt));
      if (result.status === "scheduled") setScheduleInput(toPhoenixInput(result.publishedAt));
      const verb =
        options.autosave ? "Autosaved" : result.status === "published" ? "Published" : result.status === "scheduled" ? "Scheduled" : "Draft saved";
      setSaveState({ kind: "saved", text: `${verb} at ${clockTime(new Date())}` });
      try {
        window.localStorage.removeItem(backupKey);
        if (wasNew) {
          window.localStorage.removeItem("vamos:post-backup:new");
          const kp = window.localStorage.getItem("vamos:post-keyphrase:new");
          if (kp) {
            window.localStorage.setItem(`vamos:post-keyphrase:${result.id}`, kp);
            window.localStorage.removeItem("vamos:post-keyphrase:new");
          }
        }
      } catch {
        // ignore
      }
      if (wasNew) window.history.replaceState(null, "", `/admin/blog/${result.id}`);
      return result;
    },
    [editor, fields, postId, slugTouched, backupKey],
  );

  // Background autosave: drafts only, so a live post never changes without a click.
  useEffect(() => {
    if (!dirty || !editor) return;
    if (savedStatus && savedStatus !== "draft") return;
    if (!fields.title.trim() || editor.isEmpty) return;
    const timer = window.setTimeout(() => {
      void persist("draft", { autosave: true });
    }, AUTOSAVE_MS);
    return () => window.clearTimeout(timer);
  }, [dirty, editor, fields.title, savedStatus, persist, snapshot]);

  // Warn before leaving with unsaved changes.
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  function scheduleIso() {
    return fromPhoenixInput(scheduleInput);
  }

  async function onSaveDraft() {
    if (savedStatus && savedStatus !== "draft") {
      const ok = window.confirm(
        savedStatus === "published"
          ? "Switch this post to a draft? It will come off the public site until you publish it again."
          : "Switch this post to a draft? The schedule will be cancelled.",
      );
      if (!ok) return;
    }
    await persist("draft");
  }

  async function onPublish() {
    const target: PostStatus = publishMode === "schedule" ? "scheduled" : "published";
    if (target === "scheduled") {
      const at = scheduleIso();
      if (!at || Date.parse(at) <= Date.now() + 60_000) {
        setSaveState({ kind: "error", text: "Pick a future date and time to schedule this post." });
        return;
      }
    }
    if (editor?.isEmpty) {
      setSaveState({ kind: "error", text: "Write the article before publishing it." });
      return;
    }
    const problems = report.checks.filter((check) => check.status === "bad");
    if (savedStatus !== "published" && problems.length > 0) {
      const ok = window.confirm(`Before you ${target === "scheduled" ? "schedule" : "publish"}:\n\n• ${problems.map((check) => check.label).join("\n• ")}\n\nContinue anyway?`);
      if (!ok) return;
    }
    const publishAt =
      target === "scheduled" ? scheduleIso() : savedStatus === "published" && publishedInput ? fromPhoenixInput(publishedInput) : "";
    const result = await persist(target, { publishAt });
    if (result) router.refresh();
  }

  async function onPreview() {
    const tab = window.open("", "_blank");
    let id = postId;
    if (!id || (dirty && (savedStatus ?? "draft") === "draft")) {
      const result = await persist("draft");
      id = result?.id ?? null;
    } else if (dirty) {
      setSaveState({ kind: "idle", text: "Preview shows the last saved version. Click Update to publish your changes." });
    }
    if (!id) {
      tab?.close();
      return;
    }
    if (tab) tab.location.href = `/admin/blog/${id}/preview`;
    else window.open(`/admin/blog/${id}/preview`, "_blank");
  }

  // Ctrl/Cmd+S saves without changing the status.
  const saveShortcut = useRef<() => void>(() => undefined);
  useEffect(() => {
    saveShortcut.current = () => {
      if (savedStatus === "published") void persist("published", { publishAt: publishedInput ? fromPhoenixInput(publishedInput) : "" });
      else if (savedStatus === "scheduled") void persist("scheduled", { publishAt: fromPhoenixInput(scheduleInput) });
      else void persist("draft");
    };
  });
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        saveShortcut.current();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  async function onDelete() {
    if (!postId) return;
    if (!window.confirm("Delete this post for good? It comes off the public site and cannot be restored.")) return;
    const result = await deletePost(postId);
    if (!result.ok) {
      setSaveState({ kind: "error", text: result.message });
      return;
    }
    try {
      window.localStorage.removeItem(backupKey);
      window.localStorage.removeItem(keyphraseKey);
    } catch {
      // ignore
    }
    setLastSnapshot(snapshot);
    router.push("/admin/blog");
  }

  // ---------- editor helpers ----------
  function onTitle(value: string) {
    setFields((current) => ({ ...current, title: value, slug: slugTouched ? current.slug : slugify(value) }));
  }

  function rememberSelection() {
    if (!editor) return;
    selection.current = { from: editor.state.selection.from, to: editor.state.selection.to };
  }

  function chain(at?: number) {
    if (!editor) return null;
    if (typeof at === "number") return editor.chain().focus().setTextSelection(at);
    const range = selection.current;
    return range ? editor.chain().focus().setTextSelection(range) : editor.chain().focus();
  }

  function openPicker(next: Picker) {
    rememberSelection();
    setPickerQuery("");
    setPicker(next);
  }

  function insertImage(url: string, alt: string, at?: number) {
    chain(at)?.setImage({ src: url, alt }).run();
  }

  function chooseMedia(item: MediaChoice) {
    if (picker === "featured") {
      setFields((current) => ({ ...current, featuredImageUrl: item.url, featuredImageAlt: item.alt || current.featuredImageAlt }));
    } else if (picker === "og") {
      set("ogImageUrl", item.url);
    } else if (picker === "image") {
      insertImage(item.url, item.alt || "");
    } else if (picker === "video") {
      chain()?.insertContent({ type: "videoEmbed", attrs: { src: item.url, caption: "" } }).run();
    } else if (picker === "document") {
      chain()?.insertContent({ type: "fileEmbed", attrs: { href: item.url, label: item.fileName.replace(/\.[a-z0-9]+$/i, "") } }).run();
    }
    setPicker(null);
  }

  async function uploadImages(files: File[], options: { at?: number; target?: "body" | "featured" | "og" } = {}) {
    const target = options.target ?? "body";
    for (const [index, file] of files.entries()) {
      setUploading(`Uploading ${file.name}${files.length > 1 ? ` (${index + 1} of ${files.length})` : ""}…`);
      const result = await uploadImageToLibrary(file, {
        folder: "blog",
        onStage: (label, percent) => setUploading(`${label} ${file.name}${percent ? ` · ${percent}%` : ""}`),
      });
      if (!result.ok) {
        setUploading("");
        setSaveState({ kind: "error", text: `${file.name}: ${result.message}` });
        return;
      }
      setLibrary((current) => [{ id: -Date.now() - index, url: result.url, fileName: file.name, kind: "image", alt: null }, ...current]);
      if (target === "featured") setFields((current) => ({ ...current, featuredImageUrl: result.url }));
      else if (target === "og") set("ogImageUrl", result.url);
      else insertImage(result.url, "", index === 0 ? options.at : undefined);
    }
    setUploading("");
    if (target !== "body") setPicker(null);
  }
  // Paste/drop handlers live in the editor config; point them at the latest upload function.
  useEffect(() => {
    uploadRef.current = (files, at) => uploadImages(files, { at });
  });

  function openLink() {
    if (!editor) return;
    const attrs = editor.getAttributes("link") as { href?: string; target?: string | null };
    setLinkUrl(attrs.href ?? "");
    setLinkNewTab(attrs.target === "_blank");
    setLinkError("");
    setLinkOpen(true);
  }

  function applyLink() {
    if (!editor) return;
    const href = linkUrl.trim();
    if (!href) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      setLinkOpen(false);
      return;
    }
    if (!validLink(href)) {
      setLinkError("Use a site path like /cash-offer or a full https:// link.");
      return;
    }
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href, target: linkNewTab ? "_blank" : null })
      .run();
    setLinkOpen(false);
  }

  function addTag(raw: string) {
    const names = raw
      .split(",")
      .map((name) => name.trim())
      .filter(Boolean);
    if (names.length === 0) return;
    setFields((current) => {
      const next = [...current.tags];
      for (const name of names) {
        if (next.length >= 12) break;
        if (!next.some((tag) => tag.toLowerCase() === name.toLowerCase())) next.push(name.slice(0, 40));
      }
      return { ...current, tags: next };
    });
    setTagDraft("");
  }

  const roots = categories.filter((category) => category.parentId == null || !categories.some((item) => item.id === category.parentId));

  function categoryList(items: CategoryView[], depth: number) {
    if (items.length === 0) return null;
    return (
      <ul>
        {items.map((category) => (
          <li key={category.id} className={depth > 0 ? "pl-4" : undefined}>
            <label className="flex min-h-11 items-center gap-3 text-base text-ink">
              <input
                type="checkbox"
                checked={fields.categoryIds.includes(category.id)}
                onChange={() =>
                  set(
                    "categoryIds",
                    fields.categoryIds.includes(category.id)
                      ? fields.categoryIds.filter((id) => id !== category.id)
                      : [...fields.categoryIds, category.id],
                  )
                }
              />
              {category.name}
            </label>
            {categoryList(
              categories.filter((item) => item.parentId === category.id),
              depth + 1,
            )}
          </li>
        ))}
      </ul>
    );
  }

  const pickerKind: MediaKind | null =
    picker === "image" || picker === "featured" || picker === "og" ? "image" : picker === "video" ? "video" : picker === "document" ? "document" : null;
  const choices = pickerKind
    ? library.filter((item) => item.kind === pickerKind && (!pickerQuery || item.fileName.toLowerCase().includes(pickerQuery.toLowerCase())))
    : [];

  const primaryLabel =
    savedStatus === "published"
      ? "Update"
      : publishMode === "schedule"
        ? savedStatus === "scheduled"
          ? "Update schedule"
          : "Schedule"
        : savedStatus === "scheduled"
          ? "Publish now"
          : "Publish";
  const saving = saveState.kind === "saving";
  const blockType = editor?.isActive("heading", { level: 2 }) ? "h2" : editor?.isActive("heading", { level: 3 }) ? "h3" : "p";
  const imageSelected = Boolean(editor?.isActive("image"));
  const imageAttrs = (imageSelected ? editor?.getAttributes("image") : {}) as { alt?: string; title?: string };
  const publicPath = savedSlug ? `/blog/${savedSlug}` : "";

  return (
    <div className="mt-6">
      {/* Action bar */}
      <div className="sticky top-0 z-30 -mx-4 flex flex-wrap items-center justify-between gap-3 border-b border-line bg-paper/95 px-4 py-3 backdrop-blur">
        <div className="flex min-w-0 flex-wrap items-center gap-3 text-sm">
          <span
            className={`inline-flex min-h-8 items-center px-2 font-semibold ${
              savedStatus === "published" ? "bg-navy text-white" : savedStatus === "scheduled" ? "bg-amber text-amber-ink" : "bg-mist text-ink"
            }`}
          >
            {savedStatus ? statusLabel[savedStatus] : "New post"}
          </span>
          {savedStatus === "scheduled" && publishedAt ? <span className="text-muted">Goes live {formatPhoenix(publishedAt)} (AZ)</span> : null}
          {savedStatus === "published" && publicPath ? (
            <Link href={publicPath} target="_blank" className="font-semibold text-link">
              View post ↗
            </Link>
          ) : null}
          <span
            role="status"
            className={saveState.kind === "error" ? "font-semibold text-red-700 dark:text-red-300" : "text-muted"}
          >
            {dirty && saveState.kind !== "saving" && saveState.kind !== "error" ? "Unsaved changes" : saveState.text}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onPreview}
            disabled={saving || !editor}
            className="inline-flex min-h-11 items-center border border-line px-4 text-sm font-semibold text-ink disabled:opacity-60"
          >
            Preview
          </button>
          <button
            type="button"
            onClick={onSaveDraft}
            disabled={saving || !editor}
            className="inline-flex min-h-11 items-center border border-line px-4 text-sm font-semibold text-ink disabled:opacity-60"
          >
            {savedStatus && savedStatus !== "draft" ? "Switch to draft" : "Save draft"}
          </button>
          <button
            type="button"
            onClick={onPublish}
            disabled={saving || !editor}
            className="inline-flex min-h-11 items-center bg-navy px-5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving ? "Saving…" : primaryLabel}
          </button>
        </div>
      </div>

      {backup ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border border-amber bg-amber/15 px-4 py-3 text-sm text-ink" role="alert">
          <p>
            There is a newer copy of this post on this device from {clockTime(new Date(backup.at))}, probably from before the page closed.
          </p>
          <div className="flex gap-2">
            <button type="button" onClick={restoreBackup} className="inline-flex min-h-11 items-center bg-navy px-4 font-semibold text-white">
              Restore it
            </button>
            <button type="button" onClick={discardBackup} className="inline-flex min-h-11 items-center px-3 font-semibold text-ink">
              Discard
            </button>
          </div>
        </div>
      ) : null}

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        {/* Writing column */}
        <div className="min-w-0 border border-line bg-paper">
          <label className="sr-only" htmlFor="post-title">
            Title
          </label>
          <textarea
            id="post-title"
            value={fields.title}
            onChange={(event) => onTitle(event.target.value.replace(/\n/g, " "))}
            placeholder="Add a title"
            rows={2}
            maxLength={180}
            className="w-full resize-none border-b border-line bg-transparent px-4 py-5 text-3xl font-semibold leading-tight text-ink sm:px-8 sm:text-4xl"
          />
          <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-3 text-sm sm:px-8">
            <label className="font-semibold text-muted" htmlFor="post-slug">
              Web address
            </label>
            <span className="text-muted">{siteHost}/blog/</span>
            <input
              id="post-slug"
              value={fields.slug}
              onChange={(event) => {
                setSlugTouched(true);
                set("slug", event.target.value.toLowerCase().replace(/\s+/g, "-"));
              }}
              onBlur={() => set("slug", slugify(fields.slug || fields.title))}
              className="min-h-11 min-w-0 flex-1 border border-line bg-paper px-3 text-base text-ink"
            />
            {slugTouched && savedStatus !== "published" ? (
              <button
                type="button"
                onClick={() => {
                  setSlugTouched(false);
                  set("slug", slugify(fields.title));
                }}
                className="inline-flex min-h-11 items-center px-2 font-semibold text-link"
              >
                Reset from title
              </button>
            ) : null}
            {savedStatus === "published" && fields.slug !== savedSlug ? (
              <p className="basis-full text-xs text-orange-700 dark:text-orange-300">
                Changing the address of a live post breaks links to the old one. Only do this if it is new.
              </p>
            ) : null}
          </div>

          {/* Toolbar */}
          <div className="sticky top-[4.25rem] z-20 flex flex-wrap items-center border-b border-line bg-panel px-1" role="toolbar" aria-label="Formatting">
            <ToolButton label="↶" title="Undo (Ctrl+Z)" disabled={!editor?.can().undo()} onClick={() => editor?.chain().focus().undo().run()} />
            <ToolButton label="↷" title="Redo (Ctrl+Shift+Z)" disabled={!editor?.can().redo()} onClick={() => editor?.chain().focus().redo().run()} />
            <Divider />
            <label className="sr-only" htmlFor="block-type">
              Text style
            </label>
            <select
              id="block-type"
              value={blockType}
              onChange={(event) => {
                const value = event.target.value;
                if (value === "p") editor?.chain().focus().setParagraph().run();
                else editor?.chain().focus().toggleHeading({ level: value === "h2" ? 2 : 3 }).run();
              }}
              className="min-h-11 bg-transparent px-2 text-sm font-semibold text-ink"
            >
              <option value="p">Paragraph</option>
              <option value="h2">Heading 2</option>
              <option value="h3">Heading 3</option>
            </select>
            <Divider />
            <ToolButton label={<b>B</b>} title="Bold (Ctrl+B)" pressed={editor?.isActive("bold")} onClick={() => editor?.chain().focus().toggleBold().run()} />
            <ToolButton label={<i>I</i>} title="Italic (Ctrl+I)" pressed={editor?.isActive("italic")} onClick={() => editor?.chain().focus().toggleItalic().run()} />
            <ToolButton label={<u>U</u>} title="Underline (Ctrl+U)" pressed={editor?.isActive("underline")} onClick={() => editor?.chain().focus().toggleUnderline().run()} />
            <ToolButton label={<s>S</s>} title="Strikethrough" pressed={editor?.isActive("strike")} onClick={() => editor?.chain().focus().toggleStrike().run()} />
            <ToolButton label="Link" title="Link (select text first)" pressed={editor?.isActive("link")} onClick={openLink} />
            <Divider />
            <ToolButton label="• List" title="Bulleted list" pressed={editor?.isActive("bulletList")} onClick={() => editor?.chain().focus().toggleBulletList().run()} />
            <ToolButton label="1. List" title="Numbered list" pressed={editor?.isActive("orderedList")} onClick={() => editor?.chain().focus().toggleOrderedList().run()} />
            <ToolButton label="“ ”" title="Quote" pressed={editor?.isActive("blockquote")} onClick={() => editor?.chain().focus().toggleBlockquote().run()} />
            <ToolButton label="{ }" title="Code block" pressed={editor?.isActive("codeBlock")} onClick={() => editor?.chain().focus().toggleCodeBlock().run()} />
            <ToolButton label="―" title="Divider line" onClick={() => editor?.chain().focus().setHorizontalRule().run()} />
            <Divider />
            <ToolButton
              label="Upload"
              title="Upload a photo from this computer"
              onClick={() => {
                rememberSelection();
                fileInput.current?.click();
              }}
            />
            <ToolButton label="Photo" title="Photo from the media library" onClick={() => openPicker("image")} />
            <ToolButton label="Video" title="Video from the media library" onClick={() => openPicker("video")} />
            <ToolButton label="PDF" title="PDF from the media library" onClick={() => openPicker("document")} />
            <Divider />
            <ToolButton label="Clear" title="Clear formatting" onClick={() => editor?.chain().focus().unsetAllMarks().clearNodes().run()} />
            <input
              ref={fileInput}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
              multiple
              className="sr-only"
              tabIndex={-1}
              aria-hidden="true"
              onChange={(event) => {
                const files = [...(event.target.files ?? [])];
                event.target.value = "";
                if (files.length) void uploadImages(files);
              }}
            />
          </div>

          {linkOpen ? (
            <form
              className="grid gap-2 border-b border-line bg-mist px-4 py-3 sm:px-8"
              onSubmit={(event) => {
                event.preventDefault();
                applyLink();
              }}
            >
              <div className="flex flex-wrap items-center gap-2">
                <label className="sr-only" htmlFor="post-link">
                  Link address
                </label>
                <input
                  id="post-link"
                  autoFocus
                  value={linkUrl}
                  onChange={(event) => {
                    setLinkUrl(event.target.value);
                    setLinkError("");
                  }}
                  placeholder="/cash-offer or https://…"
                  className="min-h-11 min-w-0 flex-1 border border-line bg-paper px-3 text-base text-ink"
                />
                <label className="flex min-h-11 items-center gap-2 text-sm text-ink">
                  <input type="checkbox" checked={linkNewTab} onChange={(event) => setLinkNewTab(event.target.checked)} />
                  Open in new tab
                </label>
                <button type="submit" className="inline-flex min-h-11 items-center bg-navy px-4 text-sm font-semibold text-white">
                  Apply
                </button>
                <button
                  type="button"
                  className="inline-flex min-h-11 items-center px-3 text-sm font-semibold text-ink"
                  onClick={() => {
                    editor?.chain().focus().extendMarkRange("link").unsetLink().run();
                    setLinkOpen(false);
                  }}
                >
                  Remove link
                </button>
                <button type="button" className="inline-flex min-h-11 items-center px-3 text-sm font-semibold text-muted" onClick={() => setLinkOpen(false)}>
                  Cancel
                </button>
              </div>
              {linkError ? <p className="text-sm text-red-700 dark:text-red-300">{linkError}</p> : null}
            </form>
          ) : null}

          {imageSelected ? (
            <div className="grid gap-2 border-b border-line bg-mist px-4 py-3 sm:grid-cols-2 sm:px-8">
              <label className="text-sm font-semibold text-muted">
                Image alt text (describe the photo for search and screen readers)
                <input
                  value={imageAttrs.alt ?? ""}
                  onChange={(event) => editor?.chain().updateAttributes("image", { alt: event.target.value.slice(0, 180) }).run()}
                  placeholder="Single-story house in Mesa with a tile roof"
                  className={fieldClass}
                />
              </label>
              <label className="text-sm font-semibold text-muted">
                Hover title (optional)
                <input
                  value={imageAttrs.title ?? ""}
                  onChange={(event) => editor?.chain().updateAttributes("image", { title: event.target.value.slice(0, 240) }).run()}
                  className={fieldClass}
                />
              </label>
            </div>
          ) : null}

          {uploading ? (
            <p className="border-b border-line bg-mist px-4 py-2 text-sm text-ink sm:px-8" role="status">
              {uploading}
            </p>
          ) : null}

          <div className="post-editor post-content">
            {editor ? <EditorContent editor={editor} /> : <p className="px-4 py-8 text-base text-muted">Loading the editor…</p>}
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-1 border-t border-line px-4 py-3 text-sm text-muted sm:px-8">
            <span>{report.wordCount.toLocaleString()} words</span>
            <span>{report.readingMinutes} min read</span>
            <span>{report.h2Count} H2 headings</span>
            <span>
              {report.internalLinks} internal / {report.externalLinks} external links
            </span>
          </div>

          <div className="border-t border-line px-4 py-4 sm:px-8">
            <div className="flex items-baseline justify-between">
              <label className="block text-sm font-semibold text-muted" htmlFor="post-excerpt">
                Excerpt
              </label>
              <span className="text-xs text-muted">{fields.excerpt.length} / 300</span>
            </div>
            <textarea
              id="post-excerpt"
              value={fields.excerpt}
              maxLength={300}
              onChange={(event) => set("excerpt", event.target.value)}
              rows={3}
              className={fieldClass}
            />
            <p className="mt-2 text-sm leading-6 text-muted">Shown on the blog index and in search when there is no meta description. Leave it blank to use the opening of the article.</p>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="grid gap-4">
          <SideCard title="Publish">
            <fieldset>
              <legend className="text-sm font-semibold text-muted">{savedStatus === "published" ? "Published on" : "When"}</legend>
              {savedStatus === "published" ? (
                <>
                  <input
                    type="datetime-local"
                    value={publishedInput}
                    onChange={(event) => setPublishedInput(event.target.value)}
                    className={fieldClass}
                    aria-label="Published date and time (Arizona)"
                  />
                  <p className="mt-2 text-xs leading-5 text-muted">Arizona time. Change it only to correct the date; click Update to save.</p>
                </>
              ) : (
                <div className="mt-2 grid gap-1">
                  <label className="flex min-h-11 items-center gap-3 text-base text-ink">
                    <input type="radio" name="publish-mode" checked={publishMode === "now"} onChange={() => setPublishMode("now")} />
                    Immediately
                  </label>
                  <label className="flex min-h-11 items-center gap-3 text-base text-ink">
                    <input type="radio" name="publish-mode" checked={publishMode === "schedule"} onChange={() => setPublishMode("schedule")} />
                    Schedule for later
                  </label>
                  {publishMode === "schedule" ? (
                    <>
                      <input
                        type="datetime-local"
                        value={scheduleInput}
                        min={toPhoenixInput(new Date().toISOString())}
                        onChange={(event) => setScheduleInput(event.target.value)}
                        className={fieldClass}
                        aria-label="Publish date and time (Arizona)"
                      />
                      <p className="text-xs leading-5 text-muted">Arizona time. The post goes live within 15 minutes of this time.</p>
                    </>
                  ) : null}
                </div>
              )}
            </fieldset>
            <p className="mt-4 text-xs leading-5 text-muted">
              Drafts autosave every few seconds. Live posts change only when you click {savedStatus === "published" ? "Update" : "Publish"}. Ctrl+S saves.
            </p>
          </SideCard>

          <SideCard title={`SEO · ${report.score}`}>
            <PostSeoPanel
              report={report}
              siteHost={siteHost}
              slug={fields.slug}
              keyphrase={keyphrase}
              onKeyphrase={setKeyphrase}
              metaTitle={fields.metaTitle}
              onMetaTitle={(value) => set("metaTitle", value)}
              metaDescription={fields.metaDescription}
              onMetaDescription={(value) => set("metaDescription", value)}
              titlePlaceholder={fields.title}
              socialImageUrl={fields.ogImageUrl || fields.featuredImageUrl}
              publishedAt={publishedAt}
            />
          </SideCard>

          <SideCard title="Featured image">
            {fields.featuredImageUrl ? (
              <img src={fields.featuredImageUrl} alt={fields.featuredImageAlt || ""} className="mb-3 aspect-[16/9] w-full border border-line object-cover" />
            ) : (
              <p className="text-sm leading-6 text-muted">Shown at the top of the post, on the blog index, and when shared. 1200 × 630 or larger works best.</p>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" onClick={() => openPicker("featured")} className="inline-flex min-h-11 items-center border border-line px-3 text-sm font-semibold text-ink">
                {fields.featuredImageUrl ? "Replace" : "Choose image"}
              </button>
              {fields.featuredImageUrl ? (
                <button
                  type="button"
                  onClick={() => setFields((current) => ({ ...current, featuredImageUrl: "", featuredImageAlt: "" }))}
                  className="inline-flex min-h-11 items-center px-3 text-sm font-semibold text-ink"
                >
                  Remove
                </button>
              ) : null}
            </div>
            <label className="mt-3 block text-sm font-semibold text-muted" htmlFor="featured-alt">
              Alt text
            </label>
            <input
              id="featured-alt"
              value={fields.featuredImageAlt}
              maxLength={180}
              onChange={(event) => set("featuredImageAlt", event.target.value)}
              placeholder="Describe what is in the photo"
              className={fieldClass}
            />
          </SideCard>

          <SideCard title="Categories">
            {categories.length === 0 ? (
              <p className="text-sm leading-6 text-muted">
                No categories yet. <Link href="/admin/blog/categories" className="font-semibold text-link">Add one</Link>.
              </p>
            ) : (
              categoryList(roots, 0)
            )}
          </SideCard>

          <SideCard title="Tags">
            {fields.tags.length > 0 ? (
              <ul className="mb-3 flex flex-wrap gap-2">
                {fields.tags.map((tag) => (
                  <li key={tag} className="inline-flex min-h-9 items-center gap-1 border border-line bg-mist pl-3 text-sm text-ink">
                    {tag}
                    <button
                      type="button"
                      aria-label={`Remove tag ${tag}`}
                      onClick={() => set("tags", fields.tags.filter((item) => item !== tag))}
                      className="inline-flex min-h-9 min-w-9 items-center justify-center font-semibold text-muted"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
            <label className="sr-only" htmlFor="post-tags">
              Add a tag
            </label>
            <input
              id="post-tags"
              value={tagDraft}
              list="post-tag-suggestions"
              onChange={(event) => {
                if (event.target.value.endsWith(",")) addTag(event.target.value);
                else setTagDraft(event.target.value);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addTag(tagDraft);
                } else if (event.key === "Backspace" && !tagDraft && fields.tags.length) {
                  set("tags", fields.tags.slice(0, -1));
                }
              }}
              onBlur={() => addTag(tagDraft)}
              placeholder="Type a tag and press Enter"
              className={fieldClass}
            />
            <datalist id="post-tag-suggestions">
              {tagSuggestions
                .filter((name) => !fields.tags.some((tag) => tag.toLowerCase() === name.toLowerCase()))
                .map((name) => (
                  <option key={name} value={name} />
                ))}
            </datalist>
            <p className="mt-2 text-xs leading-5 text-muted">Up to 12. Reuse existing tags so archive pages stay useful.</p>
          </SideCard>

          <SideCard title="Advanced" defaultOpen={false}>
            <label className="block text-sm font-semibold text-muted" htmlFor="canonical-url">
              Canonical URL
            </label>
            <input
              id="canonical-url"
              value={fields.canonicalUrl}
              onChange={(event) => set("canonicalUrl", event.target.value)}
              placeholder={`/blog/${fields.slug || "your-post"}`}
              className={fieldClass}
            />
            <p className="mt-2 text-xs leading-5 text-muted">Leave blank unless this article was first published somewhere else.</p>
            <p className="mt-4 text-sm font-semibold text-muted">Social image</p>
            {fields.ogImageUrl ? <img src={fields.ogImageUrl} alt="" className="mt-2 aspect-[1.91/1] w-full border border-line object-cover" /> : null}
            <p className="mt-1 text-xs leading-5 text-muted">Defaults to the featured image.</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button type="button" onClick={() => openPicker("og")} className="inline-flex min-h-11 items-center border border-line px-3 text-sm font-semibold text-ink">
                Choose social image
              </button>
              {fields.ogImageUrl ? (
                <button type="button" onClick={() => set("ogImageUrl", "")} className="inline-flex min-h-11 items-center px-3 text-sm font-semibold text-ink">
                  Remove
                </button>
              ) : null}
            </div>
            {postId ? (
              <button
                type="button"
                onClick={onDelete}
                className="mt-6 inline-flex min-h-11 w-full items-center justify-center border border-red-300 px-4 text-sm font-semibold text-red-700 dark:text-red-300"
              >
                Delete post
              </button>
            ) : null}
          </SideCard>
        </aside>
      </div>

      {picker ? (
        <MediaPicker
          kind={pickerKind}
          query={pickerQuery}
          onQuery={setPickerQuery}
          choices={choices}
          uploading={uploading}
          onUpload={(files) => uploadImages(files, { target: picker === "featured" ? "featured" : picker === "og" ? "og" : "body" })}
          onChoose={chooseMedia}
          onClose={() => setPicker(null)}
        />
      ) : null}
    </div>
  );
}

function MediaPicker({
  kind,
  query,
  onQuery,
  choices,
  uploading,
  onUpload,
  onChoose,
  onClose,
}: {
  kind: MediaKind | null;
  query: string;
  onQuery: (value: string) => void;
  choices: MediaChoice[];
  uploading: string;
  onUpload: (files: File[]) => Promise<void>;
  onChoose: (item: MediaChoice) => void;
  onClose: () => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-navy/40 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label="Media library"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="flex max-h-[85vh] w-full max-w-4xl flex-col border border-line bg-paper">
        <div className="flex flex-wrap items-center gap-3 border-b border-line p-4">
          <h2 className="mr-auto text-xl font-semibold text-ink">Media library</h2>
          {kind === "image" ? (
            <>
              <button
                type="button"
                onClick={() => input.current?.click()}
                className="inline-flex min-h-11 items-center bg-navy px-4 text-sm font-semibold text-white"
              >
                Upload from computer
              </button>
              <input
                ref={input}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
                multiple
                className="sr-only"
                tabIndex={-1}
                aria-hidden="true"
                onChange={(event) => {
                  const files = [...(event.target.files ?? [])];
                  event.target.value = "";
                  if (files.length) void onUpload(files);
                }}
              />
            </>
          ) : null}
          <button type="button" onClick={onClose} className="inline-flex min-h-11 items-center px-3 text-sm font-semibold text-ink">
            Close
          </button>
        </div>
        <div className="border-b border-line p-4">
          <label className="sr-only" htmlFor="media-search">
            Search files
          </label>
          <input
            id="media-search"
            value={query}
            onChange={(event) => onQuery(event.target.value)}
            placeholder="Search by file name"
            className="min-h-11 w-full border border-line bg-paper px-3 text-base text-ink"
          />
          {uploading ? (
            <p className="mt-2 text-sm text-ink" role="status">
              {uploading}
            </p>
          ) : null}
        </div>
        <div className="overflow-auto p-4">
          {choices.length === 0 ? (
            <p className="text-base leading-7 text-muted">
              {query ? "No files match that search." : "Nothing in the library for this yet."}{" "}
              {kind === "image" ? "Upload one above, or " : ""}
              <Link href="/admin/media" className="font-semibold text-link">
                open the media library
              </Link>
              .
            </p>
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {choices.map((item) => (
                <li key={item.id}>
                  <button type="button" onClick={() => onChoose(item)} className="w-full border border-line p-2 text-left hover:border-navy">
                    {item.kind === "image" ? <img src={item.url} alt={item.alt || ""} className="mb-2 aspect-[4/3] w-full object-cover" /> : null}
                    {item.kind === "video" ? <video src={item.url} className="mb-2 aspect-[4/3] w-full object-cover" preload="metadata" /> : null}
                    {item.kind === "document" ? (
                      <span className="mb-2 flex aspect-[4/3] w-full items-center justify-center bg-mist text-sm font-semibold text-muted">PDF</span>
                    ) : null}
                    <span className="block truncate text-sm font-semibold text-ink">{item.fileName}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
