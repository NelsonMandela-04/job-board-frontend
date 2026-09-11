import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { getUser } from "../utils/auth";
import "./AdminMessages.css";

function AdminMessages() {
    const currentUser = getUser();

    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const [message, setMessage] = useState("");

    const [loading, setLoading] = useState(true);
    const [messagesLoading, setMessagesLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const isAdmin =
        currentUser?.is_staff === true ||
        currentUser?.is_superuser === true;

    const getParticipantName = (participant) => {
        if (!participant) {
            return "Unknown User";
        }

        const fullName = [
            participant.first_name,
            participant.last_name
        ]
            .filter(Boolean)
            .join(" ")
            .trim();

        return (
            fullName ||
            participant.username ||
            participant.email ||
            `User #${participant.id}`
        );
    };

    const getParticipantInitials = (participant) => {
        const name = getParticipantName(participant);

        const words = name
            .split(" ")
            .filter(Boolean);

        if (words.length >= 2) {
            return `${words[0][0]}${words[1][0]}`.toUpperCase();
        }

        return name.substring(0, 2).toUpperCase();
    };

    const getOtherParticipants = (conversation) => {
        if (!conversation?.participants) {
            return [];
        }

        return conversation.participants.filter(
            (participant) =>
                Number(participant.id) !== Number(currentUser?.id)
        );
    };

    const getConversationTitle = (conversation) => {
        if (!conversation) {
            return "Select a conversation";
        }

        if (conversation.subject) {
            return conversation.subject;
        }

        const participants = getOtherParticipants(conversation);

        if (participants.length) {
            return participants
                .map(getParticipantName)
                .join(", ");
        }

        return `Conversation #${conversation.id}`;
    };

    const getConversationSubtitle = (conversation) => {
        const participants = conversation?.participants || [];

        if (!participants.length) {
            return "No participants";
        }

        return `${participants.length} participant${
            participants.length === 1 ? "" : "s"
        }`;
    };

    const getLatestMessage = (conversation) => {
        if (!conversation?.latest_message) {
            return "No messages yet";
        }

        return conversation.latest_message.message || "No message";
    };

    const formatDate = (dateString) => {
        if (!dateString) {
            return "";
        }

        const date = new Date(dateString);

        if (Number.isNaN(date.getTime())) {
            return "";
        }

        return date.toLocaleString([], {
            dateStyle: "medium",
            timeStyle: "short"
        });
    };

    const formatShortDate = (dateString) => {
        if (!dateString) {
            return "";
        }

        const date = new Date(dateString);

        if (Number.isNaN(date.getTime())) {
            return "";
        }

        return date.toLocaleString([], {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const loadConversations = useCallback(async (showLoader = true) => {
        try {
            if (showLoader) {
                setLoading(true);
            }

            setError("");

            const response = await api.get(
                "/conversations/"
            );

            const data = Array.isArray(response.data)
                ? response.data
                : response.data?.results || [];

            setConversations(data);

            setSelectedConversation((current) => {
                if (!current) {
                    return data.length ? data[0] : null;
                }

                const updated = data.find(
                    (conversation) =>
                        Number(conversation.id) ===
                        Number(current.id)
                );

                return updated || (
                    data.length ? data[0] : null
                );
            });
        } catch (err) {
            setError(
                err?.response?.data?.detail ||
                "Unable to load conversations."
            );
        } finally {
            if (showLoader) {
                setLoading(false);
            }
        }
    }, []);

    const loadMessages = useCallback(async (conversation) => {
        if (!conversation?.id) {
            setMessages([]);
            return;
        }

        try {
            setMessagesLoading(true);
            setError("");

            const response = await api.get(
                `/conversations/${conversation.id}/messages/`
            );

            const data = Array.isArray(response.data)
                ? response.data
                : response.data?.results || [];

            setMessages(data);
        } catch (err) {
            setError(
                err?.response?.data?.detail ||
                "Unable to load messages."
            );
        } finally {
            setMessagesLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!isAdmin) {
            setLoading(false);
            return;
        }

        loadConversations();

        const interval = setInterval(() => {
            loadConversations(false);
        }, 15000);

        return () => clearInterval(interval);
    }, [isAdmin, loadConversations]);

    useEffect(() => {
        if (!selectedConversation) {
            setMessages([]);
            return;
        }

        loadMessages(selectedConversation);

        const interval = setInterval(() => {
            loadMessages(selectedConversation);
        }, 10000);

        return () => clearInterval(interval);
    }, [selectedConversation, loadMessages]);

    const filteredConversations = useMemo(() => {
        const searchValue = search
            .trim()
            .toLowerCase();

        return conversations.filter((conversation) => {
            const statusMatches =
                statusFilter === "all" ||
                conversation.status === statusFilter;

            if (!statusMatches) {
                return false;
            }

            if (!searchValue) {
                return true;
            }

            const participantText = (
                conversation.participants || []
            )
                .map((participant) =>
                    [
                        participant.username,
                        participant.first_name,
                        participant.last_name,
                        participant.email
                    ]
                        .filter(Boolean)
                        .join(" ")
                )
                .join(" ");

            const searchableText = [
                conversation.subject,
                participantText,
                getLatestMessage(conversation)
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            return searchableText.includes(
                searchValue
            );
        });
    }, [
        conversations,
        search,
        statusFilter
    ]);

    const openCount = useMemo(() => {
        return conversations.filter(
            (conversation) =>
                conversation.status === "open"
        ).length;
    }, [conversations]);

    const closedCount = useMemo(() => {
        return conversations.filter(
            (conversation) =>
                conversation.status === "closed"
        ).length;
    }, [conversations]);

    const selectConversation = (conversation) => {
        setSelectedConversation(conversation);
        setSuccess("");
        setError("");
    };

    const sendMessage = async (event) => {
        event.preventDefault();

        if (!selectedConversation?.id) {
            return;
        }

        const content = message.trim();

        if (!content) {
            setError("Please enter a message.");
            return;
        }

        try {
            setSending(true);
            setError("");
            setSuccess("");

            const response = await api.post(
                `/conversations/${selectedConversation.id}/send_message/`,
                {
                    message: content
                }
            );

            const newMessage = response.data;

            setMessages((current) => [
                ...current,
                newMessage
            ]);

            setMessage("");

            await loadConversations(false);

            setSuccess("Message sent successfully.");
        } catch (err) {
            setError(
                err?.response?.data?.detail ||
                "Unable to send message."
            );
        } finally {
            setSending(false);
        }
    };

    const changeConversationStatus = async (
        action
    ) => {
        if (!selectedConversation?.id) {
            return;
        }

        try {
            setActionLoading(true);
            setError("");
            setSuccess("");

            const endpoint =
                action === "close"
                    ? "close"
                    : "reopen";

            const response = await api.post(
                `/conversations/${selectedConversation.id}/${endpoint}/`
            );

            setSuccess(
                response?.data?.detail ||
                "Conversation updated successfully."
            );

            await loadConversations(false);
        } catch (err) {
            setError(
                err?.response?.data?.detail ||
                "Unable to update conversation."
            );
        } finally {
            setActionLoading(false);
        }
    };

    const refreshMessages = async () => {
        if (!selectedConversation) {
            return;
        }

        await loadMessages(
            selectedConversation
        );

        await loadConversations(false);
    };

    if (!isAdmin) {
        return (
            <div className="admin-messages-page">
                <div className="admin-messages-overlay">
                    <div className="admin-messages-access-denied">
                        <div className="access-denied-icon">
                            <i className="bi bi-shield-lock-fill"></i>
                        </div>

                        <h2>Access denied</h2>

                        <p>
                            You do not have permission to access
                            the administrator messaging center.
                        </p>

                        <Link
                            to="/"
                            className="admin-messages-back-btn"
                        >
                            <i className="bi bi-house-fill"></i>
                            Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-messages-page">
            <div className="admin-messages-overlay">

                <div className="admin-messages-container">

                    <div className="admin-messages-header">

                        <div className="admin-messages-header-left">

                            <div className="admin-messages-icon">
                                <i className="bi bi-chat-left-dots-fill"></i>
                            </div>

                            <div>
                                <div className="admin-messages-breadcrumb">
                                    <Link to="/admin-dashboard">
                                        Admin Dashboard
                                    </Link>

                                    <i className="bi bi-chevron-right"></i>

                                    <span>Messages</span>
                                </div>

                                <h1>
                                    Message Center
                                </h1>

                                <p>
                                    Monitor and manage platform conversations.
                                </p>
                            </div>

                        </div>

                        <div className="admin-messages-header-actions">

                            <button
                                type="button"
                                className="admin-header-action"
                                onClick={() =>
                                    loadConversations()
                                }
                                disabled={loading}
                                title="Refresh conversations"
                            >
                                <i
                                    className={
                                        loading
                                            ? "bi bi-arrow-repeat spin"
                                            : "bi bi-arrow-clockwise"
                                    }
                                ></i>

                                <span>Refresh</span>
                            </button>

                            <Link
                                to="/admin-dashboard"
                                className="admin-header-action secondary"
                            >
                                <i className="bi bi-speedometer2"></i>
                                <span>Dashboard</span>
                            </Link>

                        </div>

                    </div>

                    <div className="admin-message-stat-grid">

                        <div className="admin-message-stat-card">
                            <div className="stat-icon total">
                                <i className="bi bi-chat-square-text-fill"></i>
                            </div>

                            <div>
                                <span>Total Conversations</span>
                                <strong>
                                    {conversations.length}
                                </strong>
                            </div>
                        </div>

                        <div className="admin-message-stat-card">
                            <div className="stat-icon open">
                                <i className="bi bi-chat-dots-fill"></i>
                            </div>

                            <div>
                                <span>Open Conversations</span>
                                <strong>
                                    {openCount}
                                </strong>
                            </div>
                        </div>

                        <div className="admin-message-stat-card">
                            <div className="stat-icon closed">
                                <i className="bi bi-chat-square-check-fill"></i>
                            </div>

                            <div>
                                <span>Closed Conversations</span>
                                <strong>
                                    {closedCount}
                                </strong>
                            </div>
                        </div>

                    </div>

                    {error && (
                        <div className="admin-message-alert error">
                            <i className="bi bi-exclamation-triangle-fill"></i>

                            <span>{error}</span>

                            <button
                                type="button"
                                onClick={() => setError("")}
                            >
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>
                    )}

                    {success && (
                        <div className="admin-message-alert success">
                            <i className="bi bi-check-circle-fill"></i>

                            <span>{success}</span>

                            <button
                                type="button"
                                onClick={() => setSuccess("")}
                            >
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>
                    )}

                    <div className="admin-messages-workspace">

                        <aside className="admin-conversations-panel">

                            <div className="conversations-panel-header">

                                <div>
                                    <h2>
                                        Conversations
                                    </h2>

                                    <span>
                                        {filteredConversations.length} shown
                                    </span>
                                </div>

                                <i className="bi bi-inbox-fill"></i>

                            </div>

                            <div className="conversation-controls">

                                <div className="conversation-search">

                                    <i className="bi bi-search"></i>

                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(event) =>
                                            setSearch(
                                                event.target.value
                                            )
                                        }
                                        placeholder="Search conversations..."
                                    />

                                    {search && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setSearch("")
                                            }
                                        >
                                            <i className="bi bi-x-circle-fill"></i>
                                        </button>
                                    )}

                                </div>

                                <div className="conversation-filter">

                                    <button
                                        type="button"
                                        className={
                                            statusFilter === "all"
                                                ? "active"
                                                : ""
                                        }
                                        onClick={() =>
                                            setStatusFilter("all")
                                        }
                                    >
                                        All
                                    </button>

                                    <button
                                        type="button"
                                        className={
                                            statusFilter === "open"
                                                ? "active"
                                                : ""
                                        }
                                        onClick={() =>
                                            setStatusFilter("open")
                                        }
                                    >
                                        Open
                                    </button>

                                    <button
                                        type="button"
                                        className={
                                            statusFilter === "closed"
                                                ? "active"
                                                : ""
                                        }
                                        onClick={() =>
                                            setStatusFilter("closed")
                                        }
                                    >
                                        Closed
                                    </button>

                                </div>

                            </div>

                            <div className="conversation-list">

                                {loading ? (
                                    <div className="conversation-loading">

                                        <div className="loading-spinner">
                                            <i className="bi bi-arrow-repeat spin"></i>
                                        </div>

                                        <span>
                                            Loading conversations...
                                        </span>

                                    </div>
                                ) : filteredConversations.length === 0 ? (
                                    <div className="conversation-empty">

                                        <div className="empty-icon">
                                            <i className="bi bi-chat-square"></i>
                                        </div>

                                        <h3>
                                            No conversations
                                        </h3>

                                        <p>
                                            No conversations match your current filters.
                                        </p>

                                    </div>
                                ) : (
                                    filteredConversations.map(
                                        (conversation) => {

                                            const participants =
                                                getOtherParticipants(
                                                    conversation
                                                );

                                            const primaryParticipant =
                                                participants[0] ||
                                                conversation.participants?.[0];

                                            const isSelected =
                                                Number(
                                                    selectedConversation?.id
                                                ) ===
                                                Number(
                                                    conversation.id
                                                );

                                            return (
                                                <button
                                                    type="button"
                                                    key={conversation.id}
                                                    className={
                                                        isSelected
                                                            ? "conversation-item selected"
                                                            : "conversation-item"
                                                    }
                                                    onClick={() =>
                                                        selectConversation(
                                                            conversation
                                                        )
                                                    }
                                                >

                                                    <div className="conversation-avatar">

                                                        {getParticipantInitials(
                                                            primaryParticipant
                                                        )}

                                                    </div>

                                                    <div className="conversation-item-content">

                                                        <div className="conversation-item-top">

                                                            <strong>
                                                                {getConversationTitle(
                                                                    conversation
                                                                )}
                                                            </strong>

                                                            <span>
                                                                {formatShortDate(
                                                                    conversation.updated_at
                                                                )}
                                                            </span>

                                                        </div>

                                                        <div className="conversation-item-subject">
                                                            {conversation.subject ||
                                                                "No subject"}
                                                        </div>

                                                        <p>
                                                            {getLatestMessage(
                                                                conversation
                                                            )}
                                                        </p>

                                                        <div className="conversation-item-bottom">

                                                            <span className="participants-count">
                                                                <i className="bi bi-people-fill"></i>

                                                                {
                                                                    getConversationSubtitle(
                                                                        conversation
                                                                    )
                                                                }
                                                            </span>

                                                            <span
                                                                className={
                                                                    conversation.status === "open"
                                                                        ? "conversation-status open"
                                                                        : "conversation-status closed"
                                                                }
                                                            >
                                                                <i
                                                                    className={
                                                                        conversation.status === "open"
                                                                            ? "bi bi-circle-fill"
                                                                            : "bi bi-check-circle-fill"
                                                                    }
                                                                ></i>

                                                                {conversation.status === "open"
                                                                    ? "Open"
                                                                    : "Closed"}
                                                            </span>

                                                        </div>

                                                    </div>

                                                </button>
                                            );
                                        }
                                    )
                                )}

                            </div>

                        </aside>

                        <main className="admin-chat-panel">

                            {!selectedConversation ? (
                                <div className="chat-empty-state">

                                    <div className="chat-empty-icon">
                                        <i className="bi bi-chat-square-dots-fill"></i>
                                    </div>

                                    <h2>
                                        Select a conversation
                                    </h2>

                                    <p>
                                        Choose a conversation from the
                                        left panel to view its messages.
                                    </p>

                                </div>
                            ) : (
                                <>

                                    <div className="chat-header">

                                        <div className="chat-header-user">

                                            <div className="chat-main-avatar">

                                                {getParticipantInitials(
                                                    getOtherParticipants(
                                                        selectedConversation
                                                    )[0]
                                                )}

                                            </div>

                                            <div>

                                                <div className="chat-header-title">

                                                    <h2>
                                                        {getConversationTitle(
                                                            selectedConversation
                                                        )}
                                                    </h2>

                                                    <span
                                                        className={
                                                            selectedConversation.status === "open"
                                                                ? "header-status open"
                                                                : "header-status closed"
                                                        }
                                                    >
                                                        <i className="bi bi-circle-fill"></i>

                                                        {selectedConversation.status === "open"
                                                            ? "Open"
                                                            : "Closed"}
                                                    </span>

                                                </div>

                                                <p>
                                                    {selectedConversation.subject ||
                                                        "No subject"}
                                                </p>

                                            </div>

                                        </div>

                                        <div className="chat-header-actions">

                                            <button
                                                type="button"
                                                className="chat-icon-button"
                                                onClick={
                                                    refreshMessages
                                                }
                                                title="Refresh messages"
                                            >
                                                <i className="bi bi-arrow-clockwise"></i>
                                            </button>

                                            {selectedConversation.status === "open" ? (
                                                <button
                                                    type="button"
                                                    className="chat-action-button close"
                                                    onClick={() =>
                                                        changeConversationStatus(
                                                            "close"
                                                        )
                                                    }
                                                    disabled={actionLoading}
                                                >
                                                    <i className="bi bi-lock-fill"></i>

                                                    <span>
                                                        Close
                                                    </span>
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    className="chat-action-button reopen"
                                                    onClick={() =>
                                                        changeConversationStatus(
                                                            "reopen"
                                                        )
                                                    }
                                                    disabled={actionLoading}
                                                >
                                                    <i className="bi bi-unlock-fill"></i>

                                                    <span>
                                                        Reopen
                                                    </span>
                                                </button>
                                            )}

                                        </div>

                                    </div>

                                    <div className="conversation-participants-bar">

                                        <div className="participants-label">
                                            <i className="bi bi-people-fill"></i>

                                            <span>
                                                Participants
                                            </span>
                                        </div>

                                        <div className="participants-list">

                                            {(
                                                selectedConversation.participants ||
                                                []
                                            ).map(
                                                (participant) => (
                                                    <span
                                                        key={
                                                            participant.id
                                                        }
                                                        className="participant-chip"
                                                    >
                                                        <span>
                                                            {getParticipantInitials(
                                                                participant
                                                            )}
                                                        </span>

                                                        {
                                                            getParticipantName(
                                                                participant
                                                            )
                                                        }
                                                    </span>
                                                )
                                            )}

                                        </div>

                                    </div>

                                    <div className="chat-messages">

                                        {messagesLoading ? (
                                            <div className="messages-loading">

                                                <i className="bi bi-arrow-repeat spin"></i>

                                                <span>
                                                    Loading messages...
                                                </span>

                                            </div>
                                        ) : messages.length === 0 ? (
                                            <div className="messages-empty">

                                                <div>
                                                    <i className="bi bi-chat-left-text-fill"></i>
                                                </div>

                                                <h3>
                                                    No messages yet
                                                </h3>

                                                <p>
                                                    Start the conversation by
                                                    sending a message.
                                                </p>

                                            </div>
                                        ) : (
                                            messages.map(
                                                (item) => {

                                                    const isMine =
                                                        Number(
                                                            item.sender
                                                        ) ===
                                                        Number(
                                                            currentUser?.id
                                                        );

                                                    return (
                                                        <div
                                                            key={
                                                                item.id
                                                            }
                                                            className={
                                                                isMine
                                                                    ? "message-row mine"
                                                                    : "message-row"
                                                            }
                                                        >

                                                            {!isMine && (
                                                                <div className="message-avatar">
                                                                    {getParticipantInitials(
                                                                        {
                                                                            id: item.sender,
                                                                            username:
                                                                                item.sender_username,
                                                                            first_name:
                                                                                item.sender_name,
                                                                        }
                                                                    )}
                                                                </div>
                                                            )}

                                                            <div className="message-content">

                                                                <div className="message-meta">

                                                                    <strong>
                                                                        {isMine
                                                                            ? "You"
                                                                            : item.sender_name ||
                                                                              item.sender_username ||
                                                                              "User"}
                                                                    </strong>

                                                                    <span>
                                                                        {formatDate(
                                                                            item.created_at
                                                                        )}
                                                                    </span>

                                                                </div>

                                                                <div className="message-bubble">
                                                                    {item.message}
                                                                </div>

                                                            </div>

                                                            {isMine && (
                                                                <div className="message-avatar admin">
                                                                    <i className="bi bi-shield-fill-check"></i>
                                                                </div>
                                                            )}

                                                        </div>
                                                    );
                                                }
                                            )
                                        )}

                                    </div>

                                    <form
                                        className="admin-message-composer"
                                        onSubmit={sendMessage}
                                    >

                                        {selectedConversation.status === "closed" && (
                                            <div className="composer-closed-notice">
                                                <i className="bi bi-lock-fill"></i>

                                                <span>
                                                    This conversation is closed.
                                                    Reopen it to send a message.
                                                </span>
                                            </div>
                                        )}

                                        <div className="composer-input-area">

                                            <textarea
                                                value={message}
                                                onChange={(event) =>
                                                    setMessage(
                                                        event.target.value
                                                    )
                                                }
                                                placeholder={
                                                    selectedConversation.status === "closed"
                                                        ? "Reopen the conversation to send a message..."
                                                        : "Write an administrative message..."
                                                }
                                                disabled={
                                                    sending ||
                                                    selectedConversation.status === "closed"
                                                }
                                                rows={3}
                                            />

                                            <div className="composer-bottom">

                                                <span className="composer-hint">
                                                    <i className="bi bi-shield-check"></i>

                                                    Sending as administrator
                                                </span>

                                                <button
                                                    type="submit"
                                                    disabled={
                                                        sending ||
                                                        selectedConversation.status ===
                                                            "closed" ||
                                                        !message.trim()
                                                    }
                                                >
                                                    {sending ? (
                                                        <>
                                                            <i className="bi bi-arrow-repeat spin"></i>
                                                            Sending...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <i className="bi bi-send-fill"></i>
                                                            Send Message
                                                        </>
                                                    )}
                                                </button>

                                            </div>

                                        </div>

                                    </form>

                                </>
                            )}

                        </main>

                    </div>

                </div>

            </div>
        </div>
    );
}

export default AdminMessages;