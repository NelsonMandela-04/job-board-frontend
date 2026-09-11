import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Jobs from "./pages/Jobs";
import JobDetails from "./pages/JobDetails";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import Dashboard from "./pages/Dashboard";
import ResumeUpload from "./pages/ResumeUpload";
import SavedJobs from "./pages/SavedJobs";
import MyApplications from "./pages/MyApplications";
import Profile from "./pages/Profile";
import ApplyJob from "./pages/ApplyJob";
import Notifications from "./pages/Notifications";
import Messages from "./pages/Messages";
import Interviews from "./pages/Interviews";

import EmployerDashboard from "./pages/EmployerDashboard";
import CreateCompany from "./pages/CreateCompany";
import CreateJob from "./pages/CreateJob";
import EmployerApplications from "./pages/EmployerApplications";

import AdminDashboard from "./pages/AdminDashboard";
import AdminJobs from "./pages/AdminJobs";
import AdminUsers from "./pages/AdminUsers";
import AdminCompanies from "./pages/AdminCompanies";
import AdminApplications from "./pages/AdminApplications";
import PublicProfile from "./pages/PublicProfile";

function App() {
    return (
        <>
            <Navbar />

            <main>
                <Routes>
                    <Route
                        path="/"
                        element={<Home />}
                    />

                    <Route
                        path="/jobs"
                        element={<Jobs />}
                    />

                    <Route
                        path="/jobs/:id"
                        element={<JobDetails />}
                    />

                    <Route
                        path="/login"
                        element={<Login />}
                    />

                    <Route
                        path="/register"
                        element={<Register />}
                    />

                    <Route
                        path="/forgot-password"
                        element={<ForgotPassword />}
                    />

                    <Route
                        path="/reset-password/:uid/:token"
                        element={<ResetPassword />}
                    />

                    <Route
                        element={
                            <ProtectedRoute
                                allowedRoles={["applicant"]}
                                allowAdmin={true}
                            />
                        }
                    >
                        <Route
                            path="/dashboard"
                            element={<Dashboard />}
                        />

                        <Route
                            path="/resume"
                            element={<ResumeUpload />}
                        />

                        <Route
                            path="/saved-jobs"
                            element={<SavedJobs />}
                        />

                        <Route
                            path="/applications"
                            element={<MyApplications />}
                        />

                        <Route
                            path="/profile"
                            element={<Profile />}
                        />

                        <Route
                            path="/jobs/:id/apply"
                            element={<ApplyJob />}
                        />
                    </Route>

                    <Route
                        element={
                            <ProtectedRoute />
                        }
                    >
                        <Route
                            path="/notifications"
                            element={<Notifications />}
                        />

                        <Route
                            path="/messages"
                            element={<Messages />}
                        />
                    </Route>

                    <Route
                        path="/interviews"
                        element={<Interviews />}
                    />

                    <Route
                        element={
                            <ProtectedRoute
                                allowedRoles={["employer"]}
                                allowAdmin={true}
                            />
                        }
                    >
                        <Route
                            path="/employer"
                            element={<EmployerDashboard />}
                        />

                        <Route
                            path="/company/create"
                            element={<CreateCompany />}
                        />

                        <Route
                            path="/job/create"
                            element={<CreateJob />}
                        />

                        <Route
                            path="/employer/applications"
                            element={<EmployerApplications />}
                        />
                    </Route>

                    <Route
                        element={
                            <ProtectedRoute
                                allowedRoles={["admin"]}
                            />
                        }
                    >
                        <Route
                            path="/admin-dashboard"
                            element={<AdminDashboard />}
                        />

                        <Route
                            path="/admin/jobs"
                            element={<AdminJobs />}
                        />

                        <Route
                            path="/admin/users"
                            element={<AdminUsers />}
                        />

                        <Route
                            path="/admin/companies"
                            element={<AdminCompanies />}
                        />

                        <Route
                            path="/admin/applications"
                            element={<AdminApplications />}
                        />

                        <Route
                            path="/public-profile/:username"
                            element={<PublicProfile />}
                        />
                    </Route>
                </Routes>
            </main>
        </>
    );
}

export default App;