import React from "react";
import {
  Alert,
  Box,
  Button,
  List,
  ListItemButton,
  ListItemText,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { Link as RouterLink, useLocation } from "react-router-dom";
import api from "../../lib/api";
import queryKeys from "../../lib/queryKeys";

// Placeholder rows shown while the user list is loading
function UserListSkeleton() {
  return (
    <>
      <Skeleton variant="text" width="40%" height={32} sx={{ mb: 1 }} />
      <Stack spacing={0.5}>
        {[1, 2, 3, 4, 5].map((n) => (
          <Skeleton key={n} variant="rectangular" height={42} sx={{ borderRadius: 1 }} />
        ))}
      </Stack>
    </>
  );
}

export default function UserList() {
  const location = useLocation();
  const {
    data: users = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: queryKeys.users,
    queryFn: api.getUsers,
  });

  if (isLoading) {
    return <UserListSkeleton />;
  }

  if (isError) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 1 }}>Failed to load users.</Alert>
        <Button size="small" onClick={() => refetch()}>Retry</Button>
      </Box>
    );
  }

  if (users.length === 0) {
    return <Alert severity="info">No users found.</Alert>;
  }

  return (
    <>
      <Typography variant="h6" sx={{ mb: 1 }}>
        Users
      </Typography>

      <List disablePadding>
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
              sx={{ borderRadius: 1 }}
            >
              <ListItemText
                primary={`${user.first_name} ${user.last_name}`}
                primaryTypographyProps={{ variant: "body2" }}
              />
            </ListItemButton>
          );
        })}
      </List>
    </>
  );
}
