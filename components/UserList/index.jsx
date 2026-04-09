import React from "react";
import {
  Alert,
  CircularProgress,
  List,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { Link as RouterLink, useLocation } from "react-router-dom";
import api from "../../lib/api";
import queryKeys from "../../lib/queryKeys";

export default function UserList() {
  const location = useLocation();
  const {
    data: users = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: queryKeys.users,
    queryFn: api.getUsers,
  });

  if (isLoading) {
    return <CircularProgress />;
  }

  if (isError) {
    return <Alert severity="error">Failed to load users.</Alert>;
  }

  if (users.length === 0) {
    return <Alert severity="info">No users found.</Alert>;
  }

  return (
    <>
      <Typography variant="h6" sx={{ mb: 1 }}>
        Users
      </Typography>

      <List>
        {users.map((user) => {
          const userPath = `/users/${user._id}`;
          const selected = location.pathname === userPath
            || location.pathname === `${userPath}/photos`;

          return (
            <ListItemButton
              key={user._id}
              component={RouterLink}
              to={userPath}
              selected={selected}
            >
              <ListItemText primary={`${user.first_name} ${user.last_name}`} />
            </ListItemButton>
          );
        })}
      </List>
    </>
  );
}
