import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL + "/api/",
});

api.interceptors.request.use(
    (config) => {
        console.log("AXIOS REQUEST DATA:", config.data);

        const publicEndpoints = [
            "password-reset/",
            "password-reset-confirm/",
            "login/",
            "register/",
        ];

        const isPublicEndpoint =
            publicEndpoints.some((endpoint) =>
                config.url?.includes(endpoint)
            );

        if (!isPublicEndpoint) {
            const token =
                localStorage.getItem("token");

            if (token) {
                config.headers.Authorization =
                    `Token ${token}`;
            } else {
                delete config.headers.Authorization;
            }
        } else {
            delete config.headers.Authorization;
        }

        if (
            config.data instanceof FormData
        ) {
            delete config.headers[
                "Content-Type"
            ];
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (!error.response) {
            console.error(
                "Network error:",
                error
            );

            return Promise.reject(error);
        }

        const status =
            error.response.status;

        if (status === 401) {
            console.error(
                "Unauthorized request."
            );
        }

        if (status === 403) {
            console.error(
                "Permission denied."
            );
        }

        if (status === 404) {
            console.error(
                "Resource not found."
            );
        }

        if (status >= 500) {
            console.error(
                "Server error."
            );
        }

        return Promise.reject(error);
    }
);

export default api;

