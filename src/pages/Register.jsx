import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { saveAuth } from "../utils/auth";
import "./Register.css";

function Register() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (event) => {
        setFormData({
            ...formData,
            [event.target.name]: event.target.value,
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setLoading(true);

        try {
            const response = await api.post(
                "register/",
                formData
            );

            saveAuth(response.data);

            navigate("/dashboard");
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.error ||
                "Registration failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-page">

            <div className="register-background-overlay"></div>

            <div className="register-container">

                <div className="register-card">

                    <div className="register-header">

                        <div className="register-logo">
                            <i className="bi bi-person-plus-fill"></i>
                        </div>

                        <span className="register-label">
                            EZITECH TECHNOLOGIES
                        </span>

                        <h1>
                            Create Your Account
                        </h1>

                        <p>
                            Join our professional job platform
                            and discover opportunities that
                            match your skills.
                        </p>

                    </div>

                    {error && (
                        <div className="register-alert">
                            <i className="bi bi-exclamation-circle-fill"></i>

                            <span>
                                {error}
                            </span>
                        </div>
                    )}

                    <form
                        className="register-form"
                        onSubmit={handleSubmit}
                    >

                        <div className="register-field">

                            <label htmlFor="username">
                                Username
                            </label>

                            <div className="register-input-wrapper">

                                <i className="bi bi-person-fill"></i>

                                <input
                                    id="username"
                                    type="text"
                                    name="username"
                                    value={
                                        formData.username
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Enter your username"
                                    autoComplete="username"
                                    required
                                />

                            </div>

                        </div>

                        <div className="register-field">

                            <label htmlFor="email">
                                Email Address
                            </label>

                            <div className="register-input-wrapper">

                                <i className="bi bi-envelope-fill"></i>

                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={
                                        formData.email
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Enter your email"
                                    autoComplete="email"
                                    required
                                />

                            </div>

                        </div>

                        <div className="register-field">

                            <label htmlFor="password">
                                Password
                            </label>

                            <div className="register-input-wrapper">

                                <i className="bi bi-lock-fill"></i>

                                <input
                                    id="password"
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    name="password"
                                    value={
                                        formData.password
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Create a password"
                                    autoComplete="new-password"
                                    required
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
                                    <i
                                        className={
                                            showPassword
                                                ? "bi bi-eye-slash-fill"
                                                : "bi bi-eye-fill"
                                        }
                                    ></i>
                                </button>

                            </div>

                        </div>

                        <div className="register-security">

                            <i className="bi bi-shield-check"></i>

                            <span>
                                Your account information is
                                securely protected.
                            </span>

                        </div>

                        <button
                            type="submit"
                            className="register-button"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="register-spinner"></span>
                                    Creating Account...
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-person-check-fill"></i>
                                    Create Account
                                </>
                            )}
                        </button>

                    </form>

                    <div className="register-divider">
                        <span>Already registered?</span>
                    </div>

                    <Link
                        to="/login"
                        className="register-login-button"
                    >
                        <i className="bi bi-box-arrow-in-right"></i>
                        Login to Your Account
                    </Link>

                    <div className="register-footer">

                        <Link
                            to="/"
                            className="register-home-link"
                        >
                            <i className="bi bi-arrow-left"></i>
                            Back to Home
                        </Link>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default Register;