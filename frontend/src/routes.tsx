import { Navigate, RouteObject } from "react-router-dom";
import AuthGuard from "./auth/auth.guard";
import AuthPage from "./pages/auth.page";
import WelcomePage from "./pages/welcome.page";

const routes: RouteObject[] = [
  {
    path: "/auth",
    element: <AuthPage />,
  },
  {
    path: "/welcome",
    element: (
      <AuthGuard>
        <WelcomePage />
      </AuthGuard>
    ),
  },
  {
    path: "*",
    element: <Navigate to="/auth" replace />,
  },
];

export default routes;
