import React from "react";
import { Loader2 } from "lucide-react";
import { useMediaPreviews } from "@/hooks/useMediaPreviews.js";

export function MediaPreviewGrid({ media, className = "" }) {
  const previews = useMediaPreviews(media);

  if (!Array.isArray(media) || media.length === 0) return null;

  return (
    <div className={`mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 ${className}`}>
      {previews.map((preview) => (
        <div
          key={preview.key}
          className="relative overflow-hidden rounded-xl border border-gray-200 bg-gray-50"
        >
          {preview.loading ? (
            <div className="flex h-32 items-center justify-center text-xs text-gray-500">
              <Loader2 size={16} className="animate-spin" />
            </div>
          ) : preview.error || !preview.url ? (
            <div className="flex h-32 items-center justify-center text-xs text-red-500">
              Failed to load
            </div>
          ) : (
            <img
              src={preview.url}
              alt="Attached media"
              className="h-32 w-full object-cover"
            />
          )}
        </div>
      ))}
    </div>
  );
}
