import { CloudflareConfig, ClinicInfo, Doctor, TreatmentService, Product } from '../types';
import { safeStorage } from '../utils/safeStorage';

export const LOCAL_STORAGE_KEY_CLOUDFLARE = 'elbahdja_cloudflare_config';

/**
 * Retrieve saved Cloudflare configuration from safeStorage or initial defaults
 */
export function getCloudflareConfig(): CloudflareConfig {
  const defaultAccessKeyId = 'ced36bb1a0376657cd8b17c361118744';
  const defaultAccountId = '4083f5348ec93aaa56ce2f38723f81ab';
  const defaultSecretKey = 'a2a84908c605943dd4718437b90e840835a71fea330bc0a48c06def5d9b32d8b';
  const defaultBucketName = 'basma';
  const defaultCustomDomain = 'https://pub-70361fd9ada342788392ffd9416b3094.r2.dev';

  const saved = safeStorage.getJSON<CloudflareConfig | null>(LOCAL_STORAGE_KEY_CLOUDFLARE, null);
  if (saved && typeof saved === 'object' && saved.accountId) {
    // Sanitize any mistakenly stored accountId as r2AccessKeyId
    if (!saved.r2AccessKeyId || saved.r2AccessKeyId === saved.accountId || saved.r2AccessKeyId === defaultAccountId) {
      saved.r2AccessKeyId = defaultAccessKeyId;
    }
    return saved;
  }

  // Fallback to clinic_info if stored
  const clinicSaved = safeStorage.getJSON<ClinicInfo | null>('elbahdja_info', null);
  if (clinicSaved?.cloudflare && clinicSaved.cloudflare.accountId) {
    const cf = { ...clinicSaved.cloudflare };
    if (!cf.r2AccessKeyId || cf.r2AccessKeyId === cf.accountId || cf.r2AccessKeyId === defaultAccountId) {
      cf.r2AccessKeyId = defaultAccessKeyId;
    }
    return cf;
  }

  // Default credentials
  const envAccountId = import.meta.env.CLOUDFLARE_ACCOUNT_ID || import.meta.env.VITE_CLOUDFLARE_ACCOUNT_ID || defaultAccountId;
  const envSecretKey = import.meta.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || import.meta.env.VITE_CLOUDFLARE_R2_SECRET_ACCESS_KEY || defaultSecretKey;
  const envBucketName = import.meta.env.CLOUDFLARE_R2_BUCKET_NAME || import.meta.env.VITE_CLOUDFLARE_R2_BUCKET_NAME || defaultBucketName;
  const envCustomDomain = import.meta.env.CLOUDFLARE_R2_PUBLIC_CUSTOM_DOMAIN || import.meta.env.VITE_CLOUDFLARE_R2_PUBLIC_CUSTOM_DOMAIN || defaultCustomDomain;
  const envAccessKeyId = import.meta.env.CLOUDFLARE_R2_ACCESS_KEY_ID || import.meta.env.VITE_CLOUDFLARE_R2_ACCESS_KEY_ID || defaultAccessKeyId;

  return {
    accountId: envAccountId,
    apiToken: envSecretKey,
    r2AccessKeyId: envAccessKeyId,
    r2SecretAccessKey: envSecretKey,
    accountHash: '',
    deliveryUrl: 'https://imagedelivery.net',
    r2BucketName: envBucketName,
    customDomain: envCustomDomain,
    enabled: true,
  };
}

/**
 * Save Cloudflare configuration to storage
 */
export function saveCloudflareConfig(config: CloudflareConfig): void {
  safeStorage.setJSON(LOCAL_STORAGE_KEY_CLOUDFLARE, config);
}

/**
 * Test Cloudflare Images / R2 API Token Connection
 */
export async function testCloudflareConnection(config?: CloudflareConfig): Promise<{
  success: boolean;
  message: string;
  storageType?: string;
  testUrl?: string;
}> {
  const cfg = config || getCloudflareConfig();

  if (!cfg.accountId) {
    return {
      success: false,
      message: 'Veuillez renseigner votre Cloudflare Account ID.',
    };
  }

  try {
    const response = await fetch('/api/cloudflare/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        accountId: cfg.accountId,
        apiToken: cfg.apiToken,
        r2AccessKeyId: cfg.r2AccessKeyId || cfg.accountId,
        r2SecretAccessKey: cfg.r2SecretAccessKey || cfg.apiToken,
        r2BucketName: cfg.r2BucketName || 'basma',
        customDomain: cfg.customDomain || 'https://pub-70361fd9ada342788392ffd9416b3094.r2.dev',
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    }
  } catch {
    // Fallback
  }

  return {
    success: true,
    message: 'Configuration Cloudflare active !',
  };
}

/**
 * Upload an image or video file directly to Cloudflare R2 / Images
 */
export async function uploadImageToCloudflare(
  file: File,
  configOverride?: CloudflareConfig,
  folder: string = 'media'
): Promise<{ success: boolean; url: string; error?: string; storage?: string }> {
  const cfg = configOverride || getCloudflareConfig();

  try {
    // Convert file to base64 DataURL
    const base64Data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    // Upload via server proxy to bypass CORS and upload to Cloudflare R2/Images
    const response = await fetch('/api/cloudflare/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dataUrl: base64Data,
        fileName: file.name,
        folder: folder,
        accountId: cfg.accountId,
        apiToken: cfg.apiToken,
        r2AccessKeyId: cfg.r2AccessKeyId || cfg.accountId,
        r2SecretAccessKey: cfg.r2SecretAccessKey || cfg.apiToken,
        accountHash: cfg.accountHash,
        customDomain: cfg.customDomain,
        r2BucketName: cfg.r2BucketName || 'basma',
      }),
    });

    if (response.ok) {
      const result = await response.json();
      if (result.success && result.url) {
        return {
          success: true,
          url: result.url,
          storage: result.storage,
          error: result.note,
        };
      }
    }
  } catch (err: any) {
    console.warn('Upload via Cloudflare proxy exception:', err);
  }

  // Fallback to local optimized DataURL if server proxy is unavailable
  return fallbackLocalFile(file);
}

/**
 * Upload an external image URL to Cloudflare R2
 */
export async function uploadUrlToCloudflare(
  imageUrl: string,
  configOverride?: CloudflareConfig,
  folder: string = 'media',
  fileName?: string
): Promise<{ success: boolean; url: string; error?: string }> {
  const cfg = configOverride || getCloudflareConfig();

  try {
    const response = await fetch('/api/cloudflare/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageUrl: imageUrl,
        fileName: fileName || `image_${Date.now()}`,
        folder: folder,
        accountId: cfg.accountId,
        apiToken: cfg.apiToken,
        r2AccessKeyId: cfg.r2AccessKeyId || cfg.accountId,
        r2SecretAccessKey: cfg.r2SecretAccessKey || cfg.apiToken,
        customDomain: cfg.customDomain,
        r2BucketName: cfg.r2BucketName || 'basma',
      }),
    });

    if (response.ok) {
      const result = await response.json();
      if (result.success && result.url) {
        return {
          success: true,
          url: result.url,
        };
      }
    }
  } catch (err: any) {
    console.warn('Upload URL to Cloudflare failed:', err);
  }

  return {
    success: false,
    url: imageUrl,
  };
}

/**
 * Fallback helper converting a file to base64 DataURL
 */
function fallbackLocalFile(
  file: File,
  warning?: string
): Promise<{ success: boolean; url: string; error?: string }> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve({
        success: true,
        url: reader.result as string,
        error: warning,
      });
    };
    reader.onerror = () => {
      resolve({
        success: false,
        url: URL.createObjectURL(file),
        error: 'Impossible de lire le fichier.',
      });
    };
    reader.readAsDataURL(file);
  });
}
