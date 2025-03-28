import React from "react";
import { Link as RouterLink } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
const PremiumCardLink = styled(RouterLink)(({ theme }) => ({
  textDecoration: "none",
  display: "block",
  position: "relative",
  overflow: "hidden",
  transition: theme.transitions.create(
    ["transform", "box-shadow"],
    {
      duration: theme.transitions.duration.standard,
      easing: theme.transitions.easing.easeInOut
    }
  ),
  "&:before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    background: "linear-gradient(90deg, #2196F3 0%, #4CAF50 100%)",
    zIndex: 1
  },
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: theme.shadows[6]
  }
}));

export default function Cards({ heading, subtext, imageSrc, linkTo }) {
  return (
    <PremiumCardLink to={linkTo}>
      <Box
        sx={{
          p: 3,
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: 3,
          border: "1px solid",
          borderColor: "divider",
          height: "100%",
          display: "flex",
          alignItems: "center",
          gap: 2.5,
          transition: theme => theme.transitions.create(["background-color", "transform"]),  // Fixed
          "&:hover img": {
            transform: "scale(1.05)"
          }}}      >
        {/* Image Container */}
        <Box
          sx={{
            flexShrink: 0,
            width: 88,
            height: 88,
            borderRadius: 1.5,
            overflow: "hidden",
            position: "relative",
            "&:after": {
              content: '""',
              position: "absolute",
              inset: 0,
              border: "0px solid",
              borderColor: "divider",
              borderRadius: "inherit"
            },
            "& img": {
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "transform 0.3s ease-in-out"
            }
          
          }}
        >
          <img src={imageSrc} alt={heading} />
        </Box>

        {/* Content */}
        <Box>
          <Typography
            variant="h6"
            component="h3"
            sx={{
              fontWeight: 600,
              color: "text.primary",
              mb: 0.5,
              letterSpacing: 0.15
            }}
          >
            {heading}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              lineHeight: 1.5,
              fontSize: "0.875rem",
              maxWidth: "28ch"
            }}
          >
            {subtext}
          </Typography>
        </Box>
      </Box>
    </PremiumCardLink>
  );
}