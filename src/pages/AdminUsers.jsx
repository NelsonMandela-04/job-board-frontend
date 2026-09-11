import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import "./AdminUsers.css";

function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [processingId, setProcessingId] = useState(null);
    const [successMessage, setSuccessMessage] = useState("");

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError("");
            setSuccessMessage("");

            const response = await api.get(
                "admin/users/"
            );

            setUsers(
                Array.isArray(response.data)
                    ? response.data
                    : response.data?.results || []
            );
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.detail ||
                    "Unable to load users."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const toggleUserStatus = async (user) => {
        const newStatus = !user.is_active;

        const action = newStatus
            ? "activate"
            : "deactivate";

        const confirmed = window.confirm(
            `Are you sure you want to ${action} ${user.username}?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setProcessingId(user.id);
            setSuccessMessage("");

            const response = await api.patch(
                `admin/users/${user.id}/`,
                {
                    is_active: newStatus,
                }
            );

            const updatedUser =
                response.data?.user ||
                response.data;

            setUsers((currentUsers) =>
                currentUsers.map((currentUser) =>
                    currentUser.id === user.id
                        ? {
                              ...currentUser,
                              ...updatedUser,
                              is_active:
                                  updatedUser?.is_active ??
                                  newStatus,
                          }
                        : currentUser
                )
            );

            setSuccessMessage(
                `${user.username} has been ${
                    newStatus
                        ? "activated"
                        : "deactivated"
                } successfully.`
            );
        } catch (err) {
            console.error(err);

            alert(
                err.response?.data?.detail ||
                    `Unable to ${action} user.`
            );
        } finally {
            setProcessingId(null);
        }
    };

    const deleteUser = async (user) => {
        const confirmed = window.confirm(
            `Are you sure you want to permanently delete ${user.username}?\n\nThis action cannot be undone and may remove all data belonging to this user.`
        );

        if (!confirmed) {
            return;
        }

        try {
            setProcessingId(user.id);
            setSuccessMessage("");

            await api.delete(
                `admin/users/${user.id}/`
            );

            setUsers((currentUsers) =>
                currentUsers.filter(
                    (currentUser) =>
                        currentUser.id !== user.id
                )
            );

            setSuccessMessage(
                `${user.username} has been permanently deleted.`
            );
        } catch (err) {
            console.error(err);

            alert(
                err.response?.data?.detail ||
                    "Unable to delete user."
            );
        } finally {
            setProcessingId(null);
        }
    };

    const statistics = useMemo(() => {
        const total = users.length;

        const active = users.filter(
            (user) => user.is_active
        ).length;

        const inactive = users.filter(
            (user) => !user.is_active
        ).length;

        const staff = users.filter(
            (user) => user.is_staff
        ).length;

        const employers = users.filter(
            (user) =>
                user.is_employer ||
                user.has_company ||
                user.company_count > 0 ||
                Array.isArray(user.companies) &&
                    user.companies.length > 0
        ).length;

        return {
            total,
            active,
            inactive,
            staff,
            employers,
        };
    }, [users]);

    const isEmployer = (user) => {
        return (
            user.is_employer ||
            user.has_company ||
            user.company_count > 0 ||
            (
                Array.isArray(user.companies) &&
                user.companies.length > 0
            )
        );
    };

    const getInitials = (user) => {
        const username =
            user.username ||
            user.email ||
            "U";

        return username
            .substring(0, 2)
            .toUpperCase();
    };

    const formatDate = (date) => {
        if (!date) {
            return "—";
        }

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "—";
        }

        return parsedDate.toLocaleDateString(
            undefined,
            {
                year: "numeric",
                month: "short",
                day: "numeric",
            }
        );
    };

    if (loading) {
        return (
            <div className="admin-users-page">
                <div className="admin-users-loading">
                    <div className="admin-users-loading-spinner"></div>

                    <h2>
                        Loading Users
                    </h2>

                    <p>
                        Please wait while we retrieve the
                        registered users.
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-users-page">
                <div className="admin-users-error-card">
                    <div className="admin-users-error-icon">
                        <i className="bi bi-exclamation-triangle-fill"></i>
                    </div>

                    <h2>
                        Unable to Load Users
                    </h2>

                    <p>
                        {error}
                    </p>

                    <button
                        type="button"
                        className="admin-users-retry-button"
                        onClick={fetchUsers}
                    >
                        <i className="bi bi-arrow-clockwise"></i>
                        Try Again
                    </button>

                    <Link
                        to="/admin-dashboard"
                        className="admin-users-back-link"
                    >
                        <i className="bi bi-arrow-left"></i>
                        Back to Admin Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-users-page">
            <div className="admin-users-overlay"></div>

            <div className="admin-users-container">
                <header className="admin-users-header">
                    <div className="admin-users-heading">
                        <span className="admin-users-label">
                            <i className="bi bi-shield-lock-fill"></i>
                            ADMINISTRATION
                        </span>

                        <h1>
                            Manage Users
                        </h1>

                        <p>
                            Monitor registered users, review
                            account status, and manage access
                            to the Job Board platform.
                        </p>
                    </div>

                    <Link
                        to="/admin-dashboard"
                        className="admin-users-dashboard-button"
                    >
                        <i className="bi bi-grid-1x2-fill"></i>
                        Admin Dashboard
                    </Link>
                </header>

                <section className="admin-users-statistics">
                    <div className="admin-user-stat-card">
                        <div className="admin-user-stat-icon total">
                            <i className="bi bi-people-fill"></i>
                        </div>

                        <div>
                            <span>
                                Total Users
                            </span>

                            <strong>
                                {statistics.total}
                            </strong>
                        </div>
                    </div>

                    <div className="admin-user-stat-card">
                        <div className="admin-user-stat-icon active">
                            <i className="bi bi-person-check-fill"></i>
                        </div>

                        <div>
                            <span>
                                Active Users
                            </span>

                            <strong>
                                {statistics.active}
                            </strong>
                        </div>
                    </div>

                    <div className="admin-user-stat-card">
                        <div className="admin-user-stat-icon inactive">
                            <i className="bi bi-person-x-fill"></i>
                        </div>

                        <div>
                            <span>
                                Inactive Users
                            </span>

                            <strong>
                                {statistics.inactive}
                            </strong>
                        </div>
                    </div>

                    <div className="admin-user-stat-card">
                        <div className="admin-user-stat-icon staff">
                            <i className="bi bi-shield-fill-check"></i>
                        </div>

                        <div>
                            <span>
                                Staff Accounts
                            </span>

                            <strong>
                                {statistics.staff}
                            </strong>
                        </div>
                    </div>

                    <div className="admin-user-stat-card">
                        <div className="admin-user-stat-icon employer">
                            <i className="bi bi-building-fill"></i>
                        </div>

                        <div>
                            <span>
                                Employers
                            </span>

                            <strong>
                                {statistics.employers}
                            </strong>
                        </div>
                    </div>
                </section>

                {successMessage && (
                    <div className="admin-users-success">
                        <i className="bi bi-check-circle-fill"></i>

                        <span>
                            {successMessage}
                        </span>
                    </div>
                )}

                <section className="admin-users-card">
                    <div className="admin-users-card-header">
                        <div>
                            <div className="admin-users-card-title">
                                <div className="admin-users-card-title-icon">
                                    <i className="bi bi-people-fill"></i>
                                </div>

                                <div>
                                    <h2>
                                        Registered Users
                                    </h2>

                                    <p>
                                        {users.length}{" "}
                                        {users.length === 1
                                            ? "user"
                                            : "users"}{" "}
                                        registered on the platform
                                    </p>
                                </div>
                            </div>
                        </div>

                        <button
                            type="button"
                            className="admin-users-refresh-button"
                            onClick={fetchUsers}
                        >
                            <i className="bi bi-arrow-clockwise"></i>
                            Refresh
                        </button>
                    </div>

                    {users.length === 0 ? (
                        <div className="admin-users-empty">
                            <div className="admin-users-empty-icon">
                                <i className="bi bi-people"></i>
                            </div>

                            <h3>
                                No Users Found
                            </h3>

                            <p>
                                There are currently no registered
                                users on the platform.
                            </p>
                        </div>
                    ) : (
                        <div className="admin-users-table-wrapper">
                            <table className="admin-users-table">
                                <thead>
                                    <tr>
                                        <th>
                                            User
                                        </th>

                                        <th>
                                            Email
                                        </th>

                                        <th>
                                            Role
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                        <th>
                                            Date Joined
                                        </th>

                                        <th>
                                            Action
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {users.map((user) => {
                                        const employer =
                                            isEmployer(user);

                                        const processing =
                                            processingId ===
                                            user.id;

                                        return (
                                            <tr
                                                key={user.id}
                                            >
                                                <td>
                                                    <div className="admin-user-profile">
                                                        <div className="admin-user-avatar">
                                                            {getInitials(
                                                                user
                                                            )}
                                                        </div>

                                                        <div className="admin-user-name">
                                                            <strong>
                                                                {user.username ||
                                                                    "No username"}
                                                            </strong>

                                                            <span>
                                                                User ID: #
                                                                {user.id}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td>
                                                    <div className="admin-user-email">
                                                        <i className="bi bi-envelope"></i>

                                                        <span>
                                                            {user.email ||
                                                                "No email"}
                                                        </span>
                                                    </div>
                                                </td>

                                                <td>
                                                    {user.is_staff ? (
                                                        <span className="admin-user-role staff">
                                                            <i className="bi bi-shield-fill-check"></i>
                                                            Staff
                                                        </span>
                                                    ) : employer ? (
                                                        <span className="admin-user-role employer">
                                                            <i className="bi bi-building-fill"></i>
                                                            Employer
                                                        </span>
                                                    ) : (
                                                        <span className="admin-user-role user">
                                                            <i className="bi bi-person-fill"></i>
                                                            User
                                                        </span>
                                                    )}
                                                </td>

                                                <td>
                                                    {user.is_active ? (
                                                        <span className="admin-user-status active">
                                                            <span className="status-dot"></span>
                                                            Active
                                                        </span>
                                                    ) : (
                                                        <span className="admin-user-status inactive">
                                                            <span className="status-dot"></span>
                                                            Inactive
                                                        </span>
                                                    )}
                                                </td>

                                                <td>
                                                    <div className="admin-user-date">
                                                        <i className="bi bi-calendar3"></i>

                                                        {formatDate(
                                                            user.date_joined
                                                        )}
                                                    </div>
                                                </td>

                                                <td>
                                                    <div className="admin-user-actions">
                                                        <button
                                                            type="button"
                                                            className={
                                                                user.is_active
                                                                    ? "admin-user-action deactivate"
                                                                    : "admin-user-action activate"
                                                            }
                                                            onClick={() =>
                                                                toggleUserStatus(
                                                                    user
                                                                )
                                                            }
                                                            disabled={
                                                                processing
                                                            }
                                                        >
                                                            <i
                                                                className={
                                                                    user.is_active
                                                                        ? "bi bi-person-x-fill"
                                                                        : "bi bi-person-check-fill"
                                                                }
                                                            ></i>

                                                            {user.is_active
                                                                ? "Deactivate"
                                                                : "Activate"}
                                                        </button>

                                                        {!user.is_staff && (
                                                            <button
                                                                type="button"
                                                                className="admin-user-action delete"
                                                                onClick={() =>
                                                                    deleteUser(
                                                                        user
                                                                    )
                                                                }
                                                                disabled={
                                                                    processing
                                                                }
                                                            >
                                                                <i className="bi bi-trash3-fill"></i>

                                                                {processing
                                                                    ? "Processing..."
                                                                    : "Delete User"}
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                <footer className="admin-users-footer">
                    <span>
                        <i className="bi bi-shield-check"></i>
                        Administrator Control Panel
                    </span>

                    <span>
                        <i className="bi bi-lock-fill"></i>
                        Secure User Management
                    </span>

                    <span>
                        <i className="bi bi-activity"></i>
                        {statistics.active} active accounts
                    </span>
                </footer>
            </div>
        </div>
    );
}

export default AdminUsers;