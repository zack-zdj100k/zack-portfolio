# Putting ZACK online: Vercel + Render + Cloudinary

| Piece | Service | What it holds |
| --- | --- | --- |
| The site (pages, admin, API) | **Vercel** | The Next.js app, built from GitHub on every push |
| The database | **Render** (PostgreSQL) | Everything you edit in the admin, inquiries, referrals |
| The pictures | **Cloudinary** | Project screenshots, feature screenshots, your portrait, every upload |

The hero's 3D artwork (`/public/hero`) stays with the site on Vercel: it is part of the code and is
read by WebGL, which needs the exact files.

Do the steps in order. Commands run on your Mac, in the project folder. Nothing secret goes in
GitHub: keys and passwords only go in Vercel's settings and in your terminal.

---

## 1. Cloudinary (pictures)

1. Sign up at <https://cloudinary.com> (free plan is enough).
2. **Settings → API Keys**. Copy the **API environment variable**. It looks like
   `cloudinary://123456789012345:AbCdEf...@your-cloud-name`. This is `CLOUDINARY_URL`.

## 2. Render (database)

1. Sign up at <https://render.com> → **New → PostgreSQL**.
2. Name `zack-portfolio`, **Region: Frankfurt (EU Central)** (Vercel is set to Frankfurt too, in
   `vercel.json`, so the two are close), PostgreSQL **16**.
3. Plan: the **free** database is deleted by Render after a limited time (30 days at the time of
   writing; check Render's current terms). For a site you keep online, take the smallest paid plan.
4. When it is ready, open it and copy the **External Database URL**. Add `?sslmode=require` at the
   end. In your terminal:

   ```bash
   export RENDER_DB='postgresql://zack:PASSWORD@dpg-xxxx.frankfurt-postgres.render.com/zack_xxxx?sslmode=require'
   ```

## 3. Fill the Render database (from your Mac)

Pick **one** of the two.

**A. Copy your local database: keeps everything you already edited in the admin** (prices, skills,
texts, projects). Recommended.

```bash
export LOCAL_DB='paste the DATABASE_URL value from your .env here'
pg_dump --no-owner --no-acl -Fc "$LOCAL_DB" -f zack.dump
pg_restore --no-owner --no-acl --clean --if-exists -d "$RENDER_DB" zack.dump
DATABASE_URL="$RENDER_DB" npm run db:deploy
```

(`pg_restore` may print a few warnings about objects that don't exist yet; that's normal on an empty
database. If it says the server version is newer, update your tools: `brew upgrade postgresql@16`.)

**B. Start fresh** with the seeded content:

```bash
DATABASE_URL="$RENDER_DB" npm run db:deploy
DATABASE_URL="$RENDER_DB" npm run db:seed
DATABASE_URL="$RENDER_DB" npm run admin:code      # your admin access code for the live site
```

With A, your admin access code is the same as on your Mac.

## 4. Move the pictures to Cloudinary

```bash
export CLOUDINARY_URL='cloudinary://API_KEY:API_SECRET@CLOUD_NAME'
DATABASE_URL="$RENDER_DB" npm run media:cloudinary -- --dry-run   # shows what will move
DATABASE_URL="$RENDER_DB" npm run media:cloudinary                # moves them
```

It uploads every picture in Admin → Media that isn't on Cloudinary yet (built-in screenshots and
portrait, and anything you uploaded on your Mac, from `./uploads`) and points the database at the
Cloudinary copies. Pages don't change otherwise. Run it from the folder that has your `uploads`.
It's safe to run again: it only moves what is left (for example after a failure).

## 5. Vercel (the site)

1. The code must be on the branch Vercel deploys (usually `main`): merge the work branch into
   `main` on GitHub first (or set Vercel's Production Branch to the work branch).
2. Sign up at <https://vercel.com> with GitHub → **Add New → Project** → import `zack-portfolio`.
   Framework: Next.js (detected). Leave the build command as it is: Vercel runs
   `npm run vercel-build`, which also applies new database migrations on every deploy.
3. **Environment Variables** (Production, and Preview if you use previews):

   | Name | Value |
   | --- | --- |
   | `DATABASE_URL` | the Render External Database URL with `?sslmode=require` |
   | `SESSION_SECRET` | output of `openssl rand -base64 32` |
   | `NEXT_PUBLIC_SITE_URL` | `https://your-project.vercel.app` (or your own domain), no trailing `/` |
   | `STORAGE_DRIVER` | `cloudinary` |
   | `CLOUDINARY_URL` | the `cloudinary://...` value from step 1 |

4. **Deploy**. When it finishes, open the address Vercel gives you. If `NEXT_PUBLIC_SITE_URL` was a
   guess, correct it in Settings → Environment Variables and redeploy (Deployments → ⋯ → Redeploy).
5. Your own domain (optional): Settings → Domains → add it, follow Vercel's DNS instructions, then
   set `NEXT_PUBLIC_SITE_URL` to it and redeploy.

## 6. Check

- The site opens, pictures load (right-click one: its address starts with `res.cloudinary.com`).
- `/admin` → sign in with your access code → upload a picture somewhere (it goes to Cloudinary).
- Contact form: send a test message, then find it in Admin → Inquiries.

## Good to know

- **Uploads on Vercel:** a request can't be bigger than 4.5 MB. The admin shrinks big photos in your
  browser before sending (to 2400 px WebP, which the site does anyway), and tells you when files are
  still too big. 3D models must be under 4 MB.
- **If the site won't start** with "On Vercel, set STORAGE_DRIVER…": the two Cloudinary variables are
  missing in Vercel. Vercel has no lasting disk, so the site refuses to save uploads there.
- **Database errors:** `P1001 Can't reach database server` means `DATABASE_URL` is wrong or the
  Render database is suspended or expired. A certificate error means the `?sslmode=require` part is
  missing or mistyped.
- **Vercel's free (Hobby) plan** is meant for personal, non-commercial sites. A portfolio that takes
  client work may need the Pro plan; read Vercel's fair-use terms and decide.
- **Backups:** Render's paid plans keep daily backups. You can also copy the live database to your
  Mac any time: `pg_dump -Fc "$RENDER_DB" -f zack-$(date +%F).dump`.
