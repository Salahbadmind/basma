import express from "express";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const app = express();

// CORS Headers
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept");
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

// JSON Body parser
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Health check route
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "El Bahdja Dental API", platform: "vercel" });
});

// Public Configuration route for client bootstrap
app.get("/api/config", (req, res) => {
  res.json({
    supabase: {
      url: process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "https://ubdulhtzwfynlbskjhti.supabase.co",
      anonKey: process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViZHVsaHR6d2Z5bmxic2tqaHRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ5NzM5ODgsImV4cCI6MjEwMDU0OTk4OH0.cgVnqdXuWLSGQa9SMKd5Cs7Qt9oYstTHTwFdrFiNnkU",
    },
    cloudflare: {
      accountId: process.env.CLOUDFLARE_ACCOUNT_ID || "4083f5348ec93aaa56ce2f38723f81ab",
      r2AccessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || "ced36bb1a0376657cd8b17c361118744",
      r2SecretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || "a2a84908c605943dd4718437b90e840835a71fea330bc0a48c06def5d9b32d8b",
      r2BucketName: process.env.CLOUDFLARE_R2_BUCKET_NAME || "basma",
      customDomain: process.env.CLOUDFLARE_R2_PUBLIC_CUSTOM_DOMAIN || "https://pub-70361fd9ada342788392ffd9416b3094.r2.dev",
    }
  });
});

// Cloudflare Upload Proxy
app.post("/api/cloudflare/upload", async (req, res) => {
  try {
    const { 
      dataUrl, 
      imageUrl,
      fileName, 
      folder = "media",
      accountId = process.env.CLOUDFLARE_ACCOUNT_ID || "4083f5348ec93aaa56ce2f38723f81ab", 
      apiToken = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || process.env.CLOUDFLARE_API_TOKEN || "a2a84908c605943dd4718437b90e840835a71fea330bc0a48c06def5d9b32d8b",
      r2AccessKeyId,
      r2SecretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || process.env.CLOUDFLARE_API_TOKEN || "a2a84908c605943dd4718437b90e840835a71fea330bc0a48c06def5d9b32d8b",
      r2BucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME || "basma",
      accountHash,
      customDomain = process.env.CLOUDFLARE_R2_PUBLIC_CUSTOM_DOMAIN || "https://pub-70361fd9ada342788392ffd9416b3094.r2.dev"
    } = req.body;

    const defaultR2KeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || "ced36bb1a0376657cd8b17c361118744";
    const resolvedKeyId = (!r2AccessKeyId || r2AccessKeyId === accountId || r2AccessKeyId === "4083f5348ec93aaa56ce2f38723f81ab")
      ? defaultR2KeyId
      : r2AccessKeyId;

    let buffer: Buffer;
    let mimeType = "image/jpeg";
    const cleanFileName = fileName || `file_${Date.now()}`;

    // 1. External URL vs Base64
    if (imageUrl && !dataUrl) {
      try {
        const fetchRes = await fetch(imageUrl);
        if (!fetchRes.ok) throw new Error(`HTTP ${fetchRes.status}`);
        const arrayBuf = await fetchRes.arrayBuffer();
        buffer = Buffer.from(arrayBuf);
        mimeType = fetchRes.headers.get("content-type") || "image/jpeg";
      } catch (fetchErr: any) {
        return res.status(400).json({ success: false, error: `Impossible de télécharger l'image: ${fetchErr.message}` });
      }
    } else if (dataUrl) {
      const matches = dataUrl.match(/^data:([A-Za-z-+\/0-9]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return res.status(400).json({ success: false, error: "Format base64 invalide." });
      }
      mimeType = matches[1];
      buffer = Buffer.from(matches[2], "base64");
    } else {
      return res.status(400).json({ success: false, error: "Aucun fichier ou URL d'image fourni." });
    }

    const ext = mimeType.includes("png") ? "png" : mimeType.includes("webp") ? "webp" : mimeType.includes("svg") ? "svg" : mimeType.includes("mp4") ? "mp4" : "jpg";
    const sanitizedName = cleanFileName.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 30);
    const objectKey = `${folder}/${sanitizedName}_${Date.now()}.${ext}`;

    // Cloudflare R2 Upload
    if (accountId && (r2SecretAccessKey || apiToken)) {
      try {
        const keyId = resolvedKeyId.trim();
        const secretKey = (r2SecretAccessKey || apiToken).trim();
        const bucket = (r2BucketName || "basma").trim();

        const s3 = new S3Client({
          region: "auto",
          endpoint: `https://${accountId.trim()}.r2.cloudflarestorage.com`,
          credentials: {
            accessKeyId: keyId,
            secretAccessKey: secretKey,
          },
        });

        const putCmd = new PutObjectCommand({
          Bucket: bucket,
          Key: objectKey,
          Body: buffer,
          ContentType: mimeType,
        });

        await s3.send(putCmd);

        const domain = (customDomain || "https://pub-70361fd9ada342788392ffd9416b3094.r2.dev").trim().replace(/\/$/, "");
        const finalUrl = `${domain}/${objectKey}`;

        return res.json({
          success: true,
          url: finalUrl,
          objectKey: objectKey,
          storage: "cloudflare-r2"
        });
      } catch (r2Err: any) {
        console.warn("R2 Upload failed:", r2Err.name, r2Err.message);
      }
    }

    // Cloudflare Images API
    if (accountId && apiToken && !mimeType.startsWith("video/")) {
      try {
        const blob = new Blob([buffer], { type: mimeType });
        const formData = new FormData();
        formData.append("file", blob, `${sanitizedName}.${ext}`);
        formData.append("requireSignedURLs", "false");

        const cfRes = await fetch(
          `https://api.cloudflare.com/client/v4/accounts/${accountId.trim()}/images/v1`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiToken.trim()}`,
            },
            body: formData,
          }
        );

        const cfData: any = await cfRes.json();

        if (cfData.success && cfData.result) {
          let cdnUrl = "";
          if (cfData.result.variants && cfData.result.variants.length > 0) {
            cdnUrl = cfData.result.variants[0];
          } else if (accountHash) {
            cdnUrl = `https://imagedelivery.net/${accountHash.trim()}/${cfData.result.id}/public`;
          } else {
            cdnUrl = `https://imagedelivery.net/${cfData.result.id}/public`;
          }

          return res.json({
            success: true,
            url: cdnUrl,
            cloudflareId: cfData.result.id,
            storage: "cloudflare-images"
          });
        }
      } catch (cfErr: any) {
        console.warn("Cloudflare Images failed:", cfErr.message);
      }
    }

    // Data URL fallback if direct CDN unavailable
    return res.json({
      success: true,
      url: dataUrl || imageUrl,
      storage: "embedded-fallback"
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || "Erreur serveur" });
  }
});

// Cloudflare Connection Test Route
app.post("/api/cloudflare/test", async (req, res) => {
  try {
    const { 
      accountId = process.env.CLOUDFLARE_ACCOUNT_ID || "4083f5348ec93aaa56ce2f38723f81ab", 
      apiToken = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || process.env.CLOUDFLARE_API_TOKEN || "a2a84908c605943dd4718437b90e840835a71fea330bc0a48c06def5d9b32d8b",
      r2AccessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || process.env.CLOUDFLARE_ACCOUNT_ID || "4083f5348ec93aaa56ce2f38723f81ab",
      r2SecretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || process.env.CLOUDFLARE_API_TOKEN || "a2a84908c605943dd4718437b90e840835a71fea330bc0a48c06def5d9b32d8b",
      r2BucketName = "basma",
      customDomain = "https://pub-70361fd9ada342788392ffd9416b3094.r2.dev"
    } = req.body;

    if (!accountId) {
      return res.json({ success: false, message: "Account ID manquant." });
    }

    const defaultR2KeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || "ced36bb1a0376657cd8b17c361118744";
    const resolvedKeyId = (!r2AccessKeyId || r2AccessKeyId === accountId || r2AccessKeyId === "4083f5348ec93aaa56ce2f38723f81ab")
      ? defaultR2KeyId
      : r2AccessKeyId;

    if (r2SecretAccessKey || apiToken) {
      try {
        const s3 = new S3Client({
          region: "auto",
          endpoint: `https://${accountId.trim()}.r2.cloudflarestorage.com`,
          credentials: {
            accessKeyId: resolvedKeyId.trim(),
            secretAccessKey: (r2SecretAccessKey || apiToken).trim(),
          },
        });

        const probeKey = `system/probe_${Date.now()}.txt`;
        await s3.send(new PutObjectCommand({
          Bucket: (r2BucketName || "basma").trim(),
          Key: probeKey,
          Body: "OK",
          ContentType: "text/plain",
        }));

        const domain = (customDomain || "https://pub-70361fd9ada342788392ffd9416b3094.r2.dev").trim().replace(/\/$/, "");
        return res.json({
          success: true,
          storageType: "r2",
          message: `✅ Connexion réussie à Cloudflare R2 ! Le bucket '${r2BucketName || "basma"}' est prêt.`,
          testUrl: `${domain}/${probeKey}`,
        });
      } catch (r2Err: any) {
        console.warn("Cloudflare test R2 failed:", r2Err.name, r2Err.message);
      }
    }

    return res.json({
      success: false,
      message: `Impossible de valider les identifiants Cloudflare.`,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || "Erreur" });
  }
});

export default app;
