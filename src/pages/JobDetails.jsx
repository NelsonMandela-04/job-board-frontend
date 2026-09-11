import {
    useEffect,
    useState
} from "react";

import {
    Link,
    useNavigate,
    useParams
} from "react-router-dom";

import api from "../api/axios";
import { getUser } from "../utils/auth";
import "./JobDetails.css";

function JobDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const user = getUser();

    const userId = user?.id || null;

    const isAdmin = Boolean(
        user?.is_staff
    );

    const isEmployer = Boolean(
        user?.is_employer && !isAdmin
    );

    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [saving, setSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState("");

    const [hasApplied, setHasApplied] = useState(false);

    const [
        checkingApplication,
        setCheckingApplication
    ] = useState(true);

    const [
        applicationData,
        setApplicationData
    ] = useState(null);

    useEffect(() => {
        const fetchJob = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await api.get(
                    `jobs/${id}/`
                );

                setJob(response.data);
            } catch (err) {
                console.error(
                    "Unable to load job:",
                    err
                );

                setError(
                    err.response?.data?.detail ||
                        "Unable to load this job."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchJob();
    }, [id]);

    useEffect(() => {
        const checkApplication = async () => {
            if (!userId) {
                setCheckingApplication(false);
                return;
            }

            try {
                setCheckingApplication(true);

                const response = await api.get(
                    "applications/"
                );

                const applications =
                    Array.isArray(response.data)
                        ? response.data
                        : response.data?.results || [];

                const existingApplication =
                    applications.find(
                        (application) =>
                            Number(
                                application.job
                            ) === Number(id) ||
                            Number(
                                application.job_details?.id
                            ) === Number(id)
                    );

                if (existingApplication) {
                    setHasApplied(true);

                    setApplicationData(
                        existingApplication
                    );
                } else {
                    setHasApplied(false);
                    setApplicationData(null);
                }
            } catch (err) {
                console.error(
                    "Unable to check application:",
                    err
                );

                setHasApplied(false);
                setApplicationData(null);
            } finally {
                setCheckingApplication(false);
            }
        };

        checkApplication();
    }, [id, userId]);

    const formatApplicationDate = (date) => {
        if (!date) {
            return "date unavailable";
        }

        return new Date(
            date
        ).toLocaleDateString(
            "en-NG",
            {
                year: "numeric",
                month: "long",
                day: "numeric"
            }
        );
    };

    const formatJobType = (type) => {
        if (!type) {
            return "Not specified";
        }

        return type
            .replace(/_/g, " ")
            .replace(
                /\b\w/g,
                (letter) =>
                    letter.toUpperCase()
            );
    };

    const isJobClosed =
        job?.status === "closed";

    const isOwnCompanyJob =
        Boolean(
            user &&
            job &&
            isAdmin &&
            job.company_details?.owner ===
                user.id
        );

    const handleApply = () => {
        if (!user) {
            navigate("/login");
            return;
        }

        if (isEmployer) {
            return;
        }

        if (isOwnCompanyJob) {
            return;
        }

        if (isJobClosed) {
            return;
        }

        navigate(
            `/jobs/${job.id}/apply`
        );
    };

    const handleSaveJob = async () => {
        if (!user) {
            navigate("/login");
            return;
        }

        setSaving(true);
        setSaveMessage("");

        try {
            await api.post(
                "saved-jobs/",
                {
                    job: job.id
                }
            );

            setSaveMessage(
                "Job saved successfully."
            );
        } catch (err) {
            console.error(
                "SAVE JOB ERROR:",
                err
            );

            if (
                err.response?.status === 400
            ) {
                const detail =
                    err.response?.data?.job;

                if (Array.isArray(detail)) {
                    setSaveMessage(
                        detail[0] ||
                            "Unable to save this job."
                    );
                } else {
                    setSaveMessage(
                        detail ||
                            "You have already saved this job."
                    );
                }
            } else if (
                err.response?.status === 401
            ) {
                setSaveMessage(
                    "Please login to save this job."
                );

                navigate("/login");
            } else if (
                err.response?.status === 403
            ) {
                setSaveMessage(
                    "Your account cannot save jobs."
                );
            } else {
                setSaveMessage(
                    "Unable to save this job."
                );
            }
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="job-details-page">
                <div className="job-details-loading">
                    <div className="loading-spinner" />

                    <p>
                        Loading job details...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="job-details-page">
                <div className="job-details-message">
                    <h2>
                        {error}
                    </h2>

                    <Link
                        to="/jobs"
                        className="back-button"
                    >
                        <i className="bi bi-arrow-left"></i>{" "}
                        Back to Jobs
                    </Link>
                </div>
            </div>
        );
    }

    if (!job) {
        return (
            <div className="job-details-page">
                <div className="job-details-message">
                    <h2>
                        Job not found.
                    </h2>

                    <Link
                        to="/jobs"
                        className="back-button"
                    >
                        <i className="bi bi-arrow-left"></i>{" "}
                        Back to Jobs
                    </Link>
                </div>
            </div>
        );
    }

    const company =
        job.company_details;

    const companyName =
        company?.name ||
        "Company not specified";

    const companyLogo =
        company?.logo;

    const companyInitial =
        companyName
            ?.charAt(0)
            ?.toUpperCase() || "C";

    const canApply =
        Boolean(
            user &&
            !isEmployer &&
            !isOwnCompanyJob &&
            !isJobClosed
        );

    return (
        <div className="job-details-page">
            <div className="job-details-container">

                <Link
                    to="/jobs"
                    className="back-to-jobs"
                >
                    <i className="bi bi-arrow-left"></i>{" "}
                    Back to Jobs
                </Link>

                <div className="job-details-layout">

                    <main className="job-details-main">

                        <header className="job-details-header">

                            {companyLogo ? (
                                <img
                                    src={companyLogo}
                                    alt={`${companyName} logo`}
                                    className="company-logo-placeholder"
                                />
                            ) : (
                                <div className="company-logo-placeholder">
                                    {companyInitial}
                                </div>
                            )}

                            <div className="job-header-info">

                                <h1>
                                    {job.title}
                                </h1>

                                <h2>
                                    {companyName}
                                </h2>

                                <div className="job-meta">

                                    <span>
                                        <i className="bi bi-geo-alt-fill"></i>{" "}
                                        {job.location ||
                                            "Location not specified"}
                                    </span>

                                    <span>
                                        <i className="bi bi-briefcase-fill"></i>{" "}
                                        {formatJobType(
                                            job.job_type
                                        )}
                                    </span>

                                    {job.salary && (
                                        <span>
                                            <i className="bi bi-cash-stack"></i>{" "}
                                            {job.salary}
                                        </span>
                                    )}

                                    <span>
                                        <strong>
                                            Status:
                                        </strong>{" "}
                                        {isJobClosed
                                            ? "Closed"
                                            : "Open"}
                                    </span>

                                </div>

                            </div>

                        </header>

                        {isJobClosed && (
                            <section className="job-section">

                                <h2>
                                    Job Closed
                                </h2>

                                <div className="job-section-content">

                                    <p>
                                        This job is no longer
                                        accepting applications.
                                    </p>

                                </div>

                            </section>
                        )}

                        <section className="job-section">

                            <h2>
                                Job Description
                            </h2>

                            <div className="job-section-content">

                                <p>
                                    {job.description ||
                                        "No description provided."}
                                </p>

                            </div>

                        </section>

                        <section className="job-section">

                            <h2>
                                Requirements
                            </h2>

                            <div className="job-section-content">

                                <p>
                                    {job.requirements ||
                                        "No specific requirements provided."}
                                </p>

                            </div>

                        </section>

                        <section className="job-section">

                            <h2>
                                About the Company
                            </h2>

                            <div className="company-info">

                                {companyLogo ? (
                                    <img
                                        src={companyLogo}
                                        alt={`${companyName} logo`}
                                        className="company-logo-small"
                                    />
                                ) : (
                                    <div className="company-logo-small">
                                        {companyInitial}
                                    </div>
                                )}

                                <div>

                                    <h3>
                                        {companyName}
                                    </h3>

                                    {company?.description && (
                                        <p>
                                            {company.description}
                                        </p>
                                    )}

                                    {company?.location && (
                                        <p>
                                            <i className="bi bi-geo-alt-fill"></i>{" "}
                                            {company.location}
                                        </p>
                                    )}

                                    {company?.website && (
                                        <p>
                                            <a
                                                href={
                                                    company.website
                                                }
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                Visit Company Website
                                            </a>
                                        </p>
                                    )}

                                </div>

                            </div>

                        </section>

                    </main>

                    <aside className="job-details-sidebar">

                        <div className="application-card">

                            <h2>
                                Apply for this job
                            </h2>

                            {isJobClosed ? (

                                <div className="already-applied">

                                    <h3>
                                        Applications Closed
                                    </h3>

                                    <p>
                                        This job is currently
                                        closed and is no longer
                                        accepting applications.
                                    </p>

                                </div>

                            ) : isOwnCompanyJob ? (

                                <div className="already-applied">

                                    <h3>
                                        Your Company Job
                                    </h3>

                                    <p>
                                        You cannot apply to a job
                                        posted by your own company.
                                    </p>

                                </div>

                            ) : isEmployer ? (

                                <div className="already-applied">

                                    <h3>
                                        Employer Account
                                    </h3>

                                    <p>
                                        Employer accounts cannot
                                        apply for jobs.
                                    </p>

                                </div>

                            ) : checkingApplication ? (

                                <div className="application-checking">

                                    <div className="small-spinner" />

                                    <span>
                                        Checking application...
                                    </span>

                                </div>

                            ) : hasApplied ? (

                                <div className="already-applied">

                                    <div className="success-icon">
                                        <i className="bi bi-check-circle-fill"></i>
                                    </div>

                                    <h3>
                                        Application Submitted
                                    </h3>

                                    <p>
                                        You have already applied
                                        for this job at{" "}
                                        {companyName}.
                                    </p>

                                    <p className="application-date">
                                        Applied on{" "}
                                        {formatApplicationDate(
                                            applicationData?.applied_at
                                        )}
                                    </p>

                                </div>

                            ) : (

                                <button
                                    type="button"
                                    className="apply-button"
                                    onClick={
                                        handleApply
                                    }
                                    disabled={
                                        !canApply
                                    }
                                >
                                    <i className="bi bi-send-fill"></i>{" "}
                                    Apply Now
                                </button>

                            )}

                            <button
                                type="button"
                                className="save-button"
                                onClick={
                                    handleSaveJob
                                }
                                disabled={
                                    saving
                                }
                            >

                                {saving ? (

                                    <>
                                        <span>
                                            Saving...
                                        </span>
                                    </>

                                ) : (

                                    <>
                                        <i className="bi bi-bookmark"></i>{" "}
                                        Save Job
                                    </>

                                )}

                            </button>

                            {saveMessage && (
                                <p
                                    className={`save-message ${
                                        saveMessage.includes(
                                            "successfully"
                                        )
                                            ? "success"
                                            : ""
                                    }`}
                                >
                                    {saveMessage}
                                </p>
                            )}

                        </div>

                        <div className="job-overview-card">

                            <h2>
                                Job Overview
                            </h2>

                            <div className="overview-item">

                                <span className="overview-label">
                                    Job Type
                                </span>

                                <strong>
                                    {formatJobType(
                                        job.job_type
                                    )}
                                </strong>

                            </div>

                            <div className="overview-item">

                                <span className="overview-label">
                                    Location
                                </span>

                                <strong>
                                    {job.location ||
                                        "Not specified"}
                                </strong>

                            </div>

                            <div className="overview-item">

                                <span className="overview-label">
                                    Salary
                                </span>

                                <strong>
                                    {job.salary ||
                                        "Not specified"}
                                </strong>

                            </div>

                            <div className="overview-item">

                                <span className="overview-label">
                                    Status
                                </span>

                                <strong>
                                    {isJobClosed
                                        ? "Closed"
                                        : "Open"}
                                </strong>

                            </div>

                        </div>

                    </aside>

                </div>

            </div>
        </div>
    );
}

export default JobDetails;