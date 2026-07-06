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
    <Container maxWidth="lg" sx={{ paddingTop: 4, paddingBottom: 4 }}>
      <Typography variant="h4" sx={{ marginBottom: 4, fontWeight: 600 }}>
        Transaction History
      </Typography>

      {error && (
        <Box sx={{ color: '#c33', marginBottom: 2 }}>
          {error}
        </Box>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', padding: 4 }}>
          <CircularProgress />
        </Box>
      ) : transactions.length === 0 ? (
        <Card sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <CardContent sx={{ textAlign: 'center', padding: 4 }}>
            <Typography variant="body1" sx={{ color: '#666' }}>
              No transactions yet. Start trading to see your history here.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper} sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Date & Time</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Ticker</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Shares</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Price</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Total Value</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow key={tx.id} hover>
                  <TableCell>
                    {new Date(tx.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>
                    {tx.ticker}
                  </TableCell>
                  <TableCell>
                    <span
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        backgroundColor: tx.type === 'BUY' ? '#d4edda' : '#f8d7da',
                        color: tx.type === 'BUY' ? '#155724' : '#721c24',
                        fontWeight: 500,
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
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    ${parseFloat(tx.totalValue).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
}
