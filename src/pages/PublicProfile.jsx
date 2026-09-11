import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/axios";
import { getUser } from "../utils/auth";
import "./PublicProfile.css";

function PublicProfile() {
    const { username } = useParams();
    const user = getUser();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showPhotoViewer, setShowPhotoViewer] = useState(false);

    useEffect(() => {
        const fetchPublicProfile = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await api.get(
                    `public-profile/${encodeURIComponent(username)}/`
                );

                setProfile(response.data);
            } catch (err) {
                console.error(
                    "Unable to load public profile:",
                    err
                );

                setError(
                    err.response?.data?.detail ||
                    err.response?.data?.error ||
                    "Unable to load this profile."
                );
            } finally {
                setLoading(false);
            }
        };

        if (user && username) {
            fetchPublicProfile();
        } else {
            setLoading(false);
        }
    }, [username]);

    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === "Escape") {
                setShowPhotoViewer(false);
            }
        };

        if (showPhotoViewer) {
            document.addEventListener(
                "keydown",
                handleEscape
            );

            document.body.style.overflow = "hidden";
        }

        return () => {
            document.removeEventListener(
                "keydown",
                handleEscape
            );

            document.body.style.overflow = "";
        };
    }, [showPhotoViewer]);

    const getInitials = () => {
        if (!profile) {
            return "?";
        }

        const firstName = profile.first_name?.trim();

        if (firstName) {
            return firstName
                .charAt(0)
                .toUpperCase();
        }

        return profile.username
            ?.charAt(0)
            .toUpperCase() || "?";
    };

    const getSkills = () => {
        if (!profile?.skills) {
            return [];
        }

        return profile.skills
            .split(",")
            .map((skill) => skill.trim())
            .filter(Boolean);
    };

    const skills = getSkills();

    if (!user) {
        return (
            <div className="public-profile-page">
                <div className="public-profile-overlay"></div>

                <div className="public-profile-auth-card">
                    <div className="public-profile-auth-icon">
                        <i className="bi bi-person-circle"></i>
                    </div>

                    <h1>Login Required</h1>

                    <p>
                        Please log in to view user profiles.
                    </p>

                    <Link
                        to="/login"
                        className="public-profile-primary-button"
                    >
                        <i className="bi bi-box-arrow-in-right"></i>
                        Login
                    </Link>

                    <Link
                        to="/"
                        className="public-profile-back-link"
                    >
                        <i className="bi bi-arrow-left"></i>
                        Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="public-profile-page">
                <div className="public-profile-overlay"></div>

                <div className="public-profile-loading">
                    <div className="public-profile-spinner"></div>

                    <p>
                        Loading profile...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        const isPrivate =
            error.toLowerCase().includes("private");

        const isEmployerOnly =
            error.toLowerCase().includes("employers");

        return (
            <div className="public-profile-page">
                <div className="public-profile-overlay"></div>

                <div className="public-profile-error-card">
                    <div className="public-profile-error-icon">
                        <i
                            className={
                                isPrivate
                                    ? "bi bi-lock-fill"
                                    : isEmployerOnly
                                    ? "bi bi-briefcase-fill"
                                    : "bi bi-person-x-fill"
                            }
                        ></i>
                    </div>

                    <h1>
                        {isPrivate
                            ? "Private Profile"
                            : isEmployerOnly
                            ? "Employers Only"
                            : "Profile Unavailable"}
                    </h1>

                    <p>{error}</p>

                    <div className="public-profile-error-actions">
                        <button
                            type="button"
                            className="public-profile-secondary-button"
                            onClick={() =>
                                window.history.back()
                            }
                        >
                            <i className="bi bi-arrow-left"></i>
                            Go Back
                        </button>

                        <Link
                            to="/dashboard"
                            className="public-profile-primary-button"
                        >
                            <i className="bi bi-speedometer2"></i>
                            Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (!profile) {
        return null;
    }

    return (
        <div className="public-profile-page">
            <div className="public-profile-overlay"></div>

            <div className="public-profile-container">
                <div className="public-profile-card">

                    <div className="public-profile-topbar">
                        <Link
                            to="/dashboard"
                            className="public-profile-dashboard-link"
                        >
                            <i className="bi bi-arrow-left"></i>
                            Dashboard
                        </Link>

                        <span className="public-profile-label">
                            <i className="bi bi-person-badge"></i>
                            USER PROFILE
                        </span>
                    </div>

                    <div className="public-profile-hero">

                        <div className="public-profile-avatar-wrapper">
                            <button
                                type="button"
                                className="public-profile-avatar"
                                onClick={() => {
                                    if (
                                        profile.profile_photo
                                    ) {
                                        setShowPhotoViewer(true);
                                    }
                                }}
                                aria-label={
                                    profile.profile_photo
                                        ? "View profile photo"
                                        : "Profile photo"
                                }
                            >
                                {profile.profile_photo ? (
                                    <img
                                        src={
                                            profile.profile_photo
                                        }
                                        alt={
                                            profile.username
                                        }
                                        className="public-profile-avatar-image"
                                    />
                                ) : (
                                    <span>
                                        {getInitials()}
                                    </span>
                                )}
                            </button>

                            <span className="public-profile-online-dot"></span>
                        </div>

                        <div className="public-profile-identity">

                            <div className="public-profile-name-row">
                                <h1>
                                    {profile.first_name ||
                                        profile.username}
                                </h1>

                                {profile.is_employer && (
                                    <span className="public-profile-employer-badge">
                                        <i className="bi bi-building-check"></i>
                                        Employer
                                    </span>
                                )}
                            </div>

                            <p className="public-profile-username">
                                <i className="bi bi-at"></i>
                                {profile.username}
                            </p>

                            {profile.location && (
                                <p className="public-profile-location">
                                    <i className="bi bi-geo-alt-fill"></i>
                                    {profile.location}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="public-profile-divider"></div>

                    <div className="public-profile-body">

                        <section className="public-profile-section">
                            <div className="public-profile-section-heading">
                                <div className="public-profile-section-icon">
                                    <i className="bi bi-person-lines-fill"></i>
                                </div>

                                <div>
                                    <h2>About</h2>
                                    <p>
                                        Professional introduction
                                    </p>
                                </div>
                            </div>

                            <div className="public-profile-content">
                                {profile.bio ? (
                                    <p className="public-profile-bio">
                                        {profile.bio}
                                    </p>
                                ) : (
                                    <div className="public-profile-empty-content">
                                        <i className="bi bi-info-circle"></i>
                                        <span>
                                            This user has not
                                            added a biography yet.
                                        </span>
                                    </div>
                                )}
                            </div>
                        </section>

                        <section className="public-profile-section">
                            <div className="public-profile-section-heading">
                                <div className="public-profile-section-icon">
                                    <i className="bi bi-code-slash"></i>
                                </div>

                                <div>
                                    <h2>Skills</h2>
                                    <p>
                                        Professional skills and
                                        expertise
                                    </p>
                                </div>
                            </div>

                            <div className="public-profile-content">
                                {skills.length > 0 ? (
                                    <div className="public-profile-skills">
                                        {skills.map(
                                            (skill, index) => (
                                                <span
                                                    key={`${skill}-${index}`}
                                                    className="public-profile-skill"
                                                >
                                                    <i className="bi bi-check2"></i>
                                                    {skill}
                                                </span>
                                            )
                                        )}
                                    </div>
                                ) : (
                                    <div className="public-profile-empty-content">
                                        <i className="bi bi-code-square"></i>
                                        <span>
                                            No skills have been
                                            added yet.
                                        </span>
                                    </div>
                                )}
                            </div>
                        </section>

                        <section className="public-profile-section">
                            <div className="public-profile-section-heading">
                                <div className="public-profile-section-icon">
                                    <i className="bi bi-mortarboard-fill"></i>
                                </div>

                                <div>
                                    <h2>Education</h2>
                                    <p>
                                        Academic background
                                    </p>
                                </div>
                            </div>

                            <div className="public-profile-content">
                                {profile.education ? (
                                    <div className="public-profile-text-card">
                                        <i className="bi bi-book-half"></i>

                                        <p>
                                            {profile.education}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="public-profile-empty-content">
                                        <i className="bi bi-mortarboard"></i>
                                        <span>
                                            No education information
                                            has been added yet.
                                        </span>
                                    </div>
                                )}
                            </div>
                        </section>

                        <section className="public-profile-section">
                            <div className="public-profile-section-heading">
                                <div className="public-profile-section-icon">
                                    <i className="bi bi-briefcase-fill"></i>
                                </div>

                                <div>
                                    <h2>Experience</h2>
                                    <p>
                                        Professional experience
                                    </p>
                                </div>
                            </div>

                            <div className="public-profile-content">
                                {profile.experience ? (
                                    <div className="public-profile-text-card">
                                        <i className="bi bi-building"></i>

                                        <p>
                                            {profile.experience}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="public-profile-empty-content">
                                        <i className="bi bi-briefcase"></i>
                                        <span>
                                            No professional
                                            experience has been
                                            added yet.
                                        </span>
                                    </div>
                                )}
                            </div>
                        </section>

                    </div>

                    <div className="public-profile-footer">
                        <div className="public-profile-security">
                            <i className="bi bi-shield-check"></i>

                            <span>
                                Profile information is protected
                                by the user's privacy settings.
                            </span>
                        </div>

                        <Link
                            to="/jobs"
                            className="public-profile-jobs-button"
                        >
                            <i className="bi bi-search"></i>
                            Explore Jobs
                        </Link>
                    </div>

                </div>
            </div>

            {showPhotoViewer &&
                profile.profile_photo && (
                    <div
                        className="public-profile-photo-viewer"
                        onClick={() =>
                            setShowPhotoViewer(false)
                        }
                    >
                        <button
                            type="button"
                            className="public-profile-photo-viewer-close"
                            onClick={() =>
                                setShowPhotoViewer(false)
                            }
                            aria-label="Close photo viewer"
                        >
                            <i className="bi bi-x-lg"></i>
                        </button>

                        <div
                            className="public-profile-photo-viewer-content"
                            onClick={(event) =>
                                event.stopPropagation()
                            }
                        >
                            <img
                                src={
                                    profile.profile_photo
                                }
                                alt={
                                    profile.username
                                }
                                className="public-profile-full-photo"
                            />
                        </div>
                    </div>
                )}
        </div>
    );
}

export default PublicProfile;