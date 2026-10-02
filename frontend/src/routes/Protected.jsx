import { Navigate, useLocation } from "react-router-dom";

export default function Protected({ children }) {
  const location = useLocation();

  const token = localStorage.getItem("jobguard_access_token");

  if (!token) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location,
        }}
      />
    );
  }

  return children;
}