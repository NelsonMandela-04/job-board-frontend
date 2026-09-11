import {
    useCallback,
    useEffect,
    useState
} from "react";
import {
    Link,
    useNavigate
} from "react-router-dom";
import api from "../api/axios";
import { getUser } from "../utils/auth";
import "./Notifications.css";

function Notifications() {
    const navigate = useNavigate();
    const user = getUser();
    const userId = user?.id || null;

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [markingAll, setMarkingAll] = useState(false);

    const fetchNotifications = useCallback(async () => {
        if (!userId) {
            return;
        }

        try {
            setLoading(true);
            setError("");

            const response = await api.get("notifications/");

            const notificationData = Array.isArray(response.data)
                ? response.data
                : Array.isArray(response.data?.results)
                    ? response.data.results
                    : [];

            setNotifications(notificationData);
        } catch (err) {
            console.error("FETCH NOTIFICATIONS ERROR:", err);
            console.error("STATUS:", err.response?.status);
            console.error("SERVER RESPONSE:", err.response?.data);

            setError("Unable to load your notifications.");
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            navigate("/login");
            return;
        }

        fetchNotifications();
    }, [userId, navigate, fetchNotifications]);

    useEffect(() => {
        if (!userId) {
            return;
        }

        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                fetchNotifications();
            }
        };

        document.addEventListener(
            "visibilitychange",
            handleVisibilityChange
        );

        return () => {
            document.removeEventListener(
                "visibilitychange",
                handleVisibilityChange
            );
        };
    }, [userId, fetchNotifications]);

    const markAsRead = async (notificationId) => {
        try {
            await api.patch(
                `notifications/${notificationId}/mark_read/`
            );

            setNotifications((currentNotifications) =>
                currentNotifications.map((notification) =>
                    notification.id === notificationId
                        ? {
                            ...notification,
                            is_read: true
                        }
                        : notification
                )
            );
        } catch (err) {
            console.error(
                "MARK NOTIFICATION READ ERROR:",
                err
            );
        }
    };

    const markAllAsRead = async () => {
        try {
            setMarkingAll(true);

            await api.patch(
                "notifications/mark_all_read/"
            );

            setNotifications((currentNotifications) =>
                currentNotifications.map((notification) => ({
                    ...notification,
                    is_read: true
                }))
            );
        } catch (err) {
            console.error(
                "MARK ALL NOTIFICATIONS READ ERROR:",
                err
            );
        } finally {
            setMarkingAll(false);
        }
    };

    const getNotificationIcon = (notificationType) => {
        switch (notificationType) {
            case "application_submitted":
                return "bi-send-fill";

            case "application_reviewed":
                return "bi-eye-fill";

            case "application_accepted":
                return "bi-check-circle-fill";

            case "application_rejected":
                return "bi-x-circle-fill";

            case "job_posted":
                return "bi-briefcase-fill";

            case "job_approved":
                return "bi-patch-check-fill";

            case "job_rejected":
                return "bi-exclamation-triangle-fill";

            default:
                return "bi-bell-fill";
        }
    };

    const getNotificationClass = (notificationType) => {
        switch (notificationType) {
            case "application_accepted":
            case "job_approved":
                return "notification-success";

            case "application_rejected":
            case "job_rejected":
                return "notification-danger";

            case "application_submitted":
                return "notification-info";

            case "application_reviewed":
                return "notification-review";

            case "job_posted":
                return "notification-job";

            default:
                return "notification-default";
        }
    };

    const getNotificationDestination = (notification) => {
        const type = notification.notification_type;

        if (type === "application_submitted") {
            if (user?.is_employer) {
                return "/employer/applications";
            }

            return "/applications";
        }

        if (
            type === "application_reviewed" ||
            type === "application_accepted" ||
            type === "application_rejected"
        ) {
            return "/applications";
        }

        if (
            type === "job_approved" ||
            type === "job_rejected"
        ) {
            if (user?.is_employer) {
                return "/employer";
            }

            if (notification.job) {
                return `/jobs/${notification.job}`;
            }
        }

        if (type === "job_posted") {
            if (notification.job) {
                return `/jobs/${notification.job}`;
            }

            if (user?.is_employer) {
                return "/employer";
            }
        }

        if (notification.job) {
            return `/jobs/${notification.job}`;
        }

        return null;
    };

    const handleNotificationClick = async (notification) => {
        if (!notification.is_read) {
            await markAsRead(notification.id);
        }

        const destination =
            getNotificationDestination(notification);

        if (destination) {
            navigate(destination);
        }
    };

    const handleCardKeyDown = (event, notification) => {
        if (
            event.key === "Enter" ||
            event.key === " "
        ) {
            event.preventDefault();
            handleNotificationClick(notification);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) {
            return "";
        }

        const date = new Date(dateString);

        if (Number.isNaN(date.getTime())) {
            return "";
        }

        return date.toLocaleString(
            undefined,
            {
                dateStyle: "medium",
                timeStyle: "short"
            }
        );
    };

    const unreadNotifications = notifications.filter(
        (notification) => !notification.is_read
    );

    if (!userId) {
        return null;
    }

    return (
        <div className="notifications-page">
            <div className="notifications-background"></div>

            <div className="notifications-overlay"></div>

            <div className="notifications-container">
                <div className="notifications-header">
                    <div className="notifications-heading">
                        <div className="notifications-label">
                            <span className="label-line"></span>
                            <span>ACCOUNT</span>
                        </div>

                        <h1>
                            Notifications
                        </h1>

                        <p>
                            Stay updated with your jobs,
                            applications, and account activity.
                        </p>
                    </div>

                    {unreadNotifications.length > 0 && (
                        <button
                            type="button"
                            className="mark-all-button"
                            onClick={markAllAsRead}
                            disabled={markingAll}
                        >
                            <i
                                className={
                                    markingAll
                                        ? "bi bi-hourglass-split"
                                        : "bi bi-check2-all"
                                }
                            ></i>

                            <span>
                                {markingAll
                                    ? "Marking..."
                                    : "Mark all as read"}
                            </span>
                        </button>
                    )}
                </div>

                <div className="notification-summary">
                    <div className="summary-item">
                        <div className="summary-icon">
                            <i className="bi bi-bell-fill"></i>
                        </div>

                        <div>
                            <span className="summary-number">
                                {notifications.length}
                            </span>

                            <span className="summary-label">
                                Total
                            </span>
                        </div>
                    </div>

                    <div className="summary-divider"></div>

                    <div className="summary-item">
                        <div className="summary-icon unread-summary-icon">
                            <i className="bi bi-envelope-fill"></i>
                        </div>

                        <div>
                            <span className="summary-number">
                                {unreadNotifications.length}
                            </span>

                            <span className="summary-label">
                                Unread
                            </span>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="notifications-error">
                        <div className="error-icon">
                            <i className="bi bi-exclamation-triangle-fill"></i>
                        </div>

                        <div className="error-content">
                            <strong>
                                Something went wrong
                            </strong>

                            <p>
                                {error}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={fetchNotifications}
                        >
                            <i className="bi bi-arrow-clockwise"></i>
                            Try Again
                        </button>
                    </div>
                )}

                {loading ? (
                    <div className="notifications-loading">
                        <div className="loading-spinner"></div>

                        <h3>
                            Loading notifications
                        </h3>

                        <p>
                            Please wait while we get your latest updates.
                        </p>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="empty-notifications">
                        <div className="empty-icon">
                            <i className="bi bi-bell-slash-fill"></i>
                        </div>

                        <div className="empty-badge">
                            <i className="bi bi-check-circle-fill"></i>
                            All caught up
                        </div>

                        <h2>
                            No notifications yet
                        </h2>

                        <p>
                            When you receive updates about your
                            applications, jobs, or account activity,
                            they will appear here.
                        </p>

                        <Link
                            to="/jobs"
                            className="browse-jobs-button"
                        >
                            <i className="bi bi-briefcase-fill"></i>

                            <span>
                                Browse Jobs
                            </span>

                            <i className="bi bi-arrow-right"></i>
                        </Link>
                    </div>
                ) : (
                    <div className="notifications-list">
                        <div className="notifications-list-header">
                            <div>
                                <h2>
                                    Recent activity
                                </h2>

                                <p>
                                    Your latest account updates
                                </p>
                            </div>

                            <span className="notification-count">
                                {notifications.length} notification
                                {notifications.length !== 1 ? "s" : ""}
                            </span>
                        </div>

                        {notifications.map((notification) => {
                            const destination =
                                getNotificationDestination(
                                    notification
                                );

                            return (
                                <div
                                    key={notification.id}
                                    className={`notification-card ${
                                        notification.is_read
                                            ? "is-read"
                                            : "is-unread"
                                    } ${
                                        destination
                                            ? "is-clickable"
                                            : ""
                                    }`}
                                    role={
                                        destination
                                            ? "button"
                                            : undefined
                                    }
                                    tabIndex={
                                        destination
                                            ? 0
                                            : undefined
                                    }
                                    onClick={() =>
                                        handleNotificationClick(
                                            notification
                                        )
                                    }
                                    onKeyDown={(event) =>
                                        handleCardKeyDown(
                                            event,
                                            notification
                                        )
                                    }
                                >
                                    <div
                                        className={`notification-icon ${getNotificationClass(
                                            notification.notification_type
                                        )}`}
                                    >
                                        <i
                                            className={`bi ${getNotificationIcon(
                                                notification.notification_type
                                            )}`}
                                        ></i>
                                    </div>

                                    <div className="notification-content">
                                        <div className="notification-top">
                                            <div>
                                                <span className="notification-type">
                                                    {notification.notification_type
                                                        ?.replaceAll("_", " ")
                                                        ?.replace(
                                                            /\b\w/g,
                                                            (letter) =>
                                                                letter.toUpperCase()
                                                        ) || "Notification"}
                                                </span>

                                                <h3>
                                                    {notification.title}
                                                </h3>
                                            </div>

                                            {!notification.is_read && (
                                                <span
                                                    className="unread-dot"
                                                    title="Unread notification"
                                                ></span>
                                            )}
                                        </div>

                                        <p className="notification-message">
                                            {notification.message}
                                        </p>

                                        {notification.job_title && (
                                            <div className="notification-job">
                                                <div className="job-icon">
                                                    <i className="bi bi-briefcase-fill"></i>
                                                </div>

                                                <div>
                                                    <span>
                                                        Related job
                                                    </span>

                                                    <strong>
                                                        {notification.job_title}
                                                    </strong>
                                                </div>
                                            </div>
                                        )}

                                        <div className="notification-footer">
                                            <span className="notification-date">
                                                <i className="bi bi-clock-fill"></i>

                                                {formatDate(
                                                    notification.created_at
                                                )}
                                            </span>

                                            <div className="notification-actions">
                                                {!notification.is_read && (
                                                    <button
                                                        type="button"
                                                        className="mark-read-button"
                                                        onClick={(event) => {
                                                            event.stopPropagation();

                                                            markAsRead(
                                                                notification.id
                                                            );
                                                        }}
                                                    >
                                                        <i className="bi bi-check2"></i>

                                                        <span>
                                                            Mark as read
                                                        </span>
                                                    </button>
                                                )}

                                                {destination && (
                                                    <span className="notification-view-link">
                                                        <span>
                                                            View details
                                                        </span>

                                                        <i className="bi bi-arrow-right"></i>
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Notifications;