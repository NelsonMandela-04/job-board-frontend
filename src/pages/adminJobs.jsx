import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import api from "../api/axios";

import "./adminJobs.css";

function AdminJobs() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [rejectingJobId, setRejectingJobId] =
        useState(null);

    const [rejectionReason, setRejectionReason] =
        useState("");

    const [actionLoading, setActionLoading] =
        useState(false);

    const [processingJobId, setProcessingJobId] =
        useState(null);

    const [successMessage, setSuccessMessage] =
        useState("");

    const fetchPendingJobs = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(
                "jobs/pending_jobs/"
            );

            const data = Array.isArray(response.data)
                ? response.data
                : response.data?.results || [];

            setJobs(data);
        } catch (err) {
            console.error(
                "FETCH PENDING JOBS ERROR:",
                err
            );

            setError(
                err.response?.data?.detail ||
                    "Unable to load pending jobs."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingJobs();
    }, []);

    const approveJob = async (jobId) => {
        try {
            setActionLoading(true);
            setProcessingJobId(jobId);
            setError("");
            setSuccessMessage("");

            await api.post(
                `jobs/${jobId}/approve/`
            );

            setJobs((currentJobs) =>
                currentJobs.filter(
                    (job) => job.id !== jobId
                )
            );

            setSuccessMessage(
                "Job approved successfully."
            );
        } catch (err) {
            console.error(
                "APPROVE JOB ERROR:",
                err
            );

            setError(
                err.response?.data?.detail ||
                    "Unable to approve job."
            );
        } finally {
            setActionLoading(false);
            setProcessingJobId(null);
        }
    };

    const openRejectForm = (jobId) => {
        setRejectingJobId(jobId);
        setRejectionReason("");
        setError("");
        setSuccessMessage("");
    };

    const cancelReject = () => {
        setRejectingJobId(null);
        setRejectionReason("");
        setError("");
    };

    const rejectJob = async (jobId) => {
        const reason =
            rejectionReason.trim();

        if (!reason) {
            setError(
                "Please enter a reason for rejecting this job."
            );
            return;
        }

        try {
            setActionLoading(true);
            setProcessingJobId(jobId);
            setError("");
            setSuccessMessage("");

            await api.post(
                `jobs/${jobId}/reject/`,
                {
                    reason: reason,
                }
            );

            setJobs((currentJobs) =>
                currentJobs.filter(
                    (job) => job.id !== jobId
                )
            );

            setRejectingJobId(null);
            setRejectionReason("");

            setSuccessMessage(
                "Job rejected successfully. The employer has been notified."
            );
        } catch (err) {
            console.error(
                "REJECT JOB ERROR:",
                err
            );

            console.error(
                "STATUS:",
                err.response?.status
            );

            console.error(
                "SERVER RESPONSE:",
                err.response?.data
            );

            setError(
                err.response?.data?.detail ||
                    "Unable to reject job."
            );
        } finally {
            setActionLoading(false);
            setProcessingJobId(null);
        }
    };

    const statistics = useMemo(() => {
        const total = jobs.length;

        const fullTime = jobs.filter(
            (job) =>
                job.job_type === "full_time"
        ).length;

        const partTime = jobs.filter(
            (job) =>
                job.job_type === "part_time"
        ).length;

        const contract = jobs.filter(
            (job) =>
                job.job_type === "contract"
        ).length;

        const internship = jobs.filter(
            (job) =>
                job.job_type === "internship"
        ).length;

        return {
            total,
            fullTime,
            partTime,
            contract,
            internship,
        };
    }, [jobs]);

    const getCompany = (job) => {
        return (
            job?.company_details ||
            job?.company ||
            {}
        );
    };

    const getCompanyName = (job) => {
        const company = getCompany(job);

        return (
            company?.name ||
            "Company not specified"
        );
    };

    const getCompanyLogo = (job) => {
        const company = getCompany(job);

        const logo = company?.logo;

        if (!logo) {
            return "";
        }

        if (
            logo.startsWith("http://") ||
            logo.startsWith("https://")
        ) {
            return logo;
        }

        return `http://127.0.0.1:8000${
            logo.startsWith("/") ? "" : "/"
        }${logo}`;
    };

    const getJobTypeLabel = (jobType) => {
        const types = {
            full_time: "Full Time",
            part_time: "Part Time",
            contract: "Contract",
            internship: "Internship",
        };

        return (
            types[jobType] ||
            jobType ||
            "Not specified"
        );
    };

    const getInitials = (name) => {
        if (!name) {
            return "CO";
        }

        const words = name
            .trim()
            .split(/\s+/);

        if (words.length >= 2) {
            return (
                words[0].charAt(0) +
                words[1].charAt(0)
            ).toUpperCase();
        }

        return name
            .substring(0, 2)
            .toUpperCase();
    };

    const formatDate = (date) => {
        if (!date) {
            return "—";
        }

        const parsedDate = new Date(date);

        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {
            return "—";
        }

        return parsedDate.toLocaleDateString(
            undefined,
            {
                year: "numeric",
                month: "short",
                day: "numeric",
            }
        );
    };

    if (loading) {
        return (
            <div className="admin-jobs-page">
                <div className="admin-jobs-loading">
                    <div className="admin-jobs-loading-spinner"></div>

                    <span className="admin-jobs-loading-label">
                        ADMINISTRATION
                    </span>

                    <h2>
                        Loading Pending Jobs
                    </h2>

                    <p>
                        Please wait while we
                        retrieve jobs waiting
                        for moderation.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-jobs-page">
            <div className="admin-jobs-overlay"></div>

            <div className="admin-jobs-container">
                <header className="admin-jobs-header">
                    <div className="admin-jobs-heading">
                        <span className="admin-jobs-label">
                            <i className="bi bi-shield-lock-fill"></i>
                            ADMINISTRATION
                        </span>

                        <h1>
                            Job Moderation
                        </h1>

                        <p>
                            Review submitted jobs,
                            approve suitable
                            listings, or reject
                            jobs that do not meet
                            platform requirements.
                        </p>
                    </div>

                    <div className="admin-jobs-header-actions">
                        <button
                            type="button"
                            className="admin-jobs-refresh-button"
                            onClick={
                                fetchPendingJobs
                            }
                        >
                            <i className="bi bi-arrow-clockwise"></i>
                            Refresh
                        </button>

                        <Link
                            to="/admin-dashboard"
                            className="admin-jobs-dashboard-button"
                        >
                            <i className="bi bi-grid-1x2-fill"></i>
                            Admin Dashboard
                        </Link>
                    </div>
                </header>

                <section className="admin-jobs-overview">
                    <div className="admin-jobs-overview-icon">
                        <i className="bi bi-hourglass-split"></i>
                    </div>

                    <div>
                        <span>
                            MODERATION QUEUE
                        </span>

                        <h2>
                            Pending Jobs
                        </h2>

                        <p>
                            These job listings are
                            waiting for administrator
                            review.
                        </p>
                    </div>

                    <div className="admin-jobs-queue-count">
                        <strong>
                            {statistics.total}
                        </strong>

                        <span>
                            {statistics.total === 1
                                ? "Job"
                                : "Jobs"}{" "}
                            Pending
                        </span>
                    </div>
                </section>

                {error && (
                    <div className="admin-jobs-alert error">
                        <div className="admin-jobs-alert-icon">
                            <i className="bi bi-exclamation-triangle-fill"></i>
                        </div>

                        <div>
                            <strong>
                                Action Required
                            </strong>

                            <p>{error}</p>
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                setError("")
                            }
                            aria-label="Close error"
                        >
                            <i className="bi bi-x-lg"></i>
                        </button>
                    </div>
                )}

                {successMessage && (
                    <div className="admin-jobs-alert success">
                        <div className="admin-jobs-alert-icon">
                            <i className="bi bi-check-circle-fill"></i>
                        </div>

                        <div>
                            <strong>
                                Success
                            </strong>

                            <p>
                                {successMessage}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                setSuccessMessage(
                                    ""
                                )
                            }
                            aria-label="Close success message"
                        >
                            <i className="bi bi-x-lg"></i>
                        </button>
                    </div>
                )}

                <section className="admin-jobs-statistics">
                    <div className="admin-jobs-stat-card">
                        <div className="admin-jobs-stat-top">
                            <span>
                                Pending Jobs
                            </span>

                            <div className="admin-jobs-stat-icon pending">
                                <i className="bi bi-hourglass-split"></i>
                            </div>
                        </div>

                        <strong>
                            {statistics.total}
                        </strong>

                        <small>
                            Awaiting moderation
                        </small>
                    </div>

                    <div className="admin-jobs-stat-card">
                        <div className="admin-jobs-stat-top">
                            <span>
                                Full Time
                            </span>

                            <div className="admin-jobs-stat-icon full-time">
                                <i className="bi bi-briefcase-fill"></i>
                            </div>
                        </div>

                        <strong>
                            {statistics.fullTime}
                        </strong>

                        <small>
                            Full-time positions
                        </small>
                    </div>

                    <div className="admin-jobs-stat-card">
                        <div className="admin-jobs-stat-top">
                            <span>
                                Part Time
                            </span>

                            <div className="admin-jobs-stat-icon part-time">
                                <i className="bi bi-clock-fill"></i>
                            </div>
                        </div>

                        <strong>
                            {statistics.partTime}
                        </strong>

                        <small>
                            Part-time positions
                        </small>
                    </div>

                    <div className="admin-jobs-stat-card">
                        <div className="admin-jobs-stat-top">
                            <span>
                                Other Types
                            </span>

                            <div className="admin-jobs-stat-icon other">
                                <i className="bi bi-layers-fill"></i>
                            </div>
                        </div>

                        <strong>
                            {statistics.contract +
                                statistics.internship}
                        </strong>

                        <small>
                            Contract & internship
                        </small>
                    </div>
                </section>

                <section className="admin-jobs-card">
                    <div className="admin-jobs-card-header">
                        <div className="admin-jobs-card-title">
                            <div className="admin-jobs-card-title-icon">
                                <i className="bi bi-briefcase-fill"></i>
                            </div>

                            <div>
                                <h2>
                                    Jobs Awaiting Review
                                </h2>

                                <p>
                                    {jobs.length}{" "}
                                    {jobs.length === 1
                                        ? "job"
                                        : "jobs"}{" "}
                                    currently in the
                                    moderation queue
                                </p>
                            </div>
                        </div>

                        <span className="admin-jobs-pending-badge">
                            <span></span>
                            Pending Review
                        </span>
                    </div>

                    {jobs.length === 0 ? (
                        <div className="admin-jobs-empty">
                            <div className="admin-jobs-empty-icon">
                                <i className="bi bi-check2-circle"></i>
                            </div>

                            <h3>
                                Moderation Queue Is Clear
                            </h3>

                            <p>
                                There are currently no
                                jobs waiting for
                                administrator review.
                            </p>

                            <Link
                                to="/admin-dashboard"
                                className="admin-jobs-empty-button"
                            >
                                <i className="bi bi-arrow-left"></i>
                                Back to Dashboard
                            </Link>
                        </div>
                    ) : (
                        <div className="admin-jobs-list">
                            {jobs.map((job) => {
                                const company =
                                    getCompany(job);

                                const companyName =
                                    getCompanyName(
                                        job
                                    );

                                const companyLogo =
                                    getCompanyLogo(
                                        job
                                    );

                                const isRejecting =
                                    rejectingJobId ===
                                    job.id;

                                const isProcessing =
                                    processingJobId ===
                                    job.id;

                                return (
                                    <article
                                        className="admin-job-item"
                                        key={job.id}
                                    >
                                        <div className="admin-job-top">
                                            <div className="admin-job-company">
                                                {companyLogo ? (
                                                    <img
                                                        src={
                                                            companyLogo
                                                        }
                                                        alt={`${companyName} logo`}
                                                        className="admin-job-company-logo"
                                                        onError={(
                                                            event
                                                        ) => {
                                                            event.currentTarget.style.display =
                                                                "none";

                                                            if (
                                                                event
                                                                    .currentTarget
                                                                    .nextElementSibling
                                                            ) {
                                                                event.currentTarget.nextElementSibling.style.display =
                                                                    "flex";
                                                            }
                                                        }}
                                                    />
                                                ) : null}

                                                <div
                                                    className="admin-job-company-placeholder"
                                                    style={{
                                                        display:
                                                            companyLogo
                                                                ? "none"
                                                                : "flex",
                                                    }}
                                                >
                                                    {getInitials(
                                                        companyName
                                                    )}
                                                </div>

                                                <div className="admin-job-company-info">
                                                    <span>
                                                        COMPANY
                                                    </span>

                                                    <strong>
                                                        {companyName}
                                                    </strong>

                                                    {company?.location && (
                                                        <small>
                                                            <i className="bi bi-geo-alt-fill"></i>
                                                            {
                                                                company.location
                                                            }
                                                        </small>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="admin-job-status">
                                                <span className="admin-job-status-dot"></span>
                                                {job.moderation_status ||
                                                    "Pending"}
                                            </div>
                                        </div>

                                        <div className="admin-job-content">
                                            <div className="admin-job-main">
                                                <span className="admin-job-number">
                                                    JOB #
                                                    {job.id}
                                                </span>

                                                <h3>
                                                    {job.title}
                                                </h3>

                                                <div className="admin-job-meta">
                                                    <span>
                                                        <i className="bi bi-geo-alt-fill"></i>
                                                        {job.location ||
                                                            "Location not specified"}
                                                    </span>

                                                    <span>
                                                        <i className="bi bi-briefcase-fill"></i>
                                                        {getJobTypeLabel(
                                                            job.job_type
                                                        )}
                                                    </span>

                                                    {job.salary && (
                                                        <span>
                                                            <i className="bi bi-cash-stack"></i>
                                                            {
                                                                job.salary
                                                            }
                                                        </span>
                                                    )}

                                                    <span>
                                                        <i className="bi bi-calendar3"></i>
                                                        {formatDate(
                                                            job.created_at
                                                        )}
                                                    </span>
                                                </div>

                                                <div className="admin-job-description">
                                                    <span>
                                                        DESCRIPTION
                                                    </span>

                                                    <p>
                                                        {
                                                            job.description
                                                        }
                                                    </p>
                                                </div>

                                                {job.requirements && (
                                                    <div className="admin-job-requirements">
                                                        <span>
                                                            REQUIREMENTS
                                                        </span>

                                                        <p>
                                                            {
                                                                job.requirements
                                                            }
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            <aside className="admin-job-actions">
                                                <div className="admin-job-actions-header">
                                                    <div className="admin-job-actions-icon">
                                                        <i className="bi bi-shield-check"></i>
                                                    </div>

                                                    <div>
                                                        <span>
                                                            ADMIN ACTION
                                                        </span>

                                                        <h4>
                                                            Moderation
                                                        </h4>
                                                    </div>
                                                </div>

                                                <div className="admin-job-actions-divider"></div>

                                                {isRejecting ? (
                                                    <div className="admin-job-reject-form">
                                                        <div className="admin-job-reject-heading">
                                                            <i className="bi bi-exclamation-circle-fill"></i>

                                                            <span>
                                                                Reject this
                                                                job
                                                            </span>
                                                        </div>

                                                        <label
                                                            htmlFor={`rejection-reason-${job.id}`}
                                                        >
                                                            Reason for
                                                            rejection
                                                        </label>

                                                        <textarea
                                                            id={`rejection-reason-${job.id}`}
                                                            value={
                                                                rejectionReason
                                                            }
                                                            onChange={(
                                                                event
                                                            ) =>
                                                                setRejectionReason(
                                                                    event
                                                                        .target
                                                                        .value
                                                                )
                                                            }
                                                            placeholder="Enter the reason why this job is being rejected..."
                                                            rows="6"
                                                            disabled={
                                                                actionLoading
                                                            }
                                                        />

                                                        <div className="admin-job-reject-actions">
                                                            <button
                                                                type="button"
                                                                className="admin-job-confirm-reject"
                                                                onClick={() =>
                                                                    rejectJob(
                                                                        job.id
                                                                    )
                                                                }
                                                                disabled={
                                                                    actionLoading
                                                                }
                                                            >
                                                                {isProcessing ? (
                                                                    <>
                                                                        <span className="admin-job-button-spinner"></span>
                                                                        Rejecting...
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <i className="bi bi-x-circle-fill"></i>
                                                                        Confirm Rejection
                                                                    </>
                                                                )}
                                                            </button>

                                                            <button
                                                                type="button"
                                                                className="admin-job-cancel-reject"
                                                                onClick={
                                                                    cancelReject
                                                                }
                                                                disabled={
                                                                    actionLoading
                                                                }
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="admin-job-action-buttons">
                                                        <button
                                                            type="button"
                                                            className="admin-job-approve-button"
                                                            onClick={() =>
                                                                approveJob(
                                                                    job.id
                                                                )
                                                            }
                                                            disabled={
                                                                actionLoading
                                                            }
                                                        >
                                                            {isProcessing ? (
                                                                <>
                                                                    <span className="admin-job-button-spinner"></span>
                                                                    Processing...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <i className="bi bi-check-circle-fill"></i>
                                                                    Approve Job
                                                                </>
                                                            )}
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="admin-job-reject-button"
                                                            onClick={() =>
                                                                openRejectForm(
                                                                    job.id
                                                                )
                                                            }
                                                            disabled={
                                                                actionLoading
                                                            }
                                                        >
                                                            <i className="bi bi-x-circle-fill"></i>
                                                            Reject Job
                                                        </button>
                                                    </div>
                                                )}

                                                {!isRejecting && (
                                                    <div className="admin-job-action-note">
                                                        <i className="bi bi-info-circle-fill"></i>

                                                        <span>
                                                            Approving a job
                                                            will make it
                                                            available to
                                                            job seekers.
                                                        </span>
                                                    </div>
                                                )}
                                            </aside>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </section>

                <footer className="admin-jobs-footer">
                    <div>
                        <i className="bi bi-shield-check"></i>
                        Administrator Control Panel
                    </div>

                    <div>
                        <i className="bi bi-briefcase-fill"></i>
                        {jobs.length} jobs awaiting review
                    </div>

                    <div>
                        <i className="bi bi-lock-fill"></i>
                        Secure Job Moderation
                    </div>
                </footer>
            </div>
        </div>
    );
}

export default AdminJobs;