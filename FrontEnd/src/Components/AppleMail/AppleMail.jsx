import { useState } from "react";
import "./Apple.css";

const today = new Date().toLocaleDateString();
const inboxMessages = [
  {
    id: "apple",
    sender: "Apple ID",
    address: "apple@id.apple.com",
    subject: "Your Apple ID was used to sign in",
    date: "Tue, 8:30 AM",
    text: "A new device was used to sign in to your Apple ID. If this was not you, review your account security.",
    recipient: "user@macbook.com",
  },
  {
    id: "portfolio",
    sender: "Promise_X",
    address: "promise0X@gmail.com",
    subject: "Website Project",
    date: "Thu, 9:30 AM",
    text: "Check out this new project before it is unpublished: https://github.com/Promise254",
    recipient: "user@macbook.com",
  },
];

const emptyDraft = { sender: "", subject: "", message: "" };

function AppleMail() {
  const [mailbox, setMailbox] = useState("inbox");
  const [selectedMessage, setSelectedMessage] = useState(inboxMessages[0]);
  const [sentMessages, setSentMessages] = useState([]);
  const [isComposing, setIsComposing] = useState(false);
  const [draft, setDraft] = useState(emptyDraft);
  const [sendStatus, setSendStatus] = useState("");

  const visibleMessages = mailbox === "inbox" ? inboxMessages : mailbox === "sent" ? sentMessages : [];

  async function sendEmail(event) {
    event.preventDefault();
    const message = {
      id: `sent-${Date.now()}`,
      sender: draft.sender.trim(),
      address: draft.sender.trim(),
      subject: draft.subject.trim(),
      date: today,
      text: draft.message.trim(),
      recipient: "PromiseDev@gmail.com",
    };

    if (!message.sender || !message.subject || !message.text) {
      setSendStatus("Enter your email address, a subject, and a message before sending.");
      return;
    }

    setSendStatus("Sending email to the portfolio owner...");
    try {
      const response = await fetch("http://127.0.0.1:5000/mail-user-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: {
            Sender: message.sender,
            Subject: message.subject,
            Message: message.text,
            DateSent: message.date,
          },
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.error || "Could not send your email.");
      }

      setSentMessages((current) => [message, ...current]);
      setSelectedMessage(message);
      setMailbox("sent");
      setDraft(emptyDraft);
      setIsComposing(false);
      setSendStatus("Your email was sent to the portfolio owner.");
    } catch (error) {
      setSendStatus(error instanceof Error ? error.message : "Could not send your email.");
    }
  }

  function openMailbox(nextMailbox) {
    setMailbox(nextMailbox);
    setIsComposing(false);
    const nextMessages = nextMailbox === "inbox" ? inboxMessages : nextMailbox === "sent" ? sentMessages : [];
    setSelectedMessage(nextMessages[0] || null);
    setSendStatus("");
  }

  return (
    <div className="mail-app">
      <div className="mail-container">
        <header className="mail-header">
          <div className="mail-window-lights" aria-hidden="true">
            <span className="mail-dot mail-dot-red" />
            <span className="mail-dot mail-dot-yellow" />
            <span className="mail-dot mail-dot-green" />
          </div>
          <strong className="mail-window-title">Mail</strong>
          <button
            className="mail-compose-button"
            type="button"
            onClick={() => {
              setIsComposing(true);
              setSendStatus("");
            }}
          >
            <i className="fas fa-pen" aria-hidden="true" />
            <span>New Message</span>
          </button>
        </header>

        {sendStatus && <p className="mail-api-status" role="status" aria-live="polite">{sendStatus}</p>}

        {isComposing ? (
          <form className="mail-composer" onSubmit={sendEmail}>
            <div className="mail-composer-recipient"><span>To</span><strong>PromiseDev@gmail.com</strong></div>
            <label className="mail-composer-field">
              <span>From</span>
              <input
                type="email"
                autoComplete="email"
                value={draft.sender}
                onChange={(event) => setDraft((current) => ({ ...current, sender: event.target.value }))}
                placeholder="Your email address"
                required
              />
            </label>
            <label className="mail-composer-field">
              <span>Subject</span>
              <input
                type="text"
                value={draft.subject}
                onChange={(event) => setDraft((current) => ({ ...current, subject: event.target.value }))}
                placeholder="Add a subject"
                required
              />
            </label>
            <textarea
              className="mail-composer-message"
              value={draft.message}
              onChange={(event) => setDraft((current) => ({ ...current, message: event.target.value }))}
              placeholder="Write your message..."
              required
            />
            <div className="mail-composer-actions">
              <button type="button" className="mail-cancel-button" onClick={() => setIsComposing(false)}>Cancel</button>
              <button type="submit" className="mail-send-button">
                <i className="fas fa-paper-plane" aria-hidden="true" /> Send
              </button>
            </div>
          </form>
        ) : (
          <div className="mail-main">
            <aside className="mail-sidebar" aria-label="Mailboxes">
              <button className={mailbox === "inbox" ? "selected" : ""} type="button" onClick={() => openMailbox("inbox")}>
                <span><i className="fas fa-inbox" aria-hidden="true" /> Inbox</span><span>{inboxMessages.length}</span>
              </button>
              <button className={mailbox === "sent" ? "selected" : ""} type="button" onClick={() => openMailbox("sent")}>
                <span><i className="fas fa-paper-plane" aria-hidden="true" /> Sent</span><span>{sentMessages.length}</span>
              </button>
              <button className={mailbox === "draft" ? "selected" : ""} type="button" onClick={() => openMailbox("draft")}>
                <span><i className="fas fa-file-alt" aria-hidden="true" /> Draft</span><span>0</span>
              </button>
              <button className={mailbox === "trash" ? "selected" : ""} type="button" onClick={() => openMailbox("trash")}>
                <span><i className="fas fa-trash-alt" aria-hidden="true" /> Trash</span><span>0</span>
              </button>
            </aside>

            <section className="mail-message-list" aria-label={`${mailbox} messages`}>
              {visibleMessages.length ? visibleMessages.map((message) => (
                <button
                  type="button"
                  key={message.id}
                  className={`mail-message-row ${selectedMessage?.id === message.id ? "selected" : ""}`}
                  onClick={() => setSelectedMessage(message)}
                >
                  <span className="mail-message-row-heading"><strong>{message.sender}</strong><time>{message.date}</time></span>
                  <strong className="mail-message-subject">{message.subject}</strong>
                  <span className="mail-message-preview">{message.text}</span>
                </button>
              )) : (
                <div className="mail-empty-state">
                  <i className={`fas ${mailbox === "draft" ? "fa-file-alt" : mailbox === "trash" ? "fa-trash-alt" : "fa-paper-plane"}`} aria-hidden="true" />
                  <span>No messages in {mailbox}.</span>
                </div>
              )}
            </section>

            <article className="mail-message-detail">
              {selectedMessage ? (
                <>
                  <h1>{selectedMessage.subject}</h1>
                  <dl>
                    <div><dt>From</dt><dd>{selectedMessage.sender} &lt;{selectedMessage.address}&gt;</dd></div>
                    <div><dt>To</dt><dd>{selectedMessage.recipient}</dd></div>
                    <div><dt>Date</dt><dd>{selectedMessage.date}</dd></div>
                  </dl>
                  <p className="mail-message-body">{selectedMessage.text}</p>
                </>
              ) : (
                <div className="mail-empty-detail">Select a message to read it.</div>
              )}
            </article>
          </div>
        )}
      </div>
    </div>
  );
}

export default AppleMail;
