"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { normalizePublicImageUrl } from "@/lib/utils";

// Load TiptapEditor only on client (no SSR)
const TiptapEditor = dynamic(() => import("@/components/TiptapEditor"), { ssr: false });

// ── Helpers ───────────────────────────────────────────────────
function DuoBtn({ onClick, children, className = "", disabled, type = "button" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl font-black text-sm border-2 border-b-[4px] transition-all hover:-translate-y-0.5 active:translate-y-1 active:border-b-0 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  );
}

const EMPTY_FORM = { title: "", content: "", excerpt: "", coverImage: "", published: false, slug: null };

export default function AdminBlogsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, blog: null });
  const [form, setForm] = useState(EMPTY_FORM);
  const [previewHtml, setPreviewHtml] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    else if (status === "authenticated") {
      if (session.user.role !== "ADMIN") router.push("/learn");
      else fetchBlogs();
    }
  }, [status, session, router]);

  const fetchBlogs = async () => {
    try {
      const res = await fetch("/api/blogs?all=true");
      if (res.ok) setBlogs(await res.json());
    } catch { toast.error("Gagal memuat blog"); }
    finally { setLoading(false); }
  };

  const openCreate = () => { setForm(EMPTY_FORM); setShowPreview(false); setEditorOpen(true); };
  const openEdit = (blog) => {
    setForm({ title: blog.title, content: blog.content, excerpt: blog.excerpt || "", coverImage: blog.coverImage || "", published: blog.published, slug: blog.slug });
    setShowPreview(false);
    setEditorOpen(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    try {
      setActionLoading(true);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok) { setForm((p) => ({ ...p, coverImage: data.url })); toast.success("Gambar berhasil diupload"); }
      else toast.error(data.error || "Gagal upload gambar");
    } catch { toast.error("Gagal upload gambar"); }
    finally { setActionLoading(false); }
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) { toast.error("Judul dan konten harus diisi"); return; }
    setActionLoading(true);
    try {
      const isEdit = form.slug !== null;
      const res = await fetch(isEdit ? `/api/blogs/${form.slug}` : "/api/blogs", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: form.title, content: form.content, excerpt: form.excerpt, coverImage: form.coverImage, published: form.published }),
      });
      if (res.ok) {
        toast.success(isEdit ? "Blog berhasil diperbarui" : "Blog berhasil dibuat");
        setEditorOpen(false);
        fetchBlogs();
      } else {
        const d = await res.json();
        toast.error(d.error || "Gagal menyimpan blog");
      }
    } catch { toast.error("Gagal menyimpan blog"); }
    finally { setActionLoading(false); }
  };

  const handleTogglePublish = async (blog) => {
    try {
      const res = await fetch(`/api/blogs/${blog.slug}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ published: !blog.published }) });
      if (res.ok) { toast.success(blog.published ? "Blog di-draft" : "Blog dipublikasikan"); fetchBlogs(); }
    } catch { toast.error("Gagal mengubah status"); }
  };

  const handleDelete = async () => {
    if (!deleteDialog.blog) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/blogs/${deleteDialog.blog.slug}`, { method: "DELETE" });
      if (res.ok) { toast.success("Blog berhasil dihapus"); setDeleteDialog({ open: false, blog: null }); fetchBlogs(); }
    } catch { toast.error("Gagal menghapus blog"); }
    finally { setActionLoading(false); }
  };

  if (status === "loading" || loading) return null;
  if (!session || session.user.role !== "ADMIN") return null;

  // ── Full-page Editor ─────────────────────────────────────────
  if (editorOpen) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] font-[family-name:var(--font-nunito)]">
        <style dangerouslySetInnerHTML={{ __html: `.duo-btn{border-bottom-width:4px;transition:all .1s ease}.duo-btn:hover{transform:translateY(-2px);border-bottom-width:6px}.duo-btn:active{transform:translateY(4px);border-bottom-width:0}` }} />

        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-white border-b-4 border-gray-200 px-4 sm:px-6 py-3 flex items-center gap-3 shadow-sm">
          <button
            onClick={() => setEditorOpen(false)}
            className="duo-btn flex items-center gap-1.5 px-3 py-2 bg-white border-4 border-b-[5px] border-gray-200 rounded-2xl font-black text-gray-600 text-xs hover:bg-gray-50"
          >
            <Icon icon="solar:arrow-left-bold" className="text-base" />
            Kembali
          </button>

          <div className="flex-1 min-w-0">
            <input
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              placeholder="Judul blog..."
              className="w-full font-black text-lg text-gray-900 bg-transparent border-none outline-none placeholder:text-gray-300 truncate"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowPreview((v) => !v)}
              className={`duo-btn flex items-center gap-1.5 px-3 py-2 rounded-2xl font-black text-xs border-4 border-b-[5px] ${showPreview ? "bg-indigo-500 border-indigo-700 text-white" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"}`}
            >
              <Icon icon={showPreview ? "solar:pen-bold" : "solar:eye-bold"} className="text-base" />
              <span className="hidden sm:inline">{showPreview ? "Editor" : "Preview"}</span>
            </button>

            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border-2 border-gray-200 rounded-2xl">
              <Switch
                checked={form.published}
                onCheckedChange={(v) => setForm((p) => ({ ...p, published: v }))}
                id="pub-toggle"
              />
              <label htmlFor="pub-toggle" className={`text-xs font-black cursor-pointer ${form.published ? "text-emerald-600" : "text-gray-400"}`}>
                {form.published ? "Publish" : "Draft"}
              </label>
            </div>

            <DuoBtn
              onClick={handleSave}
              disabled={actionLoading}
              className="bg-emerald-500 border-emerald-700 text-white hover:bg-emerald-600"
            >
              {actionLoading
                ? <Icon icon="svg-spinners:ring-resize" className="text-base" />
                : <Icon icon="solar:diskette-bold" className="text-base" />
              }
              <span className="hidden sm:inline">{form.slug ? "Simpan" : "Buat Blog"}</span>
            </DuoBtn>
          </div>
        </div>

        {/* Editor body — 2 column on large screens */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Main editor / preview */}
          <div className="lg:col-span-2 space-y-4">
            {showPreview ? (
              <div className="bg-white rounded-3xl border-4 border-b-[6px] border-gray-200 p-6 sm:p-8 shadow-sm">
                <div className="flex items-center gap-2 mb-5 pb-4 border-b-2 border-gray-100">
                  <Icon icon="solar:eye-bold" className="text-indigo-500 text-xl" />
                  <span className="font-black text-gray-700">Preview</span>
                </div>
                {normalizePublicImageUrl(form.coverImage) && (
                  <div className="relative w-full h-48 sm:h-64 rounded-2xl overflow-hidden mb-6 border-2 border-gray-200">
                    <Image src={normalizePublicImageUrl(form.coverImage)} alt="Cover" fill className="object-cover" unoptimized />
                  </div>
                )}
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mb-3">{form.title || "Judul Blog"}</h1>
                {form.excerpt && <p className="text-gray-500 font-bold text-sm mb-5 italic border-l-4 border-indigo-300 pl-4">{form.excerpt}</p>}
                <div
                  className="prose prose-sm sm:prose max-w-none font-[family-name:var(--font-nunito)]"
                  dangerouslySetInnerHTML={{ __html: form.content || "<p><em>Belum ada konten</em></p>" }}
                />
              </div>
            ) : (
              <TiptapEditor
                content={form.content}
                onChange={(html) => setForm((p) => ({ ...p, content: html }))}
                placeholder="Mulai tulis konten blog yang menginspirasi..."
              />
            )}
          </div>

          {/* Sidebar settings */}
          <div className="space-y-4">

            {/* Excerpt */}
            <div className="bg-white rounded-3xl border-4 border-b-[6px] border-gray-200 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-3">
                <Icon icon="solar:document-text-bold" className="text-indigo-500 text-lg" />
                <h3 className="font-black text-gray-800 text-sm">Ringkasan</h3>
              </div>
              <textarea
                value={form.excerpt}
                onChange={(e) => setForm((p) => ({ ...p, excerpt: e.target.value }))}
                placeholder="Ringkasan singkat yang muncul di daftar blog..."
                rows={4}
                maxLength={300}
                className="w-full text-sm font-bold text-gray-700 placeholder:text-gray-300 bg-gray-50 border-2 border-gray-200 rounded-2xl px-4 py-3 resize-none focus:outline-none focus:border-indigo-400 transition-colors"
              />
              <p className="text-[10px] font-bold text-gray-400 mt-1 text-right">{form.excerpt.length}/300</p>
            </div>

            {/* Cover Image */}
            <div className="bg-white rounded-3xl border-4 border-b-[6px] border-gray-200 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-3">
                <Icon icon="solar:gallery-bold" className="text-indigo-500 text-lg" />
                <h3 className="font-black text-gray-800 text-sm">Cover Image</h3>
              </div>

              {normalizePublicImageUrl(form.coverImage) ? (
                <div className="relative w-full h-36 rounded-2xl overflow-hidden border-2 border-gray-200 mb-3">
                  <Image src={normalizePublicImageUrl(form.coverImage)} alt="Cover" fill className="object-cover" unoptimized />
                  <button
                    onClick={() => setForm((p) => ({ ...p, coverImage: "" }))}
                    className="absolute top-2 right-2 w-7 h-7 bg-red-500 border-2 border-red-700 rounded-xl flex items-center justify-center text-white hover:bg-red-600 transition-colors"
                  >
                    <Icon icon="solar:close-bold" className="text-sm" />
                  </button>
                </div>
              ) : (
                <div className="w-full h-28 rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-2 mb-3 bg-gray-50">
                  <Icon icon="solar:gallery-add-bold" className="text-3xl text-gray-300" />
                  <p className="text-xs font-bold text-gray-400">Belum ada cover</p>
                </div>
              )}

              <label className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-50 border-2 border-b-[4px] border-indigo-200 rounded-2xl font-black text-indigo-600 text-xs cursor-pointer hover:bg-indigo-100 transition-colors">
                <Icon icon="solar:upload-bold" className="text-base" />
                Upload Gambar
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
              <p className="text-[10px] font-bold text-gray-400 mt-2 text-center">JPG, PNG, WebP · Maks 5MB</p>
            </div>

            {/* Publish status */}
            <div className="bg-white rounded-3xl border-4 border-b-[6px] border-gray-200 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <Icon icon="solar:settings-bold" className="text-indigo-500 text-lg" />
                <h3 className="font-black text-gray-800 text-sm">Pengaturan</h3>
              </div>
              <div className={`flex items-center justify-between p-3 rounded-2xl border-2 ${form.published ? "bg-emerald-50 border-emerald-200" : "bg-gray-50 border-gray-200"}`}>
                <div>
                  <p className={`font-black text-sm ${form.published ? "text-emerald-700" : "text-gray-600"}`}>
                    {form.published ? "Dipublikasikan" : "Draft"}
                  </p>
                  <p className="text-[10px] font-bold text-gray-400">
                    {form.published ? "Terlihat oleh semua pengguna" : "Hanya terlihat oleh admin"}
                  </p>
                </div>
                <Switch
                  checked={form.published}
                  onCheckedChange={(v) => setForm((p) => ({ ...p, published: v }))}
                />
              </div>
            </div>

            {/* Tips */}
            <div className="bg-indigo-50 rounded-3xl border-4 border-b-[6px] border-indigo-200 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-3">
                <Icon icon="solar:lightbulb-bold" className="text-indigo-500 text-lg" />
                <h3 className="font-black text-indigo-700 text-sm">Tips Menulis</h3>
              </div>
              <ul className="space-y-2 text-xs font-bold text-indigo-600">
                {["Gunakan H2/H3 untuk struktur yang jelas", "Tambahkan gambar untuk mempercantik artikel", "Tulis ringkasan yang menarik perhatian", "Blockquote untuk kutipan penting", "Cek preview sebelum publish"].map((tip) => (
                  <li key={tip} className="flex items-start gap-2">
                    <Icon icon="solar:check-circle-bold" className="text-indigo-400 shrink-0 mt-0.5" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Blog List ────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F8FAFC] font-[family-name:var(--font-nunito)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-emerald-500 to-teal-500 p-6 sm:p-8 rounded-3xl border-4 border-b-[6px] border-emerald-700 text-white shadow-lg relative overflow-hidden">
          <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-14 h-14 bg-white/20 border-2 border-white/30 rounded-2xl flex items-center justify-center">
              <Icon icon="solar:document-text-bold" className="text-3xl text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black">Management Blog</h1>
              <p className="font-bold opacity-80 text-sm">{blogs.length} artikel tersimpan</p>
            </div>
          </div>
          <button
            onClick={openCreate}
            className="relative z-10 flex items-center gap-2 px-6 py-3 bg-white text-emerald-600 font-black rounded-2xl border-2 border-b-[5px] border-emerald-200 hover:-translate-y-0.5 active:translate-y-1 active:border-b-0 transition-all text-sm shadow-sm"
          >
            <Icon icon="solar:add-circle-bold" className="text-xl" />
            Buat Blog Baru
          </button>
        </div>

        {/* Blog grid */}
        {blogs.length === 0 ? (
          <div className="bg-white rounded-3xl border-4 border-b-[6px] border-gray-200 p-16 text-center shadow-sm">
            <Icon icon="solar:document-text-linear" className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="font-black text-gray-500 text-lg mb-1">Belum ada blog</p>
            <p className="font-bold text-gray-400 text-sm mb-6">Klik "Buat Blog Baru" untuk memulai</p>
            <button onClick={openCreate} className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white font-black rounded-2xl border-2 border-b-[4px] border-emerald-700 hover:-translate-y-0.5 transition-all text-sm">
              <Icon icon="solar:add-circle-bold" /> Buat Blog Pertama
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            <AnimatePresence>
              {blogs.map((blog, i) => (
                <motion.div
                  key={blog.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="bg-white rounded-3xl border-4 border-b-[6px] border-gray-200 shadow-sm overflow-hidden hover:-translate-y-1 transition-transform"
                >
                  {/* Cover */}
                  <div className="relative w-full h-36 bg-gradient-to-br from-gray-100 to-gray-200">
                    {normalizePublicImageUrl(blog.coverImage) ? (
                      <Image src={normalizePublicImageUrl(blog.coverImage)} alt={blog.title} fill className="object-cover" unoptimized />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Icon icon="solar:gallery-bold" className="text-4xl text-gray-300" />
                      </div>
                    )}
                    <div className="absolute top-2 left-2">
                      <span className={`px-2.5 py-1 rounded-xl font-black text-[11px] border-2 ${blog.published ? "bg-emerald-100 border-emerald-300 text-emerald-700" : "bg-gray-100 border-gray-300 text-gray-500"}`}>
                        {blog.published ? "Published" : "Draft"}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <p className="font-black text-gray-900 text-sm line-clamp-2 mb-1">{blog.title}</p>
                    <p className="text-xs font-bold text-gray-400 mb-3 line-clamp-2">{blog.excerpt || "Tidak ada ringkasan"}</p>
                    <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 mb-3">
                      <span className="flex items-center gap-1">
                        <Icon icon="solar:user-bold" className="text-xs" />
                        {blog.author?.name || "Unknown"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Icon icon="solar:calendar-bold" className="text-xs" />
                        {new Date(blog.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-3 border-t-2 border-gray-100">
                      <button
                        onClick={() => handleTogglePublish(blog)}
                        title={blog.published ? "Jadikan Draft" : "Publikasikan"}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl font-black text-xs border-2 border-b-[3px] transition-all hover:-translate-y-0.5 ${blog.published ? "bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100" : "bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100"}`}
                      >
                        <Icon icon={blog.published ? "solar:eye-closed-bold" : "solar:eye-bold"} className="text-sm" />
                        {blog.published ? "Draft" : "Publish"}
                      </button>
                      <button
                        onClick={() => openEdit(blog)}
                        className="flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-50 border-2 border-b-[3px] border-indigo-200 text-indigo-600 hover:bg-indigo-100 transition-all hover:-translate-y-0.5"
                      >
                        <Icon icon="solar:pen-bold" className="text-sm" />
                      </button>
                      <button
                        onClick={() => setDeleteDialog({ open: true, blog })}
                        className="flex items-center justify-center w-9 h-9 rounded-xl bg-red-50 border-2 border-b-[3px] border-red-200 text-red-500 hover:bg-red-100 transition-all hover:-translate-y-0.5"
                      >
                        <Icon icon="solar:trash-bin-trash-bold" className="text-sm" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(o) => setDeleteDialog((p) => ({ ...p, open: o }))}>
        <AlertDialogContent className="rounded-3xl border-4 border-b-[6px] border-gray-200 font-[family-name:var(--font-nunito)]">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-black">Hapus Blog?</AlertDialogTitle>
            <AlertDialogDescription className="font-bold text-gray-500">
              Blog <strong>&ldquo;{deleteDialog.blog?.title}&rdquo;</strong> akan dihapus permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel className="rounded-2xl font-black border-2 border-b-4" disabled={actionLoading}>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={actionLoading} className="rounded-2xl font-black bg-red-500 border-2 border-b-4 border-red-700 hover:bg-red-600">
              {actionLoading ? <Icon icon="svg-spinners:ring-resize" className="mr-2" /> : null}
              Hapus
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
