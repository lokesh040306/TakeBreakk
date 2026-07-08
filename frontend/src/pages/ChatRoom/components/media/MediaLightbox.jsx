/**
 * MediaLightbox.jsx
 *
 * Full-screen image/video viewer — triggered by clicking a media message.
 * Closes on backdrop click, Escape key, or the X button.
 * Supports both images and videos.
 */
import { useEffect } from "react";
import { FiX, FiDownload } from "react-icons/fi";

function MediaLightbox({ url, type, name, onClose }) {
  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="lightbox-overlay" onClick={onClose}>
      {/* Stop propagation so clicks on the media itself don't close */}
      <div
        className="relative max-w-[90vw] max-h-[90vh] flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar — filename + action buttons */}
        <div className="flex items-center justify-between w-full mb-3 px-1">
          <span className="text-sm text-white/70 truncate max-w-xs">{name}</span>

          <div className="flex items-center gap-2">
            {/* Download button */}
            <a
              href={url}
              download={name}
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
              title="Download"
              onClick={(e) => e.stopPropagation()}
            >
              <FiDownload size={16} />
            </a>

            {/* Close button */}
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
              title="Close (Esc)"
            >
              <FiX size={16} />
            </button>
          </div>
        </div>

        {/* Media content */}
        {type === "image" ? (
          <img
            src={url}
            alt={name}
            className="max-w-[85vw] max-h-[80vh] rounded-2xl object-contain shadow-2xl"
          />
        ) : (
          <video
            src={url}
            controls
            autoPlay
            className="max-w-[85vw] max-h-[80vh] rounded-2xl shadow-2xl"
          />
        )}
      </div>
    </div>
  );
}

export default MediaLightbox;
