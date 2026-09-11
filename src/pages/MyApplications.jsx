import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { getUser } from "../utils/auth";
import "./MyApplications.css";

function MyApplications() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [sortOrder, setSortOrder] = useState("newest");
    const [expandedApplications, setExpandedApplications] = useState({});

    const user = getUser();

    useEffect(() => {
        let isMounted = true;

        const fetchApplications = async () => {
            try {
                setLoading(true);
                setError("");

                if (!user) {
                    if (isMounted) {
                        setLoading(false);
                    }

                    return;
                }

                const response = await api.get("applications/");

                if (!isMounted) {
                    return;
                }

                if (Array.isArray(response.data)) {
                    setApplications(response.data);
                } else if (Array.isArray(response.data?.results)) {
                    setApplications(response.data.results);
                } else {
                    setApplications([]);
                }
            } catch (err) {
                console.error("Failed to load applications:", err);

                if (!isMounted) {
                    return;
                }

                setError(
                    err.response?.data?.detail ||
                    err.response?.data?.error ||
                    "Unable to load your applications."
                );
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchApplications();

        return () => {
            isMounted = false;
        };
    }, []);

    const formatStatus = (status) => {
        if (!status) {
            return "Pending";
        }

        const normalizedStatus = String(status).toLowerCase();

        const statusLabels = {
            pending: "Pending",
            under_review: "Under Review",
            shortlisted: "Shortlisted",
            interview: "Interview",
            offer: "Offer",
            hired: "Hired",
            rejected: "Rejected",
            withdrawn: "Withdrawn",
            reviewed: "Reviewed",
            accepted: "Accepted",
            approved: "Approved",
            declined: "Declined",
        };

        return (
            statusLabels[normalizedStatus] ||
            normalizedStatus
                .replace(/_/g, " ")
                .replace(/\b\w/g, (letter) => letter.toUpperCase())
        );
    };

    const getStatusClass = (status) => {
        const normalizedStatus = String(
            status || "pending"
        ).toLowerCase();

        switch (normalizedStatus) {
            case "pending":
                return "status-pending";

            case "under_review":
            case "reviewed":
                return "status-reviewed";

            case "shortlisted":
                return "status-shortlisted";

            case "interview":
                return "status-interview";

            case "offer":
                return "status-offer";

            case "hired":
            case "accepted":
            case "approved":
                return "status-accepted";

            case "rejected":
            case "declined":
                return "status-rejected";

            case "withdrawn":
                return "status-withdrawn";

            default:
                return "status-pending";
        }
    };

    const getStatusIcon = (status) => {
        const normalizedStatus = String(
            status || "pending"
        ).toLowerCase();

        switch (normalizedStatus) {
            case "pending":
                return "bi-clock-fill";

            case "under_review":
                return "bi-search";

            case "reviewed":
                return "bi-eye-fill";

            case "shortlisted":
                return "bi-star-fill";

            case "interview":
                return "bi-calendar-event-fill";

            case "offer":
                return "bi-file-earmark-check-fill";

            case "hired":
                return "bi-check-circle-fill";

            case "accepted":
            case "approved":
                return "bi-check-circle-fill";

            case "rejected":
            case "declined":
                return "bi-x-circle-fill";

            case "withdrawn":
                return "bi-arrow-left-circle-fill";

            default:
                return "bi-clock-fill";
        }
    };

    const formatDate = (date) => {
        if (!date) {
            return "Date unavailable";
        }

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "Date unavailable";
        }

        return parsedDate.toLocaleDateString("en-NG", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const formatRelativeDate = (date) => {
        if (!date) {
            return "";
        }

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "";
        }

        const now = new Date();
        const difference = now.getTime() - parsedDate.getTime();

        const days = Math.floor(
            difference / (1000 * 60 * 60 * 24)
        );

        if (days <= 0) {
            return "Today";
        }

        if (days === 1) {
            return "Yesterday";
        }

        if (days < 7) {
            return `${days} days ago`;
        }

        if (days < 30) {
            const weeks = Math.floor(days / 7);

            return `${weeks} ${
                weeks === 1 ? "week" : "weeks"
            } ago`;
        }

        const months = Math.floor(days / 30);

        return `${months} ${
            months === 1 ? "month" : "months"
        } ago`;
    };

    const getJobType = (type) => {
        if (!type) {
            return "Not specified";
        }

        return type
            .replace(/_/g, " ")
            .replace(/\b\w/g, (letter) => letter.toUpperCase());
    };

    const getCompanyName = (job) => {
        if (!job) {
            return "Company";
        }

        if (typeof job.company === "string") {
            return job.company;
        }

        return (
            job.company?.name ||
            job.company_details?.name ||
            "Company"
        );
    };

    const getCompanyLogo = (job) => {
        if (!job) {
            return null;
        }

        if (typeof job.company === "object") {
            return job.company?.logo || null;
        }

        return job.company_details?.logo || null;
    };

    const toggleCoverLetter = (id) => {
        setExpandedApplications((previous) => ({
            ...previous,
            [id]: !previous[id],
        }));
    };

    const filteredApplications = useMemo(() => {
        let result = [...applications];

        const searchValue = search.trim().toLowerCase();

        if (searchValue) {
            result = result.filter((application) => {
                const job = application.job_details || {};

                const jobTitle = String(
                    job.title || ""
                ).toLowerCase();

                const companyName = getCompanyName(job).toLowerCase();

                const location = String(
                    job.location || ""
                ).toLowerCase();

                return (
                    jobTitle.includes(searchValue) ||
                    companyName.includes(searchValue) ||
                    location.includes(searchValue)
                );
            });
        }

        if (statusFilter !== "all") {
            result = result.filter(
                (application) =>
                    String(
                        application.status || "pending"
                    ).toLowerCase() === statusFilter
            );
        }

        result.sort((first, second) => {
            const firstDate = first.applied_at
                ? new Date(first.applied_at).getTime()
                : 0;

            const secondDate = second.applied_at
                ? new Date(second.applied_at).getTime()
                : 0;

            if (sortOrder === "oldest") {
                return firstDate - secondDate;
            }

            return secondDate - firstDate;
        });

        return result;
    }, [
        applications,
        search,
        statusFilter,
        sortOrder,
    ]);

    const statistics = useMemo(() => {
        const total = applications.length;

        const getCount = (statuses) =>
            applications.filter((application) =>
                statuses.includes(
                    String(
                        application.status || "pending"
                    ).toLowerCase()
                )
            ).length;

        return {
            total,
            pending: getCount(["pending"]),
            underReview: getCount([
                "under_review",
                "reviewed",
            ]),
            shortlisted: getCount([
                "shortlisted",
            ]),
            interview: getCount([
                "interview",
            ]),
            offer: getCount([
                "offer",
            ]),
            hired: getCount([
                "hired",
            ]),
            rejected: getCount([
                "rejected",
                "declined",
            ]),
            withdrawn: getCount([
                "withdrawn",
            ]),
        };
    }, [applications]);

    if (!user) {
        return (
            <div className="my-applications-page">
                <div className="applications-login-card">
                    <div className="applications-login-icon">
                        <i className="bi bi-lock-fill"></i>
                    </div>

                    <h1>Login Required</h1>

                    <p>
                        Please log in to view and manage your job
                        applications.
                    </p>

                    <Link
                        to="/login"
                        className="applications-primary-button"
                    >
                        <i className="bi bi-box-arrow-in-right"></i>
                        Login to Continue
                    </Link>

                    <Link
                        to="/jobs"
                        className="applications-secondary-link"
                    >
                        <i className="bi bi-search"></i>
                        Browse Jobs
                    </Link>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="my-applications-page">
                <div className="applications-page-header">
                    <div className="applications-page-header-inner">
                        <div className="applications-title-icon">
                            <i className="bi bi-file-earmark-person-fill"></i>
                        </div>

                        <h1>My Applications</h1>

                        <p>
                            Track and manage your job applications.
                        </p>
                    </div>
                </div>

                <div className="applications-loading-card">
                    <div className="applications-loading-spinner"></div>

                    <h2>Loading Applications</h2>

                    <p>
                        Please wait while we retrieve your applications.
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="my-applications-page">
                <div className="applications-page-header">
                    <div className="applications-page-header-inner">
                        <div className="applications-title-icon">
                            <i className="bi bi-file-earmark-person-fill"></i>
                        </div>

                        <h1>My Applications</h1>
                    </div>
                </div>

                <div className="applications-error-card">
                    <div className="applications-error-icon">
                        <i className="bi bi-exclamation-triangle-fill"></i>
                    </div>

                    <h2>Unable to Load Applications</h2>

                    <p>{error}</p>

                    <Link
                        to="/jobs"
                        className="applications-primary-button"
                    >
                        <i className="bi bi-search"></i>
                        Browse Jobs
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="my-applications-page">
            <div className="applications-page-header">
                <div className="applications-header-content">
                    <div>
                        <Link
                            to="/dashboard"
                            className="applications-back-link"
                        >
                            <i className="bi bi-arrow-left"></i>
                            Dashboard
                        </Link>

                        <div className="applications-title-row">
                            <div className="applications-title-icon">
                                <i className="bi bi-file-earmark-person-fill"></i>
                            </div>

                            <div>
                                <h1>My Applications</h1>

                                <p>
                                    Track your applications and stay
                                    updated on your job search.
                                </p>
                            </div>
                        </div>
                    </div>

                    <Link
                        to="/jobs"
                        className="applications-browse-button"
                    >
                        <i className="bi bi-search"></i>
                        Browse Jobs
                    </Link>
                </div>
            </div>

            <div className="applications-container">
                <div className="applications-statistics">
                    <div className="application-stat-card">
                        <div className="application-stat-icon total">
                            <i className="bi bi-files"></i>
                        </div>

                        <div>
                            <span>Total Applications</span>
                            <strong>{statistics.total}</strong>
                        </div>
                    </div>

                    <div className="application-stat-card">
                        <div className="application-stat-icon pending">
                            <i className="bi bi-clock-fill"></i>
                        </div>

                        <div>
                            <span>Pending</span>
                            <strong>{statistics.pending}</strong>
                        </div>
                    </div>

                    <div className="application-stat-card">
                        <div className="application-stat-icon reviewed">
                            <i className="bi bi-search"></i>
                        </div>

                        <div>
                            <span>Under Review</span>
                            <strong>{statistics.underReview}</strong>
                        </div>
                    </div>

                    <div className="application-stat-card">
                        <div className="application-stat-icon shortlisted">
                            <i className="bi bi-star-fill"></i>
                        </div>

                        <div>
                            <span>Shortlisted</span>
                            <strong>{statistics.shortlisted}</strong>
                        </div>
                    </div>

                    <div className="application-stat-card">
                        <div className="application-stat-icon interview">
                            <i className="bi bi-calendar-event-fill"></i>
                        </div>

                        <div>
                            <span>Interview</span>
                            <strong>{statistics.interview}</strong>
                        </div>
                    </div>

                    <div className="application-stat-card">
                        <div className="application-stat-icon offer">
                            <i className="bi bi-file-earmark-check-fill"></i>
                        </div>

                        <div>
                            <span>Offers</span>
                            <strong>{statistics.offer}</strong>
                        </div>
                    </div>

                    <div className="application-stat-card">
                        <div className="application-stat-icon accepted">
                            <i className="bi bi-check-circle-fill"></i>
                        </div>

                        <div>
                            <span>Hired</span>
                            <strong>{statistics.hired}</strong>
                        </div>
                    </div>

                    <div className="application-stat-card">
                        <div className="application-stat-icon rejected">
                            <i className="bi bi-x-circle-fill"></i>
                        </div>

                        <div>
                            <span>Rejected</span>
                            <strong>{statistics.rejected}</strong>
                        </div>
                    </div>

                    <div className="application-stat-card">
                        <div className="application-stat-icon withdrawn">
                            <i className="bi bi-arrow-left-circle-fill"></i>
                        </div>

                        <div>
                            <span>Withdrawn</span>
                            <strong>{statistics.withdrawn}</strong>
                        </div>
                    </div>
                </div>

                {applications.length > 0 && (
                    <div className="applications-toolbar">
                        <div className="applications-search">
                            <i className="bi bi-search"></i>

                            <input
                                type="text"
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Search by job, company or location..."
                            />

                            {search && (
                                <button
                                    type="button"
                                    onClick={() => setSearch("")}
                                    aria-label="Clear search"
                                >
                                    <i className="bi bi-x"></i>
                                </button>
                            )}
                        </div>

                        <div className="applications-filters">
                            <div className="application-filter">
                                <label htmlFor="status-filter">
                                    Status
                                </label>

                                <select
                                    id="status-filter"
                                    value={statusFilter}
                                    onChange={(event) =>
                                        setStatusFilter(
                                            event.target.value
                                        )
                                    }
                                >
                                    <option value="all">
                                        All Applications
                                    </option>

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

                                    <option value="withdrawn">
                                        Withdrawn
                                    </option>

                                    <option value="reviewed">
                                        Reviewed
                                    </option>

                                    <option value="accepted">
                                        Accepted
                                    </option>
                                </select>
                            </div>

                            <div className="application-filter">
                                <label htmlFor="sort-filter">
                                    Sort
                                </label>

                                <select
                                    id="sort-filter"
                                    value={sortOrder}
                                    onChange={(event) =>
                                        setSortOrder(
                                            event.target.value
                                        )
                                    }
                                >
                                    <option value="newest">
                                        Newest First
                                    </option>

                                    <option value="oldest">
                                        Oldest First
                                    </option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {applications.length === 0 ? (
                    <div className="applications-empty-card">
                        <div className="applications-empty-icon">
                            <i className="bi bi-file-earmark-text"></i>
                        </div>

                        <h2>No Applications Yet</h2>

                        <p>
                            You have not applied for any jobs yet. Find a
                            position that matches your skills and start
                            your application today.
                        </p>

                        <Link
                            to="/jobs"
                            className="applications-primary-button"
                        >
                            <i className="bi bi-search"></i>
                            Find Jobs
                        </Link>
                    </div>
                ) : filteredApplications.length === 0 ? (
                    <div className="applications-empty-card filtered-empty">
                        <div className="applications-empty-icon">
                            <i className="bi bi-search"></i>
                        </div>

                        <h2>No Matching Applications</h2>

                        <p>
                            We could not find any applications matching
                            your current search and filters.
                        </p>

                        <button
                            type="button"
                            className="applications-primary-button"
                            onClick={() => {
                                setSearch("");
                                setStatusFilter("all");
                            }}
                        >
                            <i className="bi bi-arrow-counterclockwise"></i>
                            Clear Filters
                        </button>
                    </div>
                ) : (
                    <div className="applications-list">
                        <div className="applications-results-header">
                            <span>
                                Showing{" "}
                                <strong>
                                    {filteredApplications.length}
                                </strong>{" "}
                                of{" "}
                                <strong>
                                    {applications.length}
                                </strong>{" "}
                                applications
                            </span>
                        </div>

                        {filteredApplications.map((application) => {
                            const job =
                                application.job_details ||
                                application.job ||
                                {};

                            const companyName = getCompanyName(job);
                            const companyLogo = getCompanyLogo(job);
                            const jobId =
                                job.id || application.job;

                            const companyInitial =
                                companyName
                                    .charAt(0)
                                    .toUpperCase();

                            const statusClass =
                                getStatusClass(
                                    application.status
                                );

                            const statusIcon =
                                getStatusIcon(
                                    application.status
                                );

                            const coverLetter =
                                application.cover_letter || "";

                            const isExpanded = Boolean(
                                expandedApplications[
                                    application.id
                                ]
                            );

                            const preview =
                                coverLetter.length > 280
                                    ? `${coverLetter.slice(
                                          0,
                                          280
                                      )}...`
                                    : coverLetter;

                            return (
                                <article
                                    className="application-card"
                                    key={application.id}
                                >
                                    <div className="application-card-top">
                                        <div className="application-company-logo">
                                            {companyLogo ? (
                                                <img
                                                    src={companyLogo}
                                                    alt={`${companyName} logo`}
                                                />
                                            ) : (
                                                companyInitial
                                            )}
                                        </div>

                                        <div className="application-job-info">
                                            <div className="application-job-title-row">
                                                <div>
                                                    <h2>
                                                        {job.title ||
                                                            "Job"}
                                                    </h2>

                                                    <p>
                                                        {companyName}
                                                    </p>
                                                </div>

                                                <span
                                                    className={`application-status ${statusClass}`}
                                                >
                                                    <i
                                                        className={`bi ${statusIcon}`}
                                                    ></i>

                                                    {formatStatus(
                                                        application.status
                                                    )}
                                                </span>
                                            </div>

                                            <div className="application-meta">
                                                {job.location && (
                                                    <span>
                                                        <i className="bi bi-geo-alt-fill"></i>
                                                        {job.location}
                                                    </span>
                                                )}

                                                {job.job_type && (
                                                    <span>
                                                        <i className="bi bi-briefcase-fill"></i>
                                                        {getJobType(
                                                            job.job_type
                                                        )}
                                                    </span>
                                                )}

                                                {job.salary && (
                                                    <span>
                                                        <i className="bi bi-cash-stack"></i>
                                                        {job.salary}
                                                    </span>
                                                )}

                                                {application.applied_at && (
                                                    <span>
                                                        <i className="bi bi-calendar3"></i>
                                                        Applied{" "}
                                                        {formatRelativeDate(
                                                            application.applied_at
                                                        )}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="application-card-divider"></div>

                                    <div className="application-date-row">
                                        <div className="application-date-info">
                                            <i className="bi bi-calendar-check"></i>

                                            <div>
                                                <span>
                                                    Application Date
                                                </span>

                                                <strong>
                                                    {formatDate(
                                                        application.applied_at
                                                    )}
                                                </strong>
                                            </div>
                                        </div>

                                        <span
                                            className={`application-status application-status-mobile ${statusClass}`}
                                        >
                                            <i
                                                className={`bi ${statusIcon}`}
                                            ></i>

                                            {formatStatus(
                                                application.status
                                            )}
                                        </span>
                                    </div>

                                    {coverLetter && (
                                        <div className="application-cover-letter">
                                            <div className="cover-letter-heading">
                                                <h3>
                                                    <i className="bi bi-envelope-paper"></i>
                                                    Cover Letter
                                                </h3>

                                                {coverLetter.length >
                                                    280 && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            toggleCoverLetter(
                                                                application.id
                                                            )
                                                        }
                                                    >
                                                        {isExpanded
                                                            ? "Show Less"
                                                            : "Read More"}

                                                        <i
                                                            className={`bi ${
                                                                isExpanded
                                                                    ? "bi-chevron-up"
                                                                    : "bi-chevron-down"
                                                            }`}
                                                        ></i>
                                                    </button>
                                                )}
                                            </div>

                                            <p>
                                                {isExpanded
                                                    ? coverLetter
                                                    : preview}
                                            </p>
                                        </div>
                                    )}

                                    {application.rejection_reason && (
                                        <div className="application-rejection">
                                            <div className="application-rejection-icon">
                                                <i className="bi bi-info-circle-fill"></i>
                                            </div>

                                            <div>
                                                <strong>
                                                    Employer Feedback
                                                </strong>

                                                <p>
                                                    {
                                                        application.rejection_reason
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="application-card-actions">
                                        {jobId && (
                                            <Link
                                                to={`/jobs/${jobId}`}
                                                className="application-view-job"
                                            >
                                                <i className="bi bi-eye"></i>
                                                View Job
                                            </Link>
                                        )}

                                        {application.resume_file && (
                                            <a
                                                href={
                                                    application.resume_file
                                                }
                                                target="_blank"
                                                rel="noreferrer"
                                                className="application-resume-link"
                                            >
                                                <i className="bi bi-file-earmark-pdf"></i>
                                                View Resume
                                            </a>
                                        )}
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default MyApplications;