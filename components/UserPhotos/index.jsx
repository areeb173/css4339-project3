import React, { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  Divider,
  Link,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link as RouterLink, useParams } from "react-router-dom";
import api, { getErrorMessage } from "../../lib/api";
import queryKeys from "../../lib/queryKeys";

function formatDate(dateString) {
  return new Date(dateString).toLocaleString();
}

export default function UserPhotos() {
  const { userId } = useParams();
  const queryClient = useQueryClient();
  const [commentDrafts, setCommentDrafts] = useState({});
  const [commentErrors, setCommentErrors] = useState({});

  const userQuery = useQuery({
    queryKey: queryKeys.user(userId),
    queryFn: () => api.getUser(userId),
  });

  const photosQuery = useQuery({
    queryKey: queryKeys.photos(userId),
    queryFn: () => api.getPhotos(userId),
  });

  const addCommentMutation = useMutation({
    mutationFn: ({ photoId, comment }) => api.addComment(photoId, comment),
    onSuccess: (_, variables) => {
      setCommentDrafts((current) => ({
        ...current,
        [variables.photoId]: "",
      }));
      setCommentErrors((current) => ({
        ...current,
        [variables.photoId]: "",
      }));
      queryClient.invalidateQueries({ queryKey: queryKeys.photos(userId) });
    },
    onError: (error, variables) => {
      setCommentErrors((current) => ({
        ...current,
        [variables.photoId]: getErrorMessage(error, "Unable to post comment."),
      }));
    },
  });

  if (userQuery.isLoading || photosQuery.isLoading) {
    return <CircularProgress />;
  }

  if (userQuery.isError || photosQuery.isError) {
    return <Alert severity="error">Could not load photos for this user.</Alert>;
  }

  const user = userQuery.data;
  const photos = photosQuery.data || [];

  if (!user) {
    return <Alert severity="warning">Invalid user.</Alert>;
  }

  const submitComment = (photoId) => {
    const nextComment = (commentDrafts[photoId] || "").trim();

    if (!nextComment) {
      setCommentErrors((current) => ({
        ...current,
        [photoId]: "Comment text is required.",
      }));
      return;
    }

    addCommentMutation.mutate({
      photoId,
      comment: nextComment,
    });
  };

  return (
    <Stack spacing={3}>
      <Typography variant="h4">
        Photos of
        {" "}
        {user.first_name}
        {" "}
        {user.last_name}
      </Typography>

      {photos.length === 0 ? (
        <Alert severity="info">This user has no photos.</Alert>
      ) : (
        photos.map((photo) => (
          <Card key={photo._id}>
            <CardMedia
              component="img"
              image={`/images/${photo.file_name}`}
              alt={`Uploaded by ${user.first_name} ${user.last_name}`}
            />

            <CardContent>
              <Typography variant="body2" sx={{ mb: 2 }}>
                <strong>Posted:</strong>
                {" "}
                {formatDate(photo.date_time)}
              </Typography>

              <Typography variant="h6" gutterBottom>
                Comments
              </Typography>

              {!photo.comments || photo.comments.length === 0 ? (
                <Typography>No comments.</Typography>
              ) : (
                <Stack spacing={2}>
                  {photo.comments.map((comment) => (
                    <div key={comment._id}>
                      <Typography variant="body2">
                        <strong>User:</strong>
                        {" "}
                        {comment.user ? (
                          <Link
                            component={RouterLink}
                            to={`/users/${comment.user._id}`}
                            underline="hover"
                          >
                            {comment.user.first_name}
                            {" "}
                            {comment.user.last_name}
                          </Link>
                        ) : (
                          "Unknown user"
                        )}
                      </Typography>

                      <Typography variant="body2">
                        <strong>Date:</strong>
                        {" "}
                        {formatDate(comment.date_time)}
                      </Typography>

                      <Typography variant="body1">
                        {comment.comment}
                      </Typography>

                      <Divider sx={{ mt: 1 }} />
                    </div>
                  ))}
                </Stack>
              )}

              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Add a comment
                </Typography>
                <Stack spacing={1.5}>
                  {commentErrors[photo._id] ? (
                    <Alert severity="error">{commentErrors[photo._id]}</Alert>
                  ) : null}
                  <TextField
                    label="Write a comment"
                    multiline
                    minRows={2}
                    value={commentDrafts[photo._id] || ""}
                    onChange={(event) => {
                      const { value } = event.target;
                      setCommentDrafts((current) => ({
                        ...current,
                        [photo._id]: value,
                      }));
                    }}
                    fullWidth
                  />
                  <Box>
                    <Button
                      variant="contained"
                      onClick={() => submitComment(photo._id)}
                      disabled={
                        addCommentMutation.isPending
                        && addCommentMutation.variables?.photoId === photo._id
                      }
                    >
                      {addCommentMutation.isPending
                        && addCommentMutation.variables?.photoId === photo._id
                        ? "Posting..."
                        : "Post Comment"}
                    </Button>
                  </Box>
                </Stack>
              </Box>
            </CardContent>
          </Card>
        ))
      )}
    </Stack>
  );
}
