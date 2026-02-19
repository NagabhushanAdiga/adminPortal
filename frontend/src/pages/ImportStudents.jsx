import { useState, useMemo } from 'react';
import { useRef } from 'react';
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
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';

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

export default function ImportStudents() {
  const fileInputRef = useRef(null);
  const [jsonInput, setJsonInput] = useState('');
  const [parseError, setParseError] = useState('');
  const [parsedData, setParsedData] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [fileName, setFileName] = useState('');

  const columns = useMemo(() => (parsedData ? getColumns(parsedData) : []), [parsedData]);
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

  const processJsonString = (str) => {
    setParseError('');
    setParsedData(null);
    const trimmed = str.trim();
    if (!trimmed) {
      setParseError('Please enter or upload JSON data.');
      return;
    }
    try {
      const parsed = JSON.parse(trimmed);
      if (!Array.isArray(parsed)) {
        setParseError('JSON must be an array of objects (e.g. [{ "id": 1, "name": "..." }, ...]).');
        return;
      }
      setParsedData(parsed);
      setPage(0);
    } catch (e) {
      setParseError(e.message || 'Invalid JSON. Check syntax and try again.');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        setJsonInput(text);
        processJsonString(text);
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
            Upload a JSON file or paste JSON as an array of objects. Column headers will be generated from the keys in your data.
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
              startIcon={<FolderOpenIcon />}
              onClick={() => fileInputRef.current?.click()}
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
            placeholder={'[\n  { "id": 1, "name": "John", "email": "john@example.com" },\n  { "id": 2, "name": "Jane", "email": "jane@example.com" }\n]'}
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
              startIcon={<UploadFileIcon />}
              onClick={handleImport}
            >
              Import & Preview
            </Button>
            <Button variant="outlined" onClick={handleClear}>
              Clear
            </Button>
          </Box>
        </CardContent>
      </Card>

      {parsedData && (
        <Card sx={{ overflow: 'auto' }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Preview — {parsedData.length} row{parsedData.length !== 1 ? 's' : ''} (columns from JSON)
            </Typography>
            <Table size="small" sx={{ minWidth: 400 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.50' }}>
                  {columns.map((col) => (
                    <TableCell key={col} sx={{ fontWeight: 600, color: 'text.secondary' }}>
                      {col}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedRows.map((row, rowIndex) => (
                  <TableRow key={page * rowsPerPage + rowIndex} hover>
                    {columns.map((col) => (
                      <TableCell key={col}>
                        {getCellValue(row[col])}
                      </TableCell>
                    ))}
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
    </Box>
  );
}
