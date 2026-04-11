import React, { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Collapse,
  Divider,
  Link,
  Skeleton,
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

// Skeleton cards rendered while photos are loading
function PhotosSkeleton() {
  return (
    <Stack spacing={3}>
      <Skeleton variant="text" width="50%" height={48} />
      {[1, 2].map((n) => (
        <Card key={n}>
          <Skeleton variant="rectangular" height={260} />
          <CardContent>
            <Skeleton variant="text" width="30%" sx={{ mb: 2 }} />
            <Skeleton variant="text" width="20%" sx={{ mb: 1 }} />
            <Skeleton variant="text" width="80%" />
            <Skeleton variant="text" width="70%" />
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}

export default function UserPhotos() {
  const { userId } = useParams();
  const queryClient = useQueryClient();

  // Per-photo comment drafts, errors, and brief success indicators
  const [commentDrafts, setCommentDrafts] = useState({});
  const [commentErrors, setCommentErrors] = useState({});
  const [commentSuccess, setCommentSuccess] = useState({});

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
      const { photoId } = variables;
      // Clear the draft and any previous error for this photo
      setCommentDrafts((prev) => ({ ...prev, [photoId]: "" }));
      setCommentErrors((prev) => ({ ...prev, [photoId]: "" }));
      // Show a transient success indicator, then hide it after 2.5 s
      setCommentSuccess((prev) => ({ ...prev, [photoId]: true }));
      setTimeout(() => {
        setCommentSuccess((prev) => ({ ...prev, [photoId]: false }));
      }, 2500);
      // Refetch the full photo list so the new comment appears immediately
      queryClient.invalidateQueries({ queryKey: queryKeys.photos(userId) });
    },
    onError: (error, variables) => {
      setCommentErrors((prev) => ({
        ...prev,
        [variables.photoId]: getErrorMessage(error, "Unable to post comment. Please try again."),
      }));
    },
  });

  if (userQuery.isLoading || photosQuery.isLoading) {
    return <PhotosSkeleton />;
  }

  if (userQuery.isError || photosQuery.isError) {
    const retryFn = userQuery.isError ? userQuery.refetch : photosQuery.refetch;
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 1 }}>
          Could not load photos for this user.
        </Alert>
        <Button size="small" onClick={() => retryFn()}>Retry</Button>
      </Box>
    );
  }

  const user = userQuery.data;
  const photos = photosQuery.data || [];

  if (!user) {
    return <Alert severity="warning">User not found.</Alert>;
  }

  const submitComment = (photoId) => {
    const text = (commentDrafts[photoId] || "").trim();

    if (!text) {
      setCommentErrors((prev) => ({
        ...prev,
        [photoId]: "Please write something before posting.",
      }));
      return;
    }

    addCommentMutation.mutate({ photoId, comment: text });
  };

  const isPendingFor = (photoId) => addCommentMutation.isPending && addCommentMutation.variables?.photoId === photoId;

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
        <Alert severity="info">This user has not uploaded any photos yet.</Alert>
      ) : (
        photos.map((photo) => (
          <Card key={photo._id}>
            <CardMedia
              component="img"
              image={`/images/${photo.file_name}`}
              alt={`Uploaded by ${user.first_name} ${user.last_name}`}
              sx={{ maxHeight: 480, objectFit: "contain", background: "#f5f5f5" }}
            />

            <CardContent>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Posted: {formatDate(photo.date_time)}
              </Typography>

              <Typography variant="h6" gutterBottom>
                Comments
                {photo.comments?.length > 0 && (
                  <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                    ({photo.comments.length})
                  </Typography>
                )}
              </Typography>

              {!photo.comments || photo.comments.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  No comments yet — be the first!
                </Typography>
              ) : (
                <Stack spacing={2} sx={{ mb: 2 }}>
                  {photo.comments.map((comment) => (
                    <div key={comment._id}>
                      <Typography variant="body2">
                        {comment.user ? (
                          <Link
                            component={RouterLink}
                            to={`/users/${comment.user._id}`}
                            underline="hover"
                            fontWeight={600}
                          >
                            {comment.user.first_name}
                            {" "}
                            {comment.user.last_name}
                          </Link>
                        ) : (
                          <strong>Unknown user</strong>
                        )}
                        <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                          {formatDate(comment.date_time)}
                        </Typography>
                      </Typography>

                      <Typography variant="body1" sx={{ mt: 0.5 }}>
                        {comment.comment}
                      </Typography>

                      <Divider sx={{ mt: 1 }} />
                    </div>
                  ))}
                </Stack>
              )}

              {/* ── Add comment ── */}
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                  Add a comment
                </Typography>
                <Stack spacing={1.5}>
                  {commentErrors[photo._id] ? (
                    <Alert
                      severity="error"
                      onClose={() => setCommentErrors((prev) => ({ ...prev, [photo._id]: "" }))}
                    >
                      {commentErrors[photo._id]}
                    </Alert>
                  ) : null}

                  {/* Brief success message after a comment is posted */}
                  <Collapse in={Boolean(commentSuccess[photo._id])} unmountOnExit>
                    <Alert severity="success">Comment posted!</Alert>
                  </Collapse>

                  <TextField
                    label="Write a comment…"
                    multiline
                    minRows={2}
                    value={commentDrafts[photo._id] || ""}
                    onChange={(event) => {
                      const { value } = event.target;
                      // Clear the per-photo error as soon as the user starts typing
                      if (commentErrors[photo._id]) {
                        setCommentErrors((prev) => ({ ...prev, [photo._id]: "" }));
                      }
                      setCommentDrafts((prev) => ({ ...prev, [photo._id]: value }));
                    }}
                    disabled={isPendingFor(photo._id)}
                    fullWidth
                  />
                  <Box>
                    <Button
                      variant="contained"
                      onClick={() => submitComment(photo._id)}
                      disabled={isPendingFor(photo._id)}
                    >
                      {isPendingFor(photo._id) ? "Posting…" : "Post Comment"}
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
