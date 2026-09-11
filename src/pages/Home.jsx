import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import api from "../api/axios";
import { getErrorMessage } from "../utils/errorHandler";

import "./Home.css";

function Home() {
    const [jobs, setJobs] = useState([]);
    const [nearbyJobs, setNearbyJobs] = useState([]);

    const [search, setSearch] = useState("");
    const [location, setLocation] = useState("");
    const [jobType, setJobType] = useState("");

    const [loading, setLoading] = useState(true);
    const [nearbyLoading, setNearbyLoading] = useState(false);

    const [error, setError] = useState("");
    const [nearbyError, setNearbyError] = useState("");

    const [userLocation, setUserLocation] = useState(null);
    const [radius, setRadius] = useState(10);

    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem("home-theme") === "dark";
    });

    const fetchJobs = async (
        searchValue = search,
        locationValue = location,
        jobTypeValue = jobType
    ) => {
        try {
            setLoading(true);
            setError("");

            const params = {};

            if (searchValue.trim()) {
                params.search = searchValue.trim();
            }

            if (locationValue.trim()) {
                params.location = locationValue.trim();
            }

            if (jobTypeValue) {
                params.job_type = jobTypeValue;
            }

            const response = await api.get("jobs/", {
                params
            });

            if (Array.isArray(response.data)) {
                setJobs(response.data);
            } else if (Array.isArray(response.data.results)) {
                setJobs(response.data.results);
            } else {
                setJobs([]);
            }
        } catch (err) {
            setError(
                getErrorMessage(
                    err,
                    "Failed to load jobs."
                )
            );
        } finally {
            setLoading(false);
        }
    };

    const fetchNearbyJobs = async (
        latitude,
        longitude,
        selectedRadius = radius
    ) => {
        try {
            setNearbyLoading(true);
            setNearbyError("");

            const response = await api.get(
                "jobs/nearby/",
                {
                    params: {
                        latitude,
                        longitude,
                        radius: selectedRadius
                    }
                }
            );

            if (
                response.data &&
                Array.isArray(response.data.results)
            ) {
                setNearbyJobs(response.data.results);
            } else if (Array.isArray(response.data)) {
                setNearbyJobs(response.data);
            } else {
                setNearbyJobs([]);
            }
        } catch (err) {
            setNearbyError(
                getErrorMessage(
                    err,
                    "Unable to find jobs near you."
                )
            );

            setNearbyJobs([]);
        } finally {
            setNearbyLoading(false);
        }
    };

    const getUserLocation = () => {
        if (!navigator.geolocation) {
            setNearbyError(
                "Geolocation is not supported by your browser."
            );

            return;
        }

        setNearbyLoading(true);
        setNearbyError("");

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;

                const currentLocation = {
                    latitude,
                    longitude
                };

                setUserLocation(currentLocation);

                fetchNearbyJobs(
                    latitude,
                    longitude,
                    radius
                );
            },
            (locationError) => {
                setNearbyLoading(false);

                if (locationError.code === 1) {
                    setNearbyError(
                        "Location permission was denied. Please allow location access in your browser to see jobs near you."
                    );
                } else if (locationError.code === 2) {
                    setNearbyError(
                        "Your location could not be determined. Please try again."
                    );
                } else if (locationError.code === 3) {
                    setNearbyError(
                        "Getting your location timed out. Please try again."
                    );
                } else {
                    setNearbyError(
                        "Unable to get your current location."
                    );
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    };

    const handleRadiusChange = (selectedRadius) => {
        setRadius(selectedRadius);

        if (userLocation) {
            fetchNearbyJobs(
                userLocation.latitude,
                userLocation.longitude,
                selectedRadius
            );
        }
    };

    const handleSearch = (event) => {
        event.preventDefault();

        fetchJobs(
            search,
            location,
            jobType
        );

        setTimeout(() => {
            document
                .getElementById("available-jobs")
                ?.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
        }, 50);
    };

    const toggleTheme = () => {
        setDarkMode((current) => {
            const next = !current;

            localStorage.setItem(
                "home-theme",
                next ? "dark" : "light"
            );

            return next;
        });
    };

    const getJobType = (type) => {
        if (type === "full_time") return "Full Time";
        if (type === "part_time") return "Part Time";
        if (type === "contract") return "Contract";
        if (type === "internship") return "Internship";

        return "Job";
    };

    const getCompanyName = (job) => {
        return (
            job.company_details?.name ||
            job.company?.name ||
            job.company_name ||
            "Company"
        );
    };

    const getCompanyLogo = (job) => {
        return (
            job.company_details?.logo ||
            job.company_details?.logo_url ||
            job.company?.logo ||
            job.company?.logo_url ||
            job.company_logo ||
            job.logo ||
            null
        );
    };

    const getCompanyInitial = (job) => {
        return getCompanyName(job)
            .charAt(0)
            .toUpperCase() || "C";
    };

    const handleLogoError = (event, job) => {
        event.currentTarget.style.display = "none";

        const fallback =
            event.currentTarget.parentElement?.querySelector(
                ".company-logo-fallback"
            );

        if (fallback) {
            fallback.style.display = "flex";
        }
    };

    const CompanyLogo = ({ job }) => {
        const logo = getCompanyLogo(job);

        return (
            <div className="company-logo">
                {logo ? (
                    <img
                        src={logo}
                        alt={`${getCompanyName(job)} logo`}
                        onError={(event) =>
                            handleLogoError(event, job)
                        }
                    />
                ) : null}

                <span
                    className="company-logo-fallback"
                    style={{
                        display: logo ? "none" : "flex"
                    }}
                >
                    {getCompanyInitial(job)}
                </span>
            </div>
        );
    };

    useEffect(() => {
        document.body.classList.toggle(
            "dark-mode",
            darkMode
        );

        return () => {
            document.body.classList.remove(
                "dark-mode"
            );
        };
    }, [darkMode]);

    useEffect(() => {
        fetchJobs();
        getUserLocation();
    }, []);

    return (
        <div
            className={`home-page ${
                darkMode ? "home-dark" : ""
            }`}
        >
            <button
                type="button"
                className="home-theme-toggle"
                onClick={toggleTheme}
                aria-label={
                    darkMode
                        ? "Switch to light mode"
                        : "Switch to dark mode"
                }
            >
                <i
                    className={
                        darkMode
                            ? "bi bi-sun-fill"
                            : "bi bi-moon-stars-fill"
                    }
                ></i>
            </button>

            <section className="hero-section">
                <div className="hero-overlay"></div>

                <div className="container hero-container">
                    <div className="hero-content">
                        <div className="hero-badge">
                            <i className="bi bi-stars"></i>
                            Your next opportunity starts here
                        </div>

                        <h1>
                            Find work that
                            <span> moves you forward.</span>
                        </h1>

                        <p>
                            Search real opportunities,
                            discover jobs near you,
                            save the ones you like,
                            and apply when you're ready.
                        </p>

                        <div className="hero-actions">
                            <a
                                href="#available-jobs"
                                className="hero-primary-button"
                            >
                                Explore Jobs
                                <i className="bi bi-arrow-down"></i>
                            </a>

                            <Link
                                to="/register"
                                className="hero-secondary-button"
                            >
                                Create Account
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="container hero-search-container">
                    <form
                        className="search-panel"
                        onSubmit={handleSearch}
                    >
                        <div className="search-panel-heading">
                            <span>
                                <i className="bi bi-search"></i>
                            </span>

                            <div>
                                <strong>
                                    Search opportunities
                                </strong>

                                <small>
                                    Find the right job for your next move
                                </small>
                            </div>
                        </div>

                        <div className="search-fields">
                            <div className="search-field">
                                <i className="bi bi-briefcase"></i>

                                <input
                                    type="text"
                                    placeholder="Job title, keyword or company"
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(
                                            event.target.value
                                        )
                                    }
                                />
                            </div>

                            <div className="search-field">
                                <i className="bi bi-geo-alt"></i>

                                <input
                                    type="text"
                                    placeholder="City or location"
                                    value={location}
                                    onChange={(event) =>
                                        setLocation(
                                            event.target.value
                                        )
                                    }
                                />
                            </div>

                            <div className="search-field">
                                <i className="bi bi-layers"></i>

                                <select
                                    value={jobType}
                                    onChange={(event) =>
                                        setJobType(
                                            event.target.value
                                        )
                                    }
                                >
                                    <option value="">
                                        All Job Types
                                    </option>

                                    <option value="full_time">
                                        Full Time
                                    </option>

                                    <option value="part_time">
                                        Part Time
                                    </option>

                                    <option value="contract">
                                        Contract
                                    </option>

                                    <option value="internship">
                                        Internship
                                    </option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                className="search-button"
                            >
                                Search
                                <i className="bi bi-arrow-right"></i>
                            </button>
                        </div>
                    </form>
                </div>
            </section>

            <main>
                <section className="quick-strip">
                    <div className="container">
                        <div className="quick-strip-inner">
                            <div className="quick-item">
                                <div className="quick-icon">
                                    <i className="bi bi-search"></i>
                                </div>

                                <div>
                                    <strong>
                                        Search smarter
                                    </strong>

                                    <span>
                                        Find opportunities by role,
                                        location and type.
                                    </span>
                                </div>
                            </div>

                            <div className="quick-item">
                                <div className="quick-icon">
                                    <i className="bi bi-geo-alt"></i>
                                </div>

                                <div>
                                    <strong>
                                        Find jobs nearby
                                    </strong>

                                    <span>
                                        Discover opportunities
                                        around your location.
                                    </span>
                                </div>
                            </div>

                            <div className="quick-item">
                                <div className="quick-icon">
                                    <i className="bi bi-send-check"></i>
                                </div>

                                <div>
                                    <strong>
                                        Apply with confidence
                                    </strong>

                                    <span>
                                        Keep your applications
                                        organized in one place.
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="nearby-section">
                    <div className="container">
                        <div className="section-heading-row">
                            <div>
                                <span className="section-kicker">
                                    LOCAL OPPORTUNITIES
                                </span>

                                <h2>
                                    Jobs closer to you
                                </h2>

                                <p>
                                    Use your location to discover
                                    approved opportunities around you.
                                </p>
                            </div>

                            <div className="local-actions">
                                <button
                                    type="button"
                                    className="location-button"
                                    onClick={getUserLocation}
                                    disabled={nearbyLoading}
                                >
                                    <i className="bi bi-crosshair"></i>

                                    {nearbyLoading
                                        ? "Finding Location..."
                                        : "Use My Location"}
                                </button>

                                <a
                                    href="#available-jobs"
                                    className="nearby-view-all-button"
                                >
                                    View All Jobs
                                    <i className="bi bi-arrow-right"></i>
                                </a>
                            </div>
                        </div>

                        <div className="nearby-toolbar">
                            <div className="nearby-toolbar-title">
                                <i className="bi bi-rulers"></i>

                                <span>
                                    Search within
                                </span>
                            </div>

                            <div className="radius-buttons">
                                {[5, 10, 25, 50].map(
                                    (option) => (
                                        <button
                                            key={option}
                                            type="button"
                                            className={
                                                radius === option
                                                    ? "radius-button active"
                                                    : "radius-button"
                                            }
                                            onClick={() =>
                                                handleRadiusChange(
                                                    option
                                                )
                                            }
                                        >
                                            {option} km
                                        </button>
                                    )
                                )}
                            </div>
                        </div>

                        {nearbyError && (
                            <div className="alert-box error-message">
                                <i className="bi bi-exclamation-circle"></i>

                                <span>
                                    {nearbyError}
                                </span>
                            </div>
                        )}

                        {nearbyLoading ? (
                            <div className="status-message">
                                <span className="loading-spinner"></span>
                                Finding opportunities near you...
                            </div>
                        ) : nearbyJobs.length === 0 &&
                          !nearbyError ? (
                            <div className="empty-message">
                                <div className="empty-icon">
                                    <i className="bi bi-geo-alt"></i>
                                </div>

                                <h3>
                                    No nearby jobs yet
                                </h3>

                                <p>
                                    We could not find approved
                                    opportunities within{" "}
                                    <strong>
                                        {radius} km
                                    </strong>{" "}
                                    of your location.
                                </p>

                                <a
                                    href="#available-jobs"
                                    className="empty-action-button"
                                >
                                    Browse Available Jobs
                                    <i className="bi bi-arrow-right"></i>
                                </a>
                            </div>
                        ) : (
                            <div className="featured-job-layout">
                                {nearbyJobs
                                    .slice(0, 4)
                                    .map((job, index) => (
                                        <article
                                            className={
                                                index === 0
                                                    ? "job-card featured-job-card"
                                                    : "job-card compact-job-card"
                                            }
                                            key={job.id}
                                        >
                                            <div className="job-card-top">
                                                <CompanyLogo job={job} />

                                                <div className="job-card-title">
                                                    <span className="job-label">
                                                        {index === 0
                                                            ? "FEATURED OPPORTUNITY"
                                                            : getJobType(
                                                                  job.job_type
                                                              )}
                                                    </span>

                                                    <h3>
                                                        {job.title}
                                                    </h3>

                                                    <p className="company-name">
                                                        {getCompanyName(job)}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="job-meta">
                                                <span>
                                                    <i className="bi bi-geo-alt-fill"></i>
                                                    {job.location}
                                                </span>

                                                {job.distance_km !==
                                                    undefined && (
                                                    <span>
                                                        <i className="bi bi-signpost-2"></i>
                                                        {
                                                            job.distance_km
                                                        }{" "}
                                                        km away
                                                    </span>
                                                )}
                                            </div>

                                            {job.salary && (
                                                <div className="job-salary">
                                                    <i className="bi bi-cash-stack"></i>
                                                    {job.salary}
                                                </div>
                                            )}

                                            <p className="job-description">
                                                {job.description
                                                    ?.length > 180
                                                    ? `${job.description.substring(
                                                          0,
                                                          180
                                                      )}...`
                                                    : job.description}
                                            </p>

                                            <Link
                                                to={`/jobs/${job.id}`}
                                                className="view-job-button"
                                            >
                                                View Opportunity
                                                <i className="bi bi-arrow-up-right"></i>
                                            </Link>
                                        </article>
                                    ))}
                            </div>
                        )}
                    </div>
                </section>

                <section
                    className="available-section"
                    id="available-jobs"
                >
                    <div className="container">
                        <div className="section-heading-row">
                            <div>
                                <span className="section-kicker">
                                    OPPORTUNITIES
                                </span>

                                <h2>
                                    Explore available jobs
                                </h2>

                                <p>
                                    Browse approved opportunities
                                    currently available on the platform.
                                </p>
                            </div>

                            <div className="job-count">
                                <i className="bi bi-briefcase"></i>
                                {jobs.length} opportunities
                            </div>
                        </div>

                        {error && (
                            <div className="alert-box error-message">
                                <i className="bi bi-exclamation-circle"></i>

                                <span>
                                    {error}
                                </span>
                            </div>
                        )}

                        {loading ? (
                            <div className="status-message">
                                <span className="loading-spinner"></span>
                                Loading available jobs...
                            </div>
                        ) : jobs.length === 0 ? (
                            <div className="empty-message">
                                <div className="empty-icon">
                                    <i className="bi bi-briefcase"></i>
                                </div>

                                <h3>
                                    No jobs found
                                </h3>

                                <p>
                                    Try changing your search
                                    criteria to discover more
                                    opportunities.
                                </p>

                                <Link
                                    to="/jobs"
                                    className="empty-action-button"
                                >
                                    Browse All Jobs
                                    <i className="bi bi-arrow-right"></i>
                                </Link>
                            </div>
                        ) : (
                            <div className="jobs-grid">
                                {jobs.map((job) => (
                                    <article
                                        className="job-card"
                                        key={job.id}
                                    >
                                        <div className="job-card-top">
                                            <CompanyLogo job={job} />

                                            <div className="job-card-title">
                                                <span className="job-label">
                                                    {getJobType(
                                                        job.job_type
                                                    )}
                                                </span>

                                                <h3>
                                                    {job.title}
                                                </h3>

                                                <p className="company-name">
                                                    {getCompanyName(job)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="job-meta">
                                            <span>
                                                <i className="bi bi-geo-alt-fill"></i>
                                                {job.location}
                                            </span>

                                            <span>
                                                <i className="bi bi-briefcase-fill"></i>
                                                {getJobType(
                                                    job.job_type
                                                )}
                                            </span>
                                        </div>

                                        {job.salary && (
                                            <div className="job-salary">
                                                <i className="bi bi-cash-stack"></i>
                                                {job.salary}
                                            </div>
                                        )}

                                        <p className="job-description">
                                            {job.description
                                                ?.length > 140
                                                ? `${job.description.substring(
                                                      0,
                                                      140
                                                  )}...`
                                                : job.description}
                                        </p>

                                        <div className="job-card-footer">
                                            <span className="job-date">
                                                <i className="bi bi-clock"></i>
                                                Posted{" "}
                                                {new Date(
                                                    job.created_at
                                                ).toLocaleDateString()}
                                            </span>

                                            <Link
                                                to={`/jobs/${job.id}`}
                                                className="view-job-button"
                                            >
                                                View Job
                                                <i className="bi bi-arrow-right"></i>
                                            </Link>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                <section className="why-section">
                    <div className="container">
                        <div className="why-layout">
                            <div className="why-intro">
                                <span className="section-kicker">
                                    BUILT FOR YOUR NEXT MOVE
                                </span>

                                <h2>
                                    More than a job search.
                                </h2>

                                <p>
                                    Everything you need to discover
                                    opportunities, manage your search,
                                    and move from searching to applying
                                    without unnecessary steps.
                                </p>

                                <Link
                                    to="/jobs"
                                    className="text-link"
                                >
                                    Explore all jobs
                                    <i className="bi bi-arrow-right"></i>
                                </Link>
                            </div>

                            <div className="benefit-grid">
                                <div className="benefit-card">
                                    <div className="benefit-number">
                                        01
                                    </div>

                                    <i className="bi bi-funnel"></i>

                                    <h3>
                                        Focused search
                                    </h3>

                                    <p>
                                        Filter opportunities by
                                        keyword, location and job type
                                        to spend less time searching.
                                    </p>
                                </div>

                                <div className="benefit-card">
                                    <div className="benefit-number">
                                        02
                                    </div>

                                    <i className="bi bi-geo-alt"></i>

                                    <h3>
                                        Location-based discovery
                                    </h3>

                                    <p>
                                        Find approved opportunities
                                        within a radius around your
                                        current location.
                                    </p>
                                </div>

                                <div className="benefit-card">
                                    <div className="benefit-number">
                                        03
                                    </div>

                                    <i className="bi bi-bookmark-star"></i>

                                    <h3>
                                        Save what matters
                                    </h3>

                                    <p>
                                        Keep interesting jobs close so
                                        you can return and apply later.
                                    </p>
                                </div>

                                <div className="benefit-card">
                                    <div className="benefit-number">
                                        04
                                    </div>

                                    <i className="bi bi-clipboard-check"></i>

                                    <h3>
                                        Track applications
                                    </h3>

                                    <p>
                                        Keep your applications organized
                                        and follow your progress from
                                        one dashboard.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="how-section">
                    <div className="container">
                        <div className="how-header">
                            <span className="section-kicker">
                                SIMPLE PROCESS
                            </span>

                            <h2>
                                From search to opportunity
                            </h2>

                            <p>
                                A straightforward experience designed
                                to help you move quickly.
                            </p>
                        </div>

                        <div className="process-line">
                            <div className="process-step">
                                <div className="process-number">
                                    01
                                </div>

                                <i className="bi bi-search"></i>

                                <h3>
                                    Discover
                                </h3>

                                <p>
                                    Search for jobs that match your
                                    skills, interests and location.
                                </p>
                            </div>

                            <div className="process-connector"></div>

                            <div className="process-step">
                                <div className="process-number">
                                    02
                                </div>

                                <i className="bi bi-file-earmark-text"></i>

                                <h3>
                                    Apply
                                </h3>

                                <p>
                                    Review the opportunity and submit
                                    your application with confidence.
                                </p>
                            </div>

                            <div className="process-connector"></div>

                            <div className="process-step">
                                <div className="process-number">
                                    03
                                </div>

                                <i className="bi bi-graph-up-arrow"></i>

                                <h3>
                                    Move forward
                                </h3>

                                <p>
                                    Manage your applications and stay
                                    focused on your next opportunity.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="employer-section">
                    <div className="container">
                        <div className="employer-panel">
                            <div className="employer-content">
                                <span className="section-kicker">
                                    FOR EMPLOYERS
                                </span>

                                <h2>
                                    Looking for the right person?
                                </h2>

                                <p>
                                    Reach candidates actively looking
                                    for their next opportunity. Create
                                    your company profile and publish
                                    your vacancy.
                                </p>

                                <div className="employer-actions">
                                    <Link
                                        to="/company/create"
                                        className="employer-primary"
                                    >
                                        Create Company
                                        <i className="bi bi-arrow-right"></i>
                                    </Link>

                                    <Link
                                        to="/job/create"
                                        className="employer-secondary"
                                    >
                                        Post a Job
                                    </Link>
                                </div>
                            </div>

                            <div className="employer-visual">
                                <div className="employer-icon-large">
                                    <i className="bi bi-building"></i>
                                </div>

                                <div className="employer-floating-card">
                                    <i className="bi bi-check-circle-fill"></i>

                                    <div>
                                        <strong>
                                            Your next hire
                                        </strong>

                                        <span>
                                            could be one search away.
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="final-cta">
                    <div className="container">
                        <div className="final-cta-inner">
                            <div>
                                <span className="section-kicker">
                                    YOUR NEXT STEP
                                </span>

                                <h2>
                                    Ready to find your next opportunity?
                                </h2>

                                <p>
                                    Start exploring jobs and take the
                                    next step in your career.
                                </p>
                            </div>

                            <Link
                                to="/jobs"
                                className="final-cta-button"
                            >
                                Browse Jobs
                                <i className="bi bi-arrow-up-right"></i>
                            </Link>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}

export default Home;