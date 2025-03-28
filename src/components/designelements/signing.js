import * as React from "react";
import { AppProvider } from "@toolpad/core/AppProvider";
import { useTheme } from "@mui/material/styles";
import { Box, TextField, Typography, Button, Fade } from "@mui/material";

export default function SignInbox({ signIn, role }) {
  const theme = useTheme();
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleSignIn = async () => {
    setError(""); // Clear previous errors
    if (!username || !password) {
      setError("Username and password are required.");
      return;
    }
    setLoading(true);
    try {
      await signIn(username, password, role); // Pass role for dynamic API endpoint
    } catch (err) {
      setError("Failed to sign in. Please check your credentials.");
      console.error("Sign-in error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppProvider theme={theme}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
          background: "linear-gradient(135deg, #e0f7fa, #e8f5e9)",
          p: 2,
        }}
      >
        <Fade in timeout={600}>
          <Box
            sx={{
              width: "100%",
              maxWidth: 400,
              p: 4,
              bgcolor: "transparent",

              borderRadius: 2,
              boxShadow: "0px 24px 48px rgba(0, 0, 0, 0.1)",
              position: "relative",
              overflow: "hidden",
              "&:before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 0,
                background: "linear-gradient(90deg, #2196F3 0%, #4CAF50 100%)",
              },
            }}
          >
            <Typography
              variant="h5"
              sx={{
                mb: 3,
                fontWeight: 600,
                textAlign: "center",
                color: "text.primary",
              }}
            >
              Sign In as {role}
            </Typography>

            {error && (
              <Typography
                variant="body2"
                sx={{ color: "error.main", textAlign: "center", mb: 2 }}
              >
                {error}
              </Typography>
            )}

            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                variant="filled"
                label="Username"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                InputProps={{
                  // disableUnderline: true,
                  sx: {
                    borderRadius: 1,
                    bgcolor: "transparent",
                    transition: "all 0.3s",
                    "&:hover": { bgcolor: "action.hover" },
                    "&.Mui-focused": {
                      bgcolor: "background.paper",
                      boxShadow: (theme) => `0 0 0 2px ${theme.palette.primary.main}`,
                    },
                  },
                }}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                variant="filled"
                label="Password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  // disableUnderline: true,
                  sx: {
                    borderRadius: 1,
                    bgcolor: "transparent",
                    transition: "all 0.3s",
                    "&:hover": { bgcolor: "action.hover" },
                    "&.Mui-focused": {
                      bgcolor: "background.paper",
                      boxShadow: (theme) => `0 0 0 2px ${theme.palette.primary.main}`,
                    },
                  },
                }}
              />
            </Box>

            <Button
              onClick={handleSignIn}
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                py: 1.5,
                borderRadius: 2,
                transition: "background-color 0.3s, transform 0.2s",
                ...(loading
                  ? { opacity: 0.7 }
                  : { "&:hover": { transform: "translateY(-2px)" } }),
              }}
            >
              {loading ? "Signing In..." : "Sign In"}
            </Button>
          </Box>
        </Fade>
      </Box>
    </AppProvider>
  );
}
