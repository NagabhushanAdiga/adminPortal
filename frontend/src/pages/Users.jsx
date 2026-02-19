import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
  Chip,
  TablePagination,
  CircularProgress,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { api } from '../api';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .usersList()
      .then((data) => {
        if (!cancelled && data.ok && Array.isArray(data.users)) setUsers(data.users);
        else if (!cancelled) setUsers([]);
      })
      .catch(() => {
        if (!cancelled) setUsers([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const filtered = users.filter(
    (u) =>
      (u.username || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.role || '').toLowerCase().includes(search.toLowerCase())
  );
  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const formatDate = (d) => {
    if (!d) return '—';
    try {
      const date = typeof d === 'string' ? new Date(d) : d;
      return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString();
    } catch {
      return '—';
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '100%', overflow: 'auto' }}>
      <Card sx={{ overflow: 'auto' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Users
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Admin users from the backend. Create more via the backend seed or createUser script.
          </Typography>
          <TextField
            fullWidth
            placeholder="Search by username, name, or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ mb: 2, maxWidth: { xs: '100%', sm: 400 } }}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : filtered.length === 0 ? (
            <Typography color="text.secondary" sx={{ py: 3 }}>
              No users found.
            </Typography>
          ) : (
            <>
              <Table size="small" sx={{ minWidth: 520 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Username</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Created</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginated.map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell>{user.username || '—'}</TableCell>
                      <TableCell>{user.name || '—'}</TableCell>
                      <TableCell>
                        <Chip size="small" label={user.role || 'Admin'} color={user.role === 'Admin' ? 'primary' : 'default'} />
                      </TableCell>
                      <TableCell>{formatDate(user.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <TablePagination
                component="div"
                count={filtered.length}
                page={page}
                onPageChange={(_, p) => setPage(p)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
                rowsPerPageOptions={[5, 10, 25]}
                sx={{ flexWrap: 'wrap' }}
              />
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
