import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import "./AdminCompanies.css";

function AdminCompanies() {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");
    const [processingId, setProcessingId] = useState(null);
    const [successMessage, setSuccessMessage] = useState("");

    const getCompanyLogo = (company) => {
        const logo = company?.logo;

        if (!logo) {
            return "";
        }

        if (
            logo.startsWith("http://") ||
            logo.startsWith("https://")
        ) {
            return logo;
        }

        return `http://127.0.0.1:8000${
            logo.startsWith("/") ? "" : "/"
        }${logo}`;
    };

    const getOwnerName = (company) => {
        const owner = company?.owner;

        if (typeof owner === "string") {
            return owner;
        }

        if (
            owner &&
            typeof owner === "object"
        ) {
            return (
                owner.username ||
                owner.name ||
                owner.email ||
                "Unknown"
            );
        }

        return (
            company?.owner_name ||
            company?.owner_username ||
            "Unknown"
        );
    };

    const getInitials = (name) => {
        if (!name) {
            return "CO";
        }

        return name
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map((word) =>
                word.charAt(0).toUpperCase()
            )
            .join("");
    };

    const fetchCompanies = async (
        isRefresh = false
    ) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");
            setSuccessMessage("");

            const response = await api.get(
                "admin/companies/"
            );

            const data =
                Array.isArray(response.data)
                    ? response.data
                    : response.data?.results || [];

            setCompanies(data);
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.detail ||
                    "Unable to load companies."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchCompanies();
    }, []);

    const toggleCompanyStatus = async (
        company
    ) => {
        const newStatus =
            !company.is_active;

        const action = newStatus
            ? "activate"
            : "deactivate";

        const confirmed = window.confirm(
            `Are you sure you want to ${action} ${company.name}?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setProcessingId(company.id);
            setSuccessMessage("");

            const response = await api.patch(
                `admin/companies/${company.id}/`,
                {
                    is_active: newStatus,
                }
            );

            const updatedCompany =
                response.data?.company ||
                response.data;

            const updatedStatus =
                updatedCompany?.is_active ??
                newStatus;

            setCompanies(
                (currentCompanies) =>
                    currentCompanies.map(
                        (currentCompany) =>
                            currentCompany.id ===
                            company.id
                                ? {
                                      ...currentCompany,
                                      ...updatedCompany,
                                      is_active:
                                          updatedStatus,
                                  }
                                : currentCompany
                    )
            );

            setSuccessMessage(
                `${company.name} has been ${
                    updatedStatus
                        ? "activated"
                        : "deactivated"
                } successfully.`
            );
        } catch (err) {
            console.error(err);

            alert(
                err.response?.data?.detail ||
                    `Unable to ${action} company.`
            );
        } finally {
            setProcessingId(null);
        }
    };

    const toggleEmployerSuspension = async (
        company
    ) => {
        const newSuspensionStatus =
            !company.is_suspended;

        const action =
            newSuspensionStatus
                ? "suspend"
                : "reactivate";

        const confirmed = window.confirm(
            newSuspensionStatus
                ? `Are you sure you want to suspend the employer for ${company.name}?\n\nThe company and its data will remain available, but the employer will not be allowed to manage the company or post/manage jobs.`
                : `Are you sure you want to reactivate the employer for ${company.name}?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setProcessingId(company.id);
            setSuccessMessage("");

            const response = await api.patch(
                `admin/companies/${company.id}/`,
                {
                    is_suspended:
                        newSuspensionStatus,
                }
            );

            const updatedCompany =
                response.data?.company ||
                response.data;

            const updatedSuspension =
                updatedCompany?.is_suspended ??
                newSuspensionStatus;

            setCompanies(
                (currentCompanies) =>
                    currentCompanies.map(
                        (currentCompany) =>
                            currentCompany.id ===
                            company.id
                                ? {
                                      ...currentCompany,
                                      ...updatedCompany,
                                      is_suspended:
                                          updatedSuspension,
                                  }
                                : currentCompany
                    )
            );

            setSuccessMessage(
                `${company.name} employer has been ${
                    updatedSuspension
                        ? "suspended"
                        : "reactivated"
                } successfully.`
            );
        } catch (err) {
            console.error(err);

            alert(
                err.response?.data?.detail ||
                    `Unable to ${action} employer.`
            );
        } finally {
            setProcessingId(null);
        }
    };

    const deleteCompany = async (
        company
    ) => {
        const confirmed = window.confirm(
            `Are you sure you want to permanently delete ${company.name}?\n\nThis will remove the company and its employer access. Jobs belonging to this company may also be deleted because of the database relationship.\n\nThis action cannot be undone.`
        );

        if (!confirmed) {
            return;
        }

        try {
            setProcessingId(company.id);
            setSuccessMessage("");

            await api.delete(
                `admin/companies/${company.id}/`
            );

            setCompanies(
                (currentCompanies) =>
                    currentCompanies.filter(
                        (currentCompany) =>
                            currentCompany.id !==
                            company.id
                    )
            );

            setSuccessMessage(
                `${company.name} has been permanently deleted.`
            );
        } catch (err) {
            console.error(err);

            alert(
                err.response?.data?.detail ||
                    "Unable to delete company."
            );
        } finally {
            setProcessingId(null);
        }
    };

    const statistics = useMemo(() => {
        const total = companies.length;

        const active = companies.filter(
            (company) => company.is_active
        ).length;

        const inactive =
            total - active;

        const suspended =
            companies.filter(
                (company) =>
                    company.is_suspended
            ).length;

        const available =
            companies.filter(
                (company) =>
                    company.is_active &&
                    !company.is_suspended
            ).length;

        return {
            total,
            active,
            inactive,
            suspended,
            available,
        };
    }, [companies]);

    if (loading) {
        return (
            <div className="admin-companies-page">
                <div className="admin-companies-overlay"></div>

                <div className="admin-companies-container">
                    <div className="admin-companies-state">
                        <div className="admin-companies-spinner"></div>

                        <h2>
                            Loading companies
                        </h2>

                        <p>
                            Please wait while we retrieve the
                            registered companies.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-companies-page">
                <div className="admin-companies-overlay"></div>

                <div className="admin-companies-container">
                    <div className="admin-companies-state">
                        <div className="admin-companies-state-icon">
                            <i className="bi bi-exclamation-triangle"></i>
                        </div>

                        <h2>
                            Unable to load companies
                        </h2>

                        <p>
                            {error}
                        </p>

                        <button
                            type="button"
                            className="admin-companies-retry-button"
                            onClick={() =>
                                fetchCompanies()
                            }
                        >
                            <i className="bi bi-arrow-clockwise"></i>
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-companies-page">
            <div className="admin-companies-overlay"></div>

            <div className="admin-companies-container">
                <header className="admin-companies-header">
                    <div className="admin-companies-heading">
                        <span className="admin-companies-eyebrow">
                            ADMINISTRATION
                        </span>

                        <h1>
                            Manage{" "}
                            <span>
                                Companies
                            </span>
                        </h1>

                        <p>
                            Review registered companies and control
                            their platform and employer access.
                        </p>
                    </div>

                    <div className="admin-companies-header-actions">
                        <Link
                            to="/admin-dashboard"
                            className="admin-companies-dashboard-button"
                        >
                            <i className="bi bi-grid-1x2-fill"></i>
                            Dashboard
                        </Link>

                        <button
                            type="button"
                            className="admin-companies-refresh-button"
                            onClick={() =>
                                fetchCompanies(true)
                            }
                            disabled={refreshing}
                        >
                            <i
                                className={`bi ${
                                    refreshing
                                        ? "bi-arrow-repeat admin-companies-spin"
                                        : "bi-arrow-clockwise"
                                }`}
                            ></i>

                            {refreshing
                                ? "Refreshing..."
                                : "Refresh"}
                        </button>
                    </div>
                </header>

                <section className="admin-companies-summary">
                    <div className="admin-companies-summary-card">
                        <div className="admin-companies-summary-icon">
                            <i className="bi bi-buildings-fill"></i>
                        </div>

                        <div className="admin-companies-summary-content">
                            <span>
                                Total Companies
                            </span>

                            <strong>
                                {statistics.total}
                            </strong>
                        </div>
                    </div>

                    <div className="admin-companies-summary-card">
                        <div className="admin-companies-summary-icon">
                            <i className="bi bi-check-circle-fill"></i>
                        </div>

                        <div className="admin-companies-summary-content">
                            <span>
                                Active Companies
                            </span>

                            <strong>
                                {statistics.active}
                            </strong>
                        </div>
                    </div>

                    <div className="admin-companies-summary-card">
                        <div className="admin-companies-summary-icon">
                            <i className="bi bi-pause-circle-fill"></i>
                        </div>

                        <div className="admin-companies-summary-content">
                            <span>
                                Inactive Companies
                            </span>

                            <strong>
                                {statistics.inactive}
                            </strong>
                        </div>
                    </div>

                    <div className="admin-companies-summary-card">
                        <div className="admin-companies-summary-icon">
                            <i className="bi bi-person-lock"></i>
                        </div>

                        <div className="admin-companies-summary-content">
                            <span>
                                Suspended Employers
                            </span>

                            <strong>
                                {statistics.suspended}
                            </strong>
                        </div>
                    </div>
                </section>

                <section className="admin-companies-toolbar">
                    <div>
                        <i className="bi bi-buildings"></i>

                        <span>
                            {statistics.total}{" "}
                            {statistics.total === 1
                                ? "company"
                                : "companies"}{" "}
                            registered
                        </span>
                    </div>

                    <div className="admin-companies-toolbar-status">
                        <span>
                            <i className="bi bi-circle-fill"></i>
                            Active:{" "}
                            {statistics.active}
                        </span>

                        <span>
                            <i className="bi bi-circle-fill"></i>
                            Inactive:{" "}
                            {statistics.inactive}
                        </span>

                        <span>
                            <i className="bi bi-lock-fill"></i>
                            Suspended:{" "}
                            {statistics.suspended}
                        </span>
                    </div>
                </section>

                {successMessage && (
                    <div className="admin-companies-success">
                        <i className="bi bi-check-circle-fill"></i>

                        <span>
                            {successMessage}
                        </span>
                    </div>
                )}

                {companies.length === 0 ? (
                    <div className="admin-companies-state">
                        <div className="admin-companies-state-icon">
                            <i className="bi bi-buildings"></i>
                        </div>

                        <h2>
                            No companies found
                        </h2>

                        <p>
                            There are currently no registered companies
                            available to manage.
                        </p>

                        <button
                            type="button"
                            className="admin-companies-retry-button"
                            onClick={() =>
                                fetchCompanies(true)
                            }
                        >
                            <i className="bi bi-arrow-clockwise"></i>
                            Refresh
                        </button>
                    </div>
                ) : (
                    <section className="admin-companies-list">
                        {companies.map(
                            (company) => {
                                const logo =
                                    getCompanyLogo(
                                        company
                                    );

                                const ownerName =
                                    getOwnerName(
                                        company
                                    );

                                const initials =
                                    getInitials(
                                        company.name
                                    );

                                const isProcessing =
                                    processingId ===
                                    company.id;

                                return (
                                    <article
                                        className="admin-company-card"
                                        key={
                                            company.id
                                        }
                                    >
                                        <div className="admin-company-header">
                                            <div className="admin-company-identity">
                                                {logo ? (
                                                    <img
                                                        src={
                                                            logo
                                                        }
                                                        alt={`${company.name} logo`}
                                                        className="admin-company-logo"
                                                        onError={(
                                                            event
                                                        ) => {
                                                            event.currentTarget.style.display =
                                                                "none";

                                                            const placeholder =
                                                                event
                                                                    .currentTarget
                                                                    .nextElementSibling;

                                                            if (
                                                                placeholder
                                                            ) {
                                                                placeholder.style.display =
                                                                    "flex";
                                                            }
                                                        }}
                                                    />
                                                ) : null}

                                                <div
                                                    className="admin-company-logo-placeholder"
                                                    style={{
                                                        display:
                                                            logo
                                                                ? "none"
                                                                : "flex",
                                                    }}
                                                >
                                                    {
                                                        initials
                                                    }
                                                </div>

                                                <div className="admin-company-name-area">
                                                    <span className="admin-company-label">
                                                        COMPANY
                                                    </span>

                                                    <h2 className="admin-company-name">
                                                        {
                                                            company.name
                                                        }
                                                    </h2>
                                                </div>
                                            </div>

                                            <div className="admin-company-status-group">
                                                <span
                                                    className={`admin-company-status ${
                                                        company.is_active
                                                            ? "active"
                                                            : "inactive"
                                                    }`}
                                                >
                                                    <i className="bi bi-circle-fill"></i>

                                                    {company.is_active
                                                        ? "Active"
                                                        : "Inactive"}
                                                </span>

                                                <span
                                                    className={`admin-company-employer-status ${
                                                        company.is_suspended
                                                            ? "suspended"
                                                            : "employer-active"
                                                    }`}
                                                >
                                                    <i
                                                        className={`bi ${
                                                            company.is_suspended
                                                                ? "bi-lock-fill"
                                                                : "bi-person-check-fill"
                                                        }`}
                                                    ></i>

                                                    {company.is_suspended
                                                        ? "Employer Suspended"
                                                        : "Employer Active"}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="admin-company-divider"></div>

                                        <div className="admin-company-details">
                                            <div className="admin-company-detail">
                                                <span className="admin-company-detail-label">
                                                    <i className="bi bi-geo-alt-fill"></i>
                                                    Location
                                                </span>

                                                <span className="admin-company-detail-value">
                                                    {company.location ||
                                                        "Not specified"}
                                                </span>
                                            </div>

                                            <div className="admin-company-detail">
                                                <span className="admin-company-detail-label">
                                                    <i className="bi bi-person-fill"></i>
                                                    Owner
                                                </span>

                                                <span className="admin-company-detail-value admin-company-owner">
                                                    <span className="admin-company-owner-avatar">
                                                        {getInitials(
                                                            ownerName
                                                        )}
                                                    </span>

                                                    {
                                                        ownerName
                                                    }
                                                </span>
                                            </div>

                                            <div className="admin-company-detail">
                                                <span className="admin-company-detail-label">
                                                    <i className="bi bi-globe2"></i>
                                                    Website
                                                </span>

                                                {company.website ? (
                                                    <a
                                                        href={
                                                            company.website
                                                        }
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="admin-company-detail-value admin-company-website"
                                                    >
                                                        {
                                                            company.website
                                                        }

                                                        <i className="bi bi-box-arrow-up-right"></i>
                                                    </a>
                                                ) : (
                                                    <span className="admin-company-detail-value">
                                                        Not provided
                                                    </span>
                                                )}
                                            </div>

                                            <div className="admin-company-detail full-width">
                                                <span className="admin-company-detail-label">
                                                    <i className="bi bi-card-text"></i>
                                                    Description
                                                </span>

                                                <p className="admin-company-detail-value description">
                                                    {company.description ||
                                                        "No description provided."}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="admin-company-actions">
                                            <button
                                                type="button"
                                                className={`admin-companies-action-button ${
                                                    company.is_active
                                                        ? "deactivate"
                                                        : "activate"
                                                }`}
                                                onClick={() =>
                                                    toggleCompanyStatus(
                                                        company
                                                    )
                                                }
                                                disabled={
                                                    isProcessing
                                                }
                                            >
                                                {isProcessing ? (
                                                    <>
                                                        <i className="bi bi-arrow-repeat admin-companies-spin"></i>
                                                        Processing...
                                                    </>
                                                ) : company.is_active ? (
                                                    <>
                                                        <i className="bi bi-pause-circle-fill"></i>
                                                        Deactivate Company
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="bi bi-check-circle-fill"></i>
                                                        Activate Company
                                                    </>
                                                )}
                                            </button>

                                            <button
                                                type="button"
                                                className={`admin-companies-action-button ${
                                                    company.is_suspended
                                                        ? "reactivate-employer"
                                                        : "suspend-employer"
                                                }`}
                                                onClick={() =>
                                                    toggleEmployerSuspension(
                                                        company
                                                    )
                                                }
                                                disabled={
                                                    isProcessing
                                                }
                                            >
                                                {isProcessing ? (
                                                    <>
                                                        <i className="bi bi-arrow-repeat admin-companies-spin"></i>
                                                        Processing...
                                                    </>
                                                ) : company.is_suspended ? (
                                                    <>
                                                        <i className="bi bi-person-check-fill"></i>
                                                        Reactivate Employer
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="bi bi-person-lock"></i>
                                                        Suspend Employer
                                                    </>
                                                )}
                                            </button>

                                            <button
                                                type="button"
                                                className="admin-companies-action-button delete-company"
                                                onClick={() =>
                                                    deleteCompany(
                                                        company
                                                    )
                                                }
                                                disabled={
                                                    isProcessing
                                                }
                                            >
                                                <i className="bi bi-trash3-fill"></i>

                                                {isProcessing
                                                    ? "Processing..."
                                                    : "Delete Company"}
                                            </button>
                                        </div>
                                    </article>
                                );
                            }
                        )}
                    </section>
                )}

                <footer className="admin-companies-footer">
                    <span>
                        <i className="bi bi-shield-check"></i>
                        Administrator Company Management
                    </span>

                    <span>
                        {statistics.available} available{" "}
                        {statistics.available === 1
                            ? "company"
                            : "companies"}
                    </span>

                    <span>
                        {statistics.suspended} suspended{" "}
                        {statistics.suspended === 1
                            ? "employer"
                            : "employers"}
                    </span>
                </footer>
            </div>
        </div>
    );
}

export default AdminCompanies;