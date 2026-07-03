import { useCallback, useState } from "react";

interface UploadResult {
  objectPath: string;
  fileName: string;
}

interface UseUploadOptions {
  basePath?: string;
}

/**
 * Two-step presigned-URL upload to object storage:
 * 1. Ask the API server for a presigned PUT URL (JSON metadata only).
 * 2. PUT the file bytes directly to Google Cloud Storage.
 *
 * Returns the normalized objectPath (store this in the DB) and the original
 * file name.
 */
export function useUpload(options: UseUploadOptions = {}) {
  const basePath = options.basePath ?? "/api/storage";
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const uploadFile = useCallback(
    async (file: File): Promise<UploadResult | null> => {
      setIsUploading(true);
      setError(null);
      try {
        const urlRes = await fetch(`${basePath}/uploads/request-url`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: file.name,
            size: file.size,
            contentType: file.type || "application/octet-stream",
          }),
        });
        if (!urlRes.ok) {
          throw new Error("Failed to get upload URL");
        }
        const { uploadURL, objectPath } = (await urlRes.json()) as {
          uploadURL: string;
          objectPath: string;
        };

        const putRes = await fetch(uploadURL, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type || "application/octet-stream" },
        });
        if (!putRes.ok) {
          throw new Error("Failed to upload file to storage");
        }

        return { objectPath, fileName: file.name };
      } catch (err) {
        const e = err instanceof Error ? err : new Error("Upload failed");
        setError(e);
        return null;
      } finally {
        setIsUploading(false);
      }
    },
    [basePath],
  );

  return { uploadFile, isUploading, error };
}
