import { useState, useMemo, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import SendIcon from '@mui/icons-material/Send';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SendAllIcon from '@mui/icons-material/Campaign';

function getColumns(data) {
  if (!Array.isArray(data) || data.length === 0) return [];
  const keySet = new Set();
  data.forEach((row) => {
    if (row && typeof row === 'object') {
      Object.keys(row).forEach((k) => keySet.add(k));
    }
  });
  return Array.from(keySet);
}

function getCellValue(value) {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

export default function Notification() {
  const fileInputRef = useRef(null);
  const [jsonInput, setJsonInput] = useState('');
  const [parseError, setParseError] = useState('');
  const [parsedData, setParsedData] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [fileName, setFileName] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const [sendAllConfirmOpen, setSendAllConfirmOpen] = useState(false);
  const [sendOneConfirmRow, setSendOneConfirmRow] = useState(null);
  const [removeConfirmRowId, setRemoveConfirmRowId] = useState(null);
  const [loadingImport, setLoadingImport] = useState(false);
  const [loadingSendOne, setLoadingSendOne] = useState(false);
  const [loadingSendAll, setLoadingSendAll] = useState(false);

  const columns = useMemo(() => {
    if (!parsedData) return [];
    return getColumns(parsedData).filter((c) => c !== '_rowId');
  }, [parsedData]);
  const paginatedRows = useMemo(() => {
    if (!parsedData || !Array.isArray(parsedData)) return [];
    const start = page * rowsPerPage;
    return parsedData.slice(start, start + rowsPerPage);
  }, [parsedData, page, rowsPerPage]);

  const handleClear = () => {
    setJsonInput('');
    setParseError('');
    setParsedData(null);
    setPage(0);
    setFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const processJsonString = async (str) => {
    setParseError('');
    setParsedData(null);
    const trimmed = str.trim();
    if (!trimmed) {
      setParseError('Please enter or upload JSON data.');
      return;
    }
    setLoadingImport(true);
    try {
      await new Promise((r) => setTimeout(r, 400));
      const parsed = JSON.parse(trimmed);
      if (!Array.isArray(parsed)) {
        setParseError('JSON must be an array of objects (e.g. [{ "studentIds": "1,2", "message": "..." }, ...]).');
        return;
      }
      setParsedData(
        parsed.map((row, i) => ({ ...row, _rowId: `row-${Date.now()}-${i}` }))
      );
      setPage(0);
    } catch (e) {
      setParseError(e.message || 'Invalid JSON. Check syntax and try again.');
    } finally {
      setLoadingImport(false);
    }
  };

  const toPayload = (row) => ({
    studentIds: row.studentIds ?? row.student_ids ?? '',
    message: row.message ?? '',
    title: row.title ?? 'Notification',
  });

  const handleSendClick = (row) => setSendOneConfirmRow(row);
  const handleSendConfirm = async () => {
    if (!sendOneConfirmRow) return;
    setLoadingSendOne(true);
    try {
      const { api } = await import('../api');
      const data = await api.notificationsSend([toPayload(sendOneConfirmRow)]);
      const pushed = data.pushed;
      const msg = pushed !== undefined && pushed > 0 ? `Notification sent to ${pushed} device(s).` : 'Notification sent successfully.';
      setSnackbar({ open: true, message: msg });
      setSendOneConfirmRow(null);
    } catch (e) {
      setSnackbar({ open: true, message: e.message || 'Failed to send notification.' });
    } finally {
      setLoadingSendOne(false);
    }
  };

  const handleRemoveClick = (rowId) => setRemoveConfirmRowId(rowId);
  const handleRemoveConfirm = () => {
    if (removeConfirmRowId == null) return;
    handleRemove(removeConfirmRowId);
    setRemoveConfirmRowId(null);
  };

  const handleRemove = (rowId) => {
    setParsedData((prev) => {
      const next = prev.filter((r) => r._rowId !== rowId);
      if (next.length === 0) setPage(0);
      else if (page > 0 && page * rowsPerPage >= next.length) setPage(Math.max(0, Math.ceil(next.length / rowsPerPage) - 1));
      return next;
    });
  };

  const handleSendAllClick = () => setSendAllConfirmOpen(true);
  const handleSendAllConfirm = async () => {
    if (!parsedData || parsedData.length === 0) return;
    setSendAllConfirmOpen(false);
    setLoadingSendAll(true);
    try {
      const { api } = await import('../api');
      const rows = parsedData.map((row) => toPayload(row));
      const data = await api.notificationsSend(rows);
      const sent = data.sent ?? rows.length;
      const pushed = data.pushed;
      let msg = `${sent} notification${sent !== 1 ? 's' : ''} sent.`;
      if (pushed !== undefined && pushed > 0) msg += ` Delivered to ${pushed} device(s).`;
      setSnackbar({ open: true, message: msg });
    } catch (e) {
      setSnackbar({ open: true, message: e.message || 'Failed to send notifications.' });
    } finally {
      setLoadingSendAll(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        setJsonInput(text);
        await processJsonString(text);
      } else {
        setParseError('Could not read file as text.');
      }
    };
    reader.onerror = () => setParseError('Failed to read file.');
    reader.readAsText(file, 'UTF-8');
    e.target.value = '';
  };

  const handleImport = () => processJsonString(jsonInput);

  return (
    <Box sx={{ width: '100%', maxWidth: '100%', overflow: 'auto' }}>
      <Card sx={{ mb: 3, overflow: 'auto' }}>
        <CardContent>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
            Upload a JSON file or paste JSON as an array of objects (e.g. student IDs and message). Columns will be generated from your data keys.
          </Typography>
          <input
            type="file"
            ref={fileInputRef}
            accept=".json,application/json"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
            <Button
              variant="outlined"
              startIcon={loadingImport ? <CircularProgress size={20} color="inherit" /> : <FolderOpenIcon />}
              onClick={() => fileInputRef.current?.click()}
              disabled={loadingImport}
            >
              Upload JSON file
            </Button>
            {fileName && (
              <Typography variant="body2" color="text.secondary" sx={{ alignSelf: 'center' }}>
                {fileName}
              </Typography>
            )}
          </Box>
          <TextField
            fullWidth
            multiline
            minRows={6}
            maxRows={12}
            placeholder={'[\n  { "studentIds": "1,2,3", "message": "Promotional message here" },\n  { "studentIds": "4", "message": "Another message" }\n]'}
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            sx={{ mb: 2 }}
            inputProps={{ spellCheck: false }}
          />
          {parseError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {parseError}
            </Alert>
          )}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              startIcon={loadingImport ? <CircularProgress size={20} color="inherit" /> : <UploadFileIcon />}
              onClick={handleImport}
              disabled={loadingImport}
            >
              Import & Preview
            </Button>
            <Button variant="outlined" onClick={handleClear} disabled={loadingImport}>
              Clear
            </Button>
          </Box>
        </CardContent>
      </Card>

      {parsedData && parsedData.length > 0 && (
        <Card sx={{ overflow: 'auto' }}>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ px: 2.5, py: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
              <Box>
                <Typography variant="h6" fontWeight="600">
                  Notification data
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {parsedData.length} row{parsedData.length !== 1 ? 's' : ''} (columns from JSON) — Send all at once or use the Send icon per row
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={loadingSendAll ? <CircularProgress size={18} color="inherit" /> : <SendAllIcon />}
                onClick={handleSendAllClick}
                disabled={loadingSendAll}
                size="small"
              >
                Send all
              </Button>
            </Box>
            <Table size="small" sx={{ minWidth: 400 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.50' }}>
                  {columns.map((col) => (
                    <TableCell key={col} sx={{ fontWeight: 600, color: 'text.secondary' }}>
                      {col}
                    </TableCell>
                  ))}
                  <TableCell sx={{ fontWeight: 600, color: 'text.secondary', width: 120 }} align="right">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedRows.map((row) => (
                  <TableRow key={row._rowId} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                    {columns.map((col) => (
                      <TableCell key={col} sx={col === 'message' ? { maxWidth: 320 } : undefined}>
                        {getCellValue(row[col])}
                      </TableCell>
                    ))}
                    <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                      <IconButton
                        size="small"
                        color="primary"
                        aria-label="Send notification"
                        onClick={() => handleSendClick(row)}
                        title="Send notification"
                      >
                        <SendIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        aria-label="Remove from table"
                        onClick={() => handleRemoveClick(row._rowId)}
                        title="Remove from table"
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={parsedData.length}
              page={page}
              onPageChange={(_, p) => setPage(p)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[5, 10, 25, 50]}
              sx={{ flexWrap: 'wrap' }}
            />
          </CardContent>
        </Card>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        message={snackbar.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
      <Dialog open={sendAllConfirmOpen} onClose={() => setSendAllConfirmOpen(false)}>
        <DialogTitle>Send all notifications</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Send notifications to all {parsedData?.length ?? 0} row{parsedData?.length !== 1 ? 's' : ''}? This will trigger one notification per row.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSendAllConfirmOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSendAllConfirm}
            variant="contained"
            startIcon={loadingSendAll ? <CircularProgress size={18} color="inherit" /> : <SendAllIcon />}
            disabled={loadingSendAll}
          >
            Send all
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={Boolean(sendOneConfirmRow)} onClose={() => setSendOneConfirmRow(null)}>
        <DialogTitle>Send notification</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Send this notification now? This will send to the student ID(s) and message in this row.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSendOneConfirmRow(null)}>Cancel</Button>
          <Button
            onClick={handleSendConfirm}
            variant="contained"
            startIcon={loadingSendOne ? <CircularProgress size={18} color="inherit" /> : <SendIcon />}
            disabled={loadingSendOne}
          >
            Send
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={Boolean(removeConfirmRowId)} onClose={() => setRemoveConfirmRowId(null)}>
        <DialogTitle>Remove from table</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Remove this row from the table? This cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRemoveConfirmRowId(null)}>Cancel</Button>
          <Button onClick={handleRemoveConfirm} color="error" variant="contained">
            Remove
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
