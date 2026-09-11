import axios from "axios";

const api = axios.create({
    baseURL: "http://127.0.0.1:8000/api/",
});

api.interceptors.request.use(
    (config) => {
        const token =
            localStorage.getItem("token");

        if (token) {
            config.headers.Authorization =
                `Token ${token}`;
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