export const saveAuth = (data) => {
  if (data.token) {
    localStorage.setItem("token", data.token);
  }

  if (data.user) {
    localStorage.setItem(
      "user",
      JSON.stringify(data.user)
    );
  }
};

export const getToken = () => {
  return localStorage.getItem("token");
};

export const getUser = () => {
  const user = localStorage.getItem("user");

  if (!user) {
    return null;
  }

  try {
    return JSON.parse(user);
  } catch (error) {
    console.error("Unable to read user data:", error);
    return null;
  }
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

export const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};