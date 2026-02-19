import { useState } from 'react';
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
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';

const initialStudents = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active', joinDate: '2024-01-15' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'Active', joinDate: '2024-02-20' },
  { id: 3, name: 'Bob Wilson', email: 'bob@example.com', role: 'User', status: 'Inactive', joinDate: '2024-03-10' },
  { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'Moderator', status: 'Active', joinDate: '2024-01-28' },
  { id: 5, name: 'Charlie Davis', email: 'charlie@example.com', role: 'User', status: 'Active', joinDate: '2024-04-05' },
  { id: 6, name: 'Eva Martinez', email: 'eva@example.com', role: 'User', status: 'Pending', joinDate: '2024-05-12' },
];

export default function Users() {
  const [students, setStudents] = useState(initialStudents);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [search, setSearch] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', role: 'User', status: 'Active', joinDate: '' });

  const filtered = students.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );
  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleEditClick = (student) => {
    setEditingStudent(student);
    setEditForm({
      name: student.name,
      email: student.email,
      role: student.role,
      status: student.status,
      joinDate: student.joinDate,
    });
    setEditOpen(true);
  };

  const handleEditClose = () => {
    setEditOpen(false);
    setEditingStudent(null);
  };

  const handleEditSave = () => {
    if (!editingStudent) return;
    setStudents((prev) =>
      prev.map((s) =>
        s.id === editingStudent.id
          ? { ...s, ...editForm }
          : s
      )
    );
    handleEditClose();
  };

  const handleEditFormChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '100%', overflow: 'auto' }}>
      <Card sx={{ overflow: 'auto' }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Search students..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ mb: 2, maxWidth: { xs: '100%', sm: 400 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <Table size="small" sx={{ minWidth: 520 }}>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Join Date</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginated.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip size="small" label={user.role} color={user.role === 'Admin' ? 'primary' : 'default'} />
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={user.status}
                      color={
                        user.status === 'Active'
                          ? 'success'
                          : user.status === 'Inactive'
                          ? 'default'
                          : 'warning'
                      }
                    />
                  </TableCell>
                  <TableCell>{user.joinDate}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      color="primary"
                      aria-label="Edit student"
                      onClick={() => handleEditClick(user)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
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
        </CardContent>
      </Card>

      <Dialog open={editOpen} onClose={handleEditClose} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Student</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField
            label="Name"
            value={editForm.name}
            onChange={(e) => handleEditFormChange('name', e.target.value)}
            fullWidth
          />
          <TextField
            label="Email"
            type="email"
            value={editForm.email}
            onChange={(e) => handleEditFormChange('email', e.target.value)}
            fullWidth
          />
          <FormControl fullWidth>
            <InputLabel>Role</InputLabel>
            <Select
              value={editForm.role}
              label="Role"
              onChange={(e) => handleEditFormChange('role', e.target.value)}
            >
              <MenuItem value="Admin">Admin</MenuItem>
              <MenuItem value="Moderator">Moderator</MenuItem>
              <MenuItem value="User">User</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={editForm.status}
              label="Status"
              onChange={(e) => handleEditFormChange('status', e.target.value)}
            >
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Join Date"
            type="date"
            value={editForm.joinDate}
            onChange={(e) => handleEditFormChange('joinDate', e.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose}>Cancel</Button>
          <Button variant="contained" onClick={handleEditSave}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
