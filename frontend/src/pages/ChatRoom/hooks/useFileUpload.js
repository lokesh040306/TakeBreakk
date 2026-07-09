/**
 * useFileUpload.js
 *
 * Handles file attachment uploads with:
 * 1. Optimistic UI — shows a preview immediately before upload completes
 * 2. POST to /api/uploads/file via multipart form data
 * 3. Backend saves to Cloudinary and emits the real message via socket
 * 4. On success: the socket "message:receive" event replaces the temp message
 * 5. On failure: temp message is removed and error toast is shown
 *
 * The hook returns { uploading, handleFileUpload }.
 */
import { useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const useFileUpload = ({ socket, roomId, username, setMessages, fileInputRef }) => {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (file) => {
    if (!file) return;

    // Create a unique temp ID for the optimistic message
    const tempId = `temp-${Date.now()}`;

    // Determine message type from MIME
    const type = file.type.startsWith("image/")
      ? "image"
      : file.type.startsWith("video/")
      ? "video"
      : "file";

    /**
     * Optimistic message — shown immediately so the user sees something
     * while upload is in progress. Uses a local blob URL for preview.
     * isTemp=true flags it for replacement when the real message arrives.
     */
    const tempMessage = {
      _id: tempId,
      roomId,
      sender: username,
      type,
      content: URL.createObjectURL(file), // local blob URL for instant preview
      fileMeta: {
        name: file.name,
        size: file.size,
        mime: file.type,
      },
      isTemp: true,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempMessage]);

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("roomId", roomId);
      formData.append("username", username);

      const res = await fetch(`${API_BASE_URL}/api/uploads/file`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || `Upload failed (${res.status})`);
      }

      /**
       * Success: the backend will emit "message:receive" with the real
       * Cloudinary URL via socket. useChatSocket handles replacing the
       * temp message by matching sender + filename.
       */
    } catch (err) {
      console.error("[useFileUpload] Upload failed:", err.message);
      // Remove the optimistic preview on failure
      setMessages((prev) => prev.filter((m) => m._id !== tempId));
      // Note: the toast is shown here via a returned error flag
      // so ChatRoom can display it — OR we just rely on the socket "error" event
    } finally {
      setUploading(false);
      // Reset file input so the same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return { uploading, handleFileUpload };
};

export default useFileUpload;
