import React from "react";
import {
  Alert,
  AppBar,
  Box,
  Button,
  CircularProgress,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  Toolbar,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import api, { getErrorMessage } from "../../lib/api";
import queryKeys from "../../lib/queryKeys";
import "./styles.css";

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
  const [uploadOpen, setUploadOpen] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState(null);
  const [previewUrl, setPreviewUrl] = React.useState(null);
  const [uploadError, setUploadError] = React.useState("");

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!selectedFile) {
        throw new Error("Choose an image before uploading.");
      }

      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
        || import.meta.env.VITE_CLOUDINARY_PRESET;

      if (!cloudName || !uploadPreset) {
        throw new Error("Cloudinary environment variables are missing.");
      }

      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("upload_preset", uploadPreset);

      const cloudinaryResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body: formData },
      );

      const cloudinaryData = await cloudinaryResponse.json();

      if (!cloudinaryResponse.ok || !cloudinaryData.secure_url) {
        throw new Error(cloudinaryData.error?.message || "Cloudinary upload failed.");
      }

      return api.createPhoto(cloudinaryData.secure_url);
    },
    onSuccess: () => {
      setUploadOpen(false);
      setSelectedFile(null);
      setPreviewUrl(null);
      setUploadError("");
      queryClient.invalidateQueries({ queryKey: queryKeys.allPhotos });
      navigate(`/users/${currentUser._id}/photos`);
    },
    onError: (error) => {
      setUploadError(getErrorMessage(error, "Unable to upload photo."));
    },
  });

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
              variant="contained"
              color="secondary"
              className="topbar-add-photo-btn"
              onClick={() => {
                setUploadError("");
                setPreviewUrl(null);
                setSelectedFile(null);
                setUploadOpen(true);
              }}
            >
              + Add Photo
            </Button>
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

      <Dialog
        open={uploadOpen}
        onClose={() => {
          if (!uploadMutation.isPending) {
            setUploadOpen(false);
            setPreviewUrl(null);
            setSelectedFile(null);
            setUploadError("");
          }
        }}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Add Photo</DialogTitle>
        <DialogContent>
          {uploadMutation.isPending && (
            <LinearProgress sx={{ mb: 1 }} />
          )}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            {uploadError ? (
              <Alert severity="error" onClose={() => setUploadError("")}>
                {uploadError}
              </Alert>
            ) : null}

            <Button
              variant="outlined"
              component="label"
              disabled={uploadMutation.isPending}
              className="upload-choose-btn"
            >
              {selectedFile ? `✓ ${selectedFile.name}` : "📁 Choose Image"}
              <input
                hidden
                accept="image/*"
                type="file"
                onChange={(event) => {
                  const file = event.target.files?.[0] || null;
                  setSelectedFile(file);
                  setUploadError("");
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => setPreviewUrl(e.target.result);
                    reader.readAsDataURL(file);
                  } else {
                    setPreviewUrl(null);
                  }
                }}
              />
            </Button>

            {previewUrl && (
              <Box
                component="img"
                src={previewUrl}
                alt="Preview"
                className="upload-preview-img"
                sx={{
                  width: "100%",
                  maxHeight: 220,
                  objectFit: "contain",
                  borderRadius: 1,
                  border: "1px solid",
                  borderColor: "divider",
                  background: "#f5f5f5",
                }}
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setUploadOpen(false)}
            disabled={uploadMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => uploadMutation.mutate()}
            disabled={!selectedFile || uploadMutation.isPending}
          >
            {uploadMutation.isPending ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              "Upload"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </AppBar>
  );
}
