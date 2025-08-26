"use client";

import { useState } from "react";
import { messagesService } from "@/lib/messages/service";
import styles from "./message-form.module.scss";

interface MessageFormProps {
  onMessageCreated: () => void;
}

export default function MessageForm({ onMessageCreated }: MessageFormProps) {
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (content.trim() === "") return;

    setIsLoading(true);
    try {
      await messagesService.createMessage(content.trim());
      setContent("");
      onMessageCreated();
    } catch (error) {
      console.error("Error creating message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles["message-form"]}>
      <div className={styles["form-group"]}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your message here..."
          className={styles["message-input"]}
          rows={3}
          disabled={isLoading}
        />
      </div>

      <button
        type="submit"
        disabled={isLoading || content.trim() === ""}
        className={`${styles.btn} ${styles["btn-primary"]}`}
      >
        {isLoading ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}
