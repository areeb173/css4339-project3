import React from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { Link as RouterLink, useParams } from "react-router-dom";
import api from "../../lib/api";
import queryKeys from "../../lib/queryKeys";

// Shimmer placeholder that mirrors the card layout
function UserDetailSkeleton() {
  return (
    <Card>
      <CardContent>
        <Skeleton variant="text" width="45%" height={52} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="30%" sx={{ mb: 0.5 }} />
        <Skeleton variant="text" width="35%" sx={{ mb: 0.5 }} />
        <Skeleton variant="text" width="70%" sx={{ mb: 3 }} />
        <Skeleton variant="rectangular" width={120} height={36} sx={{ borderRadius: 1 }} />
      </CardContent>
    </Card>
  );
}

export default function UserDetail() {
  const { userId } = useParams();
  const {
    data: user,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: queryKeys.user(userId),
    queryFn: () => api.getUser(userId),
  });

  if (isLoading) {
    return <UserDetailSkeleton />;
  }

  if (isError) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 1 }}>Could not load this user&apos;s profile.</Alert>
        <Button size="small" onClick={() => refetch()}>Retry</Button>
      </Box>
    );
  }

  if (!user) {
    return <Alert severity="warning">User not found.</Alert>;
  }

  return (
    <Card elevation={0} sx={{ background: "transparent" }}>
      <CardContent>
        <Typography variant="h4" gutterBottom>
          {user.first_name}
          {" "}
          {user.last_name}
        </Typography>

        <Stack spacing={1} sx={{ mb: 3 }}>
          <Typography variant="body1">
            <strong>Location:</strong>
            {" "}
            {user.location ? (
              <Chip label={user.location} size="small" sx={{ ml: 0.5 }} />
            ) : (
              <span style={{ color: "#888" }}>Not provided</span>
            )}
          </Typography>

          <Typography variant="body1">
            <strong>Occupation:</strong>
            {" "}
            {user.occupation ? (
              <Chip label={user.occupation} size="small" sx={{ ml: 0.5 }} />
            ) : (
              <span style={{ color: "#888" }}>Not provided</span>
            )}
          </Typography>

          <Typography variant="body1">
            <strong>Description:</strong>
            {" "}
            {user.description || <span style={{ color: "#888" }}>Not provided</span>}
          </Typography>
        </Stack>

        <Button
          variant="contained"
          component={RouterLink}
          to={`/users/${user._id}/photos`}
        >
          View Photos
        </Button>
      </CardContent>
    </Card>
  );
}
