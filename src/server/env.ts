import "server-only";
import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1),
  SESSION_SECRET: z.string().min(32, "SESSION_SECRET must be at least 32 characters"),
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
  STORAGE_DRIVER: z.enum(["local", "cloudinary"]).default("local"),
  STORAGE_LOCAL_DIR: z.string().default("./uploads"),
  // cloudinary://<api_key>:<api_secret>@<cloud_name>
  CLOUDINARY_URL: z.string().optional().default(""),
  CLOUDINARY_FOLDER: z.string().optional().default("zack-portfolio"),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  const issues = parsed.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`).join("\n");
  throw new Error(`Invalid environment configuration:\n${issues}`);
}

export const env = parsed.data;

// Vercel has no lasting disk: uploads saved "locally" would vanish on the next deploy.
if (process.env.VERCEL && (env.STORAGE_DRIVER !== "cloudinary" || !env.CLOUDINARY_URL)) {
  throw new Error('On Vercel, set STORAGE_DRIVER="cloudinary" and CLOUDINARY_URL (see docs/deploy-vercel-render-cloudinary.md).');
}
export const isProd = env.NODE_ENV === "production";
