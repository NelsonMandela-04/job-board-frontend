import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import "./Jobs.css";

function Jobs() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [location, setLocation] = useState("");
    const [company, setCompany] = useState("");
    const [jobType, setJobType] = useState("");
    const [jobStatus, setJobStatus] = useState("");
    const [posted, setPosted] = useState("");
    const [sort, setSort] = useState("");

    const [nearbyMode, setNearbyMode] = useState(false);
    const [radius, setRadius] = useState(20);
    const [userLocation, setUserLocation] = useState(null);
    const [locationLoading, setLocationLoading] = useState(false);

    const formatJobType = (type) => {
        if (!type) return "Not specified";

        return type
            .replace(/_/g, " ")
            .replace(/\b\w/g, (letter) => letter.toUpperCase());
    };

    const getJobTypeIcon = (type) => {
        switch (type) {
            case "full_time":
                return "bi-briefcase-fill";
            case "part_time":
                return "bi-clock-fill";
            case "contract":
                return "bi-file-earmark-text-fill";
            case "internship":
                return "bi-mortarboard-fill";
            default:
                return "bi-briefcase";
        }
    };

    const fetchJobs = async () => {
        try {
            setLoading(true);
            setError("");

            let response;

            if (nearbyMode && userLocation) {
                const params = new URLSearchParams();

                params.append("latitude", userLocation.latitude);
                params.append("longitude", userLocation.longitude);
                params.append("radius", radius);

                if (search.trim()) {
                    params.append("search", search.trim());
                }

                if (location.trim()) {
                    params.append("location", location.trim());
                }

                if (company.trim()) {
                    params.append("company", company.trim());
                }

                if (jobType) {
                    params.append("job_type", jobType);
                }

                if (jobStatus) {
                    params.append("status", jobStatus);
                }

                if (posted) {
                    params.append("posted", posted);
                }

                response = await api.get(
                    `jobs/nearby/?${params.toString()}`
                );
            } else {
                const params = new URLSearchParams();

                if (search.trim()) {
                    params.append("search", search.trim());
                }

                if (location.trim()) {
                    params.append("location", location.trim());
                }

                if (company.trim()) {
                    params.append("company", company.trim());
                }

                if (jobType) {
                    params.append("job_type", jobType);
                }

                if (jobStatus) {
                    params.append("status", jobStatus);
                }

                if (posted) {
                    params.append("posted", posted);
                }

                if (sort) {
                    params.append("sort", sort);
                }

                response = await api.get(
                    `jobs/?${params.toString()}`
                );
            }

            setJobs(response.data);
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.detail ||
                "Unable to load jobs. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, [nearbyMode, userLocation, radius]);

    const handleSearch = (event) => {
        event.preventDefault();
        fetchJobs();
    };

    const handleClear = () => {
        setSearch("");
        setLocation("");
        setCompany("");
        setJobType("");
        setJobStatus("");
        setPosted("");
        setSort("");
        setNearbyMode(false);
        setUserLocation(null);
        setRadius(20);

        setTimeout(() => {
            fetchJobs();
        }, 0);
    };

    const handleNearbyJobs = () => {
        if (nearbyMode) {
            setNearbyMode(false);
            setUserLocation(null);
            return;
        }

        if (!navigator.geolocation) {
            setError(
                "Geolocation is not supported by your browser."
            );
            return;
        }

        setLocationLoading(true);
        setError("");

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setUserLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });

                setNearbyMode(true);
                setLocationLoading(false);
            },
            () => {
                setError(
                    "Unable to access your location. Please allow location access and try again."
                );

                setLocationLoading(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000,
            }
        );
    };

    const handleRadiusChange = (event) => {
        setRadius(Number(event.target.value));
    };

    const getCompanyInitial = (job) => {
        return (
            job.company?.name?.charAt(0)?.toUpperCase() ||
            "C"
        );
    };

    const getCompanyLogo = (job) => {
        return (
            job.company?.logo ||
            job.company?.logo_url ||
            null
        );
    };

    const formatDate = (date) => {
        if (!date) return "Recently";

        return new Date(date).toLocaleDateString(
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
            <div className="jobs-page">
                <section className="jobs-loading-section">
                    <div className="container text-center">
                        <div
                            className="spinner-border text-primary mb-3"
                            role="status"
                        >
                            <span className="visually-hidden">
                                Loading...
                            </span>
                        </div>

                        <h5>
                            Finding the best jobs for you...
                        </h5>

                        <p className="text-muted mb-0">
                            Please wait while we load available opportunities.
                        </p>
                    </div>
                </section>
            </div>
        );
    }

    return (
        <div className="jobs-page">

            <section className="jobs-hero">
                <div className="jobs-hero-overlay"></div>

                <div className="container position-relative">
                    <div className="row justify-content-center">
                        <div className="col-lg-9 text-center text-white">

                            <span className="jobs-hero-badge">
                                <i className="bi bi-stars me-2"></i>
                                Find Your Next Opportunity
                            </span>

                            <h1 className="jobs-hero-title">
                                Discover Jobs That
                                <span> Move Your Career Forward</span>
                            </h1>

                            <p className="jobs-hero-text">
                                Search thousands of opportunities from trusted
                                companies and find the role that matches your skills.
                            </p>

                            <form
                                onSubmit={handleSearch}
                                className="hero-search-box"
                            >
                                <div className="hero-search-field">
                                    <i className="bi bi-search"></i>

                                    <input
                                        type="text"
                                        placeholder="Job title, keywords or skills"
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(e.target.value)
                                        }
                                    />
                                </div>

                                <div className="hero-search-field">
                                    <i className="bi bi-geo-alt-fill"></i>

                                    <input
                                        type="text"
                                        placeholder="Location"
                                        value={location}
                                        onChange={(e) =>
                                            setLocation(e.target.value)
                                        }
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary hero-search-button"
                                >
                                    <i className="bi bi-search me-2"></i>
                                    Search Jobs
                                </button>
                            </form>

                        </div>
                    </div>
                </div>
            </section>

            <section className="jobs-content-section">
                <div className="container">

                    {error && (
                        <div
                            className="alert alert-danger d-flex align-items-center"
                            role="alert"
                        >
                            <i className="bi bi-exclamation-triangle-fill me-2"></i>
                            <div>{error}</div>
                        </div>
                    )}

                    <div className="row g-4">

                        <div className="col-lg-3">

                            <div className="filters-card">

                                <div className="filters-header">
                                    <div>
                                        <h5>
                                            <i className="bi bi-funnel-fill me-2"></i>
                                            Filters
                                        </h5>

                                        <small>
                                            Refine your job search
                                        </small>
                                    </div>

                                    <button
                                        type="button"
                                        className="btn btn-sm btn-light"
                                        onClick={handleClear}
                                        title="Clear filters"
                                    >
                                        <i className="bi bi-arrow-counterclockwise"></i>
                                    </button>
                                </div>

                                <div className="filter-group">
                                    <label>
                                        <i className="bi bi-building me-2"></i>
                                        Company
                                    </label>

                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Company name"
                                        value={company}
                                        onChange={(e) =>
                                            setCompany(e.target.value)
                                        }
                                    />
                                </div>

                                <div className="filter-group">
                                    <label>
                                        <i className="bi bi-briefcase me-2"></i>
                                        Job Type
                                    </label>

                                    <select
                                        className="form-select"
                                        value={jobType}
                                        onChange={(e) =>
                                            setJobType(e.target.value)
                                        }
                                    >
                                        <option value="">
                                            All job types
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

                                <div className="filter-group">
                                    <label>
                                        <i className="bi bi-toggle-on me-2"></i>
                                        Status
                                    </label>

                                    <select
                                        className="form-select"
                                        value={jobStatus}
                                        onChange={(e) =>
                                            setJobStatus(e.target.value)
                                        }
                                    >
                                        <option value="">
                                            All statuses
                                        </option>

                                        <option value="open">
                                            Open
                                        </option>

                                        <option value="closed">
                                            Closed
                                        </option>
                                    </select>
                                </div>

                                <div className="filter-group">
                                    <label>
                                        <i className="bi bi-calendar-event me-2"></i>
                                        Date Posted
                                    </label>

                                    <select
                                        className="form-select"
                                        value={posted}
                                        onChange={(e) =>
                                            setPosted(e.target.value)
                                        }
                                    >
                                        <option value="">
                                            Any time
                                        </option>

                                        <option value="today">
                                            Today
                                        </option>

                                        <option value="3days">
                                            Last 3 days
                                        </option>

                                        <option value="7days">
                                            Last 7 days
                                        </option>

                                        <option value="30days">
                                            Last 30 days
                                        </option>
                                    </select>
                                </div>

                                <div className="filter-group">
                                    <label>
                                        <i className="bi bi-sort-down me-2"></i>
                                        Sort By
                                    </label>

                                    <select
                                        className="form-select"
                                        value={sort}
                                        onChange={(e) =>
                                            setSort(e.target.value)
                                        }
                                    >
                                        <option value="">
                                            Newest first
                                        </option>

                                        <option value="oldest">
                                            Oldest first
                                        </option>
                                    </select>
                                </div>

                                <button
                                    type="button"
                                    className={`btn w-100 nearby-button ${
                                        nearbyMode
                                            ? "btn-primary"
                                            : "btn-outline-primary"
                                    }`}
                                    onClick={handleNearbyJobs}
                                    disabled={locationLoading}
                                >
                                    {locationLoading ? (
                                        <>
                                            <span
                                                className="spinner-border spinner-border-sm me-2"
                                                role="status"
                                            ></span>
                                            Detecting Location...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-geo-alt-fill me-2"></i>
                                            {nearbyMode
                                                ? "Show All Jobs"
                                                : "Find Nearby Jobs"}
                                        </>
                                    )}
                                </button>

                                {nearbyMode && (
                                    <div className="radius-box">
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <span>
                                                Search Radius
                                            </span>

                                            <strong>
                                                {radius} km
                                            </strong>
                                        </div>

                                        <input
                                            type="range"
                                            className="form-range"
                                            min="1"
                                            max="100"
                                            value={radius}
                                            onChange={handleRadiusChange}
                                        />
                                    </div>
                                )}

                                <button
                                    type="button"
                                    className="btn btn-primary w-100 mt-3"
                                    onClick={handleSearch}
                                >
                                    <i className="bi bi-funnel me-2"></i>
                                    Apply Filters
                                </button>

                                <button
                                    type="button"
                                    className="btn btn-light w-100 mt-2"
                                    onClick={handleClear}
                                >
                                    <i className="bi bi-x-circle me-2"></i>
                                    Clear All
                                </button>

                            </div>
                        </div>

                        <div className="col-lg-9">

                            <div className="results-header">

                                <div>
                                    <span className="results-label">
                                        Job Opportunities
                                    </span>

                                    <h2>
                                        {jobs.length}{" "}
                                        {jobs.length === 1
                                            ? "Job"
                                            : "Jobs"}{" "}
                                        Found
                                    </h2>

                                    {nearbyMode && (
                                        <p className="nearby-active">
                                            <i className="bi bi-geo-alt-fill me-1"></i>
                                            Showing jobs within {radius} km
                                        </p>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    className="btn btn-outline-primary mobile-filter-button"
                                    onClick={handleSearch}
                                >
                                    <i className="bi bi-search me-2"></i>
                                    Refresh
                                </button>

                            </div>

                            {jobs.length === 0 ? (
                                <div className="empty-jobs-card">

                                    <div className="empty-jobs-icon">
                                        <i className="bi bi-search"></i>
                                    </div>

                                    <h4>
                                        No jobs found
                                    </h4>

                                    <p>
                                        We couldn't find jobs matching your
                                        current filters. Try changing your
                                        search criteria.
                                    </p>

                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={handleClear}
                                    >
                                        <i className="bi bi-arrow-counterclockwise me-2"></i>
                                        Clear Filters
                                    </button>

                                </div>
                            ) : (
                                <div className="jobs-list">

                                    {jobs.map((job) => {
                                        const logo =
                                            getCompanyLogo(job);

                                        return (
                                            <div
                                                className="job-card"
                                                key={job.id}
                                            >

                                                <div className="job-card-top">

                                                    <div className="company-logo">

                                                        {logo ? (
                                                            <img
                                                                src={logo}
                                                                alt={
                                                                    job.company?.name ||
                                                                    "Company"
                                                                }
                                                            />
                                                        ) : (
                                                            <span>
                                                                {getCompanyInitial(
                                                                    job
                                                                )}
                                                            </span>
                                                        )}

                                                    </div>

                                                    <div className="job-main">

                                                        <div className="d-flex justify-content-between align-items-start gap-3">

                                                            <div>
                                                                <Link
                                                                    to={`/jobs/${job.id}`}
                                                                    className="job-title"
                                                                >
                                                                    {job.title}
                                                                </Link>

                                                                <div className="company-name">
                                                                    <i className="bi bi-building me-1"></i>

                                                                    {job.company?.name ||
                                                                        "Company"}
                                                                </div>
                                                            </div>

                                                            <span
                                                                className={`job-status ${
                                                                    job.status ===
                                                                    "closed"
                                                                        ? "closed"
                                                                        : "open"
                                                                }`}
                                                            >
                                                                <i
                                                                    className={`bi ${
                                                                        job.status ===
                                                                        "closed"
                                                                            ? "bi-x-circle-fill"
                                                                            : "bi-check-circle-fill"
                                                                    } me-1`}
                                                                ></i>

                                                                {job.status ===
                                                                "closed"
                                                                    ? "Closed"
                                                                    : "Open"}
                                                            </span>

                                                        </div>

                                                        <p className="job-description">
                                                            {job.description?.length >
                                                            180
                                                                ? `${job.description.substring(
                                                                      0,
                                                                      180
                                                                  )}...`
                                                                : job.description}
                                                        </p>

                                                        <div className="job-meta">

                                                            <span>
                                                                <i className="bi bi-geo-alt-fill"></i>
                                                                {job.location ||
                                                                    "Location not specified"}
                                                            </span>

                                                            <span>
                                                                <i
                                                                    className={`bi ${getJobTypeIcon(
                                                                        job.job_type
                                                                    )}`}
                                                                ></i>

                                                                {formatJobType(
                                                                    job.job_type
                                                                )}
                                                            </span>

                                                            {job.salary && (
                                                                <span>
                                                                    <i className="bi bi-cash-stack"></i>
                                                                    {job.salary}
                                                                </span>
                                                            )}

                                                            {job.distance !==
                                                                undefined && (
                                                                <span className="distance-badge">
                                                                    <i className="bi bi-signpost-2-fill"></i>
                                                                    {job.distance} km
                                                                    away
                                                                </span>
                                                            )}

                                                        </div>

                                                        <div className="job-card-bottom">

                                                            <span className="posted-date">
                                                                <i className="bi bi-calendar3 me-1"></i>
                                                                Posted{" "}
                                                                {formatDate(
                                                                    job.created_at
                                                                )}
                                                            </span>

                                                            <Link
                                                                to={`/jobs/${job.id}`}
                                                                className="btn btn-primary btn-sm"
                                                            >
                                                                View Details
                                                                <i className="bi bi-arrow-right ms-2"></i>
                                                            </Link>

                                                        </div>

                                                    </div>

                                                </div>

                                            </div>
                                        );
                                    })}

                                </div>
                            )}

                        </div>

                    </div>
                </div>
            </section>
        </div>
    );
}

export default Jobs;