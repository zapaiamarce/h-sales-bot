"use client";

import { useState, useEffect } from "react";
import type { Message } from "@/lib/messages/types";
import { messagesService } from "@/lib/messages/service";
import MessageCard from "./message-card";
import styles from "./message-list.module.scss";

export default function MessageList() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await messagesService.getMessages();
      setMessages(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch messages");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleMessageCreated = () => {
    fetchMessages();
  };

  const handleMessageUpdated = () => {
    fetchMessages();
  };

  const handleMessageDeleted = () => {
    fetchMessages();
  };

  if (isLoading) {
    return (
      <div className={styles["message-list"]}>
        <div className={styles.loading}>Loading messages...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles["message-list"]}>
        <div className={styles.error}>
          <p>Error: {error}</p>
          <button
            onClick={fetchMessages}
            className={`${styles.btn} ${styles["btn-primary"]}`}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className={styles["message-list"]}>
        <div className={styles["empty-state"]}>
          <p>No messages yet. Create your first message!</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles["message-list"]}>
      {messages.map((message) => (
        <MessageCard
          key={message.id}
          message={message}
          onUpdate={handleMessageUpdated}
          onDelete={handleMessageDeleted}
        />
      ))}
    </div>
  );
}
