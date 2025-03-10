import React from "react";
import { Box, Card, CardContent, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router";
import { useAuthStore } from "../stores/auth.store";
import authenticationService from "../services/auth.service";

const WelcomePage: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    // Clear the access token from your auth store and localStorage.
    await authenticationService.logout();
    useAuthStore.setState({ accessToken: "" });
    localStorage.removeItem("username");
    // Redirect the user to the login (or auth) page.
    navigate("/auth", { replace: true });
  };

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f3f2f7",
        p: 2,
      }}
    >
      <Card
        sx={{ maxWidth: 500, width: "100%", borderRadius: 3, boxShadow: 3 }}
      >
        <CardContent>
          <Typography variant="h4" component="div" gutterBottom align="center">
            Welcome to the application
          </Typography>
          <Typography variant="body1" align="center" sx={{ mt: 2 }}>
            You have successfully logged in. Enjoy using our application!
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <Button variant="contained" color="primary" onClick={handleLogout}>
              Logout
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default WelcomePage;
