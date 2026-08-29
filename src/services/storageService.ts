import { storage, auth, isDemoMode } from '../lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import type { PhotoStorageProviderType } from '../types';

export type UploadProgressCallback = (progress: number) => void;

/**
 * Storage Provider Configuration Interface
 */
export interface StorageProviderConfig {
  activeProvider: PhotoStorageProviderType;
  imgbbApiKey?: string;
  cloudinaryCloudName?: string;
  cloudinaryPreset?: string;
  customFreeUrl?: string;
  enableFirebaseStorage: boolean;
}

class StorageService {
  private providerConfig: StorageProviderConfig;

  constructor() {
    const imgbbApiKey = import.meta.env.VITE_IMGBB_API_KEY || '';
    const cloudinaryCloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '';
    const cloudinaryPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '';
    const customFreeUrl = import.meta.env.VITE_FREE_IMAGE_STORAGE_URL || '';
    const enableFirebaseStorage = import.meta.env.VITE_ENABLE_FIREBASE_STORAGE === 'true';

    let activeProvider: PhotoStorageProviderType = 'LOCAL_DEMO';

    if (imgbbApiKey || customFreeUrl || (cloudinaryCloudName && cloudinaryPreset)) {
      activeProvider = 'FREE_EXTERNAL';
    } else if (enableFirebaseStorage && storage && !isDemoMode()) {
      activeProvider = 'FIREBASE_STORAGE';
    } else {
      activeProvider = 'LOCAL_DEMO';
    }

    this.providerConfig = {
      activeProvider,
      imgbbApiKey,
      cloudinaryCloudName,
      cloudinaryPreset,
      customFreeUrl,
      enableFirebaseStorage
    };

    console.info(`[TrashChain PhotoStorage] Provider Initialized: ${activeProvider} (Spark Plan Compatible)`);
  }

  /**
   * Returns active storage provider details for UI display & diagnostics
   */
  public getProviderDetails(): { provider: PhotoStorageProviderType; isSparkCompatible: boolean } {
    return {
      provider: this.providerConfig.activeProvider,
      isSparkCompatible: this.providerConfig.activeProvider !== 'FIREBASE_STORAGE'
    };
  }

  /**
   * Validates image file type (JPEG, PNG, WebP) and reasonable size (max 10 MB).
   */
  public validateFile(file: File): { valid: boolean; error?: string } {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return { 
        valid: false, 
        error: `Unsupported file type (${file.type || 'unknown'}). Please upload a JPEG, PNG, or WebP image.` 
      };
    }
    const maxSizeBytes = 10 * 1024 * 1024; // 10 MB limit
    if (file.size > maxSizeBytes) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      return { 
        valid: false, 
        error: `File size (${sizeMB} MB) exceeds the 10 MB limit. Please compress or choose a smaller photo.` 
      };
    }
    return { valid: true };
  }

  /**
   * Client-side image compression helper using HTML5 Canvas API.
   * - Resizes image so longest side is max 1600px
   * - Converts to JPEG with 0.82 quality
   * - Emits incremental progress callbacks (15% -> 20% -> 25% -> 30%)
   * - Gracefully falls back to original File if compression fails or doesn't reduce size
   */
  public async compressImage(
    file: File, 
    maxDimension: number = 1600, 
    quality: number = 0.82,
    onProgress?: UploadProgressCallback
  ): Promise<Blob | File> {
    // Skip compression if file is already lightweight (< 300 KB)
    if (file.size < 300 * 1024) {
      if (onProgress) onProgress(30);
      return file;
    }

    if (onProgress) onProgress(15); // Loading image

    return new Promise((resolve) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        if (onProgress) onProgress(20); // Preparing canvas

        let { width, height } = img;
        if (width <= maxDimension && height <= maxDimension && file.size < 800 * 1024) {
          if (onProgress) onProgress(30);
          resolve(file);
          return;
        }

        // Calculate new dimensions preserving aspect ratio
        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          if (onProgress) onProgress(30);
          resolve(file);
          return;
        }

        if (onProgress) onProgress(25); // Compressing image
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            // Memory safety: release canvas dimensions immediately
            canvas.width = 0;
            canvas.height = 0;

            if (onProgress) onProgress(30); // Optimization complete
            if (blob && blob.size < file.size) {
              resolve(blob);
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        if (onProgress) onProgress(30);
        console.warn('[StorageService] Image decoding failed during compression, using original file.');
        resolve(file); // Fallback to original file on image load error
      };

      img.src = objectUrl;
    });
  }

  /**
   * Helper to convert Blob/File to Data URL for persistent offline / local mode preview
   */
  private async blobToDataURL(blob: Blob | File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read file locally.'));
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Free External Provider Handler (ImgBB / Cloudinary / Free HTTP Endpoint)
   */
  private async uploadToFreeExternalProvider(
    blobOrFile: Blob | File,
    onProgress?: UploadProgressCallback
  ): Promise<string> {
    const { imgbbApiKey, cloudinaryCloudName, cloudinaryPreset, customFreeUrl } = this.providerConfig;

    // 1. ImgBB Free API
    if (imgbbApiKey) {
      if (onProgress) onProgress(55);
      const formData = new FormData();
      formData.append('image', blobOrFile);

      const response = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbApiKey}`, {
        method: 'POST',
        body: formData
      });

      if (onProgress) onProgress(85);
      const data = await response.json();
      if (data && data.data && data.data.url) {
        if (onProgress) onProgress(100);
        return data.data.url;
      }
      throw new Error(data.error?.message || 'Free ImgBB image upload failed.');
    }

    // 2. Cloudinary Free Unsigned Upload
    if (cloudinaryCloudName && cloudinaryPreset) {
      if (onProgress) onProgress(55);
      const formData = new FormData();
      formData.append('file', blobOrFile);
      formData.append('upload_preset', cloudinaryPreset);

      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/image/upload`, {
        method: 'POST',
        body: formData
      });

      if (onProgress) onProgress(85);
      const data = await response.json();
      if (data && data.secure_url) {
        if (onProgress) onProgress(100);
        return data.secure_url;
      }
      throw new Error(data.error?.message || 'Free Cloudinary upload failed.');
    }

    // 3. Custom Free Storage URL
    if (customFreeUrl) {
      if (onProgress) onProgress(55);
      const formData = new FormData();
      formData.append('file', blobOrFile);

      const response = await fetch(customFreeUrl, {
        method: 'POST',
        body: formData
      });

      if (onProgress) onProgress(85);
      const data = await response.json();
      if (data && (data.url || data.secure_url)) {
        if (onProgress) onProgress(100);
        return data.url || data.secure_url;
      }
      throw new Error('Custom free storage endpoint failed to return image URL.');
    }

    // Fallback to DataURL
    return this.blobToDataURL(blobOrFile);
  }

  /**
   * Multi-provider internal upload dispatcher
   */
  private async performUpload(
    file: File,
    storagePath: string,
    onProgress?: UploadProgressCallback
  ): Promise<string> {
    const validation = this.validateFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Step 1: Client-Side Compression (10% -> 30%)
    if (onProgress) onProgress(10); // "Preparing photo..."

    let uploadPayload: Blob | File = file;
    try {
      uploadPayload = await this.compressImage(file, 1600, 0.82, onProgress);
    } catch (err) {
      console.warn('[StorageService] Compression error, proceeding with original file:', err);
      uploadPayload = file;
    }

    if (onProgress) onProgress(35); // "Image ready"

    const contentType = (uploadPayload as Blob).type || file.type || 'image/jpeg';

    if (import.meta.env.DEV) {
      console.info('[StorageService] Uploading with Provider:', {
        provider: this.providerConfig.activeProvider,
        originalSizeKB: (file.size / 1024).toFixed(1),
        compressedSizeKB: (uploadPayload.size / 1024).toFixed(1),
        contentType,
        path: storagePath
      });
    }

    // Step 2: Dispatch based on active provider

    // Provider A: FREE EXTERNAL PROVIDER (ImgBB / Cloudinary / Custom HTTP)
    if (this.providerConfig.activeProvider === 'FREE_EXTERNAL') {
      try {
        return await this.uploadToFreeExternalProvider(uploadPayload, onProgress);
      } catch (err: any) {
        console.warn('[StorageService] Free external upload failed, falling back to local storage:', err);
        if (onProgress) onProgress(100);
        return await this.blobToDataURL(uploadPayload);
      }
    }

    // Provider B: LOCAL DEMO / SPARK PLAN FREE STORAGE (IndexedDB / Local DataURL)
    if (this.providerConfig.activeProvider === 'LOCAL_DEMO' || !this.providerConfig.enableFirebaseStorage || !storage) {
      if (onProgress) {
        onProgress(60);
        setTimeout(() => onProgress(85), 100);
        setTimeout(() => onProgress(100), 200);
      }
      return await this.blobToDataURL(uploadPayload);
    }

    // Provider C: FIREBASE STORAGE (Only if explicitly enabled via VITE_ENABLE_FIREBASE_STORAGE)
    if (!auth?.currentUser) {
      console.warn('[StorageService] Unauthenticated user. Falling back to local storage.');
      if (onProgress) onProgress(100);
      return await this.blobToDataURL(uploadPayload);
    }

    const storageRef = ref(storage, storagePath);
    const metadata = { contentType };
    const uploadTask = uploadBytesResumable(storageRef, uploadPayload, metadata);

    return new Promise((resolve, reject) => {
      let lastBytesTransferred = -1;
      let stallTimer: ReturnType<typeof setTimeout> | null = null;

      const resetStallTimer = () => {
        if (stallTimer) clearTimeout(stallTimer);
        stallTimer = setTimeout(() => {
          uploadTask.cancel();
          reject(new Error('Upload appears stalled — network connection timed out. Please retry.'));
        }, 15000);
      };

      resetStallTimer();

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          if (snapshot.bytesTransferred > lastBytesTransferred) {
            lastBytesTransferred = snapshot.bytesTransferred;
            resetStallTimer();
          }

          const bytesProgress = snapshot.totalBytes > 0 
            ? (snapshot.bytesTransferred / snapshot.totalBytes) * 65 
            : 0;
          const progress = Math.min(100, Math.round(35 + bytesProgress));
          if (onProgress) onProgress(progress);
        },
        (error) => {
          if (stallTimer) clearTimeout(stallTimer);
          console.error(`[StorageService] Firebase Storage upload error (${error.code}):`, error);
          reject(new Error(`Storage error: ${error.message}`));
        },
        async () => {
          if (stallTimer) clearTimeout(stallTimer);
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            if (onProgress) onProgress(100);
            resolve(downloadURL);
          } catch (err) {
            reject(new Error('Failed to retrieve storage URL.'));
          }
        }
      );
    });
  }

  /**
   * Uploads a before-cleanup photo for a reported hotspot.
   * Path: hotspots/{hotspotId}/before/{filename}
   */
  public async uploadBeforePhoto(
    file: File,
    hotspotId: string,
    onProgress?: UploadProgressCallback
  ): Promise<string> {
    const cleanName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
    const filename = `before_${Date.now()}_${cleanName}`;
    const path = `hotspots/${hotspotId}/before/${filename}`;
    return this.performUpload(file, path, onProgress);
  }

  /**
   * Uploads an after-cleanup photo for a mission or recovery record.
   * Path: missions/{targetId}/after/{filename} or recovery/{targetId}/evidence/{filename}
   */
  public async uploadAfterPhoto(
    file: File,
    targetId: string,
    onProgress?: UploadProgressCallback,
    folder: 'missions' | 'recovery' = 'missions'
  ): Promise<string> {
    const cleanName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
    const filename = `after_${Date.now()}_${cleanName}`;
    const path = folder === 'missions' 
      ? `missions/${targetId}/after/${filename}`
      : `recovery/${targetId}/evidence/${filename}`;
    return this.performUpload(file, path, onProgress);
  }

  /**
   * Uploads a monitoring photo for a site recovery checkpoint.
   * Path: monitoring/{recoveryId}/{checkpointDay}/{filename}
   */
  public async uploadMonitoringPhoto(
    file: File,
    recoveryId: string,
    checkpointDay: number,
    onProgress?: UploadProgressCallback
  ): Promise<string> {
    const cleanName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
    const filename = `day${checkpointDay}_${Date.now()}_${cleanName}`;
    const path = `monitoring/${recoveryId}/${checkpointDay}/${filename}`;
    return this.performUpload(file, path, onProgress);
  }

  /**
   * Backward compatible generic upload method
   */
  public async uploadPhoto(
    file: File, 
    pathPrefix: 'before' | 'after' | 'monitoring' | 'profile', 
    onProgress?: UploadProgressCallback
  ): Promise<string> {
    const cleanName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
    const filename = `${pathPrefix}_${Date.now()}_${cleanName}`;
    const path = `trashchain_photos/${pathPrefix}/${filename}`;
    return this.performUpload(file, path, onProgress);
  }
}

export const storageService = new StorageService();
