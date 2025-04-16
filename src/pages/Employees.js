import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Paper,
  CircularProgress,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
} from '@mui/material';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import axios from 'axios';

function Employees() {
  const [employees, setEmployees] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    employee_id: '',
    first_name: '',
    last_name: '',
    department: '',
    position: '',
    email: '',
    phone: '',
    hire_date: '',
    status: 'Active',
    base_salary: '',
  });
  const [editMode, setEditMode] = useState(false);
  const [rfidCards, setRfidCards] = useState([]);
  const [usedRfidCards, setUsedRfidCards] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('error');

  const columns = [
    { field: 'ID', headerName: 'ID', width: 70 },
    { field: 'FirstName', headerName: 'Adı', flex: 1 },
    { field: 'LastName', headerName: 'Soyadı', flex: 1 },
    { field: 'Department', headerName: 'Departman', flex: 1 },
    { field: 'Position', headerName: 'Pozisyon', flex: 1 },
    { field: 'Email', headerName: 'E-posta', flex: 1 },
    { field: 'Phone', headerName: 'Telefon', flex: 1 },
    { field: 'HireDate', headerName: 'İşe Giriş Tarihi', flex: 1 },
    { field: 'Status', headerName: 'Durum', flex: 1 },
    { field: 'BaseSalary', headerName: 'Temel Maaş', flex: 1 },
    {
      field: 'actions',
      type: 'actions',
      width: 100,
      getActions: (params) => [
        <GridActionsCellItem icon={<DeleteIcon />} label="Delete" onClick={() => handleDelete(params.row.ID)} />,
        <GridActionsCellItem icon={<EditIcon />} label="Edit" onClick={() => handleEdit(params.row)} />,
      ],
    },
  ];

  useEffect(() => {
    fetchEmployees();
    fetchRfidCards();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get('http://89.252.184.134:5001/employees');
      setEmployees(response.data);
      setLoading(false);
      const usedIds = response.data.map((employee) => employee.ID);
      setUsedRfidCards(usedIds);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setLoading(false);
    }
  };

  const fetchRfidCards = async () => {
    try {
      const response = await axios.get('http://89.252.184.134:5001/rfidcards');
      setRfidCards(response.data);
    } catch (error) {
      console.error('Error fetching RFID cards:', error);
    }
  };

  const handleOpen = () => {
    setOpen(true);
    setEditMode(false);
    setFormData({
      employee_id: '',
      first_name: '',
      last_name: '',
      department: '',
      position: '',
      email: '',
      phone: '',
      hire_date: '',
      status: 'Active',
      base_salary: '',
    });
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleDelete = async (employeeId) => {
    try {
      await axios.delete(`http://89.252.184.134:5001/employees/${employeeId}`);
      fetchEmployees();
      fetchRfidCards(); // Re-fetch RFID cards after deleting an employee
    } catch (error) {
      console.error('Error deleting employee:', error);
      setSnackbarMessage('Error deleting employee.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleEdit = (row) => {
    setFormData({
      employee_id: row.ID,
      first_name: row.FirstName,
      last_name: row.LastName,
      department: row.Department,
      position: row.Position,
      email: row.Email,
      phone: row.Phone,
      hire_date: row.HireDate,
      status: row.Status,
      base_salary: row.BaseSalary,
    });
    setEditMode(true);
    setOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await axios.put(`http://89.252.184.134:5001/employees/${formData.employee_id}`, formData);
        setSnackbarMessage('Employee updated successfully.');
        setSnackbarSeverity('success');
      } else {
        await axios.post('http://89.252.184.134:5001/employees', formData);
        setSnackbarMessage('Employee added successfully.');
        setSnackbarSeverity('success');
      }
      fetchEmployees();
      fetchRfidCards(); // Re-fetch RFID cards after adding/updating an employee
      handleClose();
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error:', error);
      if (error.response) {
        console.error('Server responded with:', error.response.data);
        setSnackbarMessage(error.response.data.message || 'Kart Mevcut Lütfen Başka Bir Kart Seçin');
      } else if (error.request) {
        setSnackbarMessage('Error: No response received from the server.');
      } else {
        setSnackbarMessage('Error: An error occurred while setting up the request.');
      }
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const availableRfidCards = rfidCards.filter((card) => !usedRfidCards.includes(card.card_id));

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  return (
    <Box sx={{ height: '80vh', width: '100%' }}>
      <Box sx={{ mb: 2 }}>
        <Button variant="contained" onClick={handleOpen}>
          ÇALIŞAN EKLE
        </Button>
      </Box>
      <Paper elevation={3}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
            <CircularProgress />
          </Box>
        ) : (
          <DataGrid
            rows={employees}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10]}
            checkboxSelection
            disableSelectionOnClick
            getRowId={(row) => row.ID}
            autoHeight
          />
        )}
      </Paper>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editMode ? 'Edit Employee' : 'Add New Employee'}</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 1 }}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="employee-id-label">Employee ID</InputLabel>
              <Select
                labelId="employee-id-label"
                id="employee_id"
                name="employee_id"
                value={formData.employee_id}
                onChange={handleChange}
                disabled={editMode}
                required
              >
                {availableRfidCards.length > 0 ? (
                  availableRfidCards.map((card) => (
                    <MenuItem key={card.card_id} value={card.card_id}>
                      {card.card_id}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled value="">
                    No available RFID cards
                  </MenuItem>
                )}
              </Select>
            </FormControl>
            <TextField
              margin="normal"
              required
              fullWidth
              name="first_name"
              label="Adı"
              value={formData.first_name}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="last_name"
              label="Soyadı"
              value={formData.last_name}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="department"
              label="Departman"
              value={formData.department}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="position"
              label="Pozisyon"
              value={formData.position}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="email"
              label="E-posta"
              type="email"
              value={formData.email}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="phone"
              label="Telefon"
              value={formData.phone}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="hire_date"
              label="İşer Giriş Tarihi"
              type="date"
              value={formData.hire_date}
              onChange={handleChange}
              InputLabelProps={{
                shrink: true,
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="status"
              label="Durum"
              value={formData.status}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="base_salary"
              label="Maaş"
              value={formData.base_salary}
              onChange={handleChange}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Vazgeç</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editMode ? 'Güncelle' : 'Ekle'}
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Employees;