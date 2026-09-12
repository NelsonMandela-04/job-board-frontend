
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import { getErrorMessage } from "../utils/errorHandler";
import "./ResetPassword.css";

function ResetPassword() {
    const { uid, token } = useParams();
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();

        setMessage("");
        setError("");

        if (!uid || !token) {
            setError("This password reset link is invalid.");
            return;
        }

        if (!password) {
            setError("Please enter a new password.");
            return;
        }

        if (password.length < 8) {
            setError("Password must be at least 8 characters long.");
            return;
        }

        if (!confirmPassword) {
            setError("Please confirm your new password.");
            return;
        }

        if (password !== confirmPassword) {
            setError("The passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            console.log("RESET REQUEST:", {
                uid: uid,
                token: token,
                password: password
            });

            const response = await api.post(
                "password-reset-confirm/",
                {
                    uid: uid,
                    token: token,
                    password: password
                }
            );

            setMessage(
                response.data?.detail ||
                response.data?.message ||
                "Your password has been changed successfully."
            );

            setSuccess(true);
            setPassword("");
            setConfirmPassword("");
        } catch (err) {
            setError(
                getErrorMessage(
                    err,
                    "Unable to reset your password. Please try again."
                )
            );
        } finally {
            setLoading(false);
        }
    };

    const handleGoToLogin = () => {
        navigate("/login");
    };

    return (
        <div className="reset-password-page">
            <section className="reset-password-brand">
                <div className="reset-brand-content">
                    <div className="reset-brand-logo">
                        Ezitech Technologies JB
                    </div>

                    <h1>
                        Secure your account.
                    </h1>

                    <p>
                        Create a new password and get back
                        to discovering opportunities, applying
                        for jobs, and managing your career.
                    </p>

                    <div className="reset-brand-features">
                        <div className="reset-brand-feature">
                            <span className="reset-feature-icon">
                                <i className="bi bi-check-circle-fill"></i>
                            </span>

                            <span>
                                Protect your account
                            </span>
                        </div>

                        <div className="reset-brand-feature">
                            <span className="reset-feature-icon">
                                <i className="bi bi-check-circle-fill"></i>
                            </span>

                            <span>
                                Use a strong password
                            </span>
                        </div>

                        <div className="reset-brand-feature">
                            <span className="reset-feature-icon">
                                <i className="bi bi-check-circle-fill"></i>
                            </span>

                            <span>
                                Get back to your job search
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            <section className="reset-password-form-section">
                <div className="reset-password-card">
                    <div className="reset-mobile-brand">
                        <div className="reset-mobile-logo">
                            JB
                        </div>

                        <span>
                            Job Board
                        </span>
                    </div>

                    {success ? (
                        <div className="reset-success-container">
                            <div className="reset-success-icon">
                                <i className="bi bi-check-circle-fill"></i>
                            </div>

                            <h2>
                                Password changed!
                            </h2>

                            <p>
                                Your password has been successfully
                                updated. You can now sign in using
                                your new password.
                            </p>

                            <button
                                type="button"
                                className="reset-login-button"
                                onClick={handleGoToLogin}
                            >
                                Go to Login
                            </button>

                            <Link
                                to="/"
                                className="reset-home-link"
                            >
                                Return to Home
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="reset-form-header">
                                <div className="reset-lock-icon">
                                    <i className="bi bi-shield-lock-fill"></i>
                                </div>

                                <h2>
                                    Create a new password
                                </h2>

                                <p>
                                    Choose a strong password for
                                    your account. Make sure it is
                                    at least 8 characters long.
                                </p>
                            </div>

                            {error && (
                                <div className="reset-error-message">
                                    <span className="reset-message-icon">
                                        !
                                    </span>

                                    <span>
                                        {error}
                                    </span>
                                </div>
                            )}

                            {message && !success && (
                                <div className="reset-success-message">
                                    <span className="reset-message-icon">
                                        <i className="bi bi-check-circle-fill"></i>
                                    </span>

                                    <span>
                                        {message}
                                    </span>
                                </div>
                            )}

                            <form
                                onSubmit={handleSubmit}
                                className="reset-password-form"
                            >
                                <div className="reset-form-group">
                                    <label htmlFor="password">
                                        New password
                                    </label>

                                    <div className="reset-password-input-wrapper">
                                        <input
                                            id="password"
                                            type={
                                                showPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            value={password}
                                            onChange={(event) =>
                                                setPassword(
                                                    event.target.value
                                                )
                                            }
                                            placeholder="Enter your new password"
                                            autoComplete="new-password"
                                            disabled={loading}
                                        />

                                        <button
                                            type="button"
                                            className="password-toggle"
                                            onClick={() =>
                                                setShowPassword(
                                                    !showPassword
                                                )
                                            }
                                            disabled={loading}
                                            aria-label={
                                                showPassword
                                                    ? "Hide password"
                                                    : "Show password"
                                            }
                                        >
                                            {showPassword
                                                ? "Hide"
                                                : "Show"}
                                        </button>
                                    </div>
                                </div>

                                <div className="reset-form-group">
                                    <label htmlFor="confirmPassword">
                                        Confirm new password
                                    </label>

                                    <div className="reset-password-input-wrapper">
                                        <input
                                            id="confirmPassword"
                                            type={
                                                showConfirmPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            value={confirmPassword}
                                            onChange={(event) =>
                                                setConfirmPassword(
                                                    event.target.value
                                                )
                                            }
                                            placeholder="Confirm your new password"
                                            autoComplete="new-password"
                                            disabled={loading}
                                        />

                                        <button
                                            type="button"
                                            className="password-toggle"
                                            onClick={() =>
                                                setShowConfirmPassword(
                                                    !showConfirmPassword
                                                )
                                            }
                                            disabled={loading}
                                            aria-label={
                                                showConfirmPassword
                                                    ? "Hide password"
                                                    : "Show password"
                                            }
                                        >
                                            {showConfirmPassword
                                                ? "Hide"
                                                : "Show"}
                                        </button>
                                    </div>
                                </div>

                                <div className="password-requirements">
                                    <div className="requirements-title">
                                        Password requirements
                                    </div>

                                    <div
                                        className={
                                            password.length >= 8
                                                ? "requirement valid"
                                                : "requirement"
                                        }
                                    >
                                        <span>
                                            {password.length >= 8 ? (
                                                <i className="bi bi-check-circle-fill"></i>
                                            ) : (
                                                <i className="bi bi-circle"></i>
                                            )}
                                        </span>

                                        At least 8 characters
                                    </div>

                                    <div
                                        className={
                                            password &&
                                            confirmPassword &&
                                            password === confirmPassword
                                                ? "requirement valid"
                                                : "requirement"
                                        }
                                    >
                                        <span>
                                            {password &&
                                            confirmPassword &&
                                            password === confirmPassword ? (
                                                <i className="bi bi-check-circle-fill"></i>
                                            ) : (
                                                <i className="bi bi-circle"></i>
                                            )}
                                        </span>

                                        Passwords match
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="reset-submit-button"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <span className="reset-spinner"></span>
                                            Changing password...
                                        </>
                                    ) : (
                                        "Change password"
                                    )}
                                </button>
                            </form>

                            <div className="reset-back-login">
                                <Link to="/login">
                                    <span>
                                        <i className="bi bi-arrow-left"></i>
                                    </span>

                                    Back to Login
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </section>
        </div>
    );
}

export default ResetPassword;

