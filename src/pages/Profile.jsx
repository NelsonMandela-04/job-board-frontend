import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { getUser } from "../utils/auth";
import "./Profile.css";

function Profile() {
    const user = getUser();
    const fileInputRef = useRef(null);
    const resumeInputRef = useRef(null);

    const [profile, setProfile] = useState(null);

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [location, setLocation] = useState("");
    const [bio, setBio] = useState("");
    const [skills, setSkills] = useState("");
    const [education, setEducation] = useState("");
    const [experience, setExperience] = useState("");
    const [privacy, setPrivacy] = useState("public");

    const [resume, setResume] = useState(null);
    const [currentResume, setCurrentResume] = useState(null);

    const [profilePhoto, setProfilePhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const [photoLocked, setPhotoLocked] = useState(false);
    const [nextPhotoChange, setNextPhotoChange] = useState(null);

    const [showPhotoViewer, setShowPhotoViewer] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await api.get("profile/");
                const data = response.data;

                setProfile(data);

                setUsername(data.username || "");
                setEmail(data.email || "");
                setLocation(data.location || "");
                setBio(data.bio || "");
                setSkills(data.skills || "");
                setEducation(data.education || "");
                setExperience(data.experience || "");
                setPrivacy(data.privacy || "public");

                setCurrentResume(data.resume || null);

                setPhotoLocked(
                    Boolean(data.profile_photo_locked)
                );

                setNextPhotoChange(
                    data.next_photo_change || null
                );

                if (data.profile_photo) {
                    setPhotoPreview(data.profile_photo);
                } else {
                    setPhotoPreview("");
                }
            } catch (err) {
                console.error(
                    "Unable to load profile:",
                    err
                );

                setError(
                    err.response?.data?.detail ||
                    err.response?.data?.error ||
                    "Unable to load profile."
                );
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchProfile();
        } else {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        return () => {
            if (
                photoPreview &&
                photoPreview.startsWith("blob:")
            ) {
                URL.revokeObjectURL(photoPreview);
            }
        };
    }, [photoPreview]);

    useEffect(() => {
        if (!nextPhotoChange) {
            return;
        }

        const checkCooldown = () => {
            const target = new Date(
                nextPhotoChange
            ).getTime();

            if (Date.now() >= target) {
                setPhotoLocked(false);
                setNextPhotoChange(null);
            }
        };

        checkCooldown();

        const interval = setInterval(
            checkCooldown,
            30000
        );

        return () => clearInterval(interval);
    }, [nextPhotoChange]);

    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === "Escape") {
                setShowPhotoViewer(false);
            }
        };

        if (showPhotoViewer) {
            document.addEventListener(
                "keydown",
                handleEscape
            );

            document.body.style.overflow = "hidden";
        }

        return () => {
            document.removeEventListener(
                "keydown",
                handleEscape
            );

            document.body.style.overflow = "";
        };
    }, [showPhotoViewer]);

    const handlePhotoClick = () => {
        if (photoLocked) {
            setError(
                nextPhotoChange
                    ? `Your profile photo cannot be changed until ${formatDateTime(
                          nextPhotoChange
                      )}.`
                    : "Your profile photo is currently locked."
            );

            return;
        }

        fileInputRef.current?.click();
    };

    const handleAvatarClick = () => {
        if (photoPreview) {
            setShowPhotoViewer(true);
        } else {
            handlePhotoClick();
        }
    };

    const handlePhotoChange = (event) => {
        const selectedFile =
            event.target.files[0] || null;

        setError("");
        setMessage("");

        if (!selectedFile) {
            return;
        }

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
        ];

        if (!allowedTypes.includes(selectedFile.type)) {
            setProfilePhoto(null);

            setError(
                "Please select a JPEG, PNG, or WebP image."
            );

            event.target.value = "";

            return;
        }

        const maxSize = 5 * 1024 * 1024;

        if (selectedFile.size > maxSize) {
            setProfilePhoto(null);

            setError(
                "Profile photo must be 5 MB or smaller."
            );

            event.target.value = "";

            return;
        }

        if (
            photoPreview &&
            photoPreview.startsWith("blob:")
        ) {
            URL.revokeObjectURL(photoPreview);
        }

        const previewUrl = URL.createObjectURL(
            selectedFile
        );

        setProfilePhoto(selectedFile);
        setPhotoPreview(previewUrl);
    };

    const handleResumeChange = (event) => {
        const selectedFile =
            event.target.files[0] || null;

        setError("");
        setMessage("");

        if (!selectedFile) {
            setResume(null);
            return;
        }

        const allowedTypes = [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ];

        const allowedExtensions = [
            ".pdf",
            ".doc",
            ".docx",
        ];

        const fileName =
            selectedFile.name.toLowerCase();

        const hasValidExtension =
            allowedExtensions.some(
                (extension) =>
                    fileName.endsWith(extension)
            );

        if (
            !allowedTypes.includes(selectedFile.type) &&
            !hasValidExtension
        ) {
            setResume(null);

            setError(
                "Please select a PDF, DOC, or DOCX file."
            );

            event.target.value = "";

            return;
        }

        const maxSize = 10 * 1024 * 1024;

        if (selectedFile.size > maxSize) {
            setResume(null);

            setError(
                "Resume must be 10 MB or smaller."
            );

            event.target.value = "";

            return;
        }

        setResume(selectedFile);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            setSaving(true);
            setError("");
            setMessage("");

            const formData = new FormData();

            formData.append(
                "username",
                username.trim()
            );

            formData.append(
                "email",
                email.trim()
            );

            formData.append(
                "location",
                location.trim()
            );

            formData.append(
                "bio",
                bio.trim()
            );

            formData.append(
                "skills",
                skills.trim()
            );

            formData.append(
                "education",
                education.trim()
            );

            formData.append(
                "experience",
                experience.trim()
            );

            formData.append(
                "privacy",
                privacy
            );

            if (resume) {
                formData.append(
                    "resume",
                    resume
                );
            }

            if (profilePhoto) {
                formData.append(
                    "profile_photo",
                    profilePhoto
                );
            }

            const response = await api.patch(
                "profile/",
                formData
            );

            const data = response.data;

            setProfile(data);

            setUsername(data.username || "");
            setEmail(data.email || "");
            setLocation(data.location || "");
            setBio(data.bio || "");
            setSkills(data.skills || "");
            setEducation(data.education || "");
            setExperience(data.experience || "");
            setPrivacy(data.privacy || "public");

            setCurrentResume(
                data.resume || currentResume || null
            );

            setResume(null);
            setProfilePhoto(null);

            setPhotoLocked(
                Boolean(data.profile_photo_locked)
            );

            setNextPhotoChange(
                data.next_photo_change || null
            );

            if (data.profile_photo) {
                setPhotoPreview(
                    data.profile_photo
                );
            }

            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }

            if (resumeInputRef.current) {
                resumeInputRef.current.value = "";
            }

            setMessage(
                "Profile updated successfully."
            );
        } catch (err) {
            console.error(
                "Unable to update profile:",
                err
            );

            const responseData =
                err.response?.data;

            if (
                err.response?.status === 429 &&
                responseData?.profile_photo_locked
            ) {
                setPhotoLocked(true);

                setNextPhotoChange(
                    responseData.next_photo_change ||
                    null
                );

                setProfilePhoto(null);

                setError(
                    responseData.detail ||
                    "Your profile photo can only be changed once every 24 hours."
                );

                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }

                if (profile?.profile_photo) {
                    setPhotoPreview(
                        profile.profile_photo
                    );
                }

                return;
            }

            if (
                typeof responseData === "object" &&
                responseData !== null
            ) {
                const firstError = Object.values(
                    responseData
                ).flat()[0];

                setError(
                    typeof firstError === "string"
                        ? firstError
                        : responseData.detail ||
                          responseData.error ||
                          "Unable to update profile."
                );
            } else {
                setError(
                    "Unable to update profile."
                );
            }
        } finally {
            setSaving(false);
        }
    };

    const formatDateTime = (dateString) => {
        if (!dateString) {
            return "";
        }

        const date = new Date(
            dateString
        );

        if (Number.isNaN(date.getTime())) {
            return "";
        }

        return date.toLocaleString([], {
            dateStyle: "medium",
            timeStyle: "short",
        });
    };

    const getRemainingTime = (dateString) => {
        if (!dateString) {
            return "";
        }

        const target = new Date(
            dateString
        ).getTime();

        const difference =
            target - Date.now();

        if (difference <= 0) {
            return "";
        }

        const totalMinutes = Math.ceil(
            difference / (1000 * 60)
        );

        const hours = Math.floor(
            totalMinutes / 60
        );

        const minutes =
            totalMinutes % 60;

        if (hours > 0) {
            return `${hours}h ${minutes}m remaining`;
        }

        return `${minutes}m remaining`;
    };

    const formatResumeDate = (dateString) => {
        if (!dateString) {
            return "";
        }

        const date = new Date(
            dateString
        );

        if (Number.isNaN(date.getTime())) {
            return "";
        }

        return date.toLocaleDateString([], {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    if (!user) {
        return (
            <div className="profile-page">
                <div className="profile-overlay"></div>

                <div className="profile-auth-card">
                    <div className="profile-auth-icon">
                        <i className="bi bi-person-circle"></i>
                    </div>

                    <h1>
                        Login Required
                    </h1>

                    <p>
                        Please log in to view and
                        manage your profile.
                    </p>

                    <Link
                        to="/login"
                        className="profile-primary-button"
                    >
                        <i className="bi bi-box-arrow-in-right"></i>
                        Login
                    </Link>

                    <Link
                        to="/"
                        className="profile-back-link"
                    >
                        <i className="bi bi-arrow-left"></i>
                        Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="profile-page">
                <div className="profile-overlay"></div>

                <div className="profile-loading">
                    <div className="profile-spinner"></div>

                    <p>
                        Loading your profile...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-page">
            <div className="profile-overlay"></div>

            <div className="profile-container">
                <div className="profile-card">

                    <div className="profile-header">
                        <div>
                            <span className="profile-eyebrow">
                                ACCOUNT SETTINGS
                            </span>

                            <h1>
                                My Profile
                            </h1>

                            <p>
                                Manage your personal
                                information, professional
                                profile, privacy, photo,
                                and resume.
                            </p>
                        </div>

                        <div className="profile-header-actions">
                            <Link
                                to={`/public-profile/${encodeURIComponent(
                                    username
                                )}`}
                                className="profile-public-link"
                            >
                                <i className="bi bi-eye"></i>
                                View Public Profile
                            </Link>

                            <Link
                                to="/dashboard"
                                className="profile-dashboard-link"
                            >
                                <i className="bi bi-speedometer2"></i>
                                Dashboard
                            </Link>
                        </div>
                    </div>

                    {error && (
                        <div className="profile-alert profile-alert-error">
                            <i className="bi bi-exclamation-circle"></i>

                            <span>
                                {error}
                            </span>
                        </div>
                    )}

                    {message && (
                        <div className="profile-alert profile-alert-success">
                            <i className="bi bi-check-circle"></i>

                            <span>
                                {message}
                            </span>
                        </div>
                    )}

                    <div className="profile-photo-section">
                        <div className="profile-avatar-wrapper">

                            <button
                                type="button"
                                className={`profile-avatar-upload ${
                                    photoLocked
                                        ? "profile-avatar-locked"
                                        : ""
                                }`}
                                onClick={
                                    handleAvatarClick
                                }
                                aria-label={
                                    photoPreview
                                        ? "View profile photo"
                                        : "Select profile photo"
                                }
                            >
                                {photoPreview ? (
                                    <img
                                        src={
                                            photoPreview
                                        }
                                        alt="Profile"
                                        className="profile-avatar-image"
                                    />
                                ) : (
                                    <i className="bi bi-person-fill"></i>
                                )}

                                <span
                                    className="profile-camera"
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        handlePhotoClick();
                                    }}
                                    role="button"
                                    tabIndex={0}
                                    aria-label="Change profile photo"
                                    onKeyDown={(event) => {
                                        if (
                                            event.key ===
                                                "Enter" ||
                                            event.key ===
                                                " "
                                        ) {
                                            event.preventDefault();
                                            event.stopPropagation();
                                            handlePhotoClick();
                                        }
                                    }}
                                >
                                    <i
                                        className={
                                            photoLocked
                                                ? "bi bi-lock-fill"
                                                : "bi bi-camera-fill"
                                        }
                                    ></i>
                                </span>
                            </button>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={
                                    handlePhotoChange
                                }
                                hidden
                            />
                        </div>

                        <div className="profile-photo-info">
                            <h2>
                                Profile Photo
                            </h2>

                            <p>
                                Click your photo to
                                view it. Click the
                                camera icon to change
                                it.
                            </p>

                            <span>
                                JPEG, PNG or WebP •
                                Maximum 5 MB
                            </span>

                            {photoLocked &&
                                nextPhotoChange && (
                                    <div className="photo-cooldown">
                                        <i className="bi bi-clock-history"></i>

                                        <div>
                                            <strong>
                                                Photo change
                                                locked
                                            </strong>

                                            <small>
                                                Available{" "}
                                                {formatDateTime(
                                                    nextPhotoChange
                                                )}
                                                {" · "}
                                                {getRemainingTime(
                                                    nextPhotoChange
                                                )}
                                            </small>
                                        </div>
                                    </div>
                                )}
                        </div>
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="profile-form"
                    >

                        <div className="profile-section-title">
                            <i className="bi bi-person-vcard"></i>

                            <div>
                                <h2>
                                    Personal Information
                                </h2>

                                <p>
                                    Keep your account and
                                    contact information
                                    up to date.
                                </p>
                            </div>
                        </div>

                        <div className="profile-fields">

                            <div className="profile-field">
                                <label htmlFor="username">
                                    Username
                                </label>

                                <div className="profile-input-wrapper">
                                    <i className="bi bi-at"></i>

                                    <input
                                        id="username"
                                        type="text"
                                        value={username}
                                        onChange={(event) =>
                                            setUsername(
                                                event.target.value
                                            )
                                        }
                                        required
                                    />
                                </div>
                            </div>

                            <div className="profile-field">
                                <label htmlFor="email">
                                    Email Address
                                </label>

                                <div className="profile-input-wrapper">
                                    <i className="bi bi-envelope"></i>

                                    <input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(event) =>
                                            setEmail(
                                                event.target.value
                                            )
                                        }
                                        required
                                    />
                                </div>
                            </div>

                            <div className="profile-field profile-field-full">
                                <label htmlFor="location">
                                    Location
                                </label>

                                <div className="profile-input-wrapper">
                                    <i className="bi bi-geo-alt"></i>

                                    <input
                                        id="location"
                                        type="text"
                                        value={location}
                                        onChange={(event) =>
                                            setLocation(
                                                event.target.value
                                            )
                                        }
                                        placeholder="e.g. Windhoek, Namibia"
                                    />
                                </div>
                            </div>

                        </div>

                        <div className="profile-section-title profile-professional-title">
                            <i className="bi bi-briefcase"></i>

                            <div>
                                <h2>
                                    Professional Profile
                                </h2>

                                <p>
                                    Tell employers and other
                                    users about your
                                    professional background.
                                </p>
                            </div>
                        </div>

                        <div className="profile-professional-fields">

                            <div className="profile-field profile-field-full">
                                <label htmlFor="bio">
                                    Professional Bio
                                </label>

                                <textarea
                                    id="bio"
                                    value={bio}
                                    onChange={(event) =>
                                        setBio(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Write a short professional introduction about yourself..."
                                    rows="5"
                                    maxLength="1000"
                                />

                                <small className="profile-character-count">
                                    {bio.length}/1000
                                </small>
                            </div>

                            <div className="profile-field profile-field-full">
                                <label htmlFor="skills">
                                    Skills
                                </label>

                                <div className="profile-input-wrapper">
                                    <i className="bi bi-code-slash"></i>

                                    <input
                                        id="skills"
                                        type="text"
                                        value={skills}
                                        onChange={(event) =>
                                            setSkills(
                                                event.target.value
                                            )
                                        }
                                        placeholder="React, Python, Django, SQL, JavaScript"
                                    />
                                </div>

                                <small className="profile-field-hint">
                                    Separate each skill with a comma.
                                </small>
                            </div>

                            <div className="profile-field profile-field-full">
                                <label htmlFor="education">
                                    Education
                                </label>

                                <textarea
                                    id="education"
                                    value={education}
                                    onChange={(event) =>
                                        setEducation(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Describe your academic background, qualifications, institution, or certifications..."
                                    rows="5"
                                    maxLength="2000"
                                />

                                <small className="profile-character-count">
                                    {education.length}/2000
                                </small>
                            </div>

                            <div className="profile-field profile-field-full">
                                <label htmlFor="experience">
                                    Professional Experience
                                </label>

                                <textarea
                                    id="experience"
                                    value={experience}
                                    onChange={(event) =>
                                        setExperience(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Describe your previous jobs, internships, projects, responsibilities, and achievements..."
                                    rows="6"
                                    maxLength="3000"
                                />

                                <small className="profile-character-count">
                                    {experience.length}/3000
                                </small>
                            </div>

                        </div>

                        <div className="profile-section-title profile-privacy-title">
                            <i className="bi bi-shield-lock"></i>

                            <div>
                                <h2>
                                    Profile Privacy
                                </h2>

                                <p>
                                    Choose who can view your
                                    professional profile.
                                </p>
                            </div>
                        </div>

                        <div className="profile-privacy-options">

                            <label
                                className={`profile-privacy-option ${
                                    privacy === "public"
                                        ? "profile-privacy-selected"
                                        : ""
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="privacy"
                                    value="public"
                                    checked={
                                        privacy ===
                                        "public"
                                    }
                                    onChange={(event) =>
                                        setPrivacy(
                                            event.target.value
                                        )
                                    }
                                />

                                <span className="profile-privacy-icon">
                                    <i className="bi bi-globe2"></i>
                                </span>

                                <span className="profile-privacy-content">
                                    <strong>
                                        Public
                                    </strong>

                                    <small>
                                        Your profile can be
                                        viewed by authenticated
                                        users.
                                    </small>
                                </span>

                                <i className="bi bi-check-circle-fill profile-privacy-check"></i>
                            </label>

                            <label
                                className={`profile-privacy-option ${
                                    privacy === "employers"
                                        ? "profile-privacy-selected"
                                        : ""
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="privacy"
                                    value="employers"
                                    checked={
                                        privacy ===
                                        "employers"
                                    }
                                    onChange={(event) =>
                                        setPrivacy(
                                            event.target.value
                                        )
                                    }
                                />

                                <span className="profile-privacy-icon">
                                    <i className="bi bi-briefcase-fill"></i>
                                </span>

                                <span className="profile-privacy-content">
                                    <strong>
                                        Employers Only
                                    </strong>

                                    <small>
                                        Only active employers
                                        can view your profile.
                                    </small>
                                </span>

                                <i className="bi bi-check-circle-fill profile-privacy-check"></i>
                            </label>

                            <label
                                className={`profile-privacy-option ${
                                    privacy === "private"
                                        ? "profile-privacy-selected"
                                        : ""
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="privacy"
                                    value="private"
                                    checked={
                                        privacy ===
                                        "private"
                                    }
                                    onChange={(event) =>
                                        setPrivacy(
                                            event.target.value
                                        )
                                    }
                                />

                                <span className="profile-privacy-icon">
                                    <i className="bi bi-lock-fill"></i>
                                </span>

                                <span className="profile-privacy-content">
                                    <strong>
                                        Private
                                    </strong>

                                    <small>
                                        Other users cannot view
                                        your public profile.
                                    </small>
                                </span>

                                <i className="bi bi-check-circle-fill profile-privacy-check"></i>
                            </label>

                        </div>

                        <div className="profile-section-title profile-resume-title">
                            <i className="bi bi-file-earmark-person"></i>

                            <div>
                                <h2>
                                    Resume
                                </h2>

                                <p>
                                    Upload a new resume to keep
                                    your applications current.
                                </p>
                            </div>
                        </div>

                        <div className="profile-resume-box">
                            <div className="profile-resume-icon">
                                <i className="bi bi-file-earmark-text"></i>
                            </div>

                            <div className="profile-resume-content">
                                {resume ? (
                                    <>
                                        <strong>
                                            {resume.name}
                                        </strong>

                                        <span>
                                            New resume selected
                                        </span>
                                    </>
                                ) : currentResume ? (
                                    <>
                                        <strong>
                                            {currentResume.name}
                                        </strong>

                                        <span>
                                            Uploaded{" "}
                                            {formatResumeDate(
                                                currentResume.uploaded_at
                                            )}
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <strong>
                                            No resume uploaded
                                        </strong>

                                        <span>
                                            PDF, DOC or DOCX •
                                            Maximum 10 MB
                                        </span>
                                    </>
                                )}
                            </div>

                            {currentResume && !resume && (
                                <a
                                    href={currentResume.file}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="profile-resume-view-button"
                                >
                                    <i className="bi bi-eye"></i>
                                    View
                                </a>
                            )}

                            <label className="profile-file-button">
                                <i className="bi bi-upload"></i>

                                {currentResume
                                    ? "Replace"
                                    : "Browse"}

                                <input
                                    ref={resumeInputRef}
                                    type="file"
                                    accept=".pdf,.doc,.docx"
                                    onChange={
                                        handleResumeChange
                                    }
                                />
                            </label>
                        </div>

                        <div className="profile-security">
                            <i className="bi bi-shield-check"></i>

                            <span>
                                Your profile information is
                                securely stored and controlled
                                by your privacy settings.
                            </span>
                        </div>

                        <div className="profile-actions">

                            <Link
                                to="/dashboard"
                                className="profile-secondary-button"
                            >
                                <i className="bi bi-arrow-left"></i>
                                Cancel
                            </Link>

                            <Link
                                to={`/public-profile/${encodeURIComponent(
                                    username
                                )}`}
                                className="profile-secondary-button profile-view-button"
                            >
                                <i className="bi bi-eye"></i>
                                View Profile
                            </Link>

                            <button
                                type="submit"
                                className="profile-primary-button"
                                disabled={saving}
                            >
                                {saving ? (
                                    <>
                                        <span className="profile-button-spinner"></span>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-check2-circle"></i>
                                        Save Changes
                                    </>
                                )}
                            </button>

                        </div>

                    </form>

                </div>
            </div>

            {showPhotoViewer &&
                photoPreview && (
                    <div
                        className="profile-photo-viewer"
                        onClick={() =>
                            setShowPhotoViewer(false)
                        }
                    >
                        <button
                            type="button"
                            className="profile-photo-viewer-close"
                            onClick={() =>
                                setShowPhotoViewer(false)
                            }
                            aria-label="Close photo viewer"
                        >
                            <i className="bi bi-x-lg"></i>
                        </button>

                        <div
                            className="profile-photo-viewer-content"
                            onClick={(event) =>
                                event.stopPropagation()
                            }
                        >
                            <img
                                src={photoPreview}
                                alt="Full profile"
                                className="profile-full-photo"
                            />
                        </div>
                    </div>
                )}
        </div>
    );
}

export default Profile;