import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthValidation } from "../hooks/useAuthValidation";

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthorized = useAuthValidation();

  useEffect(() => {
    if (isAuthorized === false) {
      navigate("/auth", { replace: true });
    }
    // If the user is authorized and they're on the auth page, redirect to welcome.
    if (isAuthorized === true && location.pathname === "/auth") {
      navigate("/welcome", { replace: true });
    }
  }, [isAuthorized, navigate, location]);

  return <>{children}</>;
};

export default AuthGuard;
