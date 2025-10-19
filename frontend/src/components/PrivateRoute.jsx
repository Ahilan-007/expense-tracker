import React from "react";
import { Navigate } from "react-router-dom";

export default function PrivateRoute({ children }) {
  // Get token from localStorage
  const token = localStorage.getItem("token");

  // If no token, redirect to login page
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If token exists, render the protected component
  return <>{children}</>;
}
