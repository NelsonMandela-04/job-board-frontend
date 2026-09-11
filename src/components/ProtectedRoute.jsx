import { Navigate, Outlet } from "react-router-dom";

import {
    getToken,
    getUser
} from "../utils/auth";

function ProtectedRoute({
    allowedRoles,
    allowAdmin = false
}) {
    const token = getToken();
    const user = getUser();

    if (!token || !user) {
        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }

    const userRoles = [];

    if (user.is_staff) {
        userRoles.push("admin");
    }

    if (user.is_employer) {
        userRoles.push("employer");
    }

    if (
        !user.is_staff &&
        !user.is_employer
    ) {
        userRoles.push("applicant");
    }

    if (
        userRoles.includes("admin") &&
        allowAdmin
    ) {
        return <Outlet />;
    }

    if (
        !allowedRoles ||
        allowedRoles.length === 0
    ) {
        return <Outlet />;
    }

    const hasAllowedRole = allowedRoles.some(
        (role) => userRoles.includes(role)
    );

    if (hasAllowedRole) {
        return <Outlet />;
    }

    if (userRoles.includes("admin")) {
        return (
            <Navigate
                to="/admin-dashboard"
                replace
            />
        );
    }

    if (userRoles.includes("employer")) {
        return (
            <Navigate
                to="/employer"
                replace
            />
        );
    }

    return (
        <Navigate
            to="/dashboard"
            replace
        />
    );
}

export default ProtectedRoute;