import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { getUser } from "../utils/auth";
import "./ResumeUpload.css";

function ResumeUpload() {
    const navigate = useNavigate();
    const user = getUser();

    const [file, setFile] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    if (!user) {
        return (
            <div className="resume-auth-page">
                <div className="resume-auth-overlay"></div>

                <div className="resume-auth-card">
                    <div className="resume-brand-icon">
                        <i className="bi bi-lock-fill"></i>
                    </div>

                    <span className="resume-small-label">
                        EZITECH TECHNOLOGIES
                    </span>

                    <h1>
                        Login Required
                    </h1>

                    <p>
                        You need to log in before uploading
                        your resume and applying for jobs.
                    </p>

                    <Link
                        to="/login"
                        className="resume-login-button"
                    >
                        <i className="bi bi-box-arrow-in-right"></i>
                        <span>Login to Continue</span>
                    </Link>

                    <Link
                        to="/"
                        className="resume-back-link"
                    >
                        <i className="bi bi-arrow-left"></i>
                        Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    const handleFileChange = (event) => {
        const selectedFile =
            event.target.files[0];

        setError("");
        setSuccess("");

        if (!selectedFile) {
            setFile(null);
            return;
        }

        const allowedTypes = [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ];

        if (!allowedTypes.includes(selectedFile.type)) {
            setFile(null);
            setError(
                "Please select a PDF, DOC, or DOCX file."
            );
            return;
        }

        setFile(selectedFile);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!file) {
            setError(
                "Please select a resume file first."
            );
            return;
        }

        setError("");
        setSuccess("");
        setLoading(true);

        const formData = new FormData();

        formData.append(
            "file",
            file
        );

        try {
            await api.post(
                "resumes/",
                formData,
                {
                    headers: {
                        "Content-Type":
                            "multipart/form-data"
                    }
                }
            );

            setSuccess(
                "Your resume has been uploaded successfully."
            );

            setTimeout(() => {
                navigate("/dashboard");
            }, 1200);
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.detail ||
                "Unable to upload your resume. Please check the file format and size."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="resume-upload-page">

            <div className="resume-background-overlay"></div>

            <div className="resume-upload-container">

                <div className="resume-upload-card">

                    <div className="resume-card-header">

                        <div className="resume-icon">
                            <i className="bi bi-file-earmark-person-fill"></i>
                        </div>

                        <span className="resume-label">
                            EZITECH TECHNOLOGIES
                        </span>

                        <h1>
                            Upload Your Resume
                        </h1>

                        <p>
                            Add your latest resume to your
                            profile and make it easier for
                            employers to discover your skills.
                        </p>

                    </div>

                    {error && (
                        <div className="resume-alert resume-alert-error">
                            <i className="bi bi-exclamation-circle-fill"></i>

                            <span>
                                {error}
                            </span>
                        </div>
                    )}

                    {success && (
                        <div className="resume-alert resume-alert-success">
                            <i className="bi bi-check-circle-fill"></i>

                            <span>
                                {success}
                            </span>
                        </div>
                    )}

                    <form
                        onSubmit={handleSubmit}
                        className="resume-form"
                    >

                        <label
                            htmlFor="resume-file"
                            className={`resume-dropzone ${
                                file
                                    ? "has-file"
                                    : ""
                            }`}
                        >

                            <input
                                id="resume-file"
                                type="file"
                                accept=".pdf,.doc,.docx"
                                onChange={
                                    handleFileChange
                                }
                                required
                            />

                            <div className="upload-file-icon">
                                <i className="bi bi-cloud-arrow-up-fill"></i>
                            </div>

                            {file ? (
                                <>
                                    <h3>
                                        Resume Selected
                                    </h3>

                                    <p className="selected-file-name">
                                        {file.name}
                                    </p>

                                    <span className="change-file">
                                        Click to change file
                                    </span>
                                </>
                            ) : (
                                <>
                                    <h3>
                                        Choose your resume
                                    </h3>

                                    <p>
                                        Click here to browse
                                        your computer
                                    </p>

                                    <span className="file-types">
                                        PDF, DOC or DOCX
                                    </span>
                                </>
                            )}

                        </label>

                        <div className="resume-requirements">

                            <div className="requirement-item">
                                <i className="bi bi-check2"></i>
                                <span>
                                    PDF, DOC or DOCX format
                                </span>
                            </div>

                            <div className="requirement-item">
                                <i className="bi bi-check2"></i>
                                <span>
                                    Use your most recent resume
                                </span>
                            </div>

                            <div className="requirement-item">
                                <i className="bi bi-check2"></i>
                                <span>
                                    Make sure your contact details are correct
                                </span>
                            </div>

                        </div>

                        <button
                            type="submit"
                            className="resume-upload-button"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="button-spinner"></span>
                                    Uploading Resume...
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-cloud-upload-fill"></i>
                                    Upload Resume
                                </>
                            )}
                        </button>

                    </form>

                    <div className="resume-footer">

                        <Link
                            to="/dashboard"
                            className="resume-back-link"
                        >
                            <i className="bi bi-arrow-left"></i>
                            Back to Dashboard
                        </Link>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default ResumeUpload;