import {
    useEffect,
    useRef,
    useState
} from "react";

import {
    Link,
    useLocation,
    useNavigate
} from "react-router-dom";

import api from "../api/axios";

import {
    getUser,
    logout
} from "../utils/auth";

import logo from "../assets/image/ezilogo.jpeg";

import "./Navbar.css";

function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();

    const user = getUser();
    const userId = user?.id || null;

    const isAdmin = Boolean(user?.is_staff);
    const isEmployer = Boolean(user?.is_employer);
    const isLoggedIn = Boolean(user);

    const [unreadCount, setUnreadCount] = useState(0);
    const [messageUnreadCount, setMessageUnreadCount] = useState(0);
    const [profilePhoto, setProfilePhoto] = useState("");

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [jobsMenuOpen, setJobsMenuOpen] = useState(false);
    const [communicationMenuOpen, setCommunicationMenuOpen] = useState(false);
    const [employerMenuOpen, setEmployerMenuOpen] = useState(false);
    const [adminMenuOpen, setAdminMenuOpen] = useState(false);

    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem("theme") === "dark";
    });

    const jobsMenuRef = useRef(null);
    const communicationMenuRef = useRef(null);
    const employerMenuRef = useRef(null);
    const adminMenuRef = useRef(null);

    useEffect(() => {
        if (darkMode) {
            document.body.classList.add("dark-mode");
            localStorage.setItem("theme", "dark");
        } else {
            document.body.classList.remove("dark-mode");
            localStorage.setItem("theme", "light");
        }
    }, [darkMode]);

    useEffect(() => {
        let mounted = true;

        if (!userId) {
            setProfilePhoto("");

            return () => {
                mounted = false;
            };
        }

        const fetchProfile = async () => {
            try {
                const response = await api.get("profile/");

                if (!mounted) {
                    return;
                }

                const photo = response.data?.profile_photo || "";

                if (!photo) {
                    setProfilePhoto("");
                    return;
                }

                const photoUrl = photo.startsWith("http")
                    ? photo
                    : `http://127.0.0.1:8000${photo}`;

                setProfilePhoto(photoUrl);
            } catch (error) {
                if (!mounted) {
                    return;
                }

                if (error.response?.status === 401) {
                    setProfilePhoto("");
                    return;
                }

                console.error(
                    "FETCH PROFILE PHOTO ERROR:",
                    error
                );

                setProfilePhoto("");
            }
        };

        fetchProfile();

        return () => {
            mounted = false;
        };
    }, [userId]);

    useEffect(() => {
        let mounted = true;

        if (!userId) {
            setUnreadCount(0);

            return () => {
                mounted = false;
            };
        }

        const fetchUnreadCount = async () => {
            try {
                const response = await api.get(
                    "notifications/unread_count/"
                );

                if (!mounted) {
                    return;
                }

                const count = Number(
                    response.data?.unread_count ?? 0
                );

                setUnreadCount(
                    Number.isFinite(count)
                        ? count
                        : 0
                );
            } catch (error) {
                if (!mounted) {
                    return;
                }

                if (error.response?.status === 401) {
                    setUnreadCount(0);
                    return;
                }

                console.error(
                    "FETCH UNREAD NOTIFICATIONS ERROR:",
                    error
                );
            }
        };

        fetchUnreadCount();

        const interval = setInterval(
            fetchUnreadCount,
            30000
        );

        return () => {
            mounted = false;
            clearInterval(interval);
        };
    }, [userId]);

    useEffect(() => {
        let mounted = true;

        if (!userId) {
            setMessageUnreadCount(0);

            return () => {
                mounted = false;
            };
        }

        const fetchMessageUnreadCount = async () => {
            try {
                const response = await api.get(
                    "conversations/unread_count/"
                );

                if (!mounted) {
                    return;
                }

                const count = Number(
                    response.data?.unread_count ?? 0
                );

                setMessageUnreadCount(
                    Number.isFinite(count)
                        ? count
                        : 0
                );
            } catch (error) {
                if (!mounted) {
                    return;
                }

                if (error.response?.status === 401) {
                    setMessageUnreadCount(0);
                    return;
                }

                console.error(
                    "FETCH UNREAD MESSAGES ERROR:",
                    error
                );
            }
        };

        fetchMessageUnreadCount();

        const interval = setInterval(
            fetchMessageUnreadCount,
            10000
        );

        return () => {
            mounted = false;
            clearInterval(interval);
        };
    }, [userId, location.pathname]);

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (
                jobsMenuRef.current &&
                !jobsMenuRef.current.contains(event.target)
            ) {
                setJobsMenuOpen(false);
            }

            if (
                communicationMenuRef.current &&
                !communicationMenuRef.current.contains(event.target)
            ) {
                setCommunicationMenuOpen(false);
            }

            if (
                employerMenuRef.current &&
                !employerMenuRef.current.contains(event.target)
            ) {
                setEmployerMenuOpen(false);
            }

            if (
                adminMenuRef.current &&
                !adminMenuRef.current.contains(event.target)
            ) {
                setAdminMenuOpen(false);
            }
        };

        document.addEventListener(
            "mousedown",
            handleOutsideClick
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleOutsideClick
            );
        };
    }, []);

    useEffect(() => {
        setMobileMenuOpen(false);
        setJobsMenuOpen(false);
        setCommunicationMenuOpen(false);
        setEmployerMenuOpen(false);
        setAdminMenuOpen(false);
    }, [location.pathname]);

    const closeAllMenus = () => {
        setJobsMenuOpen(false);
        setCommunicationMenuOpen(false);
        setEmployerMenuOpen(false);
        setAdminMenuOpen(false);
    };

    const handleJobsToggle = () => {
        setJobsMenuOpen(
            (previous) => !previous
        );

        setCommunicationMenuOpen(false);
        setEmployerMenuOpen(false);
        setAdminMenuOpen(false);
    };

    const handleCommunicationToggle = () => {
        setCommunicationMenuOpen(
            (previous) => !previous
        );

        setJobsMenuOpen(false);
        setEmployerMenuOpen(false);
        setAdminMenuOpen(false);
    };

    const handleEmployerToggle = () => {
        setEmployerMenuOpen(
            (previous) => !previous
        );

        setJobsMenuOpen(false);
        setCommunicationMenuOpen(false);
        setAdminMenuOpen(false);
    };

    const handleAdminToggle = () => {
        setAdminMenuOpen(
            (previous) => !previous
        );

        setJobsMenuOpen(false);
        setCommunicationMenuOpen(false);
        setEmployerMenuOpen(false);
    };

    const handleThemeToggle = () => {
        setDarkMode(
            (previous) => !previous
        );
    };

    const handleLogout = () => {
        logout();

        setUnreadCount(0);
        setMessageUnreadCount(0);
        setProfilePhoto("");
        setMobileMenuOpen(false);
        setJobsMenuOpen(false);
        setCommunicationMenuOpen(false);
        setEmployerMenuOpen(false);
        setAdminMenuOpen(false);

        navigate("/login");
    };

    const isActive = (path) => {
        if (path === "/") {
            return location.pathname === "/";
        }

        return (
            location.pathname === path ||
            location.pathname.startsWith(
                `${path}/`
            )
        );
    };

    const isJobsSectionActive =
        isActive("/jobs") ||
        isActive("/saved-jobs");

    const isCommunicationSectionActive =
        isActive("/notifications") ||
        isActive("/messages");

    const isEmployerSectionActive =
        isActive("/employer") ||
        isActive("/company/create") ||
        isActive("/job/create") ||
        isActive("/employer/applications");

    const isAdminSectionActive =
        isActive("/admin-dashboard") ||
        isActive("/admin/jobs") ||
        isActive("/admin/users") ||
        isActive("/admin/companies") ||
        isActive("/admin/applications");

    const firstName =
        user?.first_name?.trim() ||
        user?.username ||
        "User";

    return (
        <nav className="site-navbar">
            <div className="navbar-container">

                <Link
                    to="/"
                    className="navbar-brand"
                    aria-label="Ezitech Technologies Job Board"
                >
                    <img
                        src={logo}
                        alt="Ezitech Technologies"
                        className="navbar-logo"
                    />

                    <div className="brand-text">
                        <strong>
                            Ezitech Technologies
                        </strong>

                        <small>
                            Job Board
                        </small>
                    </div>
                </Link>

                <button
                    type="button"
                    className={`mobile-menu-button ${mobileMenuOpen
                            ? "open"
                            : ""
                        }`}
                    onClick={() => {
                        setMobileMenuOpen(
                            (previous) =>
                                !previous
                        );

                        closeAllMenus();
                    }}
                    aria-label={
                        mobileMenuOpen
                            ? "Close navigation menu"
                            : "Open navigation menu"
                    }
                    aria-expanded={
                        mobileMenuOpen
                    }
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>

                <div
                    className={`navbar-content ${mobileMenuOpen
                            ? "mobile-open"
                            : ""
                        }`}
                >

                    <div className="navbar-main-links">

                        <Link
                            to="/"
                            className={
                                isActive("/")
                                    ? "active"
                                    : ""
                            }
                        >
                            <i className="bi bi-house-door-fill"></i>
                            <span>Home</span>
                        </Link>

                        <div
                            className={`navbar-dropdown ${jobsMenuOpen
                                    ? "dropdown-open"
                                    : ""
                                }`}
                            ref={jobsMenuRef}
                        >
                            <button
                                type="button"
                                className={`dropdown-trigger ${isJobsSectionActive ||
                                        jobsMenuOpen
                                        ? "active"
                                        : ""
                                    }`}
                                onClick={
                                    handleJobsToggle
                                }
                                aria-expanded={
                                    jobsMenuOpen
                                }
                            >
                                <span className="dropdown-trigger-content">
                                    <i className="bi bi-briefcase-fill"></i>
                                    Jobs
                                </span>

                                <span
                                    className={`dropdown-arrow ${jobsMenuOpen
                                            ? "rotate"
                                            : ""
                                        }`}
                                >
                                    <i className="bi bi-chevron-down"></i>
                                </span>
                            </button>

                            {jobsMenuOpen && (
                                <div className="dropdown-menu">

                                    <Link
                                        to="/jobs"
                                        className={
                                            isActive("/jobs")
                                                ? "active"
                                                : ""
                                        }
                                        onClick={
                                            closeAllMenus
                                        }
                                    >
                                        <span className="menu-icon">
                                            <i className="bi bi-briefcase-fill"></i>
                                        </span>

                                        <span>
                                            <strong>
                                                Jobs
                                            </strong>

                                            <small>
                                                Browse available jobs
                                            </small>
                                        </span>
                                    </Link>

                                    {isLoggedIn && (
                                        <Link
                                            to="/saved-jobs"
                                            className={
                                                isActive(
                                                    "/saved-jobs"
                                                )
                                                    ? "active"
                                                    : ""
                                            }
                                            onClick={
                                                closeAllMenus
                                            }
                                        >
                                            <span className="menu-icon">
                                                <i className="bi bi-bookmark-fill"></i>
                                            </span>

                                            <span>
                                                <strong>
                                                    Saved Jobs
                                                </strong>

                                                <small>
                                                    View your saved jobs
                                                </small>
                                            </span>
                                        </Link>
                                    )}

                                </div>
                            )}
                        </div>

                        {isLoggedIn && (
                            <Link
                                to="/applications"
                                className={
                                    isActive(
                                        "/applications"
                                    )
                                        ? "active"
                                        : ""
                                }
                            >
                                <i className="bi bi-file-earmark-text-fill"></i>
                                <span>
                                    My Applications
                                </span>
                            </Link>
                        )}

                        {isLoggedIn && (
                            <Link
                                to="/dashboard"
                                className={
                                    isActive(
                                        "/dashboard"
                                    )
                                        ? "active"
                                        : ""
                                }
                            >
                                <i className="bi bi-speedometer2"></i>
                                <span>
                                    Dashboard
                                </span>
                            </Link>
                        )}

                        {isEmployer && (
                            <div
                                className={`navbar-dropdown ${employerMenuOpen
                                        ? "dropdown-open"
                                        : ""
                                    }`}
                                ref={employerMenuRef}
                            >
                                <button
                                    type="button"
                                    className={`dropdown-trigger ${isEmployerSectionActive ||
                                            employerMenuOpen
                                            ? "active"
                                            : ""
                                        }`}
                                    onClick={
                                        handleEmployerToggle
                                    }
                                    aria-expanded={
                                        employerMenuOpen
                                    }
                                >
                                    <span className="dropdown-trigger-content">
                                        <i className="bi bi-briefcase-fill"></i>
                                        Employer
                                    </span>

                                    <span
                                        className={`dropdown-arrow ${employerMenuOpen
                                                ? "rotate"
                                                : ""
                                            }`}
                                    >
                                        <i className="bi bi-chevron-down"></i>
                                    </span>
                                </button>

                                {employerMenuOpen && (
                                    <div className="dropdown-menu">

                                        <Link
                                            to="/employer"
                                            className={
                                                isActive(
                                                    "/employer"
                                                )
                                                    ? "active"
                                                    : ""
                                            }
                                            onClick={
                                                closeAllMenus
                                            }
                                        >
                                            <span className="menu-icon">
                                                <i className="bi bi-speedometer2"></i>
                                            </span>

                                            <span>
                                                <strong>
                                                    Employer Dashboard
                                                </strong>

                                                <small>
                                                    Manage your company
                                                </small>
                                            </span>
                                        </Link>

                                        <Link
                                            to="/company/create"
                                            className={
                                                isActive(
                                                    "/company/create"
                                                )
                                                    ? "active"
                                                    : ""
                                            }
                                            onClick={
                                                closeAllMenus
                                            }
                                        >
                                            <span className="menu-icon">
                                                <i className="bi bi-building-add"></i>
                                            </span>

                                            <span>
                                                <strong>
                                                    Create Company
                                                </strong>

                                                <small>
                                                    Set up a company
                                                </small>
                                            </span>
                                        </Link>

                                        <Link
                                            to="/job/create"
                                            className={
                                                isActive(
                                                    "/job/create"
                                                )
                                                    ? "active"
                                                    : ""
                                            }
                                            onClick={
                                                closeAllMenus
                                            }
                                        >
                                            <span className="menu-icon">
                                                <i className="bi bi-briefcase-fill"></i>
                                            </span>

                                            <span>
                                                <strong>
                                                    Post a Job
                                                </strong>

                                                <small>
                                                    Create a new vacancy
                                                </small>
                                            </span>
                                        </Link>

                                        <Link
                                            to="/employer/applications"
                                            className={
                                                isActive(
                                                    "/employer/applications"
                                                )
                                                    ? "active"
                                                    : ""
                                            }
                                            onClick={
                                                closeAllMenus
                                            }
                                        >
                                            <span className="menu-icon">
                                                <i className="bi bi-file-earmark-text-fill"></i>
                                            </span>

                                            <span>
                                                <strong>
                                                    Applications
                                                </strong>

                                                <small>
                                                    Review applicants
                                                </small>
                                            </span>
                                        </Link>

                                    </div>
                                )}
                            </div>
                        )}

                        {isAdmin && (
                            <div
                                className={`navbar-dropdown ${adminMenuOpen
                                        ? "dropdown-open"
                                        : ""
                                    }`}
                                ref={adminMenuRef}
                            >
                                <button
                                    type="button"
                                    className={`dropdown-trigger ${isAdminSectionActive ||
                                            adminMenuOpen
                                            ? "active"
                                            : ""
                                        }`}
                                    onClick={
                                        handleAdminToggle
                                    }
                                    aria-expanded={
                                        adminMenuOpen
                                    }
                                >
                                    <span className="dropdown-trigger-content">
                                        <i className="bi bi-shield-lock-fill"></i>
                                        Admin
                                    </span>

                                    <span
                                        className={`dropdown-arrow ${adminMenuOpen
                                                ? "rotate"
                                                : ""
                                            }`}
                                    >
                                        <i className="bi bi-chevron-down"></i>
                                    </span>
                                </button>

                                {adminMenuOpen && (
                                    <div className="dropdown-menu">

                                        <Link
                                            to="/admin-dashboard"
                                            className={
                                                isActive(
                                                    "/admin-dashboard"
                                                )
                                                    ? "active"
                                                    : ""
                                            }
                                            onClick={
                                                closeAllMenus
                                            }
                                        >
                                            <span className="menu-icon">
                                                <i className="bi bi-speedometer2"></i>
                                            </span>

                                            <span>
                                                <strong>
                                                    Admin Dashboard
                                                </strong>

                                                <small>
                                                    Platform overview
                                                </small>
                                            </span>
                                        </Link>

                                        <Link
                                            to="/admin/jobs"
                                            className={
                                                isActive(
                                                    "/admin/jobs"
                                                )
                                                    ? "active"
                                                    : ""
                                            }
                                            onClick={
                                                closeAllMenus
                                            }
                                        >
                                            <span className="menu-icon">
                                                <i className="bi bi-briefcase-fill"></i>
                                            </span>

                                            <span>
                                                <strong>
                                                    Manage Jobs
                                                </strong>

                                                <small>
                                                    Moderate job posts
                                                </small>
                                            </span>
                                        </Link>

                                        <Link
                                            to="/admin/users"
                                            className={
                                                isActive(
                                                    "/admin/users"
                                                )
                                                    ? "active"
                                                    : ""
                                            }
                                            onClick={
                                                closeAllMenus
                                            }
                                        >
                                            <span className="menu-icon">
                                                <i className="bi bi-people-fill"></i>
                                            </span>

                                            <span>
                                                <strong>
                                                    Users
                                                </strong>

                                                <small>
                                                    Manage platform users
                                                </small>
                                            </span>
                                        </Link>

                                        <Link
                                            to="/admin/companies"
                                            className={
                                                isActive(
                                                    "/admin/companies"
                                                )
                                                    ? "active"
                                                    : ""
                                            }
                                            onClick={
                                                closeAllMenus
                                            }
                                        >
                                            <span className="menu-icon">
                                                <i className="bi bi-building-fill"></i>
                                            </span>

                                            <span>
                                                <strong>
                                                    Companies
                                                </strong>

                                                <small>
                                                    Manage companies
                                                </small>
                                            </span>
                                        </Link>

                                        <Link
                                            to="/admin/applications"
                                            className={
                                                isActive(
                                                    "/admin/applications"
                                                )
                                                    ? "active"
                                                    : ""
                                            }
                                            onClick={
                                                closeAllMenus
                                            }
                                        >
                                            <span className="menu-icon">
                                                <i className="bi bi-file-earmark-text-fill"></i>
                                            </span>

                                            <span>
                                                <strong>
                                                    Applications
                                                </strong>

                                                <small>
                                                    Manage all applications
                                                </small>
                                            </span>
                                        </Link>

                                    </div>
                                )}
                            </div>
                        )}

                        {isLoggedIn && (
                            <div
                                className={`navbar-dropdown communication-dropdown ${communicationMenuOpen
                                        ? "dropdown-open"
                                        : ""
                                    }`}
                                ref={communicationMenuRef}
                            >
                                <button
                                    type="button"
                                    className={`dropdown-trigger communication-trigger ${isCommunicationSectionActive ||
                                            communicationMenuOpen
                                            ? "active"
                                            : ""
                                        }`}
                                    onClick={
                                        handleCommunicationToggle
                                    }
                                    aria-expanded={
                                        communicationMenuOpen
                                    }
                                    aria-label="Notifications and Messages"
                                    title="Notifications and Messages"
                                >
                                    <span className="communication-trigger-icons">

                                        <span className="communication-icon notification-icon">
                                            <i className="bi bi-bell-fill"></i>

                                            {unreadCount > 0 && (
                                                <span className="communication-badge">
                                                    {unreadCount > 99
                                                        ? "99+"
                                                        : unreadCount}
                                                </span>
                                            )}
                                        </span>

                                        <span className="communication-icon message-icon">
                                            <i className="bi bi-chat-dots-fill"></i>

                                            {messageUnreadCount > 0 && (
                                                <span className="communication-badge">
                                                    {messageUnreadCount > 99
                                                        ? "99+"
                                                        : messageUnreadCount}
                                                </span>
                                            )}
                                        </span>

                                    </span>

                                    <span
                                        className={`dropdown-arrow ${communicationMenuOpen
                                                ? "rotate"
                                                : ""
                                            }`}
                                    >
                                        <i className="bi bi-chevron-down"></i>
                                    </span>
                                </button>

                                {communicationMenuOpen && (
                                    <div className="dropdown-menu">

                                        <Link
                                            to="/notifications"
                                            className={
                                                isActive(
                                                    "/notifications"
                                                )
                                                    ? "active"
                                                    : ""
                                            }
                                            onClick={
                                                closeAllMenus
                                            }
                                        >
                                            <span className="menu-icon notification-menu-icon">
                                                <i className="bi bi-bell-fill"></i>

                                                {unreadCount > 0 && (
                                                    <span className="menu-badge">
                                                        {unreadCount > 99
                                                            ? "99+"
                                                            : unreadCount}
                                                    </span>
                                                )}
                                            </span>

                                            <span>
                                                <strong>
                                                    Notifications
                                                </strong>

                                                <small>
                                                    {unreadCount > 0
                                                        ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`
                                                        : "View your notifications"}
                                                </small>
                                            </span>
                                        </Link>

                                        <Link to="/interviews">
                                            <i className="bi bi-calendar-check"></i>
                                            Interviews
                                        </Link>

                                        <Link
                                            to="/messages"
                                            className={
                                                isActive(
                                                    "/messages"
                                                )
                                                    ? "active"
                                                    : ""
                                            }
                                            onClick={
                                                closeAllMenus
                                            }
                                        >
                                            <span className="menu-icon message-menu-icon">
                                                <i className="bi bi-chat-dots-fill"></i>

                                                {messageUnreadCount > 0 && (
                                                    <span className="menu-badge">
                                                        {messageUnreadCount > 99
                                                            ? "99+"
                                                            : messageUnreadCount}
                                                    </span>
                                                )}
                                            </span>

                                            <span>
                                                <strong>
                                                    Messages
                                                </strong>

                                                <small>
                                                    {messageUnreadCount > 0
                                                        ? `${messageUnreadCount} unread message${messageUnreadCount === 1 ? "" : "s"}`
                                                        : "View your conversations"}
                                                </small>
                                            </span>
                                        </Link>

                                    </div>
                                )}
                            </div>
                        )}

                    </div>

                    <div className="navbar-actions">

                        {isLoggedIn && (
                            <Link
                                to="/profile"
                                className={`navbar-profile ${isActive("/profile")
                                        ? "active"
                                        : ""
                                    }`}
                                aria-label={`Welcome, ${firstName}`}
                            >
                                <span className="profile-avatar">
                                    {profilePhoto ? (
                                        <img
                                            src={profilePhoto}
                                            alt={`${firstName} profile`}
                                            onError={() =>
                                                setProfilePhoto("")
                                            }
                                        />
                                    ) : (
                                        firstName
                                            .charAt(0)
                                            .toUpperCase()
                                    )}
                                </span>

                                <span className="profile-name">
                                    Welcome, {firstName}
                                </span>
                            </Link>
                        )}

                        {!isLoggedIn && (
                            <div className="navbar-auth">

                                <Link
                                    to="/login"
                                    className="login-link"
                                >
                                    Login
                                </Link>

                                <Link
                                    to="/register"
                                    className="register-link"
                                >
                                    Register
                                </Link>

                            </div>
                        )}

                        {isLoggedIn && (
                            <button
                                type="button"
                                className="navbar-logout"
                                onClick={handleLogout}
                            >
                                <i className="bi bi-box-arrow-right"></i>
                                <span>Logout</span>
                            </button>
                        )}

                        <button
                            type="button"
                            className="navbar-theme-toggle"
                            onClick={handleThemeToggle}
                            aria-label={
                                darkMode
                                    ? "Switch to light mode"
                                    : "Switch to dark mode"
                            }
                            title={
                                darkMode
                                    ? "Light Mode"
                                    : "Dark Mode"
                            }
                        >
                            <i
                                className={`bi ${darkMode
                                        ? "bi-sun-fill"
                                        : "bi-moon-fill"
                                    }`}
                            ></i>

                            <span>
                                {darkMode
                                    ? "Light Mode"
                                    : "Dark Mode"}
                            </span>
                        </button>

                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;