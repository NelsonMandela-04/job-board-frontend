import {
    useEffect,
    useState
} from "react";

import {
    Link
} from "react-router-dom";

import api from "../api/axios";
import { getUser } from "../utils/auth";
import "./EmployerDashboard.css";

function EmployerDashboard() {
    const user = getUser();

    const [companies, setCompanies] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionLoading, setActionLoading] = useState(null);
    const [actionMessage, setActionMessage] = useState("");

    const fetchEmployerData = async () => {
        try {
            const [
                companiesResponse,
                jobsResponse
            ] = await Promise.all([
                api.get("companies/"),
                api.get("jobs/my_jobs/")
            ]);

            const companyData =
                Array.isArray(
                    companiesResponse.data
                )
                    ? companiesResponse.data
                    : companiesResponse.data?.results || [];

            const jobData =
                Array.isArray(
                    jobsResponse.data
                )
                    ? jobsResponse.data
                    : jobsResponse.data?.results || [];

            setCompanies(companyData);
            setJobs(jobData);
        } catch (err) {
            console.error(
                "EMPLOYER DASHBOARD ERROR:",
                err
            );

            setError(
                err.response?.data?.detail ||
                "Unable to load employer data."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchEmployerData();
        } else {
            setLoading(false);
        }
    }, [user]);

    const handleCloseJob = async (jobId) => {
        setActionLoading(jobId);
        setActionMessage("");
        setError("");

        try {
            const response = await api.patch(
                `jobs/${jobId}/close/`
            );

            setActionMessage(
                response.data?.message ||
                "Job closed successfully."
            );

            await fetchEmployerData();
        } catch (err) {
            console.error(
                "CLOSE JOB ERROR:",
                err
            );

            setError(
                err.response?.data?.detail ||
                err.response?.data?.message ||
                "Unable to close this job."
            );
        } finally {
            setActionLoading(null);
        }
    };

    const handleReopenJob = async (jobId) => {
        setActionLoading(jobId);
        setActionMessage("");
        setError("");

        try {
            const response = await api.patch(
                `jobs/${jobId}/reopen/`
            );

            setActionMessage(
                response.data?.message ||
                "Job reopened successfully."
            );

            await fetchEmployerData();
        } catch (err) {
            console.error(
                "REOPEN JOB ERROR:",
                err
            );

            setError(
                err.response?.data?.detail ||
                err.response?.data?.message ||
                "Unable to reopen this job."
            );
        } finally {
            setActionLoading(null);
        }
    };

    if (!user) {
        return (
            <div className="employer-dashboard">
                <div className="employer-login-message">

                    <div className="employer-login-icon">
                        <i className="bi bi-shield-lock-fill"></i>
                    </div>

                    <h1>
                        Employer Dashboard
                    </h1>

                    <p>
                        Please log in first to access
                        your employer dashboard.
                    </p>

                    <Link to="/login">
                        <i className="bi bi-box-arrow-in-right"></i>
                        Login
                    </Link>

                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="employer-dashboard">
                <div className="employer-loading">

                    <div className="employer-loading-spinner"></div>

                    <h3>
                        Loading dashboard...
                    </h3>

                    <p>
                        Please wait while we load your
                        companies and jobs.
                    </p>

                </div>
            </div>
        );
    }

    if (
        error &&
        jobs.length === 0 &&
        companies.length === 0
    ) {
        return (
            <div className="employer-dashboard">
                <div className="employer-login-message">

                    <div className="employer-login-icon error-icon">
                        <i className="bi bi-exclamation-triangle-fill"></i>
                    </div>

                    <h1>
                        Unable to Load Dashboard
                    </h1>

                    <p>
                        {error}
                    </p>

                    <button
                        type="button"
                        className="retry-dashboard-button"
                        onClick={() => {
                            setLoading(true);
                            setError("");
                            fetchEmployerData();
                        }}
                    >
                        <i className="bi bi-arrow-clockwise"></i>
                        Try Again
                    </button>

                </div>
            </div>
        );
    }

    return (
        <div className="employer-dashboard">

            <div className="employer-dashboard-container">

                <header className="employer-dashboard-header">

                    <div className="employer-dashboard-title">

                        <div className="employer-dashboard-title-icon">
                            <i className="bi bi-building-gear"></i>
                        </div>

                        <div>
                            <h1>
                                Employer Dashboard
                            </h1>

                            <p>
                                Welcome to Ezitech Technologies,{" "}
                                <strong>
                                    {user.username}
                                </strong>
                            </p>
                        </div>

                    </div>

                    <div className="dashboard-action-buttons">

                        <Link
                            to="/company/create"
                            className="create-company-button"
                        >
                            <i className="bi bi-building-add"></i>
                            Create Company
                        </Link>

                        <Link
                            to="/job/create"
                            className="create-job-button"
                        >
                            <i className="bi bi-plus-circle-fill"></i>
                            Create Job
                        </Link>

                    </div>

                </header>

                {error && (
                    <div className="dashboard-alert dashboard-error">

                        <i className="bi bi-exclamation-triangle-fill"></i>

                        <span>
                            {error}
                        </span>

                    </div>
                )}

                {actionMessage && (
                    <div className="dashboard-alert dashboard-success">

                        <i className="bi bi-check-circle-fill"></i>

                        <span>
                            {actionMessage}
                        </span>

                    </div>
                )}

                <section className="dashboard-section">

                    <div className="dashboard-section-header">

                        <div className="dashboard-section-title">

                            <i className="bi bi-buildings-fill"></i>

                            <h2>
                                Your Companies
                            </h2>

                            <span className="dashboard-section-count">
                                {companies.length}
                            </span>

                        </div>

                    </div>

                    {companies.length === 0 ? (

                        <div className="dashboard-empty">

                            <div className="dashboard-empty-icon">
                                <i className="bi bi-building-add"></i>
                            </div>

                            <h3>
                                No company created yet
                            </h3>

                            <p>
                                Create your company profile
                                before posting your first job.
                            </p>

                            <Link to="/company/create">
                                <i className="bi bi-plus-circle"></i>
                                Create Company
                            </Link>

                        </div>

                    ) : (

                        <div className="dashboard-grid">

                            {companies.map((company) => (

                                <div
                                    className="company-card"
                                    key={company.id}
                                >

                                    <div className="company-card-top">

                                        <div className="company-icon">
                                            <i className="bi bi-building-fill"></i>
                                        </div>

                                        <div className="company-heading">
                                            <h3>
                                                {company.name}
                                            </h3>

                                            <span>
                                                Company Profile
                                            </span>
                                        </div>

                                    </div>

                                    <p className="company-description">
                                        {company.description ||
                                            "No company description provided."}
                                    </p>

                                    {company.location && (
                                        <p className="company-location">
                                            <i className="bi bi-geo-alt-fill"></i>

                                            {company.location}
                                        </p>
                                    )}

                                    {company.website && (
                                        <a
                                            href={company.website}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="company-website"
                                        >
                                            <i className="bi bi-globe2"></i>
                                            Visit Website
                                        </a>
                                    )}

                                </div>

                            ))}

                        </div>

                    )}

                </section>

                <section className="dashboard-section">

                    <div className="dashboard-section-header">

                        <div className="dashboard-section-title">

                            <i className="bi bi-briefcase-fill"></i>

                            <h2>
                                Your Jobs
                            </h2>

                            <span className="dashboard-section-count">
                                {jobs.length}
                            </span>

                        </div>

                    </div>

                    {jobs.length === 0 ? (

                        <div className="dashboard-empty">

                            <div className="dashboard-empty-icon">
                                <i className="bi bi-briefcase"></i>
                            </div>

                            <h3>
                                No jobs found
                            </h3>

                            <p>
                                Create a job listing to start
                                receiving applications.
                            </p>

                            <Link to="/job/create">
                                <i className="bi bi-plus-circle"></i>
                                Create Job
                            </Link>

                        </div>

                    ) : (

                        <div className="jobs-grid">

                            {jobs.map((job) => {

                                const isClosed =
                                    job.status === "closed";

                                const companyName =
                                    job.company_details?.name ||
                                    job.company?.name ||
                                    "Unknown Company";

                                return (
                                    <article
                                        className="job-card"
                                        key={job.id}
                                    >

                                        <div className="job-card-header">

                                            <div className="job-card-title">

                                                <div className="job-icon">
                                                    <i className="bi bi-briefcase-fill"></i>
                                                </div>

                                                <div className="job-title-content">

                                                    <h3>
                                                        {job.title}
                                                    </h3>

                                                    <p className="job-company">
                                                        <i className="bi bi-building"></i>

                                                        {companyName}
                                                    </p>

                                                </div>

                                            </div>

                                            <span
                                                className={`job-status-badge ${
                                                    isClosed
                                                        ? "job-status-closed"
                                                        : "job-status-open"
                                                }`}
                                            >
                                                <i
                                                    className={`bi ${
                                                        isClosed
                                                            ? "bi-x-circle-fill"
                                                            : "bi-check-circle-fill"
                                                    }`}
                                                ></i>

                                                {isClosed
                                                    ? "Closed"
                                                    : "Open"}
                                            </span>

                                        </div>

                                        <div className="job-card-details">

                                            <div className="job-detail">

                                                <span className="job-detail-label">
                                                    Approval
                                                </span>

                                                <span
                                                    className={`job-detail-value ${
                                                        job.is_approved
                                                            ? "approval-approved"
                                                            : "approval-pending"
                                                    }`}
                                                >
                                                    <i
                                                        className={`bi ${
                                                            job.is_approved
                                                                ? "bi-patch-check-fill"
                                                                : "bi-hourglass-split"
                                                        }`}
                                                    ></i>

                                                    {job.is_approved
                                                        ? "Approved"
                                                        : "Pending Review"}
                                                </span>

                                            </div>

                                            <div className="job-detail">

                                                <span className="job-detail-label">
                                                    Job Status
                                                </span>

                                                <span
                                                    className={`job-detail-value ${
                                                        isClosed
                                                            ? "job-closed-text"
                                                            : "job-open-text"
                                                    }`}
                                                >
                                                    <i
                                                        className={`bi ${
                                                            isClosed
                                                                ? "bi-lock-fill"
                                                                : "bi-unlock-fill"
                                                        }`}
                                                    ></i>

                                                    {isClosed
                                                        ? "Closed"
                                                        : "Open"}
                                                </span>

                                            </div>

                                        </div>

                                        <div className="job-card-actions">

                                            <Link
                                                to={`/jobs/${job.id}`}
                                                className="view-job-button"
                                            >
                                                <i className="bi bi-eye-fill"></i>
                                                View Job
                                            </Link>

                                            {isClosed ? (

                                                <button
                                                    type="button"
                                                    className="reopen-job-button"
                                                    onClick={() =>
                                                        handleReopenJob(
                                                            job.id
                                                        )
                                                    }
                                                    disabled={
                                                        actionLoading ===
                                                        job.id
                                                    }
                                                >
                                                    <i className="bi bi-arrow-clockwise"></i>

                                                    {actionLoading ===
                                                    job.id
                                                        ? "Reopening..."
                                                        : "Reopen Job"}
                                                </button>

                                            ) : (

                                                <button
                                                    type="button"
                                                    className="close-job-button"
                                                    onClick={() =>
                                                        handleCloseJob(
                                                            job.id
                                                        )
                                                    }
                                                    disabled={
                                                        actionLoading ===
                                                        job.id
                                                    }
                                                >
                                                    <i className="bi bi-x-circle"></i>

                                                    {actionLoading ===
                                                    job.id
                                                        ? "Closing..."
                                                        : "Close Job"}
                                                </button>

                                            )}

                                        </div>

                                    </article>
                                );
                            })}

                        </div>

                    )}

                </section>

                <div className="dashboard-footer-actions">

                    <Link to="/job/create">
                        <i className="bi bi-plus-circle-fill"></i>
                        Create New Job
                    </Link>

                    <Link to="/employer/applications">
                        <i className="bi bi-people-fill"></i>
                        View Applications
                    </Link>

                </div>

            </div>
        </div>
    );
}

export default EmployerDashboard;