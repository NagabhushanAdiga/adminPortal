import { useState, useMemo, useRef, useEffect } from 'react';
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
  Collapse,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import SaveIcon from '@mui/icons-material/Save';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditNoteIcon from '@mui/icons-material/EditNote';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import RefreshIcon from '@mui/icons-material/Refresh';
import { api } from '../api';

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

export default function Import() {
  const fileInputRef = useRef(null);
  const [jsonInput, setJsonInput] = useState('');
  const [parseError, setParseError] = useState('');
  const [previewData, setPreviewData] = useState(null);
  const [previewPage, setPreviewPage] = useState(0);
  const [previewRowsPerPage, setPreviewRowsPerPage] = useState(10);
  const [fileName, setFileName] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const [clearAllPreviewOpen, setClearAllPreviewOpen] = useState(false);
  const [showManualImport, setShowManualImport] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);
  const [savedData, setSavedData] = useState([]);
  const [savedDataLoading, setSavedDataLoading] = useState(false);
  const [savedDataOpen, setSavedDataOpen] = useState(false);

  const previewColumns = useMemo(() => {
    if (!previewData || previewData.length === 0) return [];
    return getColumns(previewData).filter((c) => c !== '_rowId');
  }, [previewData]);
  const paginatedPreviewRows = useMemo(() => {
    if (!previewData || !Array.isArray(previewData)) return [];
    const start = previewPage * previewRowsPerPage;
    return previewData.slice(start, start + previewRowsPerPage);
  }, [previewData, previewPage, previewRowsPerPage]);

  const loadSavedData = async () => {
    setSavedDataLoading(true);
    try {
      const data = await api.importList();
      if (data.ok && Array.isArray(data.rows)) setSavedData(data.rows);
      else setSavedData([]);
    } catch {
      setSavedData([]);
    } finally {
      setSavedDataLoading(false);
    }
  };

  const savedColumns = useMemo(() => {
    if (!savedData.length) return [];
    const keySet = new Set();
    savedData.forEach((row) => Object.keys(row).filter((k) => k !== '_rowId').forEach((k) => keySet.add(k)));
    return Array.from(keySet);
  }, [savedData]);


  const handleClearInput = () => {
    setJsonInput('');
    setParseError('');
    setFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const processPreview = async (str) => {
    setParseError('');
    setPreviewData(null);
    const trimmed = str.trim();
    if (!trimmed) {
      setParseError('Please enter or upload JSON data.');
      return;
    }
    setLoadingPreview(true);
    try {
      await new Promise((r) => setTimeout(r, 400));
      const parsed = JSON.parse(trimmed);
      if (!Array.isArray(parsed)) {
        setParseError('JSON must be an array of objects.');
        return;
      }
      const withIds = parsed.map((row, i) => ({
        ...row,
        _rowId: `row-${Date.now()}-${i}-${Math.random().toString(36).slice(2)}`,
      }));
      setPreviewData(withIds);
      setPreviewPage(0);
      setSnackbar({ open: true, message: `${withIds.length} row(s) loaded. Review and save to database when ready.` });
    } catch (e) {
      setParseError(e.message || 'Invalid JSON.');
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleClearPreview = () => {
    setPreviewData(null);
    setPreviewPage(0);
    handleClearInput();
  };

  const handleSaveToDatabase = async () => {
    if (!previewData || previewData.length === 0) return;
    setLoadingSave(true);
    try {
      const rows = previewData.map(({ _rowId, ...rest }) => rest);
      const data = await api.importSave(rows);
      if (!data.ok) {
        setSnackbar({ open: true, message: data.error || 'Failed to save to database.' });
        return;
      }
      setSnackbar({ open: true, message: `${data.saved ?? previewData.length} row(s) saved to database.` });
      setPreviewData(null);
      setPreviewPage(0);
      handleClearInput();
      loadSavedData();
    } catch (err) {
      setSnackbar({ open: true, message: err.message || 'Network error. Check API URL and CORS.' });
    } finally {
      setLoadingSave(false);
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
        await processPreview(text);
      } else {
        setParseError('Could not read file as text.');
      }
    };
    reader.onerror = () => setParseError('Failed to read file.');
    reader.readAsText(file, 'UTF-8');
    e.target.value = '';
  };

  const handleImportPreview = () => processPreview(jsonInput);
  const isBusy = loadingPreview || loadingSave;

  const handleClearAllPreviewClick = () => setClearAllPreviewOpen(true);
  const handleClearAllPreviewConfirm = () => {
    setPreviewData(null);
    setPreviewPage(0);
    handleClearInput();
    setClearAllPreviewOpen(false);
    setSnackbar({ open: true, message: 'Preview cleared.' });
  };

  return (
    <Box sx={{ width: '100%', overflow: 'auto' }}>
      <input
        type="file"
        ref={fileInputRef}
        accept=".json,application/json"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      <Card
        elevation={0}
        sx={{
          mb: 3,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            px: 3,
            py: 2.5,
            borderBottom: 1,
            borderColor: 'divider',
            background: 'linear-gradient(180deg, #fafafa 0%, #fff 100%)',
          }}
        >
          <Typography variant="h6" fontWeight="600" color="text.primary">
            Import data
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Upload a JSON file or paste JSON manually. Preview your data, then save to database.
          </Typography>
        </Box>
        <CardContent sx={{ p: 3 }}>
          {!showManualImport ? (
            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                size="large"
                startIcon={loadingPreview ? <CircularProgress size={20} color="inherit" /> : <FolderOpenIcon />}
                onClick={() => fileInputRef.current?.click()}
                disabled={isBusy}
                sx={{
                  py: 1.5,
                  px: 2.5,
                  textTransform: 'none',
                  fontWeight: 600,
                  borderRadius: 2,
                  borderWidth: 1.5,
                  '&:hover': { borderWidth: 1.5 },
                }}
              >
                Upload JSON file
              </Button>
              <Typography variant="body2" color="text.secondary" sx={{ px: 0.5 }}>
                or
              </Typography>
              <Button
                variant="contained"
                size="large"
                startIcon={<EditNoteIcon />}
                onClick={() => setShowManualImport(true)}
                disabled={isBusy}
                sx={{
                  py: 1.5,
                  px: 2.5,
                  textTransform: 'none',
                  fontWeight: 600,
                  borderRadius: 2,
                }}
              >
                Manual import
              </Button>
              {fileName && (
                <Typography variant="body2" color="text.secondary">
                  {fileName}
                </Typography>
              )}
            </Box>
          ) : (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" fontWeight="600">
                  Paste JSON
                </Typography>
                <Button
                  size="small"
                  startIcon={<CloseIcon />}
                  onClick={() => { setShowManualImport(false); handleClearInput(); setPreviewData(null); }}
                  sx={{ textTransform: 'none' }}
                >
                  Close
                </Button>
              </Box>
              <TextField
                fullWidth
                multiline
                minRows={6}
                maxRows={14}
                placeholder={'[\n  { "id": 1, "name": "John", "email": "john@example.com" },\n  { "id": 2, "name": "Jane" }\n]'}
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': { borderRadius: 2, fontFamily: 'monospace', fontSize: '0.875rem' },
                }}
                inputProps={{ spellCheck: false }}
              />
              {parseError && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setParseError('')}>
                  {parseError}
                </Alert>
              )}
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  startIcon={loadingPreview ? <CircularProgress size={18} color="inherit" /> : <VisibilityIcon />}
                  onClick={handleImportPreview}
                  disabled={loadingPreview}
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                  Import & Preview
                </Button>
                <Button variant="outlined" onClick={handleClearInput} disabled={isBusy} sx={{ textTransform: 'none' }}>
                  Clear
                </Button>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      {previewData && previewData.length > 0 && (
        <Card
          elevation={0}
          sx={{
            mb: 3,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            overflow: 'auto',
          }}
        >
          <Box
            sx={{
              px: 3,
              py: 2,
              borderBottom: 1,
              borderColor: 'divider',
              background: 'linear-gradient(180deg, #e3f2fd 0%, #fafafa 100%)',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="h6" fontWeight="600" color="text.primary">
                Import preview (unsaved)
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {previewData.length} row{previewData.length !== 1 ? 's' : ''} — Review below, then save to database
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                startIcon={loadingSave ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
                onClick={handleSaveToDatabase}
                disabled={loadingSave || !previewData?.length}
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                Save to database
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteSweepIcon />}
                onClick={handleClearAllPreviewClick}
                disabled={loadingSave}
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                Clear all
              </Button>
            </Box>
          </Box>
          <Table size="small" sx={{ minWidth: 400 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.50' }}>
                  {previewColumns.map((col) => (
                    <TableCell key={col} sx={{ fontWeight: 600, color: 'text.secondary' }}>
                      {col}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedPreviewRows.map((row) => (
                  <TableRow key={row._rowId} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                    {previewColumns.map((col) => (
                      <TableCell key={col} sx={col === 'message' ? { maxWidth: 320 } : undefined}>
                        {getCellValue(row[col])}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={previewData.length}
              page={previewPage}
              onPageChange={(_, p) => setPreviewPage(p)}
              rowsPerPage={previewRowsPerPage}
              onRowsPerPageChange={(e) => {
                setPreviewRowsPerPage(parseInt(e.target.value, 10));
                setPreviewPage(0);
              }}
              rowsPerPageOptions={[5, 10, 25, 50]}
              sx={{ flexWrap: 'wrap', px: 2 }}
            />
        </Card>
      )}

      <Card
        elevation={0}
        sx={{
          mb: 3,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            px: 3,
            py: 2,
            borderBottom: 1,
            borderColor: 'divider',
            background: 'linear-gradient(180deg, #f5f5f5 0%, #fafafa 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Button
            startIcon={savedDataOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            onClick={() => {
              setSavedDataOpen((o) => !o);
              if (!savedDataOpen && savedData.length === 0 && !savedDataLoading) loadSavedData();
            }}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Saved data in database
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={savedDataLoading ? <CircularProgress size={16} color="inherit" /> : <RefreshIcon />}
            onClick={loadSavedData}
            disabled={savedDataLoading}
            sx={{ textTransform: 'none' }}
          >
            Refresh
          </Button>
        </Box>
        <Collapse in={savedDataOpen}>
          <CardContent sx={{ p: 0 }}>
            {savedDataLoading && savedData.length === 0 ? (
              <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress size={28} />
              </Box>
            ) : savedData.length === 0 ? (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <Typography color="text.secondary">No saved records yet. Save imported data above.</Typography>
              </Box>
            ) : (
              <Table size="small" sx={{ minWidth: 400 }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.50' }}>
                    {savedColumns.map((col) => (
                      <TableCell key={col} sx={{ fontWeight: 600, color: 'text.secondary' }}>
                        {col}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {savedData.slice(0, 20).map((row, idx) => (
                    <TableRow key={row.id || idx} hover>
                      {savedColumns.map((col) => (
                        <TableCell key={col}>{getCellValue(row[col])}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            {savedData.length > 20 && (
              <Typography variant="body2" color="text.secondary" sx={{ px: 2, py: 1 }}>
                Showing first 20 of {savedData.length} records.
              </Typography>
            )}
          </CardContent>
        </Collapse>
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        message={snackbar.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
      <Dialog open={clearAllPreviewOpen} onClose={() => setClearAllPreviewOpen(false)}>
        <DialogTitle>Clear all</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Clear all {previewData?.length ?? 0} row{previewData?.length !== 1 ? 's' : ''} from the preview? This cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClearAllPreviewOpen(false)}>Cancel</Button>
          <Button onClick={handleClearAllPreviewConfirm} color="error" variant="contained" startIcon={<DeleteSweepIcon />}>
            Clear all
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
