import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import api from "../api/axios";
import { getUser } from "../utils/auth";

import "./SavedJobs.css";

function SavedJobs() {
    const user = getUser();

    const [savedJobs, setSavedJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchSavedJobs = async () => {
            try {
                const response = await api.get("saved-jobs/");
                setSavedJobs(response.data);
            } catch (err) {
                console.error(err);

                setError(
                    err.response?.data?.detail ||
                    "Unable to load saved jobs."
                );
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchSavedJobs();
        } else {
            setLoading(false);
        }
    }, [user]);

    if (!user) {
        return (
            <div className="saved-jobs-login">
                <div className="saved-jobs-login-card">
                    <h1>Saved Jobs</h1>

                    <p>
                        Please log in to view your saved jobs at Ezitech Technologies.
                    </p>

                    <Link
                        to="/login"
                        className="saved-jobs-login-link"
                    >
                        Login
                    </Link>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="saved-jobs-loading">
                Loading saved jobs...
            </div>
        );
    }

    if (error) {
        return (
            <div className="saved-jobs-page">
                <div className="saved-jobs-error">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <main className="saved-jobs-page">
            <div className="saved-jobs-container">
                <div className="saved-jobs-header">
                    <h1>Saved Jobs</h1>
                    <p>
                        Jobs you have saved for later.
                    </p>
                </div>

                {savedJobs.length === 0 ? (
                    <div className="saved-jobs-empty">
                        <div className="saved-jobs-empty-icon">
                            <i className="bi bi-bookmark-heart-fill"></i>
                        </div>

                        <h2>No Saved Jobs Yet</h2>

                        <p>
                            You haven't saved any jobs yet at Ezitech Technologies.
                            Browse available jobs and save the ones you are interested in.
                        </p>

                        <Link
                            to="/jobs"
                            className="saved-jobs-browse"
                        >
                            Browse Jobs
                        </Link>
                    </div>
                ) : (
                    <div className="saved-jobs-list">
                        {savedJobs.map((savedJob) => (
                            <article
                                className="saved-job-card"
                                key={savedJob.id}
                            >
                                <h2 className="saved-job-title">
                                    {savedJob.job_details?.title || "Untitled Job"}
                                </h2>

                                <div className="saved-job-info">
                                    <p>
                                        <strong>Company:</strong>
                                        <span>
                                            {savedJob.job_details?.company?.name || "Not specified"}
                                        </span>
                                    </p>

                                    <p>
                                        <strong>Location:</strong>
                                        <span>
                                            {savedJob.job_details?.location || "Not specified"}
                                        </span>
                                    </p>
                                </div>

                                <div className="saved-job-saved">
                                    Saved on{" "}
                                    {new Date(
                                        savedJob.saved_at
                                    ).toLocaleDateString()}
                                </div>

                                <div className="saved-job-actions">
                                    <Link
                                        to={`/jobs/${savedJob.job_details?.id}`}
                                        className="saved-job-view"
                                    >
                                        View Job
                                    </Link>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}

export default SavedJobs;