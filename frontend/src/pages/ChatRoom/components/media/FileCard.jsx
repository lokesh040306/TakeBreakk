/**
 * FileCard.jsx
 *
 * WhatsApp-style file attachment card shown in message bubbles.
 * Displays: file type icon, name, size, and a download button.
 * Used for non-image, non-video file attachments (PDF, ZIP, DOCX, etc.)
 */
import { FiDownload } from "react-icons/fi";
import { formatFileSize, fileTypeIcon } from "../../../../utils/helpers";

function FileCard({ url, name, size, mime, isTemp }) {
  return (
    <a
      href={isTemp ? undefined : url}
      download={name}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-3 p-3 rounded-xl transition"
      style={{
        background: "rgba(99,102,241,0.08)",
        border: "1px solid rgba(99,102,241,0.18)",
        textDecoration: "none",
        cursor: isTemp ? "default" : "pointer",
        minWidth: "200px",
        maxWidth: "260px",
      }}
    >
      {/* File type icon in a colored bubble */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
        style={{ background: "rgba(99,102,241,0.15)" }}
      >
        {fileTypeIcon(mime, name)}
      </div>

      {/* File info */}
      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-medium truncate"
          style={{ color: "var(--text)" }}
          title={name}
        >
          {name || "File"}
        </p>
        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
          {isTemp ? "Uploading…" : formatFileSize(size)}
        </p>
      </div>

      {/* Download icon — hidden while uploading */}
      {!isTemp && (
        <FiDownload size={15} className="shrink-0 opacity-60" style={{ color: "var(--text-muted)" }} />
      )}
    </a>
  );
}

export default FileCard;
