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

    if (logo.startsWith("http://") || logo.startsWith("https://")) {
      return logo;
    }

    return `http://127.0.0.1:8000${logo.startsWith("/") ? "" : "/"}${logo}`;
  };

  const getOwnerName = (company) => {
    const owner = company?.owner;

    if (typeof owner === "string") {
      return owner;
    }

    if (owner && typeof owner === "object") {
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
      .map((word) => word.charAt(0).toUpperCase())
      .join("");
  };

  const fetchCompanies = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");
      setSuccessMessage("");

      const response = await api.get("admin/companies/");

      const data = Array.isArray(response.data)
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

  const toggleCompanyStatus = async (company) => {
    const newStatus = !company.is_active;

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

      const updatedStatus =
        response.data?.company?.is_active ??
        response.data?.is_active ??
        newStatus;

      setCompanies((currentCompanies) =>
        currentCompanies.map((currentCompany) =>
          currentCompany.id === company.id
            ? {
                ...currentCompany,
                is_active: updatedStatus,
              }
            : currentCompany
        )
      );

      setSuccessMessage(
        `${company.name} has been ${
          updatedStatus ? "activated" : "deactivated"
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

  const statistics = useMemo(() => {
    const total = companies.length;
    const active = companies.filter(
      (company) => company.is_active
    ).length;
    const inactive = total - active;

    return {
      total,
      active,
      inactive,
    };
  }, [companies]);

  if (loading) {
    return (
      <div className="admin-companies-page">
        <div className="admin-companies-overlay"></div>

        <div className="admin-companies-container">
          <div className="admin-companies-state">
            <div className="admin-companies-spinner"></div>
            <h2>Loading companies</h2>
            <p>
              Please wait while we retrieve the registered
              companies.
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

            <h2>Unable to load companies</h2>

            <p>{error}</p>

            <button
              type="button"
              className="admin-companies-retry-button"
              onClick={() => fetchCompanies()}
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
              Manage <span>Companies</span>
            </h1>

            <p>
              Review registered companies and control their
              platform access.
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
              onClick={() => fetchCompanies(true)}
              disabled={refreshing}
            >
              <i
                className={`bi ${
                  refreshing
                    ? "bi-arrow-repeat admin-companies-spin"
                    : "bi-arrow-clockwise"
                }`}
              ></i>

              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </header>

        <section className="admin-companies-summary">
          <div className="admin-companies-summary-card">
            <div className="admin-companies-summary-icon">
              <i className="bi bi-buildings-fill"></i>
            </div>

            <div className="admin-companies-summary-content">
              <span>Total Companies</span>
              <strong>{statistics.total}</strong>
            </div>
          </div>

          <div className="admin-companies-summary-card">
            <div className="admin-companies-summary-icon">
              <i className="bi bi-check-circle-fill"></i>
            </div>

            <div className="admin-companies-summary-content">
              <span>Active Companies</span>
              <strong>{statistics.active}</strong>
            </div>
          </div>

          <div className="admin-companies-summary-card">
            <div className="admin-companies-summary-icon">
              <i className="bi bi-pause-circle-fill"></i>
            </div>

            <div className="admin-companies-summary-content">
              <span>Inactive Companies</span>
              <strong>{statistics.inactive}</strong>
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
              Active: {statistics.active}
            </span>

            <span>
              <i className="bi bi-circle-fill"></i>
              Inactive: {statistics.inactive}
            </span>
          </div>
        </section>

        {successMessage && (
          <div className="admin-companies-success">
            <i className="bi bi-check-circle-fill"></i>
            <span>{successMessage}</span>
          </div>
        )}

        {companies.length === 0 ? (
          <div className="admin-companies-state">
            <div className="admin-companies-state-icon">
              <i className="bi bi-buildings"></i>
            </div>

            <h2>No companies found</h2>

            <p>
              There are currently no registered companies
              available to manage.
            </p>

            <button
              type="button"
              className="admin-companies-retry-button"
              onClick={() => fetchCompanies(true)}
            >
              <i className="bi bi-arrow-clockwise"></i>
              Refresh
            </button>
          </div>
        ) : (
          <section className="admin-companies-list">
            {companies.map((company) => {
              const logo = getCompanyLogo(company);
              const ownerName = getOwnerName(company);
              const initials = getInitials(company.name);
              const isProcessing =
                processingId === company.id;

              return (
                <article
                  className="admin-company-card"
                  key={company.id}
                >
                  <div className="admin-company-header">
                    <div className="admin-company-identity">
                      {logo ? (
                        <img
                          src={logo}
                          alt={`${company.name} logo`}
                          className="admin-company-logo"
                          onError={(event) => {
                            event.currentTarget.style.display =
                              "none";

                            const placeholder =
                              event.currentTarget
                                .nextElementSibling;

                            if (placeholder) {
                              placeholder.style.display =
                                "flex";
                            }
                          }}
                        />
                      ) : null}

                      <div
                        className="admin-company-logo-placeholder"
                        style={{
                          display: logo ? "none" : "flex",
                        }}
                      >
                        {initials}
                      </div>

                      <div className="admin-company-name-area">
                        <span className="admin-company-label">
                          COMPANY
                        </span>

                        <h2 className="admin-company-name">
                          {company.name}
                        </h2>
                      </div>
                    </div>

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
                          {getInitials(ownerName)}
                        </span>
                        {ownerName}
                      </span>
                    </div>

                    <div className="admin-company-detail">
                      <span className="admin-company-detail-label">
                        <i className="bi bi-globe2"></i>
                        Website
                      </span>

                      {company.website ? (
                        <a
                          href={company.website}
                          target="_blank"
                          rel="noreferrer"
                          className="admin-company-detail-value admin-company-website"
                        >
                          {company.website}
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
                        toggleCompanyStatus(company)
                      }
                      disabled={isProcessing}
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
                  </div>
                </article>
              );
            })}
          </section>
        )}

        <footer className="admin-companies-footer">
          <span>
            <i className="bi bi-shield-check"></i>
            Administrator Company Management
          </span>

          <span>
            {statistics.active} active{" "}
            {statistics.active === 1
              ? "company"
              : "companies"}
          </span>
        </footer>
      </div>
    </div>
  );
}

export default AdminCompanies;