import React from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { Link as RouterLink, useParams } from "react-router-dom";
import api from "../../lib/api";
import queryKeys from "../../lib/queryKeys";

export default function UserDetail() {
  const { userId } = useParams();
  const {
    data: user,
    isLoading,
    isError,
  } = useQuery({
    queryKey: queryKeys.user(userId),
    queryFn: () => api.getUser(userId),
  });

  if (isLoading) {
    return <CircularProgress />;
  }

  if (isError) {
    return <Alert severity="error">User not found.</Alert>;
  }

  if (!user) {
    return <Alert severity="warning">Invalid user.</Alert>;
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h4" gutterBottom>
          {user.first_name}
          {" "}
          {user.last_name}
        </Typography>

        <Typography variant="body1" sx={{ mb: 1 }}>
          <strong>Location:</strong>
          {" "}
          {user.location || "Not provided"}
        </Typography>

        <Typography variant="body1" sx={{ mb: 1 }}>
          <strong>Occupation:</strong>
          {" "}
          {user.occupation || "Not provided"}
        </Typography>

        <Typography variant="body1" sx={{ mb: 2 }}>
          <strong>Description:</strong>
          {" "}
          {user.description || "Not provided"}
        </Typography>

        <Box sx={{ mt: 2 }}>
          <Button
            variant="contained"
            component={RouterLink}
            to={`/users/${user._id}/photos`}
          >
            View Photos
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
