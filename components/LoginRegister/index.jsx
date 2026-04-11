import React, { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import api, { getErrorMessage } from "../../lib/api";
import queryKeys from "../../lib/queryKeys";

const emptyRegisterForm = {
  login_name: "",
  password: "",
  confirm_password: "",
  first_name: "",
  last_name: "",
  location: "",
  description: "",
  occupation: "",
};

export default function LoginRegister() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [loginForm, setLoginForm] = useState({
    login_name: "",
    password: "",
  });
  const [registerForm, setRegisterForm] = useState(emptyRegisterForm);
  const [loginError, setLoginError] = useState("");
  const [registerError, setRegisterError] = useState("");
  // Track whether the user has tried to submit the register form (for confirm-password inline error)
  const [registerSubmitAttempted, setRegisterSubmitAttempted] = useState(false);

  const passwordsMatch =
    registerForm.confirm_password === "" ||
    registerForm.password === registerForm.confirm_password;
  const confirmPasswordError =
    registerSubmitAttempted && registerForm.password !== registerForm.confirm_password;

  const handleAuthSuccess = (user) => {
    queryClient.setQueryData(queryKeys.sessionUser, user);
    queryClient.invalidateQueries({ queryKey: queryKeys.users });
    navigate(`/users/${user._id}`, { replace: true });
  };

  const loginMutation = useMutation({
    mutationFn: api.login,
    onSuccess: handleAuthSuccess,
    onError: (error) => {
      // Clear the password so the user must retype it after a failed attempt
      setLoginForm((current) => ({ ...current, password: "" }));
      setLoginError(getErrorMessage(error, "Incorrect login name or password. Please try again."));
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (formValues) => {
      await api.registerUser(formValues);
      return api.login({
        login_name: formValues.login_name,
        password: formValues.password,
      });
    },
    onSuccess: handleAuthSuccess,
    onError: (error) => {
      setRegisterError(getErrorMessage(error, "Registration failed. Please check your details and try again."));
    },
  });

  const submitLogin = (event) => {
    event.preventDefault();
    setLoginError("");
    loginMutation.mutate({
      login_name: loginForm.login_name.trim(),
      password: loginForm.password,
    });
  };

  const submitRegistration = (event) => {
    event.preventDefault();
    setRegisterSubmitAttempted(true);
    setRegisterError("");

    if (registerForm.password !== registerForm.confirm_password) {
      setRegisterError("Passwords do not match. Please re-enter your password.");
      return;
    }

    // Strip confirm_password before sending to API
    const { confirm_password: _unused, ...payload } = registerForm;
    registerMutation.mutate({
      ...payload,
      login_name: payload.login_name.trim(),
      first_name: payload.first_name.trim(),
      last_name: payload.last_name.trim(),
      location: payload.location.trim(),
      description: payload.description.trim(),
      occupation: payload.occupation.trim(),
    });
  };

  return (
    <Box className="auth-shell">
      <Stack spacing={2} sx={{ mb: 4, maxWidth: 720 }}>
        <Typography variant="overline" className="auth-kicker">
          Project 3
        </Typography>
        <Typography variant="h2" className="auth-title">
          Photo sharing with real auth, session state, and live comment updates.
        </Typography>
        <Typography variant="body1" className="auth-copy">
          Sign in with a seeded account (e.g. login name{" "}
          <strong>took</strong>, password <strong>weak</strong>), or create a
          new account to jump straight into the app.
        </Typography>
      </Stack>

      <Grid container spacing={3} alignItems="stretch">
        {/* ── Login card ── */}
        <Grid item xs={12} md={5}>
          <Card className="auth-card auth-card-login" sx={{ height: "100%" }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="h5" gutterBottom>
                Sign In
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Continue with an existing account.
              </Typography>

              <Box component="form" onSubmit={submitLogin} noValidate>
                <Stack spacing={2.5}>
                  {loginError ? (
                    <Alert severity="error" onClose={() => setLoginError("")}>
                      {loginError}
                    </Alert>
                  ) : null}
                  <TextField
                    label="Login Name"
                    value={loginForm.login_name}
                    onChange={(event) => {
                      setLoginError("");
                      setLoginForm((current) => ({
                        ...current,
                        login_name: event.target.value,
                      }));
                    }}
                    required
                    autoComplete="username"
                    inputProps={{ maxLength: 64 }}
                    fullWidth
                  />
                  <TextField
                    label="Password"
                    type="password"
                    value={loginForm.password}
                    onChange={(event) => {
                      setLoginError("");
                      setLoginForm((current) => ({
                        ...current,
                        password: event.target.value,
                      }));
                    }}
                    required
                    autoComplete="current-password"
                    fullWidth
                  />
                  <Button
                    variant="contained"
                    size="large"
                    type="submit"
                    disabled={loginMutation.isPending}
                    fullWidth
                  >
                    {loginMutation.isPending ? "Signing In…" : "Sign In"}
                  </Button>
                </Stack>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* ── Register card ── */}
        <Grid item xs={12} md={7}>
          <Card className="auth-card auth-card-register" sx={{ height: "100%" }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="h5" gutterBottom>
                Create Account
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                New here? Fill in the form and we will log you in automatically.
              </Typography>

              <Box component="form" onSubmit={submitRegistration} noValidate>
                <Stack spacing={2}>
                  {registerError ? (
                    <Alert severity="error" onClose={() => setRegisterError("")}>
                      {registerError}
                    </Alert>
                  ) : null}

                  {/* ── Credentials section ── */}
                  <Typography variant="caption" className="auth-section-label">
                    Login credentials
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Login Name"
                        value={registerForm.login_name}
                        onChange={(event) => {
                          setRegisterForm((current) => ({
                            ...current,
                            login_name: event.target.value,
                          }));
                        }}
                        required
                        autoComplete="username"
                        inputProps={{ maxLength: 64 }}
                        helperText="Must be unique across all users"
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      {/* spacer on desktop so the password pair lines up */}
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Password"
                        type="password"
                        value={registerForm.password}
                        onChange={(event) => {
                          setRegisterForm((current) => ({
                            ...current,
                            password: event.target.value,
                          }));
                        }}
                        required
                        autoComplete="new-password"
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Confirm Password"
                        type="password"
                        value={registerForm.confirm_password}
                        onChange={(event) => {
                          setRegisterForm((current) => ({
                            ...current,
                            confirm_password: event.target.value,
                          }));
                        }}
                        required
                        autoComplete="new-password"
                        error={confirmPasswordError || (!passwordsMatch && registerForm.confirm_password !== "")}
                        helperText={
                          confirmPasswordError || (!passwordsMatch && registerForm.confirm_password !== "")
                            ? "Passwords do not match"
                            : ""
                        }
                        fullWidth
                      />
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 0.5 }} />

                  {/* ── Profile section ── */}
                  <Typography variant="caption" className="auth-section-label">
                    Profile info
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="First Name"
                        value={registerForm.first_name}
                        onChange={(event) => {
                          setRegisterForm((current) => ({
                            ...current,
                            first_name: event.target.value,
                          }));
                        }}
                        required
                        helperText="Shown on your profile"
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Last Name"
                        value={registerForm.last_name}
                        onChange={(event) => {
                          setRegisterForm((current) => ({
                            ...current,
                            last_name: event.target.value,
                          }));
                        }}
                        required
                        helperText="Shown on your profile"
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Location"
                        value={registerForm.location}
                        onChange={(event) => {
                          setRegisterForm((current) => ({
                            ...current,
                            location: event.target.value,
                          }));
                        }}
                        helperText="Optional"
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Occupation"
                        value={registerForm.occupation}
                        onChange={(event) => {
                          setRegisterForm((current) => ({
                            ...current,
                            occupation: event.target.value,
                          }));
                        }}
                        helperText="Optional"
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        label="Description"
                        value={registerForm.description}
                        onChange={(event) => {
                          setRegisterForm((current) => ({
                            ...current,
                            description: event.target.value,
                          }));
                        }}
                        multiline
                        minRows={3}
                        helperText="Optional — tell other users a bit about yourself"
                        fullWidth
                      />
                    </Grid>
                  </Grid>

                  <Button
                    variant="contained"
                    size="large"
                    type="submit"
                    disabled={registerMutation.isPending}
                    fullWidth
                  >
                    {registerMutation.isPending ? "Creating Account…" : "Create Account"}
                  </Button>
                </Stack>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
