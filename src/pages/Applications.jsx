import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import api from "../api/axios";
import { getUser } from "../utils/auth";

import "./Applications.css";

function Applications() {
    const user = getUser();

    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                const response = await api.get("applications/");
                setApplications(response.data);
            } catch (err) {
                console.error(err);

                setError(
                    err.response?.data?.detail ||
                    "Unable to load your applications."
                );
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchApplications();
        } else {
            setLoading(false);
        }
    }, [user]);

    const getStatusClass = (status) => {
        const normalizedStatus = status?.toLowerCase();

        if (
            normalizedStatus === "accepted" ||
            normalizedStatus === "approved" ||
            normalizedStatus === "hired"
        ) {
            return "application-status accepted";
        }

        if (
            normalizedStatus === "rejected" ||
            normalizedStatus === "declined"
        ) {
            return "application-status rejected";
        }

        if (
            normalizedStatus === "reviewed" ||
            normalizedStatus === "shortlisted"
        ) {
            return "application-status reviewed";
        }

        return "application-status pending";
    };

    const getStatusIcon = (status) => {
        const normalizedStatus = status?.toLowerCase();

        if (
            normalizedStatus === "accepted" ||
            normalizedStatus === "approved" ||
            normalizedStatus === "hired"
        ) {
            return "bi-check-circle-fill";
        }

        if (
            normalizedStatus === "rejected" ||
            normalizedStatus === "declined"
        ) {
            return "bi-x-circle-fill";
        }

        if (
            normalizedStatus === "reviewed" ||
            normalizedStatus === "shortlisted"
        ) {
            return "bi-eye-fill";
        }

        return "bi-clock-fill";
    };

    const formatStatus = (status) => {
        if (!status) {
            return "Pending";
        }

        return (
            status.charAt(0).toUpperCase() +
            status.slice(1)
        );
    };

    if (!user) {
        return (
            <main className="applications-page">
                <section className="applications-login">
                    <div className="applications-login-overlay"></div>

                    <div className="applications-login-card">
                        <div className="applications-login-icon">
                            <i className="bi bi-person-lock"></i>
                        </div>

                        <span className="applications-eyebrow">
                            EZITECH TECHNOLOGIES
                        </span>

                        <h1>
                            My Applications
                        </h1>

                        <p>
                            Please log in to view and track your
                            job applications at Ezitech Technologies.
                        </p>

                        <Link
                            to="/login"
                            className="btn btn-primary applications-login-button"
                        >
                            <i className="bi bi-box-arrow-in-right"></i>
                            Login
                        </Link>
                    </div>
                </section>
            </main>
        );
    }

    if (loading) {
        return (
            <main className="applications-page">
                <section className="applications-loading">
                    <div className="applications-loading-icon">
                        <i className="bi bi-hourglass-split"></i>
                    </div>

                    <h1>
                        Loading applications
                    </h1>

                    <p>
                        Please wait while we retrieve your applications.
                    </p>

                    <div
                        className="spinner-border text-primary"
                        role="status"
                    >
                        <span className="visually-hidden">
                            Loading...
                        </span>
                    </div>
                </section>
            </main>
        );
    }

    if (error) {
        return (
            <main className="applications-page">
                <section className="applications-error">
                    <div className="applications-error-card">
                        <div className="applications-error-icon">
                            <i className="bi bi-exclamation-triangle-fill"></i>
                        </div>

                        <h1>
                            Unable to load applications
                        </h1>

                        <p>
                            {error}
                        </p>

                        <Link
                            to="/dashboard"
                            className="btn btn-primary"
                        >
                            <i className="bi bi-arrow-left"></i>
                            Back to Dashboard
                        </Link>
                    </div>
                </section>
            </main>
        );
    }

    return (
        <main className="applications-page">

            <section className="applications-hero">
                <div className="applications-hero-overlay"></div>

                <div className="applications-hero-content">
                    <span className="applications-eyebrow">
                        EZITECH TECHNOLOGIES
                    </span>

                    <h1>
                        My Applications
                    </h1>

                    <p>
                        Track the jobs you have applied for and
                        stay updated on your application progress.
                    </p>

                    <div className="applications-hero-actions">
                        <Link
                            to="/jobs"
                            className="btn btn-primary applications-primary-button"
                        >
                            <i className="bi bi-search"></i>
                            Browse Jobs
                        </Link>

                        <Link
                            to="/dashboard"
                            className="btn btn-outline-light applications-outline-button"
                        >
                            <i className="bi bi-speedometer2"></i>
                            Dashboard
                        </Link>
                    </div>
                </div>
            </section>

            <div className="applications-container">

                <section className="applications-summary">

                    <div className="applications-summary-icon">
                        <i className="bi bi-file-earmark-check-fill"></i>
                    </div>

                    <div className="applications-summary-content">
                        <span>
                            Total Applications
                        </span>

                        <strong>
                            {applications.length}
                        </strong>
                    </div>

                    <div className="applications-summary-message">
                        <i className="bi bi-info-circle"></i>

                        <span>
                            Keep checking your applications for status updates.
                        </span>
                    </div>

                </section>

                {applications.length === 0 ? (
                    <section className="applications-empty">

                        <div className="applications-empty-icon">
                            <i className="bi bi-file-earmark-plus"></i>
                        </div>

                        <span className="applications-empty-label">
                            NO APPLICATIONS YET
                        </span>

                        <h2>
                            Start your job search
                        </h2>

                        <p>
                            You haven't applied for any jobs yet at
                            Ezitech Technologies. Explore available
                            opportunities and submit your first application.
                        </p>

                        <Link
                            to="/jobs"
                            className="btn btn-primary applications-empty-button"
                        >
                            <i className="bi bi-search"></i>
                            Browse Available Jobs
                        </Link>

                    </section>
                ) : (
                    <section className="applications-list-section">

                        <div className="applications-section-heading">
                            <div>
                                <span>
                                    APPLICATION HISTORY
                                </span>

                                <h2>
                                    Your Job Applications
                                </h2>
                            </div>

                            <div className="applications-count">
                                <i className="bi bi-files"></i>
                                {applications.length}{" "}
                                {applications.length === 1
                                    ? "Application"
                                    : "Applications"}
                            </div>
                        </div>

                        <div className="applications-list">

                            {applications.map((application) => {

                                const status =
                                    application.status ||
                                    "pending";

                                return (
                                    <article
                                        className="application-card"
                                        key={application.id}
                                    >

                                        <div className="application-card-top">

                                            <div className="application-company-icon">
                                                <i className="bi bi-building-fill"></i>
                                            </div>

                                            <div className="application-heading">
                                                <h2>
                                                    {application.job_details?.title ||
                                                        "Job Application"}
                                                </h2>

                                                <div className="application-company">
                                                    <i className="bi bi-building"></i>

                                                    <span>
                                                        {application.job_details?.company?.name ||
                                                            "Unknown company"}
                                                    </span>
                                                </div>
                                            </div>

                                            <div
                                                className={getStatusClass(
                                                    status
                                                )}
                                            >
                                                <i
                                                    className={`bi ${getStatusIcon(
                                                        status
                                                    )}`}
                                                ></i>

                                                <span>
                                                    {formatStatus(
                                                        status
                                                    )}
                                                </span>
                                            </div>

                                        </div>

                                        <div className="application-details">

                                            <div className="application-detail">
                                                <div className="application-detail-icon">
                                                    <i className="bi bi-geo-alt-fill"></i>
                                                </div>

                                                <div>
                                                    <span>
                                                        Location
                                                    </span>

                                                    <strong>
                                                        {application.job_details?.location ||
                                                            "Not specified"}
                                                    </strong>
                                                </div>
                                            </div>

                                            <div className="application-detail">
                                                <div className="application-detail-icon">
                                                    <i className="bi bi-calendar3"></i>
                                                </div>

                                                <div>
                                                    <span>
                                                        Applied
                                                    </span>

                                                    <strong>
                                                        {application.applied_at
                                                            ? new Date(
                                                                application.applied_at
                                                            ).toLocaleDateString(
                                                                undefined,
                                                                {
                                                                    year: "numeric",
                                                                    month: "short",
                                                                    day: "numeric"
                                                                }
                                                            )
                                                            : "Date unavailable"}
                                                    </strong>
                                                </div>
                                            </div>

                                            <div className="application-detail">
                                                <div className="application-detail-icon">
                                                    <i className="bi bi-briefcase-fill"></i>
                                                </div>

                                                <div>
                                                    <span>
                                                        Position
                                                    </span>

                                                    <strong>
                                                        {application.job_details?.title ||
                                                            "Not specified"}
                                                    </strong>
                                                </div>
                                            </div>

                                        </div>

                                        <div className="application-card-footer">

                                            <div className="application-footer-status">
                                                <i className="bi bi-shield-check"></i>

                                                <span>
                                                    Application submitted successfully
                                                </span>
                                            </div>

                                            {application.job_details?.id && (
                                                <Link
                                                    to={`/jobs/${application.job_details.id}`}
                                                    className="application-view-button"
                                                >
                                                    View Job

                                                    <i className="bi bi-arrow-right"></i>
                                                </Link>
                                            )}

                                        </div>

                                    </article>
                                );
                            })}

                        </div>

                    </section>
                )}

            </div>
        </main>
    );
}

export default Applications;