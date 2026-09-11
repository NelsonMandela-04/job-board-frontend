import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { getUser } from "../utils/auth";
import "./EmployerApplications.css";

function EmployerApplications() {
    const [applications, setApplications] = useState([]);
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updatingId, setUpdatingId] = useState(null);
    const [interviewLoading, setInterviewLoading] = useState(false);
    const [showInterviewModal, setShowInterviewModal] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [editingInterview, setEditingInterview] = useState(null);

    const [interviewForm, setInterviewForm] = useState({
        interview_type: "online",
        scheduled_at: "",
        meeting_link: "",
        location: "",
        message: "",
    });

    const recruitmentStages = [
        "pending",
        "under_review",
        "shortlisted",
        "interview",
        "offer",
        "hired",
    ];

    const getNormalizedStatus = (status) => {
        if (!status) return "pending";

        if (status === "reviewed") {
            return "under_review";
        }

        if (status === "accepted") {
            return "hired";
        }

        if (status === "declined") {
            return "rejected";
        }

        return status.toLowerCase();
    };

    const getLocalDateTimeMin = () => {
        const date = new Date();

        date.setMinutes(
            date.getMinutes() - date.getTimezoneOffset()
        );

        return date.toISOString().slice(0, 16);
    };

    const toLocalDateTimeInput = (value) => {
        if (!value) return "";

        const date = new Date(value);

        date.setMinutes(
            date.getMinutes() - date.getTimezoneOffset()
        );

        return date.toISOString().slice(0, 16);
    };

    const fetchApplications = async () => {
        try {
            const response = await api.get(
                "applications/employer_applications/"
            );

            setApplications(response.data || []);
        } catch (err) {
            console.error(
                "Unable to load applications:",
                err
            );

            setError(
                err.response?.data?.detail ||
                "Unable to load applications."
            );
        }
    };

    const fetchInterviews = async () => {
        try {
            const response = await api.get("interviews/");

            setInterviews(response.data || []);
        } catch (err) {
            console.error(
                "Unable to load interviews:",
                err
            );
        }
    };

    const loadData = async () => {
        try {
            setLoading(true);
            setError("");

            await Promise.all([
                fetchApplications(),
                fetchInterviews(),
            ]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const updateStatus = async (
        applicationId,
        newStatus
    ) => {
        if (
            newStatus === "rejected" ||
            newStatus === "hired"
        ) {
            const confirmationMessage =
                newStatus === "hired"
                    ? "Are you sure you want to mark this candidate as Hired?"
                    : "Are you sure you want to reject this application?";

            if (!window.confirm(confirmationMessage)) {
                return;
            }
        }

        try {
            setUpdatingId(applicationId);
            setError("");

            const response = await api.patch(
                `applications/${applicationId}/update_status/`,
                {
                    status: newStatus,
                }
            );

            setApplications(
                (currentApplications) =>
                    currentApplications.map(
                        (application) =>
                            application.id === applicationId
                                ? response.data
                                : application
                    )
            );

            await fetchInterviews();
        } catch (err) {
            console.error(
                "Unable to update application status:",
                err
            );

            alert(
                err.response?.data?.detail ||
                err.response?.data?.error ||
                "Unable to update application status."
            );
        } finally {
            setUpdatingId(null);
        }
    };

    const getStatusLabel = (status) => {
        const labels = {
            pending: "Pending",
            under_review: "Under Review",
            reviewed: "Reviewed",
            shortlisted: "Shortlisted",
            interview: "Interview",
            offer: "Offer",
            hired: "Hired",
            rejected: "Rejected",
            withdrawn: "Withdrawn",
            accepted: "Accepted",
        };

        return (
            labels[status] ||
            status?.replaceAll("_", " ") ||
            "Pending"
        );
    };

    const getStatusIcon = (status) => {
        const icons = {
            pending: "bi-hourglass-split",
            under_review: "bi-search",
            reviewed: "bi-search",
            shortlisted: "bi-star-fill",
            interview: "bi-calendar-event",
            offer: "bi-file-earmark-text",
            hired: "bi-check-circle-fill",
            rejected: "bi-x-circle-fill",
            withdrawn: "bi-arrow-counterclockwise",
            accepted: "bi-check-circle-fill",
        };

        return icons[status] || "bi-circle";
    };

    const getStageIndex = (status) => {
        const normalizedStatus =
            getNormalizedStatus(status);

        return recruitmentStages.indexOf(
            normalizedStatus
        );
    };

    const getApplicationInterviews = (
        applicationId
    ) => {
        return interviews
            .filter(
                (interview) =>
                    Number(interview.application) ===
                    Number(applicationId)
            )
            .sort(
                (a, b) =>
                    new Date(b.scheduled_at) -
                    new Date(a.scheduled_at)
            );
    };

    const getActiveInterview = (applicationId) => {
        const applicationInterviews =
            getApplicationInterviews(applicationId);

        return (
            applicationInterviews.find(
                (interview) =>
                    interview.status !== "cancelled" &&
                    interview.status !== "completed" &&
                    interview.status !== "declined"
            ) || null
        );
    };

    const openScheduleModal = (application) => {
        setSelectedApplication(application);
        setEditingInterview(null);

        setInterviewForm({
            interview_type: "online",
            scheduled_at: "",
            meeting_link: "",
            location: "",
            message: "",
        });

        setShowInterviewModal(true);
    };

    const openRescheduleModal = (
        application,
        interview
    ) => {
        setSelectedApplication(application);
        setEditingInterview(interview);

        setInterviewForm({
            interview_type:
                interview.interview_type || "online",
            scheduled_at: toLocalDateTimeInput(
                interview.scheduled_at
            ),
            meeting_link:
                interview.meeting_link || "",
            location: interview.location || "",
            message: interview.message || "",
        });

        setShowInterviewModal(true);
    };

    const closeInterviewModal = () => {
        if (interviewLoading) {
            return;
        }

        setShowInterviewModal(false);
        setSelectedApplication(null);
        setEditingInterview(null);

        setInterviewForm({
            interview_type: "online",
            scheduled_at: "",
            meeting_link: "",
            location: "",
            message: "",
        });
    };

    const handleInterviewInputChange = (event) => {
        const {
            name,
            value,
        } = event.target;

        setInterviewForm(
            (currentForm) => ({
                ...currentForm,
                [name]: value,
            })
        );
    };

    const submitInterview = async (event) => {
        event.preventDefault();

        if (!selectedApplication) {
            return;
        }

        if (!interviewForm.scheduled_at) {
            alert(
                "Please select an interview date and time."
            );

            return;
        }

        if (
            interviewForm.interview_type === "online" &&
            !interviewForm.meeting_link.trim()
        ) {
            alert(
                "Please provide the meeting link."
            );

            return;
        }

        if (
            interviewForm.interview_type === "in_person" &&
            !interviewForm.location.trim()
        ) {
            alert(
                "Please provide the interview location."
            );

            return;
        }

        const selectedDate = new Date(
            interviewForm.scheduled_at
        );

        if (Number.isNaN(selectedDate.getTime())) {
            alert(
                "Please provide a valid interview date and time."
            );

            return;
        }

        if (selectedDate <= new Date()) {
            alert(
                "Interview date and time must be in the future."
            );

            return;
        }

        try {
            setInterviewLoading(true);

            const payload = {
                application: selectedApplication.id,
                interview_type:
                    interviewForm.interview_type,
                scheduled_at:
                    selectedDate.toISOString(),
                meeting_link:
                    interviewForm.interview_type ===
                    "online"
                        ? interviewForm.meeting_link.trim()
                        : "",
                location:
                    interviewForm.interview_type ===
                    "in_person"
                        ? interviewForm.location.trim()
                        : "",
                message:
                    interviewForm.message.trim(),
            };

            if (editingInterview) {
                await api.patch(
                    `interviews/${editingInterview.id}/`,
                    payload
                );
            } else {
                await api.post(
                    "interviews/",
                    payload
                );
            }

            await fetchInterviews();

            setShowInterviewModal(false);
            setSelectedApplication(null);
            setEditingInterview(null);

            setInterviewForm({
                interview_type: "online",
                scheduled_at: "",
                meeting_link: "",
                location: "",
                message: "",
            });
        } catch (err) {
            console.error(
                "Unable to save interview:",
                err
            );

            alert(
                err.response?.data?.detail ||
                err.response?.data?.error ||
                err.response?.data?.application?.[0] ||
                err.response?.data?.scheduled_at?.[0] ||
                "Unable to save interview."
            );
        } finally {
            setInterviewLoading(false);
        }
    };

    const formatRequestedDate = (value) => {
        if (!value) {
            return "Not provided";
        }

        const date = new Date(
            `${value}T00:00:00`
        );

        if (Number.isNaN(date.getTime())) {
            return value;
        }

        return date.toLocaleDateString(
            "en-NG",
            {
                year: "numeric",
                month: "long",
                day: "numeric",
            }
        );
    };

    const formatRequestedTime = (value) => {
        if (!value) {
            return "Not provided";
        }

        const parts = value.split(":");

        if (parts.length < 2) {
            return value;
        }

        const hours = Number(parts[0]);
        const minutes = Number(parts[1]);

        if (
            Number.isNaN(hours) ||
            Number.isNaN(minutes)
        ) {
            return value;
        }

        const date = new Date();

        date.setHours(
            hours,
            minutes,
            0,
            0
        );

        return date.toLocaleTimeString(
            "en-NG",
            {
                hour: "2-digit",
                minute: "2-digit",
            }
        );
    };

    const approveReschedule = async (
        interview
    ) => {
        const preferredDate =
            interview?.preferred_date || "";

        const preferredTime =
            interview?.preferred_time || "";

        if (
            !preferredDate ||
            !preferredTime
        ) {
            alert(
                "The candidate's reschedule request does not contain a valid preferred date and time."
            );

            return;
        }

        const formattedDate =
            formatRequestedDate(
                preferredDate
            );

        const formattedTime =
            formatRequestedTime(
                preferredTime
            );

        const confirmationMessage =
            `Approve the candidate's reschedule request and move the interview to ${formattedDate} at ${formattedTime}?`;

        if (
            !window.confirm(
                confirmationMessage
            )
        ) {
            return;
        }

        try {
            setInterviewLoading(true);

            await api.patch(
                `interviews/${interview.id}/approve_reschedule/`
            );

            await fetchInterviews();

            alert(
                "Reschedule request approved successfully."
            );
        } catch (err) {
            console.error(
                "Unable to approve reschedule request:",
                err
            );

            alert(
                err.response?.data?.detail ||
                err.response?.data?.scheduled_at?.[0] ||
                err.response?.data?.preferred_date?.[0] ||
                err.response?.data?.preferred_time?.[0] ||
                "Unable to approve reschedule request."
            );
        } finally {
            setInterviewLoading(false);
        }
    };

    const rejectReschedule = async (
        interview
    ) => {
        const message = window.prompt(
            "Optional message to the candidate:"
        );

        if (message === null) {
            return;
        }

        if (
            !window.confirm(
                "Are you sure you want to reject this reschedule request?"
            )
        ) {
            return;
        }

        try {
            setInterviewLoading(true);

            await api.patch(
                `interviews/${interview.id}/reject_reschedule/`,
                {
                    message: message.trim(),
                }
            );

            await fetchInterviews();

            alert(
                "Reschedule request rejected successfully."
            );
        } catch (err) {
            console.error(
                "Unable to reject reschedule request:",
                err
            );

            alert(
                err.response?.data?.detail ||
                "Unable to reject reschedule request."
            );
        } finally {
            setInterviewLoading(false);
        }
    };

    const cancelInterview = async (
        interview
    ) => {
        if (
            !window.confirm(
                "Are you sure you want to cancel this interview?"
            )
        ) {
            return;
        }

        try {
            setInterviewLoading(true);

            await api.patch(
                `interviews/${interview.id}/cancel/`
            );

            await fetchInterviews();
        } catch (err) {
            console.error(
                "Unable to cancel interview:",
                err
            );

            alert(
                err.response?.data?.detail ||
                "Unable to cancel interview."
            );
        } finally {
            setInterviewLoading(false);
        }
    };

    const completeInterview = async (
        interview
    ) => {
        if (
            !window.confirm(
                "Mark this interview as completed?"
            )
        ) {
            return;
        }

        try {
            setInterviewLoading(true);

            await api.patch(
                `interviews/${interview.id}/complete/`
            );

            await fetchInterviews();
        } catch (err) {
            console.error(
                "Unable to complete interview:",
                err
            );

            alert(
                err.response?.data?.detail ||
                "Unable to complete interview."
            );
        } finally {
            setInterviewLoading(false);
        }
    };

    const formatInterviewDate = (date) => {
        if (!date) {
            return "Not scheduled";
        }

        return new Date(date).toLocaleString(
            "en-NG",
            {
                dateStyle: "medium",
                timeStyle: "short",
            }
        );
    };

    const getInterviewStatusLabel = (
        status
    ) => {
        const labels = {
            scheduled: "Scheduled",
            rescheduled: "Rescheduled",
            cancelled: "Cancelled",
            completed: "Completed",
            declined: "Declined",
        };

        return (
            labels[status] || status
        );
    };

    const totalApplications =
        applications.length;

    const pendingCount =
        applications.filter(
            (application) =>
                getNormalizedStatus(
                    application.status
                ) === "pending"
        ).length;

    const reviewedCount =
        applications.filter(
            (application) =>
                getNormalizedStatus(
                    application.status
                ) === "under_review"
        ).length;

    const shortlistedCount =
        applications.filter(
            (application) =>
                getNormalizedStatus(
                    application.status
                ) === "shortlisted"
        ).length;

    const interviewCount =
        applications.filter(
            (application) =>
                getNormalizedStatus(
                    application.status
                ) === "interview"
        ).length;

    const offerCount =
        applications.filter(
            (application) =>
                getNormalizedStatus(
                    application.status
                ) === "offer"
        ).length;

    const hiredCount =
        applications.filter(
            (application) =>
                getNormalizedStatus(
                    application.status
                ) === "hired"
        ).length;

    const rejectedCount =
        applications.filter(
            (application) =>
                getNormalizedStatus(
                    application.status
                ) === "rejected"
        ).length;

    const scheduledInterviewCount =
        interviews.filter(
            (interview) =>
                interview.status === "scheduled" ||
                interview.status === "rescheduled"
        ).length;

    const user = getUser();

    if (loading) {
        return (
            <div className="employer-applications-page">
                <div className="employer-applications-overlay">
                    <div className="applications-loading">
                        <div
                            className="spinner-border"
                            role="status"
                        >
                            <span className="visually-hidden">
                                Loading...
                            </span>
                        </div>

                        <p>
                            Loading applications...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="employer-applications-page">
            <div className="employer-applications-overlay">
                <div className="employer-applications-container">
                    <header className="applications-header">
                        <div>
                            <span className="applications-eyebrow">
                                <i className="bi bi-briefcase-fill"></i>
                                Employer Workspace
                            </span>

                            <h1>
                                Applications
                            </h1>

                            <p>
                                Review candidates, manage recruitment stages, and schedule interviews.
                            </p>
                        </div>

                        <div className="applications-header-user">
                            <i className="bi bi-person-circle"></i>

                            <div>
                                <strong>
                                    {user?.first_name ||
                                        user?.username ||
                                        "Employer"}
                                </strong>

                                <span>
                                    Recruitment Manager
                                </span>
                            </div>
                        </div>
                    </header>

                    {error && (
                        <div className="applications-error">
                            <i className="bi bi-exclamation-triangle-fill"></i>

                            <span>
                                {error}
                            </span>

                            <button
                                type="button"
                                onClick={loadData}
                            >
                                Try Again
                            </button>
                        </div>
                    )}

                    <section className="applications-summary">
                        <div className="summary-card">
                            <div className="summary-icon total">
                                <i className="bi bi-people-fill"></i>
                            </div>

                            <div>
                                <span>
                                    Total
                                </span>

                                <strong>
                                    {totalApplications}
                                </strong>
                            </div>
                        </div>

                        <div className="summary-card">
                            <div className="summary-icon pending">
                                <i className="bi bi-hourglass-split"></i>
                            </div>

                            <div>
                                <span>
                                    Pending
                                </span>

                                <strong>
                                    {pendingCount}
                                </strong>
                            </div>
                        </div>

                        <div className="summary-card">
                            <div className="summary-icon reviewed">
                                <i className="bi bi-search"></i>
                            </div>

                            <div>
                                <span>
                                    Under Review
                                </span>

                                <strong>
                                    {reviewedCount}
                                </strong>
                            </div>
                        </div>

                        <div className="summary-card">
                            <div className="summary-icon shortlisted">
                                <i className="bi bi-star-fill"></i>
                            </div>

                            <div>
                                <span>
                                    Shortlisted
                                </span>

                                <strong>
                                    {shortlistedCount}
                                </strong>
                            </div>
                        </div>

                        <div className="summary-card">
                            <div className="summary-icon interview">
                                <i className="bi bi-calendar-event-fill"></i>
                            </div>

                            <div>
                                <span>
                                    Interviews
                                </span>

                                <strong>
                                    {scheduledInterviewCount}
                                </strong>
                            </div>
                        </div>

                        <div className="summary-card">
                            <div className="summary-icon offer">
                                <i className="bi bi-file-earmark-text-fill"></i>
                            </div>

                            <div>
                                <span>
                                    Offers
                                </span>

                                <strong>
                                    {offerCount}
                                </strong>
                            </div>
                        </div>

                        <div className="summary-card">
                            <div className="summary-icon accepted">
                                <i className="bi bi-check-circle-fill"></i>
                            </div>

                            <div>
                                <span>
                                    Hired
                                </span>

                                <strong>
                                    {hiredCount}
                                </strong>
                            </div>
                        </div>

                        <div className="summary-card">
                            <div className="summary-icon rejected">
                                <i className="bi bi-x-circle-fill"></i>
                            </div>

                            <div>
                                <span>
                                    Rejected
                                </span>

                                <strong>
                                    {rejectedCount}
                                </strong>
                            </div>
                        </div>
                    </section>

                    {applications.length === 0 ? (
                        <div className="empty-applications">
                            <div className="empty-icon">
                                <i className="bi bi-inbox-fill"></i>
                            </div>

                            <h2>
                                No Applications Yet
                            </h2>

                            <p>
                                Applications from candidates will appear here when they apply to your jobs.
                            </p>

                            <Link
                                to="/employer-dashboard"
                                className="empty-action"
                            >
                                <i className="bi bi-arrow-left"></i>
                                Back to Dashboard
                            </Link>
                        </div>
                    ) : (
                        <div className="applications-list">
                            {applications.map(
                                (application) => {
                                    const normalizedStatus =
                                        getNormalizedStatus(
                                            application.status
                                        );

                                    const stageIndex =
                                        getStageIndex(
                                            application.status
                                        );

                                    const activeInterview =
                                        getActiveInterview(
                                            application.id
                                        );

                                    const applicationInterviews =
                                        getApplicationInterviews(
                                            application.id
                                        );

                                    const rescheduleDetails =
                                        activeInterview?.reschedule_requested
                                            ? {
                                                  preferredDate:
                                                      activeInterview.preferred_date ||
                                                      "",
                                                  preferredTime:
                                                      activeInterview.preferred_time ||
                                                      "",
                                                  reason:
                                                      activeInterview.reschedule_reason ||
                                                      "",
                                              }
                                            : null;

                                    return (
                                        <article
                                            key={
                                                application.id
                                            }
                                            className="application-card"
                                        >
                                            <div className="application-card-top">
                                                <div className="candidate-section">
                                                    <div className="candidate-avatar">
                                                        {(
                                                            application
                                                                .applicant
                                                                ?.first_name ||
                                                            application
                                                                .applicant
                                                                ?.username ||
                                                            "C"
                                                        )
                                                            .charAt(
                                                                0
                                                            )
                                                            .toUpperCase()}
                                                    </div>

                                                    <div className="candidate-info">
                                                        <span className="candidate-label">
                                                            Candidate
                                                        </span>

                                                        <h2>
                                                            {application
                                                                .applicant
                                                                ?.first_name ||
                                                                ""}{" "}
                                                            {application
                                                                .applicant
                                                                ?.last_name ||
                                                                ""}
                                                        </h2>

                                                        <p>
                                                            <i className="bi bi-person-badge"></i>

                                                            {application
                                                                .applicant
                                                                ?.username ||
                                                                "Candidate"}
                                                        </p>

                                                        {application
                                                            .applicant
                                                            ?.email && (
                                                            <p>
                                                                <i className="bi bi-envelope"></i>

                                                                {
                                                                    application
                                                                        .applicant
                                                                        .email
                                                                }
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div
                                                    className={`application-status ${normalizedStatus}`}
                                                >
                                                    <i
                                                        className={`bi ${getStatusIcon(
                                                            normalizedStatus
                                                        )}`}
                                                    ></i>

                                                    {getStatusLabel(
                                                        normalizedStatus
                                                    )}
                                                </div>
                                            </div>

                                            <div className="application-job-info">
                                                <div>
                                                    <span>
                                                        <i className="bi bi-briefcase-fill"></i>
                                                        Job Position
                                                    </span>

                                                    <strong>
                                                        {application
                                                            .job_details
                                                            ?.title ||
                                                            application
                                                                .job_details
                                                                ?.name ||
                                                            "Job"}
                                                    </strong>
                                                </div>

                                                <div>
                                                    <span>
                                                        <i className="bi bi-building"></i>
                                                        Company
                                                    </span>

                                                    <strong>
                                                        {application
                                                            .job_details
                                                            ?.company_name ||
                                                            application
                                                                .job_details
                                                                ?.company
                                                                ?.name ||
                                                            "Company"}
                                                    </strong>
                                                </div>

                                                <div>
                                                    <span>
                                                        <i className="bi bi-calendar3"></i>
                                                        Applied
                                                    </span>

                                                    <strong>
                                                        {application.applied_at
                                                            ? new Date(
                                                                  application.applied_at
                                                              ).toLocaleDateString(
                                                                  "en-NG",
                                                                  {
                                                                      year: "numeric",
                                                                      month: "short",
                                                                      day: "numeric",
                                                                  }
                                                              )
                                                            : "N/A"}
                                                    </strong>
                                                </div>
                                            </div>

                                            <div className="application-pipeline">
                                                <div className="pipeline-heading">
                                                    <div>
                                                        <span>
                                                            Recruitment Pipeline
                                                        </span>

                                                        <strong>
                                                            {getStatusLabel(
                                                                normalizedStatus
                                                            )}
                                                        </strong>
                                                    </div>

                                                    <small>
                                                        Stage{" "}
                                                        {stageIndex >=
                                                        0
                                                            ? stageIndex +
                                                              1
                                                            : 0}{" "}
                                                        of{" "}
                                                        {
                                                            recruitmentStages.length
                                                        }
                                                    </small>
                                                </div>

                                                <div className="pipeline-track">
                                                    {recruitmentStages.map(
                                                        (
                                                            stage,
                                                            index
                                                        ) => {
                                                            const isCompleted =
                                                                stageIndex >
                                                                index;

                                                            const isCurrent =
                                                                stageIndex ===
                                                                index;

                                                            return (
                                                                <div
                                                                    key={
                                                                        stage
                                                                    }
                                                                    className={`pipeline-stage ${
                                                                        isCompleted
                                                                            ? "completed"
                                                                            : ""
                                                                    } ${
                                                                        isCurrent
                                                                            ? "current"
                                                                            : ""
                                                                    }`}
                                                                >
                                                                    <div className="pipeline-dot">
                                                                        {isCompleted ? (
                                                                            <i className="bi bi-check"></i>
                                                                        ) : (
                                                                            index +
                                                                            1
                                                                        )}
                                                                    </div>

                                                                    <span>
                                                                        {getStatusLabel(
                                                                            stage
                                                                        )}
                                                                    </span>
                                                                </div>
                                                            );
                                                        }
                                                    )}
                                                </div>
                                            </div>

                                            <div className="application-content-grid">
                                                <div className="application-detail-box">
                                                    <span>
                                                        <i className="bi bi-file-earmark-person-fill"></i>
                                                        Resume
                                                    </span>

                                                    {application.resume ? (
                                                        <a
                                                            href={
                                                                application.resume
                                                            }
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="resume-link"
                                                        >
                                                            <i className="bi bi-file-earmark-pdf-fill"></i>
                                                            View Resume
                                                        </a>
                                                    ) : (
                                                        <strong>
                                                            No resume attached
                                                        </strong>
                                                    )}
                                                </div>

                                                <div className="application-detail-box cover-letter-box">
                                                    <span>
                                                        <i className="bi bi-chat-left-text-fill"></i>
                                                        Cover Letter
                                                    </span>

                                                    <p>
                                                        {application.cover_letter ||
                                                            "No cover letter provided."}
                                                    </p>
                                                </div>
                                            </div>

                                            {normalizedStatus ===
                                                "interview" && (
                                                <div className="interview-section">
                                                    <div className="interview-section-header">
                                                        <div>
                                                            <span className="interview-eyebrow">
                                                                <i className="bi bi-calendar-event-fill"></i>
                                                                Interview Management
                                                            </span>

                                                            <h3>
                                                                {activeInterview
                                                                    ? "Interview Details"
                                                                    : "Schedule Interview"}
                                                            </h3>
                                                        </div>

                                                        {activeInterview && (
                                                            <span
                                                                className={`interview-status-badge ${activeInterview.status}`}
                                                            >
                                                                <i className="bi bi-circle-fill"></i>

                                                                {getInterviewStatusLabel(
                                                                    activeInterview.status
                                                                )}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {activeInterview ? (
                                                        <div className="interview-details">
                                                            <div className="interview-detail">
                                                                <i className="bi bi-calendar-event"></i>

                                                                <div>
                                                                    <span>
                                                                        Date & Time
                                                                    </span>

                                                                    <strong>
                                                                        {formatInterviewDate(
                                                                            activeInterview.scheduled_at
                                                                        )}
                                                                    </strong>
                                                                </div>
                                                            </div>

                                                            <div className="interview-detail">
                                                                <i
                                                                    className={
                                                                        activeInterview.interview_type ===
                                                                        "online"
                                                                            ? "bi bi-camera-video-fill"
                                                                            : "bi bi-geo-alt-fill"
                                                                    }
                                                                ></i>

                                                                <div>
                                                                    <span>
                                                                        Interview Type
                                                                    </span>

                                                                    <strong>
                                                                        {activeInterview.interview_type ===
                                                                        "online"
                                                                            ? "Online Interview"
                                                                            : "In-Person Interview"}
                                                                    </strong>
                                                                </div>
                                                            </div>

                                                            {activeInterview.interview_type ===
                                                                "online" &&
                                                                activeInterview.meeting_link && (
                                                                    <div className="interview-detail">
                                                                        <i className="bi bi-link-45deg"></i>

                                                                        <div>
                                                                            <span>
                                                                                Meeting Link
                                                                            </span>

                                                                            <a
                                                                                href={
                                                                                    activeInterview.meeting_link
                                                                                }
                                                                                target="_blank"
                                                                                rel="noreferrer"
                                                                            >
                                                                                Join / Open Meeting
                                                                            </a>
                                                                        </div>
                                                                    </div>
                                                                )}

                                                            {activeInterview.interview_type ===
                                                                "in_person" &&
                                                                activeInterview.location && (
                                                                    <div className="interview-detail">
                                                                        <i className="bi bi-geo-alt-fill"></i>

                                                                        <div>
                                                                            <span>
                                                                                Location
                                                                            </span>

                                                                            <strong>
                                                                                {
                                                                                    activeInterview.location
                                                                                }
                                                                            </strong>
                                                                        </div>
                                                                    </div>
                                                                )}

                                                            {activeInterview.message && (
                                                                <div className="interview-message">
                                                                    <span>
                                                                        <i className="bi bi-chat-left-text-fill"></i>
                                                                        Message
                                                                    </span>

                                                                    <p>
                                                                        {
                                                                            activeInterview.message
                                                                        }
                                                                    </p>
                                                                </div>
                                                            )}

                                                            {activeInterview.reschedule_requested && (
                                                                <div className="reschedule-request-card">
                                                                    <div className="reschedule-request-header">
                                                                        <div>
                                                                            <span>
                                                                                <i className="bi bi-arrow-repeat"></i>
                                                                                Candidate Reschedule Request
                                                                            </span>

                                                                            <h4>
                                                                                The candidate has requested a different interview time.
                                                                            </h4>
                                                                        </div>

                                                                        <span className="reschedule-request-badge">
                                                                            <i className="bi bi-clock-fill"></i>
                                                                            Pending
                                                                        </span>
                                                                    </div>

                                                                    <div className="reschedule-request-details">
                                                                        <div className="reschedule-request-detail">
                                                                            <i className="bi bi-calendar-event-fill"></i>

                                                                            <div>
                                                                                <span>
                                                                                    Preferred Date
                                                                                </span>

                                                                                <strong>
                                                                                    {formatRequestedDate(
                                                                                        rescheduleDetails?.preferredDate
                                                                                    )}
                                                                                </strong>
                                                                            </div>
                                                                        </div>

                                                                        <div className="reschedule-request-detail">
                                                                            <i className="bi bi-clock-fill"></i>

                                                                            <div>
                                                                                <span>
                                                                                    Preferred Time
                                                                                </span>

                                                                                <strong>
                                                                                    {formatRequestedTime(
                                                                                        rescheduleDetails?.preferredTime
                                                                                    )}
                                                                                </strong>
                                                                            </div>
                                                                        </div>

                                                                        <div className="reschedule-request-reason">
                                                                            <span>
                                                                                <i className="bi bi-chat-left-text-fill"></i>
                                                                                Reason
                                                                            </span>

                                                                            <p>
                                                                                {rescheduleDetails?.reason ||
                                                                                    "No reason provided."}
                                                                            </p>
                                                                        </div>
                                                                    </div>

                                                                    <div className="reschedule-request-actions">
                                                                        <button
                                                                            type="button"
                                                                            className="interview-action complete"
                                                                            onClick={() =>
                                                                                approveReschedule(
                                                                                    activeInterview
                                                                                )
                                                                            }
                                                                            disabled={
                                                                                interviewLoading
                                                                            }
                                                                        >
                                                                            {interviewLoading ? (
                                                                                <span
                                                                                    className="spinner-border spinner-border-sm"
                                                                                    role="status"
                                                                                ></span>
                                                                            ) : (
                                                                                <i className="bi bi-check-circle-fill"></i>
                                                                            )}

                                                                            Approve Request
                                                                        </button>

                                                                        <button
                                                                            type="button"
                                                                            className="interview-action cancel"
                                                                            onClick={() =>
                                                                                rejectReschedule(
                                                                                    activeInterview
                                                                                )
                                                                            }
                                                                            disabled={
                                                                                interviewLoading
                                                                            }
                                                                        >
                                                                            {interviewLoading ? (
                                                                                <span
                                                                                    className="spinner-border spinner-border-sm"
                                                                                    role="status"
                                                                                ></span>
                                                                            ) : (
                                                                                <i className="bi bi-x-circle-fill"></i>
                                                                            )}

                                                                            Reject Request
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            <div className="interview-actions">
                                                                <button
                                                                    type="button"
                                                                    className="interview-action reschedule"
                                                                    onClick={() =>
                                                                        openRescheduleModal(
                                                                            application,
                                                                            activeInterview
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        interviewLoading ||
                                                                        activeInterview.reschedule_requested
                                                                    }
                                                                >
                                                                    <i className="bi bi-calendar2-event"></i>
                                                                    Reschedule
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    className="interview-action cancel"
                                                                    onClick={() =>
                                                                        cancelInterview(
                                                                            activeInterview
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        interviewLoading ||
                                                                        activeInterview.reschedule_requested
                                                                    }
                                                                >
                                                                    <i className="bi bi-x-circle"></i>
                                                                    Cancel
                                                                </button>

                                                                {activeInterview.status !==
                                                                    "completed" && (
                                                                    <button
                                                                        type="button"
                                                                        className="interview-action complete"
                                                                        onClick={() =>
                                                                            completeInterview(
                                                                                activeInterview
                                                                            )
                                                                        }
                                                                        disabled={
                                                                            interviewLoading ||
                                                                            activeInterview.reschedule_requested
                                                                        }
                                                                    >
                                                                        <i className="bi bi-check-circle"></i>
                                                                        Complete
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="schedule-interview-prompt">
                                                            <div className="schedule-interview-icon">
                                                                <i className="bi bi-calendar-plus-fill"></i>
                                                            </div>

                                                            <div>
                                                                <h4>
                                                                    Ready to schedule the interview?
                                                                </h4>

                                                                <p>
                                                                    Choose an interview format, date, time, and meeting details for this candidate.
                                                                </p>
                                                            </div>

                                                            <button
                                                                type="button"
                                                                className="schedule-interview-button"
                                                                onClick={() =>
                                                                    openScheduleModal(
                                                                        application
                                                                    )
                                                                }
                                                            >
                                                                <i className="bi bi-calendar-plus"></i>
                                                                Schedule Interview
                                                            </button>
                                                        </div>
                                                    )}

                                                    {applicationInterviews.length >
                                                        0 && (
                                                        <div className="interview-history">
                                                            <div className="interview-history-title">
                                                                <i className="bi bi-clock-history"></i>
                                                                Interview History
                                                            </div>

                                                            <div className="interview-history-list">
                                                                {applicationInterviews.map(
                                                                    (
                                                                        interview
                                                                    ) => (
                                                                        <div
                                                                            key={
                                                                                interview.id
                                                                            }
                                                                            className={`interview-history-item ${interview.status}`}
                                                                        >
                                                                            <span>
                                                                                {getInterviewStatusLabel(
                                                                                    interview.status
                                                                                )}
                                                                            </span>

                                                                            <strong>
                                                                                {formatInterviewDate(
                                                                                    interview.scheduled_at
                                                                                )}
                                                                            </strong>
                                                                        </div>
                                                                    )
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            <div className="application-actions">
                                                <div className="status-control">
                                                    <label
                                                        htmlFor={`status-${application.id}`}
                                                    >
                                                        <i className="bi bi-arrow-repeat"></i>
                                                        Recruitment Status
                                                    </label>

                                                    <select
                                                        id={`status-${application.id}`}
                                                        className="status-select"
                                                        value={
                                                            normalizedStatus
                                                        }
                                                        onChange={(
                                                            event
                                                        ) =>
                                                            updateStatus(
                                                                application.id,
                                                                event
                                                                    .target
                                                                    .value
                                                            )
                                                        }
                                                        disabled={
                                                            updatingId ===
                                                                application.id ||
                                                            normalizedStatus ===
                                                                "hired" ||
                                                            normalizedStatus ===
                                                                "rejected" ||
                                                            normalizedStatus ===
                                                                "withdrawn"
                                                        }
                                                    >
                                                        <option value="pending">
                                                            Pending
                                                        </option>

                                                        <option value="under_review">
                                                            Under Review
                                                        </option>

                                                        <option value="shortlisted">
                                                            Shortlisted
                                                        </option>

                                                        <option value="interview">
                                                            Interview
                                                        </option>

                                                        <option value="offer">
                                                            Offer
                                                        </option>

                                                        <option value="hired">
                                                            Hired
                                                        </option>

                                                        <option value="rejected">
                                                            Rejected
                                                        </option>
                                                    </select>
                                                </div>

                                                {updatingId ===
                                                    application.id && (
                                                    <div className="status-updating">
                                                        <span
                                                            className="spinner-border spinner-border-sm"
                                                            role="status"
                                                        ></span>

                                                        Updating...
                                                    </div>
                                                )}
                                            </div>
                                        </article>
                                    );
                                }
                            )}
                        </div>
                    )}
                </div>
            </div>

            {showInterviewModal && (
                <div
                    className="interview-modal-backdrop"
                    onMouseDown={(event) => {
                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            closeInterviewModal();
                        }
                    }}
                >
                    <div className="interview-modal">
                        <div className="interview-modal-header">
                            <div>
                                <span>
                                    <i className="bi bi-calendar-event-fill"></i>

                                    {editingInterview
                                        ? "Interview Management"
                                        : "Recruitment"}
                                </span>

                                <h2>
                                    {editingInterview
                                        ? "Reschedule Interview"
                                        : "Schedule Interview"}
                                </h2>

                                {selectedApplication && (
                                    <p>
                                        {
                                            selectedApplication
                                                .applicant
                                                ?.first_name
                                        }{" "}
                                        {
                                            selectedApplication
                                                .applicant
                                                ?.last_name
                                        }{" "}
                                        •{" "}
                                        {selectedApplication
                                            .job_details
                                            ?.title ||
                                            "Job Application"}
                                    </p>
                                )}
                            </div>

                            <button
                                type="button"
                                className="interview-modal-close"
                                onClick={
                                    closeInterviewModal
                                }
                                disabled={
                                    interviewLoading
                                }
                                aria-label="Close"
                            >
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>

                        <form
                            onSubmit={submitInterview}
                        >
                            <div className="interview-modal-body">
                                <div className="interview-form-group">
                                    <label>
                                        Interview Type
                                    </label>

                                    <div className="interview-type-options">
                                        <label
                                            className={`interview-type-option ${
                                                interviewForm.interview_type ===
                                                "online"
                                                    ? "selected"
                                                    : ""
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name="interview_type"
                                                value="online"
                                                checked={
                                                    interviewForm.interview_type ===
                                                    "online"
                                                }
                                                onChange={
                                                    handleInterviewInputChange
                                                }
                                            />

                                            <div className="interview-type-icon">
                                                <i className="bi bi-camera-video-fill"></i>
                                            </div>

                                            <div>
                                                <strong>
                                                    Online
                                                </strong>

                                                <span>
                                                    Video meeting
                                                </span>
                                            </div>

                                            <i className="bi bi-check-circle-fill interview-type-check"></i>
                                        </label>

                                        <label
                                            className={`interview-type-option ${
                                                interviewForm.interview_type ===
                                                "in_person"
                                                    ? "selected"
                                                    : ""
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name="interview_type"
                                                value="in_person"
                                                checked={
                                                    interviewForm.interview_type ===
                                                    "in_person"
                                                }
                                                onChange={
                                                    handleInterviewInputChange
                                                }
                                            />

                                            <div className="interview-type-icon">
                                                <i className="bi bi-geo-alt-fill"></i>
                                            </div>

                                            <div>
                                                <strong>
                                                    In Person
                                                </strong>

                                                <span>
                                                    Physical interview
                                                </span>
                                            </div>

                                            <i className="bi bi-check-circle-fill interview-type-check"></i>
                                        </label>
                                    </div>
                                </div>

                                <div className="interview-form-row">
                                    <div className="interview-form-group">
                                        <label htmlFor="scheduled_at">
                                            Date & Time
                                        </label>

                                        <div className="interview-input-wrapper">
                                            <i className="bi bi-calendar-event"></i>

                                            <input
                                                id="scheduled_at"
                                                type="datetime-local"
                                                name="scheduled_at"
                                                value={
                                                    interviewForm.scheduled_at
                                                }
                                                min={getLocalDateTimeMin()}
                                                onChange={
                                                    handleInterviewInputChange
                                                }
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                {interviewForm.interview_type ===
                                    "online" && (
                                    <div className="interview-form-group">
                                        <label htmlFor="meeting_link">
                                            Meeting Link
                                        </label>

                                        <div className="interview-input-wrapper">
                                            <i className="bi bi-link-45deg"></i>

                                            <input
                                                id="meeting_link"
                                                type="url"
                                                name="meeting_link"
                                                value={
                                                    interviewForm.meeting_link
                                                }
                                                onChange={
                                                    handleInterviewInputChange
                                                }
                                                placeholder="https://meet.google.com/..."
                                                required
                                            />
                                        </div>

                                        <small>
                                            Add the video meeting link the candidate will use.
                                        </small>
                                    </div>
                                )}

                                {interviewForm.interview_type ===
                                    "in_person" && (
                                    <div className="interview-form-group">
                                        <label htmlFor="location">
                                            Interview Location
                                        </label>

                                        <div className="interview-input-wrapper">
                                            <i className="bi bi-geo-alt-fill"></i>

                                            <input
                                                id="location"
                                                type="text"
                                                name="location"
                                                value={
                                                    interviewForm.location
                                                }
                                                onChange={
                                                    handleInterviewInputChange
                                                }
                                                placeholder="Office address or interview venue"
                                                required
                                            />
                                        </div>

                                        <small>
                                            Provide the physical location where the candidate should attend.
                                        </small>
                                    </div>
                                )}

                                <div className="interview-form-group">
                                    <label htmlFor="message">
                                        Message{" "}
                                        <span>
                                            Optional
                                        </span>
                                    </label>

                                    <textarea
                                        id="message"
                                        name="message"
                                        value={
                                            interviewForm.message
                                        }
                                        onChange={
                                            handleInterviewInputChange
                                        }
                                        placeholder="Add instructions, preparation details, or anything the candidate should know..."
                                        rows="4"
                                    ></textarea>
                                </div>
                            </div>

                            <div className="interview-modal-footer">
                                <button
                                    type="button"
                                    className="interview-modal-cancel"
                                    onClick={
                                        closeInterviewModal
                                    }
                                    disabled={
                                        interviewLoading
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="interview-modal-submit"
                                    disabled={
                                        interviewLoading
                                    }
                                >
                                    {interviewLoading ? (
                                        <>
                                            <span
                                                className="spinner-border spinner-border-sm"
                                                role="status"
                                            ></span>

                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <i
                                                className={
                                                    editingInterview
                                                        ? "bi bi-calendar2-event"
                                                        : "bi bi-calendar-plus"
                                                }
                                            ></i>

                                            {editingInterview
                                                ? "Reschedule Interview"
                                                : "Schedule Interview"}
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

export default EmployerApplications;