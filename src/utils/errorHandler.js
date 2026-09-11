export function getErrorMessage(
  error,
  fallback = "Something went wrong."
) {
  if (!error) {
    return fallback;
  }

  if (!error.response) {
    return "Unable to connect to the server. Please check your internet connection or try again with Ezitech Technologies.";
  }

  const status = error.response.status;
  const data = error.response.data;

  if (status === 400) {
    if (typeof data === "object" && data !== null) {
      const firstError = Object.values(data)[0];

      if (Array.isArray(firstError)) {
        return firstError[0];
      }

      if (typeof firstError === "string") {
        return firstError;
      }
    }

    return "The information you submitted to Ezitech Technologies is invalid.";
  }

  if (status === 401) {
    return "You are not authenticated to Ezitech Technologies. Please log in.";
  }

  if (status === 403) {
    return (
      data?.detail ||
      "You do not have permission to perform this action at Ezitech Technologies."
    );
  }

  if (status === 404) {
    return "The requested resource was not found at Ezitech Technologies.";
  }

  if (status >= 500) {
    return "Something went wrong on the server at Ezitech Technologies. Please try again later.";
  }

  return data?.detail || fallback;
}