import { useCallback, useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import api from "../api/axios";
import { getUser } from "../utils/auth";
import JobLocationPicker from "../components/JobLocationPicker";

import "./CreateJob.css";

function CreateJob() {
    const navigate = useNavigate();

    const user = getUser();
    const userId = user?.id || null;

    const [companies, setCompanies] = useState([]);

    const [formData, setFormData] = useState({
        company: "",
        title: "",
        description: "",
        location: "",
        latitude: "",
        longitude: "",
        job_type: "full_time",
        salary: "",
        requirements: "",
    });

    const [error, setError] = useState("");
    const [locationMessage, setLocationMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [companiesLoading, setCompaniesLoading] = useState(true);

    const fetchCompanies = useCallback(async () => {
        if (!userId) {
            return;
        }

        setCompaniesLoading(true);
        setError("");

        try {
            const response = await api.get("companies/");

            console.log(
                "MY COMPANIES RESPONSE:",
                response.data
            );

            const companyData = Array.isArray(response.data)
                ? response.data
                : response.data?.results || [];

            setCompanies(companyData);

            if (companyData.length === 1) {
                setFormData((previousData) => {
                    if (
                        previousData.company ===
                        companyData[0].id.toString()
                    ) {
                        return previousData;
                    }

                    return {
                        ...previousData,
                        company:
                            companyData[0].id.toString(),
                    };
                });
            }
        } catch (err) {
            console.error(
                "COMPANIES ERROR:",
                err
            );

            console.log(
                "STATUS:",
                err.response?.status
            );

            console.log(
                "SERVER RESPONSE DATA:",
                JSON.stringify(
                    err.response?.data,
                    null,
                    2
                )
            );

            setError(
                "Unable to load your companies."
            );
        } finally {
            setCompaniesLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        if (!userId) {
            setCompaniesLoading(false);
            return;
        }

        fetchCompanies();
    }, [userId, fetchCompanies]);

    if (!user) {
        return (
            <div className="create-job-page">
                <div className="create-job-container">
                    <div className="login-required-card">
                        <div className="login-required-icon">
                            <i className="bi bi-lock-fill"></i>
                        </div>

                        <h1>
                            Login Required
                        </h1>

                        <p>
                            You must be logged in to
                            post a job.
                        </p>

                        <Link
                            to="/login"
                            className="primary-button"
                        >
                            Login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const handleChange = (event) => {
        const {
            name,
            value
        } = event.target;

        setFormData((previousData) => ({
            ...previousData,
            [name]: value,
        }));

        if (name === "location") {
            setLocationMessage("");
        }

        setError("");
    };

    const handleLocationChange = (locationData) => {
        console.log(
            "GOOGLE LOCATION SELECTED:",
            locationData
        );

        setFormData((previousData) => ({
            ...previousData,
            location:
                locationData.address || "",
            latitude:
                locationData.latitude !==
                undefined
                    ? locationData.latitude.toString()
                    : "",
            longitude:
                locationData.longitude !==
                undefined
                    ? locationData.longitude.toString()
                    : "",
        }));

        setLocationMessage(
            "Job location selected successfully."
        );

        setError("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        console.log(
            "POST JOB BUTTON CLICKED"
        );

        console.log(
            "FORM DATA:",
            formData
        );

        setError("");

        if (!formData.company) {
            setError(
                "Please select your company."
            );
            return;
        }

        if (!formData.title.trim()) {
            setError(
                "Please enter the job title."
            );
            return;
        }

        if (!formData.description.trim()) {
            setError(
                "Please enter the job description."
            );
            return;
        }

        if (!formData.location.trim()) {
            setError(
                "Please search for and select a job location from Google Maps."
            );
            return;
        }

        if (
            !formData.latitude ||
            !formData.longitude
        ) {
            setError(
                "Please select a location from the Google Maps suggestions so the coordinates can be captured."
            );
            return;
        }

        const latitude = parseFloat(
            formData.latitude
        );

        const longitude = parseFloat(
            formData.longitude
        );

        if (
            Number.isNaN(latitude) ||
            Number.isNaN(longitude)
        ) {
            setError(
                "The selected location has invalid coordinates."
            );
            return;
        }

        setLoading(true);

        try {
            const jobData = {
                company:
                    Number(formData.company),

                title:
                    formData.title.trim(),

                description:
                    formData.description.trim(),

                location:
                    formData.location.trim(),

                latitude,

                longitude,

                job_type:
                    formData.job_type,

                salary:
                    formData.salary.trim(),

                requirements:
                    formData.requirements.trim(),
            };

            console.log(
                "DATA BEING SENT TO SERVER:",
                jobData
            );

            const response = await api.post(
                "jobs/",
                jobData
            );

            console.log(
                "JOB CREATED:",
                response.data
            );

            navigate("/employer");
        } catch (err) {
            console.error(
                "CREATE JOB ERROR:",
                err
            );

            console.log(
                "STATUS:",
                err.response?.status
            );

            console.log(
                "SERVER RESPONSE DATA:",
                JSON.stringify(
                    err.response?.data,
                    null,
                    2
                )
            );

            const data =
                err.response?.data;

            if (data?.detail) {
                setError(data.detail);
            } else if (data) {
                setError(
                    JSON.stringify(data)
                );
            } else {
                setError(
                    "Unable to create job."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-job-page">

            <div className="create-job-container">

                <div className="create-job-header">

                    <div>
                        <span className="create-job-label">
                            EMPLOYER
                        </span>

                        <h1>
                            Post a Job
                        </h1>

                        <p>
                            Find the right person for
                            your company by creating a
                            new job opportunity.
                        </p>
                    </div>

                    <Link
                        to="/employer"
                        className="back-button"
                    >
                        <i className="bi bi-arrow-left"></i> Employer Dashboard
                    </Link>

                </div>

                {error && (
                    <div className="create-job-error">
                        <span className="error-icon">
                            <i className="bi bi-exclamation-triangle-fill"></i>
                        </span>

                        <div>
                            <strong>
                                Unable to continue
                            </strong>

                            <p>
                                {error}
                            </p>
                        </div>
                    </div>
                )}

                <form
                    className="create-job-form"
                    onSubmit={handleSubmit}
                >

                    <section className="form-section">

                        <div className="section-heading">
                            <span className="section-number">
                                01
                            </span>

                            <div>
                                <h2>
                                    Company Information
                                </h2>

                                <p>
                                    Select the company
                                    you are posting
                                    this position for.
                                </p>
                            </div>
                        </div>

                        <div className="form-group">

                            <label htmlFor="company">
                                Company
                                <span>*</span>
                            </label>

                            {companiesLoading ? (
                                <div className="loading-companies">
                                    <span className="mini-spinner"></span>
                                    Loading your
                                    companies...
                                </div>
                            ) : companies.length === 0 ? (
                                <div className="no-company-card">

                                    <div className="no-company-icon">
                                        <i className="bi bi-building-fill"></i>
                                    </div>

                                    <div>
                                        <h3>
                                            No company
                                            found
                                        </h3>

                                        <p>
                                            Create a
                                            company before
                                            posting a job.
                                        </p>
                                    </div>

                                    <Link
                                        to="/company/create"
                                        className="primary-button"
                                    >
                                        Create Company
                                    </Link>

                                </div>
                            ) : (
                                <>
                                    <select
                                        id="company"
                                        name="company"
                                        value={
                                            formData.company
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                    >
                                        <option value="">
                                            Select Your
                                            Company
                                        </option>

                                        {companies.map(
                                            (company) => (
                                                <option
                                                    key={
                                                        company.id
                                                    }
                                                    value={
                                                        company.id
                                                    }
                                                >
                                                    {
                                                        company.name
                                                    }
                                                </option>
                                            )
                                        )}
                                    </select>

                                    <Link
                                        to="/company/create"
                                        className="create-company-link"
                                    >
                                        + Create Another
                                        Company
                                    </Link>
                                </>
                            )}

                        </div>

                    </section>

                    {companies.length > 0 && (
                        <section className="form-section">

                            <div className="section-heading">
                                <span className="section-number">
                                    02
                                </span>

                                <div>
                                    <h2>
                                        Job Information
                                    </h2>

                                    <p>
                                        Tell candidates
                                        about the position
                                        you are offering.
                                    </p>
                                </div>
                            </div>

                            <div className="form-group">

                                <label htmlFor="title">
                                    Job Title
                                    <span>*</span>
                                </label>

                                <input
                                    id="title"
                                    type="text"
                                    name="title"
                                    value={
                                        formData.title
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="e.g. Software Developer"
                                    required
                                />

                            </div>

                            <div className="form-group">

                                <label htmlFor="description">
                                    Description
                                    <span>*</span>
                                </label>

                                <textarea
                                    id="description"
                                    name="description"
                                    value={
                                        formData.description
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    rows="7"
                                    placeholder="Describe the position, responsibilities, and what the successful candidate will do..."
                                    required
                                />

                            </div>

                            <div className="form-row">

                                <div className="form-group">

                                    <label htmlFor="job_type">
                                        Job Type
                                        <span>*</span>
                                    </label>

                                    <select
                                        id="job_type"
                                        name="job_type"
                                        value={
                                            formData.job_type
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    >
                                        <option value="full_time">
                                            Full Time
                                        </option>

                                        <option value="part_time">
                                            Part Time
                                        </option>

                                        <option value="contract">
                                            Contract
                                        </option>

                                        <option value="internship">
                                            Internship
                                        </option>
                                    </select>

                                </div>

                                <div className="form-group">

                                    <label htmlFor="salary">
                                        Salary
                                    </label>

                                    <input
                                        id="salary"
                                        type="text"
                                        name="salary"
                                        value={
                                            formData.salary
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="₦300,000 - ₦500,000"
                                    />

                                </div>

                            </div>

                            <div className="form-group">

                                <label htmlFor="requirements">
                                    Requirements
                                </label>

                                <textarea
                                    id="requirements"
                                    name="requirements"
                                    value={
                                        formData.requirements
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    rows="6"
                                    placeholder="Enter qualifications, skills, experience, education, and other requirements..."
                                />

                            </div>

                        </section>
                    )}

                    {companies.length > 0 && (
                        <section className="form-section">

                            <div className="section-heading">
                                <span className="section-number">
                                    03
                                </span>

                                <div>
                                    <h2>
                                        Job Location
                                    </h2>

                                    <p>
                                        Search for the
                                        exact location
                                        using Google Maps.
                                    </p>
                                </div>
                            </div>

                            <div className="location-wrapper">

                                <JobLocationPicker
                                    value={{
                                        address:
                                            formData.location,
                                        latitude:
                                            formData.latitude,
                                        longitude:
                                            formData.longitude,
                                    }}
                                    onChange={
                                        handleLocationChange
                                    }
                                />

                                {locationMessage && (
                                    <div className="location-success">
                                        <span>
                                            <i className="bi bi-check-circle-fill"></i>
                                        </span>

                                        {
                                            locationMessage
                                        }
                                    </div>
                                )}

                            </div>

                            <div className="coordinates-grid">

                                <div className="form-group">

                                    <label htmlFor="latitude">
                                        Latitude
                                    </label>

                                    <input
                                        id="latitude"
                                        type="number"
                                        name="latitude"
                                        value={
                                            formData.latitude
                                        }
                                        placeholder="Latitude"
                                        step="any"
                                        readOnly
                                    />

                                </div>

                                <div className="form-group">

                                    <label htmlFor="longitude">
                                        Longitude
                                    </label>

                                    <input
                                        id="longitude"
                                        type="number"
                                        name="longitude"
                                        value={
                                            formData.longitude
                                        }
                                        placeholder="Longitude"
                                        step="any"
                                        readOnly
                                    />

                                </div>

                            </div>

                        </section>
                    )}

                    {companies.length > 0 && (
                        <div className="form-submit-area">

                            <div className="submit-information">

                                <span>
                                    <i className="bi bi-shield-lock-fill"></i>
                                </span>

                                <p>
                                    Your job will be
                                    submitted for
                                    administrator approval
                                    before it becomes
                                    visible to job seekers.
                                </p>

                            </div>

                            <div className="submit-buttons">

                                <Link
                                    to="/employer"
                                    className="cancel-button"
                                >
                                    Cancel
                                </Link>

                                <button
                                    type="submit"
                                    className="post-job-button"
                                    disabled={
                                        loading ||
                                        companies.length === 0
                                    }
                                >
                                    {loading ? (
                                        <>
                                            <span className="button-spinner"></span>
                                            Posting...
                                        </>
                                    ) : (
                                        <>
                                            Post Job
                                            <span>
                                                <i className="bi bi-arrow-right"></i>
                                            </span>
                                        </>
                                    )}
                                </button>

                            </div>

                        </div>
                    )}

                </form>

            </div>

        </div>
    );
}

export default CreateJob;