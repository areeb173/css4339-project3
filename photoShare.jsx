import React from "react";
// eslint-disable-next-line import/no-extraneous-dependencies
import ReactDOM from "react-dom/client";
import {
  CircularProgress,
  Grid,
  Paper,
  Typography,
} from "@mui/material";
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
} from "react-router-dom";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";

import "./styles/main.css";
import TopBar from "./components/TopBar";
import UserDetail from "./components/UserDetail";
import UserList from "./components/UserList";
import UserPhotos from "./components/UserPhotos";
import LoginRegister from "./components/LoginRegister";
import api from "./lib/api";
import queryKeys from "./lib/queryKeys";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function LoadingScreen() {
  return (
    <div className="main-loading-screen">
      <CircularProgress />
    </div>
  );
}

function UsersHome() {
  return (
    <div className="content-empty-state">
      <Typography variant="overline" className="content-kicker">
        Welcome Back
      </Typography>
      <Typography variant="h4" gutterBottom>
        Pick a person from the sidebar to view their profile and photos.
      </Typography>
      <Typography variant="body1">
        Every page in this app is now backed by TanStack Query, so server data stays fresh after
        logins, registrations, and comments.
      </Typography>
    </div>
  );
}

function ProtectedLayout({ currentUser }) {
  if (!currentUser) {
    return <Navigate to="/login-register" replace />;
  }

  return (
    <div className="main-shell">
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TopBar currentUser={currentUser} />
        </Grid>

        <Grid item xs={12} md={3}>
          <Paper className="main-grid-item sidebar-panel" elevation={0}>
            <UserList />
          </Paper>
        </Grid>

        <Grid item xs={12} md={9}>
          <Paper className="main-grid-item content-panel" elevation={0}>
            <Outlet />
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
}

function LoginRoute({ currentUser }) {
  if (currentUser) {
    return <Navigate to={`/users/${currentUser._id}`} replace />;
  }

  return <LoginRegister />;
}

function AppRouter() {
  const sessionUserQuery = useQuery({
    queryKey: queryKeys.sessionUser,
    queryFn: api.getSessionUser,
  });

  if (sessionUserQuery.isLoading) {
    return <LoadingScreen />;
  }

  const currentUser = sessionUserQuery.data;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login-register" element={<LoginRoute currentUser={currentUser} />} />
        <Route element={<ProtectedLayout currentUser={currentUser} />}>
          <Route path="/" element={<Navigate to="/users" replace />} />
          <Route path="/users" element={<UsersHome />} />
          <Route path="/users/:userId" element={<UserDetail />} />
          <Route path="/users/:userId/photos" element={<UserPhotos />} />
        </Route>
        <Route
          path="*"
          element={
            (
              <Navigate
                to={currentUser ? `/users/${currentUser._id}` : "/login-register"}
                replace
              />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

const root = ReactDOM.createRoot(document.getElementById("photoshareapp"));
root.render(
  <QueryClientProvider client={queryClient}>
    <AppRouter />
  </QueryClientProvider>,
);
