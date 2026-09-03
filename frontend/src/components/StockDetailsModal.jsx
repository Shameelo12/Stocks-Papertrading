import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import API, { unwrapList } from '../api/axios';

export default function StockDetailsModal({ open, ticker, onClose }) {
  const [holding, setHolding] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open || !ticker) return;

    const fetchData = async () => {
      try {
        const [portfolioRes, historyRes] = await Promise.all([
          API.get('/portfolio'),
          API.get('/portfolio/transactions'),
        ]);

        const portfolio = portfolioRes.data;
        const currentHolding = portfolio.holdings.find(h => h.ticker === ticker);
        setHolding(currentHolding);

        const stockTransactions = unwrapList(historyRes.data).filter(tx => tx.ticker === ticker);
        setTransactions(stockTransactions);
      } catch (err) {
        console.error('Failed to fetch stock details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [open, ticker]);

  if (!open) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, fontSize: '1.3rem' }}>
        {ticker} - Stock Details
      </DialogTitle>

      <DialogContent sx={{ paddingTop: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', padding: 4 }}>
            <CircularProgress sx={{ color: '#05a854' }} />
          </Box>
        ) : holding ? (
          <Box>
            {/* Key Metrics */}
            <Grid container spacing={2} sx={{ marginBottom: 4 }}>
              <Grid item xs={12} sm={6}>
                <Card elevation={0} sx={{ background: 'linear-gradient(135deg, #05a854 0%, #0d8f47 100%)', color: 'white', borderRadius: '12px' }}>
                  <CardContent>
                    <Typography variant="body2" sx={{ opacity: 0.85 }}>
                      Current Price
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      ${parseFloat(holding.currentPrice).toFixed(2)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Card elevation={0} sx={{ background: 'linear-gradient(135deg, #1f3a5f 0%, #2a5298 100%)', color: 'white', borderRadius: '12px' }}>
                  <CardContent>
                    <Typography variant="body2" sx={{ opacity: 0.85 }}>
                      Avg Cost
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      ${parseFloat(holding.avgCostPerShare).toFixed(2)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Card elevation={0} sx={{ background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)', color: 'white', borderRadius: '12px' }}>
                  <CardContent>
                    <Typography variant="body2" sx={{ opacity: 0.85 }}>
                      Total Shares
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      {parseFloat(holding.shares).toFixed(2)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Card elevation={0} sx={{ background: holding.gainLoss >= 0 ? 'linear-gradient(135deg, #05a854 0%, #0d8f47 100%)' : 'linear-gradient(135deg, #d32f2f 0%, #c62828 100%)', color: 'white', borderRadius: '12px' }}>
                  <CardContent>
                    <Typography variant="body2" sx={{ opacity: 0.85 }}>
                      Total P&L
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      ${parseFloat(holding.gainLoss).toFixed(2)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Trading History */}
            <Typography variant="h6" sx={{ fontWeight: 700, marginTop: 3, marginBottom: 2 }}>
              Trading History
            </Typography>
            {transactions.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead sx={{ backgroundColor: 'rgba(0,0,0,0.03)' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>Type</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>Shares</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>Price</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {transactions.map((tx) => (
                      <TableRow key={tx.id} hover>
                        <TableCell>
                          {new Date(tx.timestamp).toLocaleDateString()} {new Date(tx.timestamp).toLocaleTimeString()}
                        </TableCell>
                        <TableCell align="right">
                          <Chip
                            label={tx.type}
                            size="small"
                            sx={{
                              backgroundColor: tx.type === 'BUY' ? 'rgba(5, 168, 84, 0.2)' : 'rgba(211, 47, 47, 0.2)',
                              color: tx.type === 'BUY' ? '#05a854' : '#d32f2f',
                              fontWeight: 600,
                            }}
                          />
                        </TableCell>
                        <TableCell align="right">{parseFloat(tx.shares).toFixed(2)}</TableCell>
                        <TableCell align="right">${parseFloat(tx.priceAtTime).toFixed(2)}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                          ${parseFloat(tx.totalValue).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', padding: 2 }}>
                No trading history for this stock
              </Typography>
            )}
          </Box>
        ) : (
          <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', padding: 4 }}>
            You don't own this stock
          </Typography>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} sx={{ color: '#05a854', fontWeight: 600 }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
