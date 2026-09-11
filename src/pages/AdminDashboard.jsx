import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import api from "../api/axios";
import { getUser } from "../utils/auth";

import "./AdminDashboard.css";

function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchStats = async () => {
        try {
            setLoading(true);
            setError("");

            const user = getUser();

            if (!user) {
                setError(
                    "Please log in to access the admin dashboard."
                );
                return;
            }

            const response = await api.get(
                "admin/dashboard/"
            );

            setStats(response.data);
        } catch (err) {
            console.error(
                "Admin dashboard error:",
                err
            );

            if (err.response?.status === 401) {
                setError(
                    "Your session has expired. Please log in again."
                );
            } else if (err.response?.status === 403) {
                setError(
                    "You do not have permission to access the admin dashboard."
                );
            } else {
                setError(
                    err.response?.data?.detail ||
                    "Unable to load admin dashboard."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const statistics = [
        {
            title: "Total Users",
            value: stats?.total_users ?? 0,
            description: "Registered users",
            icon: "bi-people-fill",
            className: "users",
        },
        {
            title: "Companies",
            value: stats?.total_companies ?? 0,
            description: "Registered companies",
            icon: "bi-building-fill",
            className: "companies",
        },
        {
            title: "Jobs",
            value: stats?.total_jobs ?? 0,
            description: "Jobs posted",
            icon: "bi-briefcase-fill",
            className: "jobs",
        },
        {
            title: "Applications",
            value: stats?.total_applications ?? 0,
            description: "Applications received",
            icon: "bi-file-earmark-text-fill",
            className: "applications",
        },
        {
            title: "Pending Jobs",
            value: stats?.pending_jobs ?? 0,
            description: "Waiting for moderation",
            icon: "bi-hourglass-split",
            className: "pending",
        },
        {
            title: "Approved Jobs",
            value: stats?.approved_jobs ?? 0,
            description: "Published jobs",
            icon: "bi-check-circle-fill",
            className: "approved",
        },
    ];

    const managementItems = [
        {
            title: "Job Moderation",
            description:
                "Review submitted jobs and approve or reject listings before they appear publicly.",
            link: "/admin/jobs",
            linkText: "Manage jobs",
            icon: "bi-briefcase-fill",
        },
        {
            title: "User Management",
            description:
                "View registered users and manage their account status and platform access.",
            link: "/admin/users",
            linkText: "Manage users",
            icon: "bi-people-fill",
        },
        {
            title: "Company Management",
            description:
                "View companies registered on the platform and manage their account status.",
            link: "/admin/companies",
            linkText: "Manage companies",
            icon: "bi-building-fill",
        },
        {
            title: "Application Management",
            description:
                "Monitor applications submitted by candidates across the Job Board platform.",
            link: "/admin/applications",
            linkText: "Manage applications",
            icon: "bi-file-earmark-text-fill",
        },
    ];

    if (loading) {
        return (
            <div className="admin-dashboard-page">
                <div className="admin-dashboard-loading">
                    <div className="admin-dashboard-loading-spinner"></div>

                    <h2>Loading Dashboard</h2>

                    <p>
                        Please wait while we retrieve the
                        administration statistics.
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-dashboard-page">
                <div className="admin-dashboard-error-card">
                    <div className="admin-dashboard-error-icon">
                        <i className="bi bi-shield-exclamation"></i>
                    </div>

                    <span className="admin-dashboard-error-label">
                        ADMINISTRATION
                    </span>

                    <h2>Unable to Access Dashboard</h2>

                    <p>{error}</p>

                    <div className="admin-dashboard-error-actions">
                        <button
                            type="button"
                            className="admin-dashboard-retry-button"
                            onClick={fetchStats}
                        >
                            <i className="bi bi-arrow-clockwise"></i>
                            Try Again
                        </button>

                        <Link
                            to="/login"
                            className="admin-dashboard-login-button"
                        >
                            <i className="bi bi-box-arrow-in-right"></i>
                            Login
                        </Link>
                    </div>

                    <Link
                        to="/"
                        className="admin-dashboard-back-link"
                    >
                        <i className="bi bi-arrow-left"></i>
                        Back to Website
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-dashboard-page">
            <div className="admin-dashboard-overlay"></div>

            <div className="admin-dashboard-container">
                <header className="admin-dashboard-header">
                    <div className="admin-dashboard-heading">
                        <span className="admin-dashboard-label">
                            <i className="bi bi-shield-lock-fill"></i>
                            ADMINISTRATION
                        </span>

                        <h1>Admin Dashboard</h1>

                        <p>
                            Manage your Job Board platform,
                            monitor activity, and control
                            platform operations from one place.
                        </p>
                    </div>

                    <div className="admin-dashboard-header-actions">
                        <button
                            type="button"
                            className="admin-dashboard-refresh-button"
                            onClick={fetchStats}
                        >
                            <i className="bi bi-arrow-clockwise"></i>
                            Refresh
                        </button>

                        <Link
                            to="/"
                            className="admin-dashboard-website-button"
                        >
                            <i className="bi bi-globe2"></i>
                            View Website
                        </Link>
                    </div>
                </header>

                <section className="admin-dashboard-welcome">
                    <div className="admin-dashboard-welcome-icon">
                        <i className="bi bi-speedometer2"></i>
                    </div>

                    <div>
                        <span>PLATFORM OVERVIEW</span>
                        <h2>Dashboard Overview</h2>
                        <p>
                            A real-time overview of your Job
                            Board platform.
                        </p>
                    </div>

                    <div className="admin-dashboard-security">
                        <i className="bi bi-shield-check"></i>
                        <span>Admin Access</span>
                    </div>
                </section>

                <section className="admin-dashboard-statistics">
                    {statistics.map((stat) => (
                        <div
                            className="admin-dashboard-stat-card"
                            key={stat.title}
                        >
                            <div className="admin-dashboard-stat-top">
                                <span className="admin-dashboard-stat-title">
                                    {stat.title}
                                </span>

                                <div
                                    className={`admin-dashboard-stat-icon ${stat.className}`}
                                >
                                    <i
                                        className={`bi ${stat.icon}`}
                                    ></i>
                                </div>
                            </div>

                            <strong>
                                {stat.value}
                            </strong>

                            <span className="admin-dashboard-stat-description">
                                {stat.description}
                            </span>
                        </div>
                    ))}
                </section>

                <section className="admin-dashboard-management">
                    <div className="admin-dashboard-section-heading">
                        <div>
                            <span className="admin-dashboard-section-label">
                                <i className="bi bi-grid-fill"></i>
                                PLATFORM MANAGEMENT
                            </span>

                            <h2>Management</h2>

                            <p>
                                Choose an area below to manage
                                your Job Board platform.
                            </p>
                        </div>

                        <div className="admin-dashboard-section-count">
                            <strong>04</strong>
                            <span>Management Areas</span>
                        </div>
                    </div>

                    <div className="admin-dashboard-actions">
                        {managementItems.map((item, index) => (
                            <Link
                                to={item.link}
                                className="admin-dashboard-action-card"
                                key={item.title}
                            >
                                <div className="admin-dashboard-action-number">
                                    0{index + 1}
                                </div>

                                <div className="admin-dashboard-action-icon">
                                    <i
                                        className={`bi ${item.icon}`}
                                    ></i>
                                </div>

                                <div className="admin-dashboard-action-content">
                                    <h3>{item.title}</h3>

                                    <p>
                                        {item.description}
                                    </p>

                                    <span className="admin-dashboard-action-link">
                                        {item.linkText}

                                        <i className="bi bi-arrow-right"></i>
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                <section className="admin-dashboard-summary">
                    <div className="admin-dashboard-summary-card">
                        <div className="admin-dashboard-summary-icon">
                            <i className="bi bi-activity"></i>
                        </div>

                        <div>
                            <span>Platform Activity</span>

                            <strong>
                                {(
                                    (stats?.total_jobs ?? 0) +
                                    (stats?.total_applications ?? 0)
                                )}
                            </strong>

                            <p>
                                Total jobs and applications
                                currently recorded.
                            </p>
                        </div>
                    </div>

                    <div className="admin-dashboard-summary-card">
                        <div className="admin-dashboard-summary-icon">
                            <i className="bi bi-clock-history"></i>
                        </div>

                        <div>
                            <span>Moderation Queue</span>

                            <strong>
                                {stats?.pending_jobs ?? 0}
                            </strong>

                            <p>
                                Jobs currently waiting for
                                administrator review.
                            </p>
                        </div>
                    </div>

                    <div className="admin-dashboard-summary-card">
                        <div className="admin-dashboard-summary-icon">
                            <i className="bi bi-check2-circle"></i>
                        </div>

                        <div>
                            <span>Published Jobs</span>

                            <strong>
                                {stats?.approved_jobs ?? 0}
                            </strong>

                            <p>
                                Approved jobs currently
                                published on the platform.
                            </p>
                        </div>
                    </div>
                </section>

                <footer className="admin-dashboard-footer">
                    <div className="admin-dashboard-footer-brand">
                        <div className="admin-dashboard-footer-logo">
                            <i className="bi bi-briefcase-fill"></i>
                        </div>

                        <div>
                            <strong>
                                Ezitech Job Board
                            </strong>

                            <span>
                                Administration Panel
                            </span>
                        </div>
                    </div>

                    <div className="admin-dashboard-footer-status">
                        <span>
                            <span className="admin-dashboard-status-dot"></span>
                            System Active
                        </span>

                        <span>
                            <i className="bi bi-shield-check"></i>
                            Secure Administration
                        </span>
                    </div>
                </footer>
            </div>
        </div>
    );
}

export default AdminDashboard;