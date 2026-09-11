import { useEffect, useRef, useState } from "react";
import api from "../api/axios";
import { getUser } from "../utils/auth";
import "./Messages.css";

function Messages() {
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);

    const [message, setMessage] = useState("");

    const [selectedUser, setSelectedUser] = useState(null);
    const [userSearch, setUserSearch] = useState("");
    const [userResults, setUserResults] = useState([]);
    const [userSearchLoading, setUserSearchLoading] = useState(false);
    const [showUserResults, setShowUserResults] = useState(false);

    const [subject, setSubject] = useState("");
    const [firstMessage, setFirstMessage] = useState("");

    const [showNewConversation, setShowNewConversation] = useState(false);

    const [loading, setLoading] = useState(true);
    const [messagesLoading, setMessagesLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [creating, setCreating] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    const [error, setError] = useState("");
    const [search, setSearch] = useState("");

    const messagesEndRef = useRef(null);
    const userSearchRef = useRef(null);

    const currentUser = getUser();
    const currentUserId = Number(currentUser?.id);

    const getErrorMessage = (err, fallback) => {
        const data = err?.response?.data;

        if (!data) {
            return fallback;
        }

        if (typeof data === "string") {
            return data;
        }

        if (data.detail) {
            return data.detail;
        }

        if (data.subject) {
            return Array.isArray(data.subject)
                ? data.subject[0]
                : data.subject;
        }

        if (data.message) {
            return Array.isArray(data.message)
                ? data.message[0]
                : data.message;
        }

        if (data.participant_ids) {
            return Array.isArray(data.participant_ids)
                ? data.participant_ids[0]
                : data.participant_ids;
        }

        return fallback;
    };

    const loadConversations = async () => {
        try {
            const response = await api.get("conversations/");

            const data = Array.isArray(response.data)
                ? response.data
                : [];

            setConversations(data);

            setSelectedConversation((current) => {
                if (!current) {
                    return null;
                }

                const updated = data.find(
                    (item) => item.id === current.id
                );

                return updated || current;
            });
        } catch (err) {
            setError(
                getErrorMessage(
                    err,
                    "Unable to load conversations."
                )
            );
        } finally {
            setLoading(false);
        }
    };

    const loadMessages = async (conversation) => {
        if (!conversation) {
            return;
        }

        setMessagesLoading(true);
        setError("");

        try {
            const response = await api.get(
                `conversations/${conversation.id}/messages/`
            );

            const data = Array.isArray(response.data)
                ? response.data
                : [];

            setMessages(data);

            setConversations((current) =>
                current.map((item) =>
                    item.id === conversation.id
                        ? {
                            ...item,
                            unread_count: 0
                        }
                        : item
                )
            );

            setSelectedConversation((current) =>
                current &&
                current.id === conversation.id
                    ? {
                        ...current,
                        unread_count: 0
                    }
                    : current
            );
        } catch (err) {
            setError(
                getErrorMessage(
                    err,
                    "Unable to load messages."
                )
            );
        } finally {
            setMessagesLoading(false);
        }
    };

    useEffect(() => {
        loadConversations();
    }, []);

    useEffect(() => {
        if (!selectedConversation) {
            setMessages([]);
            return;
        }

        loadMessages(selectedConversation);
    }, [selectedConversation?.id]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth"
        });
    }, [messages]);

    useEffect(() => {
        const interval = setInterval(() => {
            loadConversations();

            if (selectedConversation) {
                loadMessages(selectedConversation);
            }
        }, 10000);

        return () => clearInterval(interval);
    }, [selectedConversation?.id]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                userSearchRef.current &&
                !userSearchRef.current.contains(event.target)
            ) {
                setShowUserResults(false);
            }
        };

        document.addEventListener(
            "mousedown",
            handleClickOutside
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
        };
    }, []);

    useEffect(() => {
        const trimmedSearch = userSearch.trim();

        if (trimmedSearch.length < 2) {
            setUserResults([]);
            setUserSearchLoading(false);
            return;
        }

        let cancelled = false;

        const searchUsers = async () => {
            setUserSearchLoading(true);

            try {
                const response = await api.get(
                    "conversations/user_search/",
                    {
                        params: {
                            search: trimmedSearch
                        }
                    }
                );

                if (cancelled) {
                    return;
                }

                const data = Array.isArray(response.data)
                    ? response.data
                    : [];

                setUserResults(data);
                setShowUserResults(true);
            } catch (err) {
                if (!cancelled) {
                    setUserResults([]);
                }
            } finally {
                if (!cancelled) {
                    setUserSearchLoading(false);
                }
            }
        };

        const timeout = setTimeout(
            searchUsers,
            350
        );

        return () => {
            cancelled = true;
            clearTimeout(timeout);
        };
    }, [userSearch]);

    const selectUser = (user) => {
        setSelectedUser(user);
        setUserSearch(user.full_name || user.username || "");
        setUserResults([]);
        setShowUserResults(false);
    };

    const clearSelectedUser = () => {
        setSelectedUser(null);
        setUserSearch("");
        setUserResults([]);
        setShowUserResults(false);
    };

    const createConversation = async (event) => {
        event.preventDefault();

        const trimmedSubject = subject.trim();
        const trimmedMessage = firstMessage.trim();

        if (
            !selectedUser ||
            !trimmedSubject ||
            !trimmedMessage
        ) {
            return;
        }

        const numericParticipantId = Number(
            selectedUser.id
        );

        if (
            !Number.isInteger(numericParticipantId) ||
            numericParticipantId <= 0
        ) {
            setError(
                "The selected user is invalid."
            );
            return;
        }

        setCreating(true);
        setError("");

        try {
            const response = await api.post(
                "conversations/",
                {
                    participant_ids: [
                        numericParticipantId
                    ],
                    subject: trimmedSubject,
                    message: trimmedMessage
                }
            );

            const newConversation = response.data;

            setConversations((current) => [
                newConversation,
                ...current.filter(
                    (item) =>
                        item.id !== newConversation.id
                )
            ]);

            setSelectedConversation(
                newConversation
            );

            if (
                newConversation.latest_message
            ) {
                setMessages([
                    newConversation.latest_message
                ]);
            } else {
                await loadMessages(
                    newConversation
                );
            }

            clearSelectedUser();
            setSubject("");
            setFirstMessage("");
            setShowNewConversation(false);
        } catch (err) {
            setError(
                getErrorMessage(
                    err,
                    "Unable to create conversation."
                )
            );
        } finally {
            setCreating(false);
        }
    };

    const sendMessage = async (event) => {
        event.preventDefault();

        if (
            !message.trim() ||
            !selectedConversation ||
            selectedConversation.status === "closed"
        ) {
            return;
        }

        setSending(true);
        setError("");

        try {
            const response = await api.post(
                `conversations/${selectedConversation.id}/send_message/`,
                {
                    message: message.trim()
                }
            );

            setMessages((current) => [
                ...current,
                response.data
            ]);

            setMessage("");

            await loadConversations();
        } catch (err) {
            setError(
                getErrorMessage(
                    err,
                    "Unable to send message."
                )
            );
        } finally {
            setSending(false);
        }
    };

    const closeConversation = async () => {
        if (
            !selectedConversation ||
            actionLoading
        ) {
            return;
        }

        setActionLoading(true);
        setError("");

        try {
            await api.post(
                `conversations/${selectedConversation.id}/close/`
            );

            const updatedConversation = {
                ...selectedConversation,
                status: "closed"
            };

            setSelectedConversation(
                updatedConversation
            );

            setConversations((current) =>
                current.map((item) =>
                    item.id ===
                    selectedConversation.id
                        ? updatedConversation
                        : item
                )
            );
        } catch (err) {
            setError(
                getErrorMessage(
                    err,
                    "Unable to close conversation."
                )
            );
        } finally {
            setActionLoading(false);
        }
    };

    const reopenConversation = async () => {
        if (
            !selectedConversation ||
            actionLoading
        ) {
            return;
        }

        setActionLoading(true);
        setError("");

        try {
            await api.post(
                `conversations/${selectedConversation.id}/reopen/`
            );

            const updatedConversation = {
                ...selectedConversation,
                status: "open"
            };

            setSelectedConversation(
                updatedConversation
            );

            setConversations((current) =>
                current.map((item) =>
                    item.id ===
                    selectedConversation.id
                        ? updatedConversation
                        : item
                )
            );
        } catch (err) {
            setError(
                getErrorMessage(
                    err,
                    "Unable to reopen conversation."
                )
            );
        } finally {
            setActionLoading(false);
        }
    };

    const filteredConversations =
        conversations.filter((conversation) => {
            const searchValue =
                search.toLowerCase().trim();

            if (!searchValue) {
                return true;
            }

            const subjectText =
                conversation.subject || "";

            const participantText = (
                conversation.participants || []
            )
                .map((participant) =>
                    [
                        participant.username,
                        participant.first_name,
                        participant.last_name
                    ]
                        .filter(Boolean)
                        .join(" ")
                )
                .join(" ");

            const latestMessage =
                conversation.latest_message
                    ?.message || "";

            return (
                subjectText
                    .toLowerCase()
                    .includes(searchValue) ||
                participantText
                    .toLowerCase()
                    .includes(searchValue) ||
                latestMessage
                    .toLowerCase()
                    .includes(searchValue)
            );
        });

    const totalUnread = conversations.reduce(
        (total, conversation) =>
            total +
            Number(
                conversation.unread_count || 0
            ),
        0
    );

    const getParticipantName = (
        participant
    ) => {
        if (!participant) {
            return "User";
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
            "User"
        );
    };

    const getOtherParticipant = (
        conversation
    ) => {
        const participants =
            conversation?.participants || [];

        return (
            participants.find(
                (participant) =>
                    Number(participant.id) !==
                    currentUserId
            ) ||
            participants[0] ||
            null
        );
    };

    const getConversationName = (
        conversation
    ) => {
        const participant =
            getOtherParticipant(
                conversation
            );

        return getParticipantName(
            participant
        );
    };

    const formatDate = (date) => {
        if (!date) {
            return "";
        }

        return new Date(
            date
        ).toLocaleDateString(
            undefined,
            {
                month: "short",
                day: "numeric"
            }
        );
    };

    const formatTime = (date) => {
        if (!date) {
            return "";
        }

        return new Date(
            date
        ).toLocaleTimeString(
            undefined,
            {
                hour: "numeric",
                minute: "2-digit"
            }
        );
    };

    const getUserInitials = (user) => {
        if (!user) {
            return "U";
        }

        const first =
            user.first_name?.charAt(0) || "";

        const last =
            user.last_name?.charAt(0) || "";

        if (first || last) {
            return `${first}${last}`.toUpperCase();
        }

        return (
            user.username?.charAt(0) ||
            "U"
        ).toUpperCase();
    };

    return (
        <div className="messages-page">
            <div className="messages-background"></div>

            <div className="messages-overlay"></div>

            <div className="messages-container">
                <div className="messages-heading">
                    <div>
                        <span className="messages-eyebrow">
                            <i className="bi bi-chat-square-dots-fill"></i>
                            Support Center
                        </span>

                        <h1>Messages</h1>

                        <p>
                            Connect with the Job Board
                            administration and get
                            the support you need.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="new-conversation-btn"
                        onClick={() =>
                            setShowNewConversation(
                                true
                            )
                        }
                    >
                        <i className="bi bi-plus-lg"></i>
                        New Conversation
                    </button>
                </div>

                {error && (
                    <div className="messages-alert">
                        <i className="bi bi-exclamation-circle-fill"></i>

                        <span>{error}</span>

                        <button
                            type="button"
                            onClick={() =>
                                setError("")
                            }
                        >
                            <i className="bi bi-x-lg"></i>
                        </button>
                    </div>
                )}

                <div className="messages-card">
                    <aside className="conversation-sidebar">
                        <div className="sidebar-header">
                            <div>
                                <h2>
                                    Conversations
                                </h2>

                                <span>
                                    {
                                        conversations.length
                                    }{" "}
                                    total
                                </span>
                            </div>

                            {totalUnread > 0 && (
                                <div className="total-unread">
                                    {totalUnread}
                                </div>
                            )}
                        </div>

                        <div className="conversation-search">
                            <i className="bi bi-search"></i>

                            <input
                                type="text"
                                placeholder="Search conversations..."
                                value={search}
                                onChange={(
                                    event
                                ) =>
                                    setSearch(
                                        event.target
                                            .value
                                    )
                                }
                            />
                        </div>

                        <div className="conversation-list">
                            {loading ? (
                                <div className="messages-loading">
                                    <div className="spinner-border"></div>

                                    <p>
                                        Loading
                                        conversations...
                                    </p>
                                </div>
                            ) : filteredConversations.length ===
                              0 ? (
                                <div className="empty-conversations">
                                    <div className="empty-icon">
                                        <i className="bi bi-chat-left-text"></i>
                                    </div>

                                    <h3>
                                        No conversations
                                    </h3>

                                    <p>
                                        Start a conversation
                                        with administration.
                                    </p>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowNewConversation(
                                                true
                                            )
                                        }
                                    >
                                        Start a
                                        conversation
                                    </button>
                                </div>
                            ) : (
                                filteredConversations.map(
                                    (
                                        conversation
                                    ) => {
                                        const latestMessage =
                                            conversation.latest_message;

                                        const active =
                                            selectedConversation?.id ===
                                            conversation.id;

                                        return (
                                            <button
                                                type="button"
                                                key={
                                                    conversation.id
                                                }
                                                className={`conversation-item ${
                                                    active
                                                        ? "active"
                                                        : ""
                                                }`}
                                                onClick={() =>
                                                    setSelectedConversation(
                                                        conversation
                                                    )
                                                }
                                            >
                                                <div className="conversation-avatar">
                                                    <i className="bi bi-headset"></i>
                                                </div>

                                                <div className="conversation-info">
                                                    <div className="conversation-top">
                                                        <h3>
                                                            {
                                                                conversation.subject
                                                            }
                                                        </h3>

                                                        <span>
                                                            {formatDate(
                                                                conversation.updated_at
                                                            )}
                                                        </span>
                                                    </div>

                                                    <div className="conversation-person">
                                                        <i className="bi bi-person"></i>

                                                        <span>
                                                            {getConversationName(
                                                                conversation
                                                            )}
                                                        </span>
                                                    </div>

                                                    <div className="conversation-bottom">
                                                        <p>
                                                            {latestMessage?.message ||
                                                                "No messages yet"}
                                                        </p>

                                                        {Number(
                                                            conversation.unread_count ||
                                                                0
                                                        ) >
                                                            0 && (
                                                            <span className="unread-badge">
                                                                {
                                                                    conversation.unread_count
                                                                }
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="conversation-status">
                                                        <span
                                                            className={
                                                                conversation.status ===
                                                                "open"
                                                                    ? "status-open"
                                                                    : "status-closed"
                                                            }
                                                        >
                                                            <i className="bi bi-circle-fill"></i>

                                                            {
                                                                conversation.status
                                                            }
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

                    <section className="chat-section">
                        {!selectedConversation ? (
                            <div className="chat-empty">
                                <div className="chat-empty-icon">
                                    <i className="bi bi-chat-square-heart-fill"></i>
                                </div>

                                <h2>
                                    Welcome to Messages
                                </h2>

                                <p>
                                    Select a conversation
                                    from the left or start
                                    a new conversation with
                                    our administration
                                    team.
                                </p>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowNewConversation(
                                            true
                                        )
                                    }
                                >
                                    <i className="bi bi-chat-left-text-fill"></i>

                                    Start New
                                    Conversation
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="chat-header">
                                    <div className="chat-contact">
                                        <div className="chat-avatar">
                                            <i className="bi bi-headset"></i>
                                        </div>

                                        <div>
                                            <h2>
                                                {
                                                    selectedConversation.subject
                                                }
                                            </h2>

                                            <div className="chat-meta">
                                                <span>
                                                    <i className="bi bi-person-fill"></i>

                                                    {
                                                        getConversationName(
                                                            selectedConversation
                                                        )
                                                    }
                                                </span>

                                                <span>
                                                    <i className="bi bi-shield-check"></i>

                                                    Admin
                                                    Support
                                                </span>

                                                <span
                                                    className={
                                                        selectedConversation.status ===
                                                        "open"
                                                            ? "chat-open"
                                                            : "chat-closed"
                                                    }
                                                >
                                                    <i className="bi bi-circle-fill"></i>

                                                    {
                                                        selectedConversation.status
                                                    }
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="chat-actions">
                                        {selectedConversation.status ===
                                        "open" ? (
                                            <button
                                                type="button"
                                                title="Close conversation"
                                                disabled={
                                                    actionLoading
                                                }
                                                onClick={
                                                    closeConversation
                                                }
                                            >
                                                {actionLoading ? (
                                                    <span className="spinner-border spinner-border-sm"></span>
                                                ) : (
                                                    <i className="bi bi-check2-circle"></i>
                                                )}

                                                <span>
                                                    Close
                                                </span>
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                title="Reopen conversation"
                                                disabled={
                                                    actionLoading
                                                }
                                                onClick={
                                                    reopenConversation
                                                }
                                            >
                                                {actionLoading ? (
                                                    <span className="spinner-border spinner-border-sm"></span>
                                                ) : (
                                                    <i className="bi bi-arrow-clockwise"></i>
                                                )}

                                                <span>
                                                    Reopen
                                                </span>
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="chat-messages">
                                    {messagesLoading ? (
                                        <div className="messages-loading">
                                            <div className="spinner-border"></div>

                                            <p>
                                                Loading
                                                messages...
                                            </p>
                                        </div>
                                    ) : messages.length ===
                                      0 ? (
                                        <div className="no-messages">
                                            <i className="bi bi-chat-dots"></i>

                                            <p>
                                                No messages
                                                in this
                                                conversation.
                                            </p>
                                        </div>
                                    ) : (
                                        messages.map(
                                            (item) => {
                                                const mine =
                                                    Number(
                                                        item.sender
                                                    ) ===
                                                    currentUserId;

                                                return (
                                                    <div
                                                        key={
                                                            item.id
                                                        }
                                                        className={`message-row ${
                                                            mine
                                                                ? "message-mine"
                                                                : "message-theirs"
                                                        }`}
                                                    >
                                                        {!mine && (
                                                            <div className="message-avatar">
                                                                <i className="bi bi-person-fill"></i>
                                                            </div>
                                                        )}

                                                        <div className="message-content">
                                                            <div className="message-bubble">
                                                                {
                                                                    item.message
                                                                }
                                                            </div>

                                                            <div className="message-time">
                                                                {mine
                                                                    ? "You"
                                                                    : item.sender_name ||
                                                                      item.sender_username ||
                                                                      "User"}

                                                                <span>
                                                                    •
                                                                </span>

                                                                {formatTime(
                                                                    item.created_at
                                                                )}
                                                            </div>
                                                        </div>

                                                        {mine && (
                                                            <div className="message-avatar user-avatar">
                                                                <i className="bi bi-person-fill"></i>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            }
                                        )
                                    )}

                                    <div
                                        ref={
                                            messagesEndRef
                                        }
                                    />
                                </div>

                                <form
                                    className="message-composer"
                                    onSubmit={
                                        sendMessage
                                    }
                                >
                                    {selectedConversation.status ===
                                    "closed" ? (
                                        <div className="closed-message">
                                            <div>
                                                <i className="bi bi-lock-fill"></i>

                                                <span>
                                                    This
                                                    conversation
                                                    is closed.
                                                </span>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={
                                                    reopenConversation
                                                }
                                            >
                                                Reopen
                                                Conversation
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="composer-input">
                                                <textarea
                                                    value={
                                                        message
                                                    }
                                                    onChange={(
                                                        event
                                                    ) =>
                                                        setMessage(
                                                            event
                                                                .target
                                                                .value
                                                        )
                                                    }
                                                    placeholder="Write a message..."
                                                    rows="1"
                                                    onKeyDown={(
                                                        event
                                                    ) => {
                                                        if (
                                                            event.key ===
                                                                "Enter" &&
                                                            !event.shiftKey
                                                        ) {
                                                            event.preventDefault();

                                                            sendMessage(
                                                                event
                                                            );
                                                        }
                                                    }}
                                                />

                                                <span>
                                                    Press Enter
                                                    to send
                                                </span>
                                            </div>

                                            <button
                                                type="submit"
                                                className="send-button"
                                                disabled={
                                                    sending ||
                                                    !message.trim()
                                                }
                                            >
                                                {sending ? (
                                                    <span className="spinner-border spinner-border-sm"></span>
                                                ) : (
                                                    <i className="bi bi-send-fill"></i>
                                                )}
                                            </button>
                                        </>
                                    )}
                                </form>
                            </>
                        )}
                    </section>
                </div>
            </div>

            {showNewConversation && (
                <div
                    className="conversation-modal-backdrop"
                    onMouseDown={(event) => {
                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            setShowNewConversation(
                                false
                            );
                        }
                    }}
                >
                    <div className="conversation-modal">
                        <div className="modal-header">
                            <div className="modal-title-icon">
                                <i className="bi bi-chat-square-plus-fill"></i>
                            </div>

                            <div>
                                <h2>
                                    New Conversation
                                </h2>

                                <p>
                                    Contact the
                                    administration
                                    team.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    setShowNewConversation(
                                        false
                                    );
                                    clearSelectedUser();
                                }}
                            >
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>

                        <form
                            className="new-conversation-form"
                            onSubmit={
                                createConversation
                            }
                        >
                            <label>
                                <span>
                                    To
                                </span>

                                <div
                                    className={`user-selector ${
                                        selectedUser
                                            ? "has-selection"
                                            : ""
                                    }`}
                                    ref={
                                        userSearchRef
                                    }
                                >
                                    {selectedUser ? (
                                        <div className="selected-user">
                                            {selectedUser.profile_photo ? (
                                                <img
                                                    src={
                                                        selectedUser.profile_photo
                                                    }
                                                    alt={
                                                        selectedUser.full_name ||
                                                        selectedUser.username
                                                    }
                                                    className="selected-user-photo"
                                                />
                                            ) : (
                                                <div className="selected-user-avatar">
                                                    {getUserInitials(
                                                        selectedUser
                                                    )}
                                                </div>
                                            )}

                                            <div className="selected-user-info">
                                                <strong>
                                                    {
                                                        selectedUser.full_name
                                                    }
                                                </strong>

                                                <span>
                                                    @
                                                    {
                                                        selectedUser.username
                                                    }
                                                </span>
                                            </div>

                                            <button
                                                type="button"
                                                className="remove-user-btn"
                                                title="Remove selected user"
                                                onClick={
                                                    clearSelectedUser
                                                }
                                            >
                                                <i className="bi bi-x-lg"></i>
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="user-search-input">
                                                <i className="bi bi-search"></i>

                                                <input
                                                    type="text"
                                                    placeholder="Search by name or username..."
                                                    value={
                                                        userSearch
                                                    }
                                                    onFocus={() => {
                                                        if (
                                                            userResults.length >
                                                            0
                                                        ) {
                                                            setShowUserResults(
                                                                true
                                                            );
                                                        }
                                                    }}
                                                    onChange={(
                                                        event
                                                    ) => {
                                                        setUserSearch(
                                                            event
                                                                .target
                                                                .value
                                                        );
                                                        setShowUserResults(
                                                            true
                                                        );
                                                    }}
                                                    autoComplete="off"
                                                    required
                                                />

                                                {userSearchLoading && (
                                                    <span className="user-search-spinner">
                                                        <span className="spinner-border spinner-border-sm"></span>
                                                    </span>
                                                )}
                                            </div>

                                            {showUserResults && (
                                                <div className="user-search-results">
                                                    {userSearch.trim().length <
                                                    2 ? (
                                                        <div className="user-search-hint">
                                                            <i className="bi bi-search"></i>

                                                            <span>
                                                                Type at least
                                                                2 characters
                                                                to search.
                                                            </span>
                                                        </div>
                                                    ) : userSearchLoading ? (
                                                        <div className="user-search-hint">
                                                            <span className="spinner-border spinner-border-sm"></span>

                                                            <span>
                                                                Searching
                                                                users...
                                                            </span>
                                                        </div>
                                                    ) : userResults.length ===
                                                      0 ? (
                                                        <div className="user-search-hint">
                                                            <i className="bi bi-person-x"></i>

                                                            <span>
                                                                No users
                                                                found.
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        userResults.map(
                                                            (user) => (
                                                                <button
                                                                    type="button"
                                                                    className="user-search-result"
                                                                    key={
                                                                        user.id
                                                                    }
                                                                    onClick={() =>
                                                                        selectUser(
                                                                            user
                                                                        )
                                                                    }
                                                                >
                                                                    {user.profile_photo ? (
                                                                        <img
                                                                            src={
                                                                                user.profile_photo
                                                                            }
                                                                            alt={
                                                                                user.full_name ||
                                                                                user.username
                                                                            }
                                                                            className="user-result-photo"
                                                                        />
                                                                    ) : (
                                                                        <div className="user-result-avatar">
                                                                            {getUserInitials(
                                                                                user
                                                                            )}
                                                                        </div>
                                                                    )}

                                                                    <div className="user-result-info">
                                                                        <strong>
                                                                            {
                                                                                user.full_name
                                                                            }
                                                                        </strong>

                                                                        <span>
                                                                            @
                                                                            {
                                                                                user.username
                                                                            }
                                                                        </span>
                                                                    </div>

                                                                    <i className="bi bi-chevron-right"></i>
                                                                </button>
                                                            )
                                                        )
                                                    )}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </label>

                            <label>
                                <span>
                                    Subject
                                </span>

                                <div className="form-input">
                                    <i className="bi bi-bookmark"></i>

                                    <input
                                        type="text"
                                        placeholder="What would you like help with?"
                                        value={
                                            subject
                                        }
                                        maxLength="200"
                                        onChange={(
                                            event
                                        ) =>
                                            setSubject(
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        required
                                    />
                                </div>
                            </label>

                            <label>
                                <span>
                                    Message
                                </span>

                                <textarea
                                    placeholder="Describe your question or issue..."
                                    value={
                                        firstMessage
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setFirstMessage(
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                    rows="6"
                                    required
                                />
                            </label>

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={() => {
                                        setShowNewConversation(
                                            false
                                        );
                                        clearSelectedUser();
                                    }}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="create-btn"
                                    disabled={
                                        creating ||
                                        !selectedUser ||
                                        !subject.trim() ||
                                        !firstMessage.trim()
                                    }
                                >
                                    {creating ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm"></span>
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
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Messages;