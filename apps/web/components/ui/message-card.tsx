"use client";

import { useState } from "react";
import type { Message } from "@/lib/messages/types";
import { messagesService } from "@/lib/messages/service";
import styles from "./message-card.module.scss";

interface MessageCardProps {
  message: Message;
  onUpdate: () => void;
  onDelete: () => void;
}

export default function MessageCard({
  message,
  onUpdate,
  onDelete,
}: MessageCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(message.content);
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdate = async () => {
    if (content.trim() === "") return;

    setIsLoading(true);
    try {
      await messagesService.updateMessage(message.id, content.trim());
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      console.error("Error updating message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this message?")) return;

    setIsLoading(true);
    try {
      await messagesService.deleteMessage(message.id);
      onDelete();
    } catch (error) {
      console.error("Error deleting message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setContent(message.content);
    setIsEditing(false);
  };

  return (
    <div className={styles["message-card"]}>
      <div className={styles["message-header"]}>
        <span className={styles["message-date"]}>
          {new Date(message.created_at).toLocaleDateString()}
        </span>
        <div className={styles["message-actions"]}>
          {isEditing ? (
            <>
              <button
                onClick={handleUpdate}
                disabled={isLoading}
                className={`${styles.btn} ${styles["btn-primary"]} ${styles["btn-sm"]}`}
              >
                Save
              </button>
              <button
                onClick={handleCancel}
                disabled={isLoading}
                className={`${styles.btn} ${styles["btn-secondary"]} ${styles["btn-sm"]}`}
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className={`${styles.btn} ${styles["btn-secondary"]} ${styles["btn-sm"]}`}
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                disabled={isLoading}
                className={`${styles.btn} ${styles["btn-danger"]} ${styles["btn-sm"]}`}
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      {isEditing ? (
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className={styles["message-edit-input"]}
          rows={3}
        />
      ) : (
        <p className={styles["message-content"]}>{message.content}</p>
      )}
    </div>
  );
}
