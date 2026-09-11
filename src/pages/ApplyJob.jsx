import { useEffect, useState } from "react";

import {
    Link,
    useNavigate,
    useParams,
} from "react-router-dom";

import api from "../api/axios";
import { getUser } from "../utils/auth";
import "./ApplyJob.css";

function ApplyJob() {
    const { id } = useParams();
    const navigate = useNavigate();

    const user = getUser();
    const isLoggedIn = Boolean(user);

    const [coverLetter, setCoverLetter] = useState("");
    const [existingResume, setExistingResume] = useState(null);
    const [loadingResume, setLoadingResume] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        if (!isLoggedIn) {
            setLoadingResume(false);
            return;
        }

        let isMounted = true;

        const fetchResume = async () => {
            try {
                setLoadingResume(true);

                const response = await api.get("profile/");

                if (!isMounted) {
                    return;
                }

                const resume = response.data?.resume || null;

                setExistingResume(resume);

                if (resume) {
                    setError("");
                }
            } catch (err) {
                console.error(
                    "RESUME FETCH ERROR:",
                    err
                );

                if (!isMounted) {
                    return;
                }

                setExistingResume(null);

                const responseData =
                    err.response?.data;

                if (responseData?.detail) {
                    setError(
                        responseData.detail
                    );
                } else {
                    setError(
                        "Unable to load your resume. Please try again."
                    );
                }
            } finally {
                if (isMounted) {
                    setLoadingResume(false);
                }
            }
        };

        fetchResume();

        return () => {
            isMounted = false;
        };
    }, [isLoggedIn]);

    if (!isLoggedIn) {
        return (
            <div className="apply-page">
                <div className="apply-login-card">
                    <div className="apply-login-icon">
                        <i className="bi bi-lock-fill"></i>
                    </div>

                    <h1>
                        Login Required
                    </h1>

                    <p>
                        You need to log in before
                        applying for a job.
                    </p>

                    <Link
                        to="/login"
                        className="apply-login-button"
                    >
                        <i className="bi bi-box-arrow-in-right"></i>
                        Login to Continue
                    </Link>

                    <Link
                        to={`/jobs/${id}`}
                        className="apply-back-link"
                    >
                        <i className="bi bi-arrow-left"></i>
                        Back to Job
                    </Link>
                </div>
            </div>
        );
    }

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        const trimmedCoverLetter =
            coverLetter.trim();

        if (!trimmedCoverLetter) {
            setError(
                "Please write a cover letter."
            );
            return;
        }

        if (trimmedCoverLetter.length < 50) {
            setError(
                "Your cover letter should contain at least 50 characters."
            );
            return;
        }

        if (!existingResume) {
            setError(
                "Please upload a resume from your Profile before applying."
            );
            return;
        }

        setLoading(true);

        try {
            const response = await api.post(
                "applications/",
                {
                    job: id,
                    cover_letter: trimmedCoverLetter,
                }
            );

            console.log(
                "APPLICATION CREATED:",
                response.data
            );

            setSuccess(
                "Application submitted successfully."
            );

            setCoverLetter("");

            setTimeout(() => {
                navigate("/applications");
            }, 1500);
        } catch (err) {
            console.error(
                "APPLICATION SUBMISSION ERROR:",
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

            const responseData =
                err.response?.data;

            if (responseData?.detail) {
                setError(
                    responseData.detail
                );
            } else if (responseData?.job) {
                setError(
                    Array.isArray(responseData.job)
                        ? responseData.job.join(" ")
                        : responseData.job
                );
            } else if (
                responseData?.cover_letter
            ) {
                setError(
                    Array.isArray(
                        responseData.cover_letter
                    )
                        ? responseData.cover_letter.join(" ")
                        : responseData.cover_letter
                );
            } else if (responseData?.resume) {
                setError(
                    Array.isArray(
                        responseData.resume
                    )
                        ? responseData.resume.join(" ")
                        : responseData.resume
                );
            } else if (
                responseData &&
                typeof responseData === "object"
            ) {
                const messages =
                    Object.values(responseData)
                        .flat()
                        .filter(Boolean);

                if (messages.length) {
                    setError(
                        messages.join(" ")
                    );
                } else {
                    setError(
                        "Unable to submit application."
                    );
                }
            } else if (
                typeof responseData === "string"
            ) {
                setError(responseData);
            } else {
                setError(
                    "Unable to submit application. Please try again."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="apply-page">
            <div className="apply-page-header">
                <Link
                    to={`/jobs/${id}`}
                    className="apply-top-back"
                >
                    <i className="bi bi-arrow-left"></i>
                    Back to Job
                </Link>

                <div className="apply-title-icon">
                    <i className="bi bi-send-fill"></i>
                </div>

                <h1>
                    Apply for Job
                </h1>

                <p>
                    Complete your application below
                    and submit it directly to the employer.
                </p>
            </div>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            {success && (
                <div className="success-message">
                    {success}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="application-form-heading">
                    <div>
                        <span className="form-step-number">
                            1
                        </span>
                    </div>

                    <div>
                        <h2>
                            Cover Letter
                        </h2>

                        <p>
                            Tell the employer why
                            you are a strong candidate
                            for this position.
                        </p>
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="cover-letter">
                        Cover Letter
                    </label>

                    <textarea
                        id="cover-letter"
                        value={coverLetter}
                        onChange={(event) => {
                            setCoverLetter(
                                event.target.value
                            );
                            setError("");
                            setSuccess("");
                        }}
                        placeholder={`Dear Hiring Manager,

I am writing to express my interest in this position. I believe my skills, experience, and qualifications make me a strong candidate for the role...`}
                        rows="10"
                        maxLength="5000"
                        required
                    />

                    <div className="character-counter">
                        <span>
                            {coverLetter.length} / 5000 characters
                        </span>

                        {coverLetter.length >= 50 && (
                            <span className="counter-valid">
                                <i className="bi bi-check-circle-fill"></i>
                                Minimum reached
                            </span>
                        )}
                    </div>
                </div>

                <div className="application-divider"></div>

                <div className="application-form-heading">
                    <div>
                        <span className="form-step-number">
                            2
                        </span>
                    </div>

                    <div>
                        <h2>
                            Your Resume
                        </h2>

                        <p>
                            Your saved profile resume
                            will be attached to this application.
                        </p>
                    </div>
                </div>

                <div className="form-group">
                    <label>
                        Resume / CV
                    </label>

                    {loadingResume ? (
                        <div className="resume-loading">
                            <span className="resume-loading-spinner"></span>

                            <div>
                                <strong>
                                    Loading your resume...
                                </strong>

                                <span>
                                    Please wait.
                                </span>
                            </div>
                        </div>
                    ) : existingResume ? (
                        <div className="existing-resume">
                            <div className="existing-resume-icon">
                                <i className="bi bi-file-earmark-person-fill"></i>
                            </div>

                            <div className="existing-resume-info">
                                <strong>
                                    {existingResume.name ||
                                        "Your Resume"}
                                </strong>

                                <span>
                                    Saved to your profile
                                </span>

                                {existingResume.uploaded_at && (
                                    <small>
                                        Uploaded{" "}
                                        {new Date(
                                            existingResume.uploaded_at
                                        ).toLocaleDateString()}
                                    </small>
                                )}
                            </div>

                            <div className="existing-resume-actions">
                                {existingResume.file && (
                                    <a
                                        href={
                                            existingResume.file
                                        }
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="view-resume-button"
                                    >
                                        <i className="bi bi-eye-fill"></i>
                                        View
                                    </a>
                                )}

                                <Link
                                    to="/profile"
                                    className="change-resume-button"
                                >
                                    <i className="bi bi-pencil-square"></i>
                                    Change
                                </Link>
                            </div>

                            <div className="resume-status">
                                <i className="bi bi-check-circle-fill"></i>
                            </div>
                        </div>
                    ) : (
                        <div className="no-resume">
                            <div className="no-resume-icon">
                                <i className="bi bi-file-earmark-x-fill"></i>
                            </div>

                            <div className="no-resume-content">
                                <strong>
                                    No resume found
                                </strong>

                                <p>
                                    You need to upload a resume
                                    to your profile before
                                    applying for this job.
                                </p>

                                <Link
                                    to="/profile"
                                    className="upload-resume-button"
                                >
                                    <i className="bi bi-cloud-arrow-up-fill"></i>
                                    Upload Resume
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                <div className="application-notice">
                    <div className="application-notice-icon">
                        <i className="bi bi-shield-check"></i>
                    </div>

                    <div>
                        <strong>
                            Your application is secure
                        </strong>

                        <p>
                            Your resume and cover letter
                            will only be shared with the
                            employer reviewing this
                            application.
                        </p>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={
                        loading ||
                        loadingResume ||
                        !existingResume
                    }
                >
                    {loading ? (
                        <>
                            <span className="submit-spinner"></span>
                            Submitting Application...
                        </>
                    ) : (
                        <>
                            <i className="bi bi-send-fill"></i>
                            Submit Application
                        </>
                    )}
                </button>
            </form>

            <div className="apply-footer">
                <Link to={`/jobs/${id}`}>
                    <i className="bi bi-arrow-left"></i>
                    Return to Job Details
                </Link>
            </div>
        </div>
    );
}

export default ApplyJob;