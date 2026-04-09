import React from "react";
import {
  AppBar,
  Box,
  Button,
  CircularProgress,
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

  const { data: viewedUser } = useQuery({
    queryKey: queryKeys.user(viewedUserId),
    queryFn: () => api.getUser(viewedUserId),
    enabled: Boolean(viewedUserId),
  });

  const logoutMutation = useMutation({
    mutationFn: api.logout,
    onSuccess: () => {
      queryClient.setQueryData(queryKeys.sessionUser, null);
      queryClient.removeQueries({ queryKey: queryKeys.users });
      navigate("/login-register", { replace: true });
    },
  });

  let title = "Photo Sharing App";
  if (location.pathname === "/users") {
    title = "User Directory";
  } else if (viewedUser && location.pathname.endsWith("/photos")) {
    title = `Photos of ${viewedUser.first_name} ${viewedUser.last_name}`;
  } else if (viewedUser) {
    title = `${viewedUser.first_name} ${viewedUser.last_name}`;
  }

  return (
    <AppBar position="sticky" className="topbar-app-bar">
      <Toolbar sx={{ gap: 2, justifyContent: "space-between" }}>
        <Box>
          <Typography variant="overline" className="topbar-label">
            PhotoShare
          </Typography>
          <Typography variant="h6">{title}</Typography>
        </Box>

        <Box sx={{ alignItems: "center", display: "flex", gap: 2 }}>
          <Typography variant="body1">{`Hi ${currentUser.first_name}`}</Typography>
          <Button
            variant="outlined"
            color="inherit"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
          >
            {logoutMutation.isPending ? <CircularProgress size={20} color="inherit" /> : "Logout"}
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
