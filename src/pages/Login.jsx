import { useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import api from "../api/axios";

import { getErrorMessage } from "../utils/errorHandler";

import { saveAuth } from "../utils/auth";

import "./Login.css";

function Login() {
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");

        if (!username.trim() || !password) {
            setError(
                "Please enter your username and password."
            );
            return;
        }

        try {
            setLoading(true);

            const response = await api.post("login/", {
                username: username.trim(),
                password,
            });

            const data = response.data;

            saveAuth(data);

            if (data.user?.is_staff) {
                navigate("/admin-dashboard");
            } else {
                navigate("/");
            }
        } catch (err) {
            console.error("Login error:", err);

            setError(
                getErrorMessage(
                    err,
                    "Unable to log in. Please check your details and try again."
                )
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <section className="login-brand-section">
                <div className="brand-content">
                    <div className="brand-logo">
                        EZ
                    </div>

                    <h1>
                        Ezitech
                        <span> Technologies</span>
                    </h1>

                    <p className="brand-tagline">
                        Connecting talented people with
                        meaningful opportunities.
                    </p>

                    <div className="brand-features">
                        <div className="brand-feature">
                            <div className="feature-icon">
                                <i className="bi bi-check-circle-fill"></i>
                            </div>

                            <div>
                                <strong>
                                    Discover opportunities
                                </strong>

                                <p>
                                    Find jobs that match your skills
                                    and career goals.
                                </p>
                            </div>
                        </div>

                        <div className="brand-feature">
                            <div className="feature-icon">
                                <i className="bi bi-check-circle-fill"></i>
                            </div>

                            <div>
                                <strong>
                                    Build your career
                                </strong>

                                <p>
                                    Apply for jobs and take the next
                                    step in your professional journey.
                                </p>
                            </div>
                        </div>

                        <div className="brand-feature">
                            <div className="feature-icon">
                                <i className="bi bi-check-circle-fill"></i>
                            </div>

                            <div>
                                <strong>
                                    Connect with companies
                                </strong>

                                <p>
                                    Connect with organizations looking
                                    for talented professionals.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="login-form-section">
                <div className="login-card">
                    <div className="mobile-logo">
                        <div className="brand-logo">
                            EZ
                        </div>

                        <div>
                            <strong>
                                Ezitech
                            </strong>

                            <span>
                                Technologies
                            </span>
                        </div>
                    </div>

                    <div className="login-header">
                        <div className="welcome-icon">
                            <i className="bi bi-person-check-fill"></i>
                        </div>

                        <h2>
                            Welcome back!
                        </h2>

                        <p>
                            Sign in to your Ezitech Technologies
                            account to continue.
                        </p>
                    </div>

                    {error && (
                        <div className="login-error">
                            <span className="error-icon">
                                !
                            </span>

                            <span>
                                {error}
                            </span>
                        </div>
                    )}

                    <form
                        className="login-form"
                        onSubmit={handleSubmit}
                    >
                        <div className="form-group">
                            <label htmlFor="username">
                                Username
                            </label>

                            <div className="input-wrapper">
                                <span className="input-icon">
                                    
                                </span>

                                <input
                                    id="username"
                                    type="text"
                                    placeholder="Enter your username"
                                    value={username}
                                    onChange={(event) =>
                                        setUsername(
                                            event.target.value
                                        )
                                    }
                                    autoComplete="username"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <div className="password-label-row">
                                <label htmlFor="password">
                                    Password
                                </label>

                                <Link
                                    to="/forgot-password"
                                    className="forgot-password"
                                >
                                    Forgot password?
                                </Link>
                            </div>

                            <div className="input-wrapper">
                                <span className="input-icon">
                                    
                                </span>

                                <input
                                    id="password"
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(event) =>
                                        setPassword(
                                            event.target.value
                                        )
                                    }
                                    autoComplete="current-password"
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
                                    aria-label={
                                        showPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                >
                                    {showPassword
                                        ? <i className="bi bi-eye-slash-fill"></i>
                                        : <i className="bi bi-eye-fill"></i>}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="login-button"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="button-spinner"></span>
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    Sign In
                                    <span className="button-arrow">
                                        <i className="bi bi-arrow-right"></i>
                                    </span>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="register-section">
                        <p>
                            Don't have an account with
                            <strong>
                                {" "}Ezitech Technologies
                            </strong>
                            ?
                        </p>

                        <Link
                            to="/register"
                            className="create-account-link"
                        >
                            Create Account
                            <span>
                                <i className="bi bi-arrow-right"></i>
                            </span>
                        </Link>
                    </div>

                    <div className="login-footer">
                        <p>
                            © {new Date().getFullYear()} Ezitech Technologies.
                            All rights reserved.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Login;