import { useState } from "react";
import { Link } from "react-router-dom";

import api from "../api/axios";
import { getErrorMessage } from "../utils/errorHandler";

import "./ForgotPassword.css";


function ForgotPassword() {
    const [email, setEmail] = useState("");

    const [loading, setLoading] = useState(false);

    const [message, setMessage] = useState("");

    const [error, setError] = useState("");


    const handleSubmit = async (event) => {
        event.preventDefault();

        setMessage("");
        setError("");

        const trimmedEmail = email.trim();

        if (!trimmedEmail) {
            setError("Please enter your email address.");
            return;
        }

        setLoading(true);

        try {
            const response = await api.post(
                "password-reset/",
                {
                    email: trimmedEmail,
                }
            );

            setMessage(
                response.data?.message ||
                "If an account exists with that email, a password reset link has been sent."
            );

            setEmail("");
        } catch (err) {
            setError(
                getErrorMessage(
                    err,
                    "Unable to process your request. Please try again."
                )
            );
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="forgot-password-page">

            {/* LEFT BRANDING SECTION */}
            <section className="forgot-password-brand">

                <div className="brand-content">

                    <div className="brand-logo">
                       ET
                    </div>

                    <h1>
                        Find your next opportunity.
                    </h1>

                    <p>
                        Welcome back to your professional
                        job search platform. Discover jobs,
                        connect with companies, and take the
                        next step in your career.
                    </p>

                    <div className="brand-features">

                        <div className="brand-feature">
                            <span className="feature-icon">
                                <i className="bi bi-check-circle-fill"></i>
                            </span>

                            <span>
                                Discover exciting job opportunities
                            </span>
                        </div>

                        <div className="brand-feature">
                            <span className="feature-icon">
                                <i className="bi bi-check-circle-fill"></i>
                            </span>

                            <span>
                                Apply to jobs with ease
                            </span>
                        </div>

                        <div className="brand-feature">
                            <span className="feature-icon">
                                <i className="bi bi-check-circle-fill"></i>
                            </span>

                            <span>
                                Manage your applications
                            </span>
                        </div>

                    </div>

                </div>

            </section>


            {/* RIGHT FORM SECTION */}
            <section className="forgot-password-form-section">

                <div className="forgot-password-card">

                    <div className="mobile-brand">
                        <div className="brand-logo">
                            JB
                        </div>

                        <span>
                            Job Board
                        </span>
                    </div>


                    <div className="form-header">

                        <div className="lock-icon">
                            <i className="bi bi-shield-lock-fill"></i>
                        </div>

                        <h2>
                            Forgot your password?
                        </h2>

                        <p>
                            No worries. Enter the email address
                            associated with your account and
                            we'll help you reset your password.
                        </p>

                    </div>


                    {/* SUCCESS MESSAGE */}
                    {message && (
                        <div className="success-message">
                            <span className="message-icon">
                                <i className="bi bi-check-circle-fill"></i>
                            </span>

                            <div>
                                <strong>
                                    Check your email
                                </strong>

                                <p>
                                    {message}
                                </p>
                            </div>
                        </div>
                    )}


                    {/* ERROR MESSAGE */}
                    {error && (
                        <div className="error-message">
                            <span className="message-icon">
                                !
                            </span>

                            <span>
                                {error}
                            </span>
                        </div>
                    )}


                    <form
                        onSubmit={handleSubmit}
                        className="forgot-password-form"
                    >

                        <div className="form-group">

                            <label htmlFor="email">
                                Email address
                            </label>

                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={email}
                                onChange={(event) =>
                                    setEmail(event.target.value)
                                }
                                placeholder="Enter your email address"
                                autoComplete="email"
                                disabled={loading}
                            />

                        </div>


                        <button
                            type="submit"
                            className="reset-button"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner"></span>
                                    Sending...
                                </>
                            ) : (
                                "Send reset link"
                            )}
                        </button>

                    </form>


                    <div className="back-to-login">

                        <Link to="/login">
                            <span>
                                <i className="bi bi-arrow-left"></i>
                            </span>

                            Back to Login
                        </Link>

                    </div>


                    <div className="security-note">

                        <span className="security-icon">
                            <i className="bi bi-shield-check"></i>
                        </span>

                        <p>
                            For your security, we don't reveal
                            whether an email address is registered
                            with an account.
                        </p>

                    </div>

                </div>

            </section>

        </div>
    );
}


export default ForgotPassword;