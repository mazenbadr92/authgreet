import { useState, useEffect, useRef } from "react";
import axiosInstance from "../axiosInstance";
import { useAuthStore } from "../stores/auth.store";
import { TokenService } from "../services/token.service";

export const useAuthValidation = (): boolean | null => {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  // Get the current access token and setter from the auth store.
  const accessToken = useAuthStore.getState().accessToken;
  const setAccessToken = useAuthStore.getState().setAccessToken;

  // Refs to ensure that token verification and refresh are attempted only once on mount.
  const refreshAttempted = useRef(false);
  const validated = useRef(false);

  useEffect(() => {
    const verifyToken = async () => {
      // Ensure we only run this logic once on mount.
      if (validated.current) return;
      validated.current = true;

      if (!accessToken) {
        // If no token is present, attempt to refresh.
        if (!refreshAttempted.current) {
          refreshAttempted.current = true;
          try {
            const refreshResponse = await axiosInstance.post(
              "/tokens/refresh",
              {},
              { withCredentials: true } // ensure the refresh token cookie is sent
            );
            const newAccessToken = refreshResponse.data.accessToken;
            setAccessToken(newAccessToken);
            await TokenService.validateToken(newAccessToken);
            setIsAuthorized(true);
            return;
          } catch (error) {
            setIsAuthorized(false);
            return;
          }
        } else {
          setIsAuthorized(false);
        }
      } else {
        // If an access token exists, try to validate it.
        try {
          await TokenService.validateToken(accessToken);
          setIsAuthorized(true);
        } catch (error) {
          if (!refreshAttempted.current) {
            refreshAttempted.current = true;
            try {
              const refreshResponse = await axiosInstance.post(
                "/tokens/refresh",
                {},
                { withCredentials: true }
              );
              const newAccessToken = refreshResponse.data.accessToken;
              setAccessToken(newAccessToken);
              await TokenService.validateToken(newAccessToken);
              setIsAuthorized(true);
            } catch (refreshError) {
              setIsAuthorized(false);
            }
          } else {
            setIsAuthorized(false);
          }
        }
      }
    };

    verifyToken();
  }, []);

  return isAuthorized;
};
