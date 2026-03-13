import { blob, ensureBlob } from "hub:blob";
import { z } from "zod";

const uploadSchema = z.object({
  username: z.string().trim().min(1),
});

function inferFileExtension(file: File) {
  if (file.type === "image/jpeg") {
    return "jpg";
  }

  if (file.type === "image/png") {
    return "png";
  }

  if (file.type === "image/webp") {
    return "webp";
  }

  if (file.type === "image/gif") {
    return "gif";
  }

  const nameExt = file.name.split(".").pop()?.toLowerCase();
  if (nameExt && /^[a-z0-9]+$/.test(nameExt)) {
    return nameExt;
  }

  return "bin";
}

export default defineEventHandler(async (event) => {
  const form = await readFormData(event);
  const parsed = uploadSchema.parse({
    username: form.get("username"),
  });

  const file = form.get("file");
  if (!(file instanceof File)) {
    throw createError({ statusCode: 400, statusMessage: "No file uploaded" });
  }

  const session = await requireUserSession(event);
  if (session.user?.username !== parsed.username && !session.user?.admin) {
    throw createError({ statusCode: 403 });
  }

  ensureBlob(file, {
    maxSize: "4MB",
    types: ["image"],
  });

  const year = new Date().getFullYear();
  const random = Math.random().toString(36).slice(2, 8);
  const pathname = `evidence/${parsed.username}/${year}/${Date.now()}-${random}.${inferFileExtension(file)}`;

  const uploaded = await blob.put(pathname, file);

  return {
    pathname: uploaded.pathname,
    size: uploaded.size,
    type: uploaded.contentType,
  };
});
