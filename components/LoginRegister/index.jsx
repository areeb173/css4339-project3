import React, { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
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

  const handleAuthSuccess = (user) => {
    queryClient.setQueryData(queryKeys.sessionUser, user);
    queryClient.invalidateQueries({ queryKey: queryKeys.users });
    navigate(`/users/${user._id}`, { replace: true });
  };

  const loginMutation = useMutation({
    mutationFn: api.login,
    onSuccess: handleAuthSuccess,
    onError: (error) => {
      setLoginError(getErrorMessage(error, "Login failed."));
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
      setRegisterError(getErrorMessage(error, "Registration failed."));
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
    setRegisterError("");
    registerMutation.mutate({
      ...registerForm,
      login_name: registerForm.login_name.trim(),
      first_name: registerForm.first_name.trim(),
      last_name: registerForm.last_name.trim(),
      location: registerForm.location.trim(),
      description: registerForm.description.trim(),
      occupation: registerForm.occupation.trim(),
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
          Sign in with one of the seeded accounts like `took` / `password`, or create a new
          account and jump straight into the app.
        </Typography>
      </Stack>

      <Grid container spacing={3}>
        <Grid item xs={12} md={5}>
          <Card className="auth-card auth-card-login">
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Login
              </Typography>
              <Typography variant="body2" sx={{ mb: 3 }}>
                Continue with an existing account.
              </Typography>

              <Box component="form" onSubmit={submitLogin}>
                <Stack spacing={2}>
                  {loginError ? <Alert severity="error">{loginError}</Alert> : null}
                  <TextField
                    label="Login Name"
                    value={loginForm.login_name}
                    onChange={(event) => {
                      setLoginForm((current) => ({
                        ...current,
                        login_name: event.target.value,
                      }));
                    }}
                    required
                    autoComplete="username"
                    fullWidth
                  />
                  <TextField
                    label="Password"
                    type="password"
                    value={loginForm.password}
                    onChange={(event) => {
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
                  >
                    {loginMutation.isPending ? "Signing In..." : "Sign In"}
                  </Button>
                </Stack>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={7}>
          <Card className="auth-card auth-card-register">
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Register
              </Typography>
              <Typography variant="body2" sx={{ mb: 3 }}>
                Create a new account, then we will log you in automatically.
              </Typography>

              <Box component="form" onSubmit={submitRegistration}>
                <Stack spacing={2}>
                  {registerError ? <Alert severity="error">{registerError}</Alert> : null}
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
                        fullWidth
                      />
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
                        label="First Name"
                        value={registerForm.first_name}
                        onChange={(event) => {
                          setRegisterForm((current) => ({
                            ...current,
                            first_name: event.target.value,
                          }));
                        }}
                        required
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
                        fullWidth
                      />
                    </Grid>
                  </Grid>
                  <Button
                    variant="contained"
                    size="large"
                    type="submit"
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? "Creating Account..." : "Create Account"}
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
