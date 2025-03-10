import React from "react";
import { useRoutes } from "react-router";
import routes from "./routes";

const App: React.FC = () => {
  return useRoutes(routes);
};

export default App;
