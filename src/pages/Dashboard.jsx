import { Link, useNavigate } from "react-router-dom";

import { getUser, logout } from "../utils/auth";

import "./Dashboard.css";

function Dashboard() {
    const navigate = useNavigate();
    const user = getUser();

    if (!user) {
        return (
            <div className="dashboard-login">
                <div className="dashboard-login-card">
                    <h1>You are not logged in</h1>

                    <p>
                        Please log in to access your Ezitech Technologies dashboard.
                    </p>

                    <Link
                        to="/login"
                        className="btn btn-primary dashboard-login-link"
                    >
                        Go to Login
                    </Link>
                </div>
            </div>
        );
    }

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const firstName =
        user.first_name?.trim() ||
        user.username ||
        "User";

    const displayName =
        `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
        user.username ||
        "User";

    const initial =
        firstName.charAt(0).toUpperCase();

    return (
        <main className="dashboard-page">
            <div className="container-fluid dashboard-container">

                <section className="dashboard-hero">
                    <div className="row align-items-center g-0">

                        <div className="col-lg-7">
                            <div className="dashboard-hero-content">
                                <span className="dashboard-eyebrow">
                                    EZITECH TECHNOLOGIES
                                </span>

                                <h1>
                                    Welcome, {firstName}
                                </h1>

                                <p>
                                    Your job search starts here. Manage your
                                    applications, saved jobs and resume from
                                    your personal dashboard.
                                </p>

                                <div className="dashboard-hero-actions">
                                    <Link
                                        to="/jobs"
                                        className="btn btn-primary"
                                    >
                                        Browse Jobs
                                    </Link>

                                    <Link
                                        to="/profile"
                                        className="btn btn-outline-primary"
                                    >
                                        View Profile
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-5">
                            <div className="dashboard-hero-image">
                                <img
                                    src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1000&q=85"
                                    alt="Professionals working together in an office"
                                />
                            </div>
                        </div>

                    </div>
                </section>

                <section className="dashboard-user-bar">
                    <div className="dashboard-user">
                        <div className="dashboard-user-avatar">
                            {initial}
                        </div>

                        <div className="dashboard-user-info">
                            <span className="dashboard-user-name">
                                {displayName}
                            </span>

                            <span className="dashboard-user-email">
                                {user.email || "No email available"}
                            </span>
                        </div>
                    </div>

                    <div className="dashboard-status">
                        <span></span>
                        Account Active
                    </div>
                </section>

                <section className="dashboard-stats">
                    <div className="row g-3">

                        <div className="col-md-4">
                            <div className="dashboard-stat-card h-100">
                                <div className="dashboard-stat-icon">
                                    <i className="bi bi-bookmark-fill"></i>
                                </div>

                                <div>
                                    <span className="dashboard-stat-title">
                                        Saved Jobs
                                    </span>

                                    <span className="dashboard-stat-description">
                                        Jobs you are interested in
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-4">
                            <div className="dashboard-stat-card h-100">
                                <div className="dashboard-stat-icon">
                                    <i className="bi bi-file-earmark-check-fill"></i>
                                </div>

                                <div>
                                    <span className="dashboard-stat-title">
                                        Applications
                                    </span>

                                    <span className="dashboard-stat-description">
                                        Track your job applications
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-4">
                            <div className="dashboard-stat-card h-100">
                                <div className="dashboard-stat-icon">
                                    <i className="bi bi-file-earmark-person-fill"></i>
                                </div>

                                <div>
                                    <span className="dashboard-stat-title">
                                        Resume
                                    </span>

                                    <span className="dashboard-stat-description">
                                        Keep your resume updated
                                    </span>
                                </div>
                            </div>
                        </div>

                    </div>
                </section>

                <section className="dashboard-section">
                    <div className="dashboard-section-header">
                        <div>
                            <h2>Quick Actions</h2>
                            <p>
                                Everything you need for your job search.
                            </p>
                        </div>
                    </div>

                    <div className="row g-3">

                        <div className="col-md-6 col-xl-3">
                            <Link
                                to="/jobs"
                                className="dashboard-action-card"
                            >
                                <div className="dashboard-action-icon">
                                    <i className="bi bi-search"></i>
                                </div>

                                <strong>
                                    Browse Jobs
                                </strong>

                                <span>
                                    Find opportunities that match your skills.
                                </span>

                                <small>
                                    Explore jobs <i className="bi bi-arrow-right"></i>
                                </small>
                            </Link>
                        </div>

                        <div className="col-md-6 col-xl-3">
                            <Link
                                to="/resume"
                                className="dashboard-action-card"
                            >
                                <div className="dashboard-action-icon">
                                    <i className="bi bi-person-vcard-fill"></i>
                                </div>

                                <strong>
                                    Manage Resume
                                </strong>

                                <span>
                                    Upload and maintain your latest resume.
                                </span>

                                <small>
                                    Manage resume <i className="bi bi-arrow-right"></i>
                                </small>
                            </Link>
                        </div>

                        <div className="col-md-6 col-xl-3">
                            <Link
                                to="/saved-jobs"
                                className="dashboard-action-card"
                            >
                                <div className="dashboard-action-icon">
                                    <i className="bi bi-bookmark-fill"></i>
                                </div>

                                <strong>
                                    Saved Jobs
                                </strong>

                                <span>
                                    Review jobs you saved for later.
                                </span>

                                <small>
                                    View saved jobs <i className="bi bi-arrow-right"></i>
                                </small>
                            </Link>
                        </div>

                        <div className="col-md-6 col-xl-3">
                            <Link
                                to="/applications"
                                className="dashboard-action-card"
                            >
                                <div className="dashboard-action-icon">
                                    <i className="bi bi-file-earmark-check-fill"></i>
                                </div>

                                <strong>
                                    My Applications
                                </strong>

                                <span>
                                    Check the progress of your applications.
                                </span>

                                <small>
                                    View applications <i className="bi bi-arrow-right"></i>
                                </small>
                            </Link>
                        </div>

                    </div>
                </section>

                <section className="dashboard-section">
                    <div className="dashboard-section-header">
                        <div>
                            <h2>Account Information</h2>
                            <p>
                                Your current account details.
                            </p>
                        </div>

                        <Link
                            to="/profile"
                            className="dashboard-edit-link"
                        >
                            Edit Profile
                        </Link>
                    </div>

                    <div className="dashboard-account">
                        <div className="row g-0">

                            <div className="col-md-6">
                                <div className="dashboard-account-item">
                                    <span>
                                        Full Name
                                    </span>

                                    <strong>
                                        {displayName}
                                    </strong>
                                </div>
                            </div>

                            <div className="col-md-6">
                                <div className="dashboard-account-item">
                                    <span>
                                        Username
                                    </span>

                                    <strong>
                                        {user.username}
                                    </strong>
                                </div>
                            </div>

                            <div className="col-md-6">
                                <div className="dashboard-account-item">
                                    <span>
                                        Email Address
                                    </span>

                                    <strong>
                                        {user.email || "Not provided"}
                                    </strong>
                                </div>
                            </div>

                            <div className="col-md-6">
                                <div className="dashboard-account-item">
                                    <span>
                                        Account Status
                                    </span>

                                    <strong className="account-active">
                                        Active
                                    </strong>
                                </div>
                            </div>

                        </div>
                    </div>
                </section>

                <section className="dashboard-career">
                    <div className="row align-items-center">

                        <div className="col-lg-8">
                            <h2>
                                Ready for your next opportunity?
                            </h2>

                            <p>
                                Explore the latest vacancies and find a position
                                that matches your experience and career goals.
                            </p>
                        </div>

                        <div className="col-lg-4 text-lg-end">
                            <Link
                                to="/jobs"
                                className="btn btn-primary dashboard-career-button"
                            >
                                Find a Job
                            </Link>
                        </div>

                    </div>
                </section>

                <div className="dashboard-footer">
                    <p>
                        Keep your profile and resume updated to improve your
                        chances of finding the right opportunity.
                    </p>

                    <button
                        type="button"
                        className="dashboard-logout"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>
                </div>

            </div>
        </main>
    );
}

export default Dashboard;