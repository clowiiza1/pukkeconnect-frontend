import { useEffect, useMemo, useState } from "react";
import { getCachedDownloadUrl } from "@/services/uploads.jsx";

const EMPTY = [];

export function useMediaPreviews(media) {
  const [previews, setPreviews] = useState(EMPTY);

  const signature = useMemo(() => {
    if (!Array.isArray(media) || media.length === 0) return "";
    return media
      .map((item) => `${item.key}:${item.position ?? 0}`)
      .join("|");
  }, [media]);

  useEffect(() => {
    let cancelled = false;

    if (!Array.isArray(media) || media.length === 0) {
      setPreviews(EMPTY);
      return () => {
        cancelled = true;
      };
    }

    setPreviews(
      media.map((item) => ({
        key: item.key,
        url: null,
        loading: true,
        error: false,
      }))
    );

    const load = async () => {
      try {
        const results = await Promise.all(
          media.map(async (item) => {
            try {
              const url = await getCachedDownloadUrl(item.key);
              return { key: item.key, url, error: false };
            } catch {
              return { key: item.key, url: null, error: true };
            }
          })
        );

        if (cancelled) return;

        setPreviews(
          results.map((result) => ({
            key: result.key,
            url: result.url,
            loading: false,
            error: result.error,
          }))
        );
      } catch (error) {
        console.error("Failed to load media previews", error);
        if (cancelled) return;
        setPreviews(
          media.map((item) => ({
            key: item.key,
            url: null,
            loading: false,
            error: true,
          }))
        );
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [signature]);

  return previews;
}
