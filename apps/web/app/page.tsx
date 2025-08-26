import MessageForm from "@/components/ui/message-form";
import MessageList from "@/components/ui/message-list";
import styles from "./page.module.scss";

export default function Home() {
  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1>H-Sales Bot</h1>
        <p>Message Management System</p>
      </header>

      <main className={styles.main}>
        <MessageForm onMessageCreated={() => {}} />
        <MessageList />
      </main>
    </div>
  );
}
