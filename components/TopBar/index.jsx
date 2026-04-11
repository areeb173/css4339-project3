import React from "react";
import {
  Alert,
  AppBar,
  Box,
  Button,
  CircularProgress,
  Collapse,
  Toolbar,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../lib/api";
import queryKeys from "../../lib/queryKeys";

function getViewedUserId(pathname) {
  const detailMatch = pathname.match(/^\/users\/([^/]+)$/);
  const photoMatch = pathname.match(/^\/users\/([^/]+)\/photos$/);
  return detailMatch?.[1] || photoMatch?.[1] || null;
}

export default function TopBar({ currentUser }) {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const viewedUserId = getViewedUserId(location.pathname);

  const isOnPhotosPage = Boolean(viewedUserId) && location.pathname.endsWith("/photos");
  const isOnDetailPage = Boolean(viewedUserId) && !location.pathname.endsWith("/photos");

  const { data: viewedUser } = useQuery({
    queryKey: queryKeys.user(viewedUserId),
    queryFn: () => api.getUser(viewedUserId),
    enabled: Boolean(viewedUserId),
  });

  const [logoutError, setLogoutError] = React.useState("");

  const logoutMutation = useMutation({
    mutationFn: api.logout,
    onSuccess: () => {
      queryClient.setQueryData(queryKeys.sessionUser, null);
      queryClient.removeQueries({ queryKey: queryKeys.users });
      navigate("/login-register", { replace: true });
    },
    onError: () => {
      setLogoutError("Logout failed. Please try again.");
    },
  });

  let title = "Photo Sharing App";
  if (location.pathname === "/users") {
    title = "User Directory";
  } else if (viewedUser && isOnPhotosPage) {
    title = `Photos of ${viewedUser.first_name} ${viewedUser.last_name}`;
  } else if (viewedUser && isOnDetailPage) {
    title = `${viewedUser.first_name} ${viewedUser.last_name}`;
  }

  return (
    <AppBar position="sticky" className="topbar-app-bar">
      <Toolbar sx={{ gap: 2, justifyContent: "space-between", flexWrap: "wrap" }}>
        {/* Left: brand + page title */}
        <Box>
          <Typography variant="overline" className="topbar-label">
            PhotoShare
          </Typography>
          <Typography variant="h6">{title}</Typography>
        </Box>

        {/* Centre: contextual nav link when viewing a user */}
        {viewedUser ? (
          <Box sx={{ display: { xs: "none", sm: "flex" }, gap: 1 }}>
            {isOnDetailPage && (
              <Button
                size="small"
                color="inherit"
                className="topbar-nav-button"
                onClick={() => navigate(`/users/${viewedUserId}/photos`)}
              >
                View Photos →
              </Button>
            )}
            {isOnPhotosPage && (
              <Button
                size="small"
                color="inherit"
                className="topbar-nav-button"
                onClick={() => navigate(`/users/${viewedUserId}`)}
              >
                ← View Profile
              </Button>
            )}
          </Box>
        ) : null}

        {/* Right: greeting + logout */}
        <Box sx={{ alignItems: "center", display: "flex", gap: 2, flexDirection: "column" }}>
          <Box sx={{ alignItems: "center", display: "flex", gap: 2 }}>
            <Typography variant="body1" className="topbar-greeting">
              {`Hi, ${currentUser.first_name}`}
            </Typography>
            <Button
              variant="outlined"
              color="inherit"
              onClick={() => {
                setLogoutError("");
                logoutMutation.mutate();
              }}
              disabled={logoutMutation.isPending}
            >
              {logoutMutation.isPending ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                "Logout"
              )}
            </Button>
          </Box>
          <Collapse in={Boolean(logoutError)} unmountOnExit>
            <Alert
              severity="error"
              onClose={() => setLogoutError("")}
              sx={{ py: 0, fontSize: "0.78rem" }}
            >
              {logoutError}
            </Alert>
          </Collapse>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
