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
  Alert,
  Chip,
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
    <Container maxWidth="lg" sx={{ paddingY: 4 }}>
      {/* Header */}
      <Box sx={{ marginBottom: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, marginBottom: 1 }}>
          Transaction History
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          View all your trades and transactions
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ marginBottom: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress sx={{ color: '#05a854' }} />
        </Box>
      ) : transactions.length === 0 ? (
        <Card elevation={0}>
          <CardContent sx={{ textAlign: 'center', paddingY: 6 }}>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              No transactions yet. Start trading to see your history here!
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Card elevation={0}>
          <CardContent sx={{ padding: 0 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, padding: 3, marginBottom: 0 }}>
              Transactions ({transactions.length})
            </Typography>
            <TableContainer>
              <Table>
                <TableHead sx={{ backgroundColor: 'rgba(0,0,0,0.03)' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Date & Time</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Ticker</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Shares</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Price</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Total Value</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactions.map((tx) => (
                    <TableRow key={tx.id} hover>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(tx.timestamp).toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>
                        {tx.ticker}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={tx.type}
                          size="small"
                          variant="outlined"
                          sx={{
                            backgroundColor: tx.type === 'BUY' ? 'rgba(5, 168, 84, 0.1)' : 'rgba(211, 47, 47, 0.1)',
                            borderColor: tx.type === 'BUY' ? '#05a854' : '#d32f2f',
                            color: tx.type === 'BUY' ? '#05a854' : '#d32f2f',
                            fontWeight: 700,
                          }}
                        />
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
          </CardContent>
        </Card>
      )}
    </Container>
  );
}
