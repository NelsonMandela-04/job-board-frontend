import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import "./Interviews.css";

function Interviews() {
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [selectedInterview, setSelectedInterview] = useState(null);

    const [actionLoading, setActionLoading] = useState(null);

    const [showRescheduleModal, setShowRescheduleModal] =
        useState(false);

    const [showDeclineModal, setShowDeclineModal] =
        useState(false);

    const [actionInterview, setActionInterview] =
        useState(null);

    const [rescheduleForm, setRescheduleForm] = useState({
        preferred_date: "",
        preferred_time: "",
        reason: "",
    });

    useEffect(() => {
        fetchInterviews();
    }, []);

    const fetchInterviews = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("interviews/");

            const data = Array.isArray(response.data)
                ? response.data
                : response.data.results || [];

            setInterviews(data);
        } catch (err) {
            console.error(
                "Failed to load interviews:",
                err
            );

            setError(
                err.response?.data?.detail ||
                "Unable to load your interviews."
            );
        } finally {
            setLoading(false);
        }
    };

    const clearMessages = () => {
        setError("");
        setSuccess("");
    };

    const showSuccessMessage = (message) => {
        setError("");
        setSuccess(message);

        setTimeout(() => {
            setSuccess("");
        }, 5000);
    };

    const getErrorMessage = (err, fallback) => {
        const data = err.response?.data;

        if (data?.detail) {
            return data.detail;
        }

        if (data?.message) {
            return data.message;
        }

        if (typeof data === "object" && data !== null) {
            const firstValue = Object.values(data)[0];

            if (Array.isArray(firstValue)) {
                return firstValue[0];
            }

            if (typeof firstValue === "string") {
                return firstValue;
            }
        }

        return fallback;
    };

    const formatDate = (dateString) => {
        if (!dateString) {
            return "Not specified";
        }

        return new Date(dateString).toLocaleDateString(
            undefined,
            {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
            }
        );
    };

    const formatTime = (dateString) => {
        if (!dateString) {
            return "Not specified";
        }

        return new Date(dateString).toLocaleTimeString(
            undefined,
            {
                hour: "2-digit",
                minute: "2-digit",
            }
        );
    };

    const getInterviewTypeLabel = (type) => {
        if (type === "online") {
            return "Online";
        }

        if (type === "in_person") {
            return "In Person";
        }

        return type || "Not specified";
    };

    const getStatusLabel = (status) => {
        const labels = {
            scheduled: "Scheduled",
            rescheduled: "Rescheduled",
            cancelled: "Cancelled",
            completed: "Completed",
        };

        return labels[status] || status;
    };

    const getStatusIcon = (status) => {
        const icons = {
            scheduled: "bi-calendar-check",
            rescheduled: "bi-arrow-repeat",
            cancelled: "bi-calendar-x",
            completed: "bi-check-circle",
        };

        return icons[status] || "bi-calendar-event";
    };

    const getStatusClass = (status) => {
        const classes = {
            scheduled: "status-scheduled",
            rescheduled: "status-rescheduled",
            cancelled: "status-cancelled",
            completed: "status-completed",
        };

        return classes[status] || "status-default";
    };

    const getInterviewDate = (interview) => {
        return new Date(interview.scheduled_at);
    };

    const isUpcomingInterview = (interview) => {
        const date = getInterviewDate(interview);

        return (
            date > new Date() &&
            interview.status !== "cancelled" &&
            interview.status !== "completed"
        );
    };

    const isActiveInterview = (interview) => {
        return (
            interview.status === "scheduled" ||
            interview.status === "rescheduled"
        );
    };

    const upcomingInterviews = interviews
        .filter((interview) =>
            isUpcomingInterview(interview)
        )
        .sort(
            (a, b) =>
                getInterviewDate(a) -
                getInterviewDate(b)
        );

    const interviewHistory = interviews
        .filter((interview) => {
            const date = getInterviewDate(interview);

            return (
                interview.status === "cancelled" ||
                interview.status === "completed" ||
                date <= new Date()
            );
        })
        .sort(
            (a, b) =>
                getInterviewDate(b) -
                getInterviewDate(a)
        );

    const confirmInterview = async (interview) => {
        if (!interview?.id) {
            return;
        }

        try {
            clearMessages();

            setActionLoading(
                `confirm-${interview.id}`
            );

            await api.patch(
                `interviews/${interview.id}/confirm/`
            );

            showSuccessMessage(
                "Your interview attendance has been confirmed."
            );

            await fetchInterviews();
        } catch (err) {
            console.error(
                "Failed to confirm interview:",
                err
            );

            setError(
                getErrorMessage(
                    err,
                    "Unable to confirm your attendance."
                )
            );
        } finally {
            setActionLoading(null);
        }
    };

    const openRescheduleModal = (interview) => {
        clearMessages();

        setActionInterview(interview);

        setRescheduleForm({
            preferred_date: "",
            preferred_time: "",
            reason: "",
        });

        setShowRescheduleModal(true);
    };

    const closeRescheduleModal = () => {
        if (actionLoading) {
            return;
        }

        setShowRescheduleModal(false);
        setActionInterview(null);

        setRescheduleForm({
            preferred_date: "",
            preferred_time: "",
            reason: "",
        });
    };

    const handleRescheduleChange = (event) => {
        const { name, value } = event.target;

        setRescheduleForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const submitRescheduleRequest = async (
        event
    ) => {
        event.preventDefault();

        if (!actionInterview) {
            return;
        }

        if (
            !rescheduleForm.preferred_date ||
            !rescheduleForm.preferred_time
        ) {
            setError(
                "Please select your preferred date and time."
            );

            return;
        }

        if (!rescheduleForm.reason.trim()) {
            setError(
                "Please provide a reason for the reschedule request."
            );

            return;
        }

        try {
            clearMessages();

            setActionLoading(
                `reschedule-${actionInterview.id}`
            );

            await api.post(
                `interviews/${actionInterview.id}/request_reschedule/`,
                {
                    preferred_date:
                        rescheduleForm.preferred_date,
                    preferred_time:
                        rescheduleForm.preferred_time,
                    reason:
                        rescheduleForm.reason.trim(),
                }
            );

            closeRescheduleModal();

            showSuccessMessage(
                "Your reschedule request has been sent to the employer."
            );

            await fetchInterviews();
        } catch (err) {
            console.error(
                "Failed to request reschedule:",
                err
            );

            setError(
                getErrorMessage(
                    err,
                    "Unable to send your reschedule request."
                )
            );
        } finally {
            setActionLoading(null);
        }
    };

    const openDeclineModal = (interview) => {
        clearMessages();

        setActionInterview(interview);
        setShowDeclineModal(true);
    };

    const closeDeclineModal = () => {
        if (actionLoading) {
            return;
        }

        setShowDeclineModal(false);
        setActionInterview(null);
    };

    const declineInterview = async () => {
        if (!actionInterview) {
            return;
        }

        try {
            clearMessages();

            setActionLoading(
                `decline-${actionInterview.id}`
            );

            await api.patch(
                `interviews/${actionInterview.id}/decline/`
            );

            closeDeclineModal();

            showSuccessMessage(
                "You have declined this interview. The employer has been notified."
            );

            await fetchInterviews();
        } catch (err) {
            console.error(
                "Failed to decline interview:",
                err
            );

            setError(
                getErrorMessage(
                    err,
                    "Unable to decline this interview."
                )
            );
        } finally {
            setActionLoading(null);
        }
    };

    const renderCandidateActions = (
        interview,
        isHistory = false
    ) => {
        const isOnline =
            interview.interview_type === "online";

        const isCancelled =
            interview.status === "cancelled";

        const isCompleted =
            interview.status === "completed";

        const isActive =
            isActiveInterview(interview);

        const isConfirming =
            actionLoading ===
            `confirm-${interview.id}`;

        const isRequestingReschedule =
            actionLoading ===
            `reschedule-${interview.id}`;

        const isDeclining =
            actionLoading ===
            `decline-${interview.id}`;

        if (isHistory) {
            return null;
        }

        if (!isActive || isCancelled || isCompleted) {
            return null;
        }

        return (
            <div className="candidate-interview-actions">
                {isOnline &&
                    interview.meeting_link && (
                        <a
                            href={
                                interview.meeting_link
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="join-button"
                        >
                            <i className="bi bi-camera-video"></i>
                            Join Interview
                        </a>
                    )}

                <button
                    type="button"
                    className="confirm-button"
                    onClick={() =>
                        confirmInterview(interview)
                    }
                    disabled={Boolean(actionLoading)}
                >
                    {isConfirming ? (
                        <>
                            <span className="button-spinner"></span>
                            Confirming...
                        </>
                    ) : (
                        <>
                            <i className="bi bi-check-circle"></i>
                            Confirm Attendance
                        </>
                    )}
                </button>

                <button
                    type="button"
                    className="reschedule-request-button"
                    onClick={() =>
                        openRescheduleModal(
                            interview
                        )
                    }
                    disabled={Boolean(actionLoading)}
                >
                    <i className="bi bi-calendar2-week"></i>
                    Request Reschedule
                </button>

                <button
                    type="button"
                    className="decline-button"
                    onClick={() =>
                        openDeclineModal(interview)
                    }
                    disabled={Boolean(actionLoading)}
                >
                    {isDeclining ? (
                        <>
                            <span className="button-spinner"></span>
                            Declining...
                        </>
                    ) : (
                        <>
                            <i className="bi bi-x-circle"></i>
                            Decline Interview
                        </>
                    )}
                </button>
            </div>
        );
    };

    const renderInterviewCard = (
        interview,
        isHistory = false
    ) => {
        const isOnline =
            interview.interview_type === "online";

        const isCancelled =
            interview.status === "cancelled";

        const isCompleted =
            interview.status === "completed";

        return (
            <div
                className={`interview-card ${isHistory
                        ? "history-card"
                        : "upcoming-card"
                    }`}
                key={interview.id}
            >
                <div className="interview-card-header">
                    <div>
                        <span className="interview-label">
                            INTERVIEW
                        </span>

                        <h3>
                            {interview.job_title ||
                                "Job Interview"}
                        </h3>

                        <p className="company-name">
                            <i className="bi bi-building"></i>

                            {interview.company_name ||
                                "Company"}
                        </p>
                    </div>

                    <span
                        className={`interview-status ${getStatusClass(
                            interview.status
                        )}`}
                    >
                        <i
                            className={`bi ${getStatusIcon(
                                interview.status
                            )}`}
                        ></i>

                        {getStatusLabel(
                            interview.status
                        )}
                    </span>
                </div>

                <div className="interview-info-grid">
                    <div className="interview-info">
                        <i className="bi bi-calendar3"></i>

                        <div>
                            <span>Date</span>

                            <strong>
                                {formatDate(
                                    interview.scheduled_at
                                )}
                            </strong>
                        </div>
                    </div>

                    <div className="interview-info">
                        <i className="bi bi-clock"></i>

                        <div>
                            <span>Time</span>

                            <strong>
                                {formatTime(
                                    interview.scheduled_at
                                )}
                            </strong>
                        </div>
                    </div>

                    <div className="interview-info">
                        <i
                            className={`bi ${isOnline
                                    ? "bi-camera-video"
                                    : "bi-geo-alt"
                                }`}
                        ></i>

                        <div>
                            <span>Type</span>

                            <strong>
                                {getInterviewTypeLabel(
                                    interview.interview_type
                                )}
                            </strong>
                        </div>
                    </div>
                </div>

                {isOnline &&
                    interview.meeting_link && (
                        <div className="interview-location">
                            <i className="bi bi-link-45deg"></i>

                            <div>
                                <span>
                                    Meeting Link
                                </span>

                                <a
                                    href={
                                        interview.meeting_link
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Join Interview

                                    <i className="bi bi-box-arrow-up-right"></i>
                                </a>
                            </div>
                        </div>
                    )}

                {!isOnline &&
                    interview.location && (
                        <div className="interview-location">
                            <i className="bi bi-geo-alt"></i>

                            <div>
                                <span>
                                    Location
                                </span>

                                <strong>
                                    {interview.location}
                                </strong>
                            </div>
                        </div>
                    )}

                {interview.message && (
                    <div className="interview-message">
                        <i className="bi bi-chat-left-text"></i>

                        <div>
                            <span>
                                Message from employer
                            </span>

                            <p>
                                {interview.message}
                            </p>
                        </div>
                    </div>
                )}

                {!isHistory &&
                    isActiveInterview(
                        interview
                    ) && (
                        <div className="candidate-action-panel">
                            <div className="action-panel-heading">
                                <div className="action-panel-icon">
                                    <i className="bi bi-person-check"></i>
                                </div>

                                <div>
                                    <strong>
                                        Interview Actions
                                    </strong>

                                    <span>
                                        Manage your attendance
                                        for this interview.
                                    </span>
                                </div>
                            </div>

                            {renderCandidateActions(
                                interview,
                                isHistory
                            )}
                        </div>
                    )}

                <div className="interview-card-footer">
                    <button
                        type="button"
                        className="details-button"
                        onClick={() =>
                            setSelectedInterview(
                                interview
                            )
                        }
                    >
                        <i className="bi bi-eye"></i>

                        View Details
                    </button>

                    {!isHistory &&
                        !isCancelled &&
                        !isCompleted &&
                        isOnline &&
                        interview.meeting_link && (
                            <a
                                href={
                                    interview.meeting_link
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="join-button"
                            >
                                <i className="bi bi-camera-video"></i>

                                Join Interview
                            </a>
                        )}
                </div>
            </div>
        );
    };

    return (
        <div className="interviews-page">
            <div className="interviews-overlay"></div>

            <main className="interviews-container">
                <div className="interviews-header">
                    <div>
                        <span className="page-label">
                            CAREER CENTER
                        </span>

                        <h1>
                            My Interviews
                        </h1>

                        <p>
                            Manage your upcoming interviews,
                            meeting details, attendance,
                            reschedule requests, and
                            interview history.
                        </p>
                    </div>

                    <Link
                        to="/my-applications"
                        className="applications-link"
                    >
                        <i className="bi bi-briefcase"></i>

                        My Applications
                    </Link>
                </div>

                {success && (
                    <div className="interviews-success">
                        <i className="bi bi-check-circle"></i>

                        <span>{success}</span>

                        <button
                            type="button"
                            onClick={() =>
                                setSuccess("")
                            }
                        >
                            <i className="bi bi-x"></i>
                        </button>
                    </div>
                )}

                {error && (
                    <div className="interviews-error">
                        <i className="bi bi-exclamation-triangle"></i>

                        <span>{error}</span>

                        <button
                            type="button"
                            onClick={fetchInterviews}
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {loading ? (
                    <div className="interviews-loading">
                        <div className="loading-spinner"></div>

                        <p>
                            Loading your interviews...
                        </p>
                    </div>
                ) : (
                    <>
                        <section className="interview-section">
                            <div className="section-heading">
                                <div>
                                    <span>
                                        YOUR SCHEDULE
                                    </span>

                                    <h2>
                                        Upcoming Interviews
                                    </h2>
                                </div>

                                <span className="section-count">
                                    {
                                        upcomingInterviews.length
                                    }
                                </span>
                            </div>

                            {upcomingInterviews.length ===
                                0 ? (
                                <div className="empty-interviews">
                                    <div className="empty-icon">
                                        <i className="bi bi-calendar-event"></i>
                                    </div>

                                    <h3>
                                        No upcoming interviews
                                    </h3>

                                    <p>
                                        When an employer schedules
                                        an interview, it will
                                        appear here.
                                    </p>

                                    <Link
                                        to="/jobs"
                                        className="browse-jobs-button"
                                    >
                                        <i className="bi bi-search"></i>

                                        Browse Jobs
                                    </Link>
                                </div>
                            ) : (
                                <div className="interviews-list">
                                    {upcomingInterviews.map(
                                        (interview) =>
                                            renderInterviewCard(
                                                interview
                                            )
                                    )}
                                </div>
                            )}
                        </section>

                        <section className="interview-section history-section">
                            <div className="section-heading">
                                <div>
                                    <span>
                                        PAST ACTIVITY
                                    </span>

                                    <h2>
                                        Interview History
                                    </h2>
                                </div>

                                <span className="section-count">
                                    {
                                        interviewHistory.length
                                    }
                                </span>
                            </div>

                            {interviewHistory.length ===
                                0 ? (
                                <div className="empty-history">
                                    <i className="bi bi-clock-history"></i>

                                    <p>
                                        Your completed and
                                        cancelled interviews
                                        will appear here.
                                    </p>
                                </div>
                            ) : (
                                <div className="interviews-list">
                                    {interviewHistory.map(
                                        (interview) =>
                                            renderInterviewCard(
                                                interview,
                                                true
                                            )
                                    )}
                                </div>
                            )}
                        </section>
                    </>
                )}
            </main>

            {selectedInterview && (
                <div
                    className="interview-modal-backdrop"
                    onClick={() =>
                        setSelectedInterview(null)
                    }
                >
                    <div
                        className="interview-modal"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >
                        <div className="modal-header">
                            <div>
                                <span>
                                    INTERVIEW DETAILS
                                </span>

                                <h2>
                                    {selectedInterview.job_title ||
                                        "Job Interview"}
                                </h2>

                                <p>
                                    {selectedInterview.company_name ||
                                        "Company"}
                                </p>
                            </div>

                            <button
                                type="button"
                                className="modal-close"
                                onClick={() =>
                                    setSelectedInterview(
                                        null
                                    )
                                }
                            >
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>

                        <div className="modal-status">
                            <span
                                className={`interview-status ${getStatusClass(
                                    selectedInterview.status
                                )}`}
                            >
                                <i
                                    className={`bi ${getStatusIcon(
                                        selectedInterview.status
                                    )}`}
                                ></i>

                                {getStatusLabel(
                                    selectedInterview.status
                                )}
                            </span>
                        </div>

                        <div className="modal-details">
                            <div>
                                <i className="bi bi-calendar3"></i>

                                <span>Date</span>

                                <strong>
                                    {formatDate(
                                        selectedInterview.scheduled_at
                                    )}
                                </strong>
                            </div>

                            <div>
                                <i className="bi bi-clock"></i>

                                <span>Time</span>

                                <strong>
                                    {formatTime(
                                        selectedInterview.scheduled_at
                                    )}
                                </strong>
                            </div>

                            <div>
                                <i
                                    className={`bi ${selectedInterview.interview_type ===
                                            "online"
                                            ? "bi-camera-video"
                                            : "bi-geo-alt"
                                        }`}
                                ></i>

                                <span>
                                    Interview Type
                                </span>

                                <strong>
                                    {getInterviewTypeLabel(
                                        selectedInterview.interview_type
                                    )}
                                </strong>
                            </div>
                        </div>

                        {selectedInterview.meeting_link && (
                            <div className="modal-detail-box">
                                <i className="bi bi-link-45deg"></i>

                                <div>
                                    <span>
                                        Meeting Link
                                    </span>

                                    <a
                                        href={
                                            selectedInterview.meeting_link
                                        }
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Join Interview

                                        <i className="bi bi-box-arrow-up-right"></i>
                                    </a>
                                </div>
                            </div>
                        )}

                        {selectedInterview.location && (
                            <div className="modal-detail-box">
                                <i className="bi bi-geo-alt"></i>

                                <div>
                                    <span>
                                        Location
                                    </span>

                                    <strong>
                                        {
                                            selectedInterview.location
                                        }
                                    </strong>
                                </div>
                            </div>
                        )}

                        {selectedInterview.message && (
                            <div className="modal-message">
                                <div className="modal-message-title">
                                    <i className="bi bi-chat-left-text"></i>

                                    <span>
                                        Employer Message
                                    </span>
                                </div>

                                <p>
                                    {
                                        selectedInterview.message
                                    }
                                </p>
                            </div>
                        )}

                        {!selectedInterview.status ||
                            (selectedInterview.status !==
                                "cancelled" &&
                                selectedInterview.status !==
                                "completed" &&
                                getInterviewDate(
                                    selectedInterview
                                ) > new Date()) ? (
                            <div className="modal-candidate-actions">
                                {renderCandidateActions(
                                    selectedInterview
                                )}
                            </div>
                        ) : null}

                        <div className="modal-footer">
                            {selectedInterview.status !==
                                "cancelled" &&
                                selectedInterview.status !==
                                "completed" &&
                                selectedInterview.interview_type ===
                                "online" &&
                                selectedInterview.meeting_link && (
                                    <a
                                        href={
                                            selectedInterview.meeting_link
                                        }
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="join-button"
                                    >
                                        <i className="bi bi-camera-video"></i>

                                        Join Interview
                                    </a>
                                )}

                            <button
                                type="button"
                                className="close-details-button"
                                onClick={() =>
                                    setSelectedInterview(
                                        null
                                    )
                                }
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showRescheduleModal &&
                actionInterview && (
                    <div
                        className="interview-modal-backdrop"
                        onClick={closeRescheduleModal}
                    >
                        <div
                            className="action-modal"
                            onClick={(event) =>
                                event.stopPropagation()
                            }
                        >
                            <div className="modal-header">
                                <div>
                                    <span>
                                        RESCHEDULE REQUEST
                                    </span>

                                    <h2>
                                        Request a New Time
                                    </h2>

                                    <p>
                                        {
                                            actionInterview.job_title
                                        }{" "}
                                        •{" "}
                                        {
                                            actionInterview.company_name
                                        }
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    className="modal-close"
                                    onClick={
                                        closeRescheduleModal
                                    }
                                    disabled={
                                        Boolean(
                                            actionLoading
                                        )
                                    }
                                >
                                    <i className="bi bi-x-lg"></i>
                                </button>
                            </div>

                            <form
                                className="action-form"
                                onSubmit={
                                    submitRescheduleRequest
                                }
                            >
                                <div className="request-info">
                                    <i className="bi bi-info-circle"></i>

                                    <p>
                                        Your preferred time will
                                        be sent to the employer.
                                        The interview will not
                                        change until the employer
                                        approves and reschedules
                                        it.
                                    </p>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="preferred_date">
                                            Preferred Date
                                        </label>

                                        <input
                                            id="preferred_date"
                                            name="preferred_date"
                                            type="date"
                                            value={
                                                rescheduleForm.preferred_date
                                            }
                                            onChange={
                                                handleRescheduleChange
                                            }
                                            min={
                                                new Date()
                                                    .toISOString()
                                                    .split(
                                                        "T"
                                                    )[0]
                                            }
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="preferred_time">
                                            Preferred Time
                                        </label>

                                        <input
                                            id="preferred_time"
                                            name="preferred_time"
                                            type="time"
                                            value={
                                                rescheduleForm.preferred_time
                                            }
                                            onChange={
                                                handleRescheduleChange
                                            }
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="reason">
                                        Reason
                                    </label>

                                    <textarea
                                        id="reason"
                                        name="reason"
                                        rows="5"
                                        value={
                                            rescheduleForm.reason
                                        }
                                        onChange={
                                            handleRescheduleChange
                                        }
                                        placeholder="Explain why you need the interview rescheduled..."
                                        required
                                    ></textarea>
                                </div>

                                <div className="action-modal-footer">
                                    <button
                                        type="button"
                                        className="cancel-modal-button"
                                        onClick={
                                            closeRescheduleModal
                                        }
                                        disabled={
                                            Boolean(
                                                actionLoading
                                            )
                                        }
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className="submit-reschedule-button"
                                        disabled={
                                            Boolean(
                                                actionLoading
                                            )
                                        }
                                    >
                                        {actionLoading ===
                                            `reschedule-${actionInterview.id}` ? (
                                            <>
                                                <span className="button-spinner"></span>
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-send"></i>
                                                Send Request
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

            {showDeclineModal &&
                actionInterview && (
                    <div
                        className="interview-modal-backdrop"
                        onClick={closeDeclineModal}
                    >
                        <div
                            className="decline-modal"
                            onClick={(event) =>
                                event.stopPropagation()
                            }
                        >
                            <div className="decline-icon">
                                <i className="bi bi-calendar-x"></i>
                            </div>

                            <h2>
                                Decline Interview?
                            </h2>

                            <p>
                                Are you sure you want to
                                decline the interview for{" "}
                                <strong>
                                    {actionInterview.job_title}
                                </strong>{" "}
                                at{" "}
                                <strong>
                                    {actionInterview.company_name}
                                </strong>
                                ?
                            </p>
                            <div className="decline-warning">
                                <i className="bi bi-exclamation-triangle"></i>

                                <span>
                                    The employer will be notified
                                    that you declined the
                                    interview.
                                </span>
                            </div>

                            <div className="decline-modal-footer">
                                <button
                                    type="button"
                                    className="cancel-modal-button"
                                    onClick={
                                        closeDeclineModal
                                    }
                                    disabled={
                                        Boolean(
                                            actionLoading
                                        )
                                    }
                                >
                                    Keep Interview
                                </button>

                                <button
                                    type="button"
                                    className="confirm-decline-button"
                                    onClick={
                                        declineInterview
                                    }
                                    disabled={
                                        Boolean(
                                            actionLoading
                                        )
                                    }
                                >
                                    {actionLoading ===
                                        `decline-${actionInterview.id}` ? (
                                        <>
                                            <span className="button-spinner"></span>
                                            Declining...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-x-circle"></i>
                                            Yes, Decline
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
        </div>
    );
}

export default Interviews;