import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Grid,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import axios from 'axios';

function SalaryCalculator() {
  const [employees, setEmployees] = useState([]);
  const [employeeId, setEmployeeId] = useState('');
  const [baseSalary, setBaseSalary] = useState(null);
  const [overtimeRate, setOvertimeRate] = useState(null);
  const [overtimeHours, setOvertimeHours] = useState('');
  const [totalSalary, setTotalSalary] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get('http://89.252.184.134:5001/employee');
        setEmployees(response.data);
      } catch (error) {
        console.error('Error fetching employees:', error);
        setMessage('Çalışanlar alınamadı.');
      }
    };

    fetchEmployees();
  }, []);

  useEffect(() => {
    if (employeeId) {
      fetchOvertimeHoursData();
    }
  }, [employeeId]);

  const fetchBaseSalary = async () => {
    try {
      const response = await axios.get(`http://89.252.184.134:5001/employee/${employeeId}/base-salary`);
      setBaseSalary(response.data.base_salary);
      const hourlyRate = response.data.base_salary / 160;
      setOvertimeRate(hourlyRate * 1.5);
    } catch (error) {
      console.error('Error fetching base salary:', error);
      setMessage('Çalışan bulunamadı veya temel maaş alınamadı.');
      setBaseSalary(null);
      setOvertimeRate(null);
    }
  };

  const fetchOvertimeHoursData = async () => {
    try {
      const response = await axios.get(`http://89.252.184.134:5001/attendance/${employeeId}`);
      const currentDate = new Date();
      const currentMonth = currentDate.toISOString().slice(0, 7); // YYYY-MM formatında

      const currentMonthOvertime = response.data.find(item => item.Month === currentMonth);
      if (currentMonthOvertime) {
        setOvertimeHours(currentMonthOvertime.OvertimeHours.toString());
      } else {
        setOvertimeHours('0'); // Bu ay için fazla mesai yoksa 0 olarak ayarla
      }
    } catch (error) {
      console.error('Error fetching overtime data:', error);
      setMessage('Fazla mesai saatleri alınamadı.');
      setOvertimeHours('0'); // Hata durumunda fazla mesaiyi 0 olarak ayarla
    }
  };

  const handleCalculateSalary = async () => {
    if (baseSalary === null || overtimeRate === null) {
      setMessage('Lütfen önce temel maaşı alın.');
      return;
    }

    try {
      const response = await axios.post('http://89.252.184.134:5001/calculate-salary', {
        employee_id: employeeId,
        base_salary: parseFloat(baseSalary),
        overtime_rate: parseFloat(overtimeRate),
        overtime_hours: parseFloat(overtimeHours),
      });

      setTotalSalary(response.data.total_salary);
      setMessage(response.data.message);
    } catch (error) {
      console.error('Error calculating salary:', error);
      setMessage('Maaş hesaplanırken bir hata oluştu.');
      setTotalSalary(null);
    }
  };

  return (
    <Box sx={{ flexGrow: 1, padding: 3 }}>
      <Grid item xs={12}>
        <Typography variant="h4" gutterBottom>
          MAAŞ HESAPLAMA
        </Typography>
        <Paper elevation={3} sx={{ padding: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
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
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button variant="contained" color="primary" onClick={fetchBaseSalary}>
                Temel Maaşı Al
              </Button>
            </Grid>
            {baseSalary !== null && (
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Temel Maaş"
                  variant="outlined"
                  value={baseSalary}
                  fullWidth
                  disabled
                />
              </Grid>
            )}
            {overtimeRate !== null && (
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Fazla Mesai Ücreti"
                  variant="outlined"
                  value={overtimeRate}
                  fullWidth
                  disabled
                />
              </Grid>
            )}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Fazla Mesai Saati"
                variant="outlined"
                value={overtimeHours}
                onChange={(e) => setOvertimeHours(e.target.value)}
                fullWidth
                type="number"
              />
            </Grid>
            <Grid item xs={12}>
              <Button variant="contained" color="primary" onClick={handleCalculateSalary}>
                Maaş Hesapla
              </Button>
            </Grid>
            {message && (
              <Grid item xs={12}>
                <Typography variant="body1" color={totalSalary !== null ? 'success' : 'error'}>
                  {message}
                </Typography>
              </Grid>
            )}
            {totalSalary !== null && (
              <Grid item xs={12}>
                <Typography variant="h6">Toplam Maaş: {totalSalary}</Typography>
              </Grid>
            )}
          </Grid>
        </Paper>
      </Grid>
    </Box>
  );
}

export default SalaryCalculator;