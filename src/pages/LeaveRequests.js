import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Paper,
  FormControl,
  InputLabel,
  Select,
  Snackbar,
  Alert,
  CircularProgress,
  IconButton,
  useMediaQuery,
  DialogContentText,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

function LeaveRequests() {
  const [requests, setRequests] = useState([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    leave_type: '',
    start_date: '',
    end_date: '',
    status: 'Pending',
  });
  const [employees, setEmployees] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [employeeId, setEmployeeId] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [requestIdToDelete, setRequestIdToDelete] = useState(null);

  const leaveTypes = [
    'Yıllık İzin',
    'Hastalık İzni',
    'Kişisel İzin',
    'Doğum İzni (Annelik)',
    'Doğum İzni (Babalık)',
  ];

  const isSmallScreen = useMediaQuery('(max-width: 600px)');

  const columns = [
    { field: 'LeaveRequestID', headerName: 'ID', width: 90 },
    { field: 'FirstName', headerName: 'Adı', flex: 1, minWidth: 100 },
    { field: 'LastName', headerName: 'Soyadı', flex: 1, minWidth: 100 },
    { field: 'EmployeeID', headerName: 'Çalışan ID', flex: 1, minWidth: 130 },
    { field: 'LeaveType', headerName: 'İzin Türü', flex: 1, minWidth: 120 },
    { field: 'StartDate', headerName: 'Başlangıç Tarihi', flex: 1, minWidth: 120 },
    { field: 'EndDate', headerName: 'Bitiş Tarihi', flex: 1, minWidth: 120 },
    {
      field: 'actions',
      headerName: 'İşlemler',
      width: isSmallScreen ? 80 : 100,
      renderCell: (params) => (
        <div>
          <IconButton aria-label="düzenle" onClick={() => handleEdit(params.row)}>
            <EditIcon />
          </IconButton>
          <IconButton aria-label="sil" onClick={() => handleDeleteConfirmation(params.row.LeaveRequestID)} color="error">
            <DeleteIcon />
          </IconButton>
        </div>
      ),
    },
  ];

  useEffect(() => {
    fetchLeaveRequests();
    fetchEmployees();
  }, []);

  const fetchLeaveRequests = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://89.252.184.134:5001/leave-requests');
      setRequests(response.data);
    } catch (error) {
      setError('İzin istekleri alınırken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://89.252.184.134:5001/employee');
      setEmployees(response.data);
    } catch (error) {
      setError('Çalışanlar alınırken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setFormData({
      leave_type: '',
      start_date: '',
      end_date: '',
      status: 'Pending',
    });
    setEmployeeId('');
    setError(null);
    setEditMode(false);
    setSelectedRequestId(null);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!employeeId || !formData.leave_type || !formData.start_date || !formData.end_date) {
      setError('Lütfen tüm alanları doldurun.');
      return;
    }
    if (new Date(formData.start_date) > new Date(formData.end_date)) {
      setError('Başlangıç tarihi bitiş tarihinden sonra olamaz.');
      return;
    }
    try {
      if (editMode) {
        await axios.put(`http://89.252.184.134:5001/leave-requests/${selectedRequestId}`, {
          ...formData,
          employee_id: employeeId,
        });
      } else {
        await axios.post('http://89.252.184.134:5001/leave-requests', {
          ...formData,
          employee_id: employeeId,
        });
      }
      fetchLeaveRequests();
      handleClose();
      setSuccess(true);
    } catch (error) {
      setError('İzin isteği gönderilirken bir hata oluştu.');
    }
  };

  const handleEdit = (row) => {
    setEditMode(true);
    setSelectedRequestId(row.LeaveRequestID);
    setEmployeeId(row.EmployeeID);
    setFormData({
      employee_id: row.EmployeeID,
      first_name: row.FirstName,
      last_name: row.LastName,
      leave_type: row.LeaveType,
      start_date: row.StartDate,
      end_date: row.EndDate,
      status: row.LeaveRequestStatus,
    });
    handleOpen();
  };

  const handleDeleteConfirmation = (id) => {
    setRequestIdToDelete(id);
    setDeleteConfirmationOpen(true);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://89.252.184.134:5001/leave-requests/${requestIdToDelete}`);
      fetchLeaveRequests();
      setSuccess(true);
    } catch (error) {
      setError('İzin isteği silinirken bir hata oluştu.');
    } finally {
      setDeleteConfirmationOpen(false);
      setRequestIdToDelete(null);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: 2 }}>
        <Button variant="contained" onClick={handleOpen}>
          YENİ İZİN İSTEĞİ
        </Button>
      </Box>
      <Paper elevation={3} sx={{ width: '100%', overflowX: 'auto' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
            <CircularProgress />
          </Box>
        ) : (
          <div style={{ width: '100%' }}>
            <DataGrid
              rows={requests}
              columns={columns}
              pageSize={10}
              rowsPerPageOptions={[10]}
              disableSelectionOnClick
              getRowId={(row) => row.LeaveRequestID}
              autoHeight
              sx={{
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: (theme) => theme.palette.grey[200],
                },
              }}
            />
          </div>
        )}
      </Paper>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editMode ? 'İzin İsteğini Düzenle' : 'İzin İsteği Gönder'}</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 1 }}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="employee-id-label">Çalışan Seçin</InputLabel>
           <Select
                            labelId="employee-id-label"
                            id="employee-id"
                            value={employeeId}
                            label="Çalışan Seçin"
                            onChange={(e) => setEmployeeId(e.target.value)}
                          >
                            {employees.map((employee) => (
                              <MenuItem key={employee.employee_id} value={employee.employee_id}>
                                {employee.employee_name} ({employee.employee_id})
                              </MenuItem>
                            ))}
                          </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel id="leave-type-label">İzin Türü Seçin</InputLabel>
              <Select
                labelId="leave-type-label"
                id="leave-type"
                name="leave_type"
                value={formData.leave_type}
                label="İzin Türü Seçin"
                onChange={handleChange}
              >
                {leaveTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              margin="normal"
              required
              fullWidth
              name="start_date"
              label="Başlangıç Tarihi"
              type="datetime-local"
              value={formData.start_date}
              onChange={handleChange}
              InputLabelProps={{
                shrink: true,
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="end_date"
              label="Bitiş Tarihi"
              type="datetime-local"
              value={formData.end_date}
              onChange={handleChange}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>İptal</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editMode ? 'Güncelle' : 'Gönder'}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={deleteConfirmationOpen}
        onClose={() => setDeleteConfirmationOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"İzin İsteğini Sil"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            İzin isteğini silmek istediğinizden emin misiniz?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmationOpen(false)}>İptal</Button>
          <Button onClick={handleDelete} autoFocus color='error'>
            Sil
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
      <Snackbar open={success} autoHideDuration={6000} onClose={() => setSuccess(false)}>
        <Alert onClose={() => setSuccess(false)} severity="success" sx={{ width: '100%' }}>
          {editMode ? 'İzin isteği başarıyla güncellendi.' : 'İzin isteği başarıyla gönderildi.'}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default LeaveRequests;