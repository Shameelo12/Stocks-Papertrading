import React from 'react';
import { Box, Container, Typography, Button } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Container maxWidth="md">
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '100vh',
              textAlign: 'center',
              gap: 3,
            }}
          >
            <ErrorOutlineIcon sx={{ fontSize: 80, color: 'error.main' }} />
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Oops! Something went wrong
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 500 }}>
              We encountered an unexpected error. The issue has been logged and our team will look into it.
            </Typography>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <Box
                sx={{
                  backgroundColor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'error.light',
                  borderRadius: 1,
                  padding: 2,
                  maxWidth: '100%',
                  textAlign: 'left',
                  overflow: 'auto',
                  maxHeight: 300,
                }}
              >
                <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'error.main' }}>
                  {this.state.error.toString()}
                </Typography>
              </Box>
            )}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant="contained" onClick={this.handleReset}>
                Try Again
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  window.location.href = '/';
                }}
              >
                Go Home
              </Button>
            </Box>
          </Box>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
