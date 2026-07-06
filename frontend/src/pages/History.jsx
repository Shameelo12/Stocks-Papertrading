import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Box,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

export default function History() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await API.get('/portfolio/transactions');
      setTransactions(response.data);
    } catch (err) {
      setError('Failed to load transaction history');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f8f9fa', paddingTop: 4, paddingBottom: 4 }}>
      <Container maxWidth="lg">
        <Typography variant="h4" sx={{ marginBottom: 4, fontWeight: 700, color: '#1a1a1a' }}>
          Transaction History
        </Typography>

        {error && (
          <Alert severity="error" sx={{ marginBottom: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', padding: 4 }}>
            <CircularProgress sx={{ color: '#05a854' }} />
          </Box>
        ) : transactions.length === 0 ? (
          <Card elevation={0} sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.04)' }}>
            <CardContent sx={{ textAlign: 'center', padding: 5 }}>
              <Typography variant="h6" sx={{ color: '#1a1a1a', marginBottom: 1 }}>
                No Transactions Yet
              </Typography>
              <Typography variant="body1" sx={{ color: '#666' }}>
                Start trading to see your transaction history here.
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <TableContainer component={Paper} elevation={0} sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.04)' }}>
            <Table>
              <TableHead sx={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid rgba(0,0,0,0.04)' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: '#1a1a1a' }}>Date & Time</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#1a1a1a' }}>Ticker</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#1a1a1a' }}>Type</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, color: '#1a1a1a' }}>Shares</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, color: '#1a1a1a' }}>Price</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, color: '#1a1a1a' }}>Total Value</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={tx.id} hover sx={{ '&:hover': { backgroundColor: '#f8f9fa' } }}>
                    <TableCell>
                      {new Date(tx.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#1a1a1a' }}>
                      {tx.ticker}
                    </TableCell>
                    <TableCell>
                      <span
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          backgroundColor: tx.type === 'BUY' ? '#d4edda' : '#f8d7da',
                          color: tx.type === 'BUY' ? '#155724' : '#721c24',
                          fontWeight: 600,
                          fontSize: '13px',
                        }}
                      >
                        {tx.type}
                      </span>
                    </TableCell>
                    <TableCell align="right">
                      {parseFloat(tx.shares).toFixed(2)}
                    </TableCell>
                    <TableCell align="right">
                      ${parseFloat(tx.priceAtTime).toFixed(2)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
                      ${parseFloat(tx.totalValue).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Container>
    </Box>
  );
}
