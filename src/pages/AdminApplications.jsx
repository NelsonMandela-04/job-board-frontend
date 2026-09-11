import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import "./AdminApplications.css";

function AdminApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchApplications = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await api.get("admin/applications/");

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.results || [];

      setApplications(data);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
          "Unable to load applications."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const statistics = useMemo(() => {
    const total = applications.length;

    const pending = applications.filter(
      (application) =>
        application.status?.toLowerCase() === "pending"
    ).length;

    const reviewed = applications.filter(
      (application) =>
        application.status?.toLowerCase() === "reviewed"
    ).length;

    const accepted = applications.filter(
      (application) =>
        application.status?.toLowerCase() === "accepted"
    ).length;

    const rejected = applications.filter(
      (application) =>
        application.status?.toLowerCase() === "rejected"
    ).length;

    return {
      total,
      pending,
      reviewed,
      accepted,
      rejected,
    };
  }, [applications]);

  const getApplicantName = (application) => {
    if (typeof application.applicant === "string") {
      return application.applicant;
    }

    if (
      application.applicant &&
      typeof application.applicant === "object"
    ) {
      return (
        application.applicant.username ||
        application.applicant.name ||
        application.applicant.email ||
        "Unknown Applicant"
      );
    }

    return (
      application.applicant_name ||
      application.applicant_username ||
      "Unknown Applicant"
    );
  };

  const getJobName = (application) => {
    if (typeof application.job === "string") {
      return application.job;
    }

    if (
      application.job &&
      typeof application.job === "object"
    ) {
      return (
        application.job.title ||
        application.job.name ||
        "Unknown Job"
      );
    }

    if (
      application.job_details &&
      typeof application.job_details === "object"
    ) {
      return (
        application.job_details.title ||
        application.job_details.name ||
        "Unknown Job"
      );
    }

    return application.job_title || "Unknown Job";
  };

  const getCompanyName = (application) => {
    if (typeof application.company === "string") {
      return application.company;
    }

    if (
      application.company &&
      typeof application.company === "object"
    ) {
      return (
        application.company.name ||
        "Unknown Company"
      );
    }

    if (
      application.job_details?.company_details &&
      typeof application.job_details.company_details ===
        "object"
    ) {
      return (
        application.job_details.company_details.name ||
        "Unknown Company"
      );
    }

    return application.company_name || "Unknown Company";
  };

  const getApplicantInitials = (name) => {
    if (!name) {
      return "AP";
    }

    const words = name.trim().split(/\s+/);

    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }

    return (
      words[0].charAt(0) +
      words[1].charAt(0)
    ).toUpperCase();
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case "accepted":
        return "accepted";

      case "rejected":
        return "rejected";

      case "reviewed":
        return "reviewed";

      case "pending":
      default:
        return "pending";
    }
  };

  const formatStatus = (status) => {
    if (!status) {
      return "Unknown";
    }

    return status
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  };

  const formatDate = (date) => {
    if (!date) {
      return "Unknown";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Unknown";
    }

    return parsedDate.toLocaleString();
  };

  if (loading) {
    return (
      <div className="admin-applications-page">
        <div className="admin-applications-overlay"></div>

        <div className="admin-applications-container">
          <div className="admin-applications-state">
            <div className="admin-applications-spinner"></div>

            <h2>Loading applications</h2>

            <p>
              Please wait while we retrieve application
              records.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-applications-page">
        <div className="admin-applications-overlay"></div>

        <div className="admin-applications-container">
          <div className="admin-applications-state">
            <div className="admin-applications-state-icon">
              <i className="bi bi-exclamation-triangle"></i>
            </div>

            <h2>Unable to load applications</h2>

            <p>{error}</p>

            <button
              type="button"
              className="admin-applications-retry-button"
              onClick={() => fetchApplications()}
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
    <div className="admin-applications-page">
      <div className="admin-applications-overlay"></div>

      <div className="admin-applications-container">
        <header className="admin-applications-header">
          <div className="admin-applications-heading">
            <span className="admin-applications-eyebrow">
              ADMINISTRATION
            </span>

            <h1>
              Manage <span>Applications</span>
            </h1>

            <p>
              Monitor job applications submitted across
              the platform.
            </p>
          </div>

          <div className="admin-applications-header-actions">
            <Link
              to="/admin-dashboard"
              className="admin-applications-dashboard-button"
            >
              <i className="bi bi-grid-1x2-fill"></i>
              Dashboard
            </Link>

            <button
              type="button"
              className="admin-applications-refresh-button"
              onClick={() => fetchApplications(true)}
              disabled={refreshing}
            >
              <i
                className={`bi ${
                  refreshing
                    ? "bi-arrow-repeat admin-applications-spin"
                    : "bi-arrow-clockwise"
                }`}
              ></i>

              {refreshing
                ? "Refreshing..."
                : "Refresh"}
            </button>
          </div>
        </header>

        <section className="admin-applications-summary">
          <div className="admin-applications-summary-card">
            <div className="admin-applications-summary-icon">
              <i className="bi bi-file-earmark-text-fill"></i>
            </div>

            <div className="admin-applications-summary-content">
              <span>Total Applications</span>
              <strong>{statistics.total}</strong>
            </div>
          </div>

          <div className="admin-applications-summary-card">
            <div className="admin-applications-summary-icon">
              <i className="bi bi-hourglass-split"></i>
            </div>

            <div className="admin-applications-summary-content">
              <span>Pending</span>
              <strong>{statistics.pending}</strong>
            </div>
          </div>

          <div className="admin-applications-summary-card">
            <div className="admin-applications-summary-icon">
              <i className="bi bi-eye-fill"></i>
            </div>

            <div className="admin-applications-summary-content">
              <span>Reviewed</span>
              <strong>{statistics.reviewed}</strong>
            </div>
          </div>

          <div className="admin-applications-summary-card">
            <div className="admin-applications-summary-icon">
              <i className="bi bi-check-circle-fill"></i>
            </div>

            <div className="admin-applications-summary-content">
              <span>Accepted</span>
              <strong>{statistics.accepted}</strong>
            </div>
          </div>
        </section>

        <section className="admin-applications-toolbar">
          <div className="admin-applications-toolbar-title">
            <i className="bi bi-briefcase-fill"></i>

            <span>
              {statistics.total}{" "}
              {statistics.total === 1
                ? "application"
                : "applications"}{" "}
              found
            </span>
          </div>

          <div className="admin-applications-toolbar-status">
            <span className="pending">
              <i className="bi bi-circle-fill"></i>
              Pending {statistics.pending}
            </span>

            <span className="reviewed">
              <i className="bi bi-circle-fill"></i>
              Reviewed {statistics.reviewed}
            </span>

            <span className="accepted">
              <i className="bi bi-circle-fill"></i>
              Accepted {statistics.accepted}
            </span>

            <span className="rejected">
              <i className="bi bi-circle-fill"></i>
              Rejected {statistics.rejected}
            </span>
          </div>
        </section>

        {applications.length === 0 ? (
          <div className="admin-applications-state">
            <div className="admin-applications-state-icon">
              <i className="bi bi-file-earmark-x"></i>
            </div>

            <h2>No applications found</h2>

            <p>
              There are currently no job applications
              registered on the platform.
            </p>

            <button
              type="button"
              className="admin-applications-retry-button"
              onClick={() => fetchApplications(true)}
            >
              <i className="bi bi-arrow-clockwise"></i>
              Refresh
            </button>
          </div>
        ) : (
          <section className="admin-applications-list">
            {applications.map((application) => {
              const applicantName =
                getApplicantName(application);

              const jobName =
                getJobName(application);

              const companyName =
                getCompanyName(application);

              const statusClass =
                getStatusClass(application.status);

              return (
                <article
                  className="admin-application-card"
                  key={application.id}
                >
                  <div className="admin-application-card-header">
                    <div className="admin-application-number">
                      <span>APPLICATION</span>

                      <strong>
                        #{application.id}
                      </strong>
                    </div>

                    <span
                      className={`admin-application-status ${statusClass}`}
                    >
                      <i className="bi bi-circle-fill"></i>
                      {formatStatus(
                        application.status
                      )}
                    </span>
                  </div>

                  <div className="admin-application-divider"></div>

                  <div className="admin-application-applicant">
                    <div className="admin-application-avatar">
                      {getApplicantInitials(
                        applicantName
                      )}
                    </div>

                    <div className="admin-application-applicant-info">
                      <span>APPLICANT</span>

                      <h2>{applicantName}</h2>
                    </div>
                  </div>

                  <div className="admin-application-details">
                    <div className="admin-application-detail">
                      <span className="admin-application-detail-label">
                        <i className="bi bi-briefcase-fill"></i>
                        Job
                      </span>

                      <strong>
                        {jobName}
                      </strong>
                    </div>

                    <div className="admin-application-detail">
                      <span className="admin-application-detail-label">
                        <i className="bi bi-building-fill"></i>
                        Company
                      </span>

                      <strong>
                        {companyName}
                      </strong>
                    </div>

                    <div className="admin-application-detail">
                      <span className="admin-application-detail-label">
                        <i className="bi bi-calendar3"></i>
                        Applied
                      </span>

                      <strong>
                        {formatDate(
                          application.created_at ||
                            application.applied_at
                        )}
                      </strong>
                    </div>

                    <div className="admin-application-detail">
                      <span className="admin-application-detail-label">
                        <i className="bi bi-activity"></i>
                        Status
                      </span>

                      <strong
                        className={`admin-application-status-text ${statusClass}`}
                      >
                        {formatStatus(
                          application.status
                        )}
                      </strong>
                    </div>
                  </div>

                  {application.cover_letter && (
                    <div className="admin-application-cover">
                      <div className="admin-application-cover-header">
                        <span>
                          <i className="bi bi-envelope-paper-fill"></i>
                          Cover Letter
                        </span>
                      </div>

                      <p>
                        {application.cover_letter}
                      </p>
                    </div>
                  )}

                  <div className="admin-application-footer">
                    <span>
                      <i className="bi bi-shield-check"></i>
                      Application record
                    </span>

                    <span>
                      ID #{application.id}
                    </span>
                  </div>
                </article>
              );
            })}
          </section>
        )}

        <footer className="admin-applications-page-footer">
          <span>
            <i className="bi bi-shield-check"></i>
            Administrator Application Management
          </span>

          <span>
            {statistics.total} total{" "}
            {statistics.total === 1
              ? "application"
              : "applications"}
          </span>
        </footer>
      </div>
    </div>
  );
}

export default AdminApplications;