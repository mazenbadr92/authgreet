import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router";
import AuthService, { LoginResponse } from "../services/auth.service";
import { useAuthStore } from "../stores/auth.store";
import axiosInstance from "../axiosInstance";

interface AuthFormData {
  email: string;
  name?: string;
  password: string;
}

const AuthPage: React.FC = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();

  // Retrieve accessToken and setter from your Zustand store.
  const accessToken = useAuthStore((state) => state.accessToken);

  // Local state for form, error, loading, etc.
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState<AuthFormData>({
    email: "",
    name: "",
    password: "",
  });
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // useRef flag to ensure auto-login is attempted only once on mount.
  const autoLoginCalled = useRef(false);

  // Auto-login effect: attempt to refresh the token once when the component mounts.
  useEffect(() => {
    if (autoLoginCalled.current) return;
    autoLoginCalled.current = true;
    const autoLogin = async () => {
      // Only attempt auto-login if there's no access token
      if (!accessToken) {
        try {
          const refreshResponse = await axiosInstance.post(
            "/tokens/refresh",
            {},
            { withCredentials: true } 
          );
          const newAccessToken = refreshResponse.data.accessToken;
          useAuthStore.setState({ accessToken: newAccessToken });
          navigate("/welcome", { replace: true });
        } catch (error) {
          // If refresh fails, log the error and continue to render the auth form
          console.log("Auto-login via refresh token failed", error);
        }
      }
    };
    autoLogin();
  }, []);

  const handleToggle = () => {
    setError("");
    setFormData({ email: "", name: "", password: "" });
    setIsLogin(!isLogin);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      let response: LoginResponse;
      if (isLogin) {
        response = await AuthService.login({
          email: formData.email,
          password: formData.password,
        });
      } else {
        response = await AuthService.signup({
          email: formData.email,
          name: formData.name || "",
          password: formData.password,
        });
      }
      useAuthStore.setState({ accessToken: response.token });
      navigate("/welcome", { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        flexDirection: isSmallScreen ? "column" : "row",
      }}
    >
      {/* LEFT DECORATIVE SECTION */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#ede7f6",
          background: `linear-gradient(135deg, #9fa8da 0%, #5c6bc0 100%)`,
          p: 4,
        }}
      >
        <Box sx={{ textAlign: "center", color: "#fff" }}>
          <Typography variant="h3" fontWeight="bold">
            Welcome Back!
          </Typography>
          <Typography variant="h6" sx={{ mt: 2 }}>
            {isLogin
              ? "Login to continue"
              : "Enter your details to create a new account"}
          </Typography>
        </Box>
      </Box>

      {/* RIGHT FORM SECTION */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
          bgcolor: "#f3f2f7",
        }}
      >
        <Card sx={{ maxWidth: 400, width: "100%", borderRadius: 3 }}>
          <CardContent>
            <Typography
              variant="h5"
              fontWeight="bold"
              textAlign="center"
              mb={2}
            >
              {isLogin ? "Login" : "Create Account"}
            </Typography>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <Box component="form" onSubmit={handleSubmit}>
              {!isLogin && (
                <TextField
                  fullWidth
                  margin="normal"
                  label="Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              )}
              <TextField
                fullWidth
                margin="normal"
                label="Email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <TextField
                fullWidth
                margin="normal"
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {isLogin ? "Login" : "Sign Up"}
              </Button>
            </Box>
            <Box textAlign="center" mt={2}>
              <Button variant="text" onClick={handleToggle}>
                {isLogin
                  ? "Don't have an account? Sign up"
                  : "Already have an account? Login"}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default AuthPage;
