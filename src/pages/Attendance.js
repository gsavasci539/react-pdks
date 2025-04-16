import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Grid,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  styled,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TableSortLabel,
} from '@mui/material';
import axios from 'axios';
import { visuallyHidden } from '@mui/utils';

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
  '&:hover': {
    backgroundColor: '#f0f0f0',
  },
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 'bold',
  color: '#333',
}));

function Attendance() {
  const [entries, setEntries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [filter, setFilter] = useState('daily');
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('EmployeeID');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchAttendance();
  }, [searchTerm, page, rowsPerPage, filter, order, orderBy, selectedMonth, selectedYear]);

  useEffect(() => {
    // Filtre veya ay/yıl değiştiğinde güncel zamanı al
    const today = new Date();
    if (filter === 'monthly') {
      setSelectedMonth(today.getMonth());
      setSelectedYear(today.getFullYear());
    } else if (filter === 'yearly') {
      setSelectedYear(today.getFullYear());
    }
  }, [filter]);

  const fetchAttendance = async () => {
    try {
      const response = await axios.get('http://89.252.184.134:5001/attendance');
      let attendanceData = response.data.attendance;

      if (filter === 'daily') {
        attendanceData = attendanceData.filter((entry) => isToday(new Date(entry.EntryTime)));
      } else if (filter === 'weekly') {
        attendanceData = attendanceData.filter((entry) => isThisWeek(new Date(entry.EntryTime)));
      } else if (filter === 'monthly') {
        attendanceData = attendanceData.filter((entry) =>
          isSpecificMonth(new Date(entry.EntryTime), selectedMonth, selectedYear)
        );
      } else if (filter === 'yearly') {
        attendanceData = attendanceData.filter((entry) => isSpecificYear(new Date(entry.EntryTime), selectedYear));
        if (selectedMonth !== null) {
          attendanceData = attendanceData.filter((entry) =>
            isSpecificMonth(new Date(entry.EntryTime), selectedMonth, selectedYear)
          );
        }
      }

      let filteredEntries = attendanceData;

      if (searchTerm) {
        filteredEntries = attendanceData.filter((entry) => String(entry.EmployeeID).includes(searchTerm));
      }

      const formattedEntries = filteredEntries.map((entry) => ({
        id: entry.ID,
        EmployeeID: entry.EmployeeID,
        EntryTime: formatDate(entry.EntryTime),
        ExitTime: formatDate(entry.ExitTime),
        TotalHours: calculateTotalHours(entry.EntryTime, entry.ExitTime),
      }));

      const sortedEntries = sortArray(formattedEntries, orderBy, order);
      setEntries(sortedEntries);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const calculateTotalHours = (entryTime, exitTime) => {
    const entry = new Date(entryTime);
    const exit = new Date(exitTime);

    const totalMilliseconds = exit - entry;
    const totalHours = totalMilliseconds / (1000 * 60 * 60);
    return totalHours.toFixed(2);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
    setPage(0);
  };

  const handleSort = (property) => (event) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortArray = (array, property, order) => {
    return array.slice().sort((a, b) => {
      const isAsc = order === 'asc';
      if (property === 'TotalHours') {
        return isAsc ? parseFloat(a[property]) - parseFloat(b[property]) : parseFloat(b[property]) - parseFloat(a[property]);
      } else {
        return isAsc ? String(a[property]).localeCompare(String(b[property])) : String(b[property]).localeCompare(String(a[property]));
      }
    });
  };

  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
  };

  const isThisWeek = (date) => {
    const today = new Date();
    const firstDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    const lastDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6));
    return date >= firstDayOfWeek && date <= lastDayOfWeek;
  };

  const isSpecificMonth = (date, month, year) => {
    return date.getMonth() === month && date.getFullYear() === year;
  };

  const isSpecificYear = (date, year) => {
    return date.getFullYear() === year;
  };

  return (
    <Box sx={{ flexGrow: 1, padding: 3 }}>
      <Grid item xs={12}>
        <Typography variant="h4" gutterBottom>
          GİRİŞ ÇIKIŞ LİSTESİ
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
          <TextField label="Çalışan ID Ara" variant="outlined" value={searchTerm} onChange={handleSearchChange} sx={{ flex: 1, marginRight: 2 }} />
          <FormControl variant="outlined" sx={{ minWidth: 120, marginRight: 2 }}>
            <InputLabel id="filter-label">Filtre</InputLabel>
            <Select labelId="filter-label" id="filter" value={filter} onChange={handleFilterChange} label="Filtre">
              <MenuItem value="daily">Günlük</MenuItem>
              <MenuItem value="weekly">Haftalık</MenuItem>
              <MenuItem value="monthly">Aylık</MenuItem>
              <MenuItem value="yearly">Yıllık</MenuItem>
            </Select>
          </FormControl>
          {(filter === 'monthly' || filter === 'yearly') && (
            <FormControl variant="outlined" sx={{ minWidth: 120 }}>
              <InputLabel id="month-label">Ay</InputLabel>
              <Select labelId="month-label" id="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} label="Ay">
                {Array.from({ length: 12 }, (_, i) => i).map((month) => (
                  <MenuItem key={month} value={month}>
                    {new Date(0, month).toLocaleString('default', { month: 'long' })}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          {filter === 'yearly' && (
            <FormControl variant="outlined" sx={{ minWidth: 120 }}>
              <InputLabel id="year-label">Yıl</InputLabel>
              <Select labelId="year-label" id="year" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} label="Yıl">
                {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Box>
        <TableContainer component={Paper} elevation={3}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <StyledTableCell>ID</StyledTableCell>
                <StyledTableCell align="right">
                  <TableSortLabel active={orderBy === 'EmployeeID'} direction={orderBy === 'EmployeeID' ? order : 'asc'} onClick={handleSort('EmployeeID')}>
                    Çalışan ID
                    {orderBy === 'EmployeeID' ? <Box component="span" sx={visuallyHidden}>{order === 'desc' ? 'sorted descending' : 'sorted ascending'}</Box> : null}
                  </TableSortLabel>
                </StyledTableCell>
                <StyledTableCell align="right">
                  <TableSortLabel active={orderBy === 'EntryTime'} direction={orderBy === 'EntryTime' ? order : 'asc'} onClick={handleSort('EntryTime')}>
                    Giriş Zamanı
                    {orderBy === 'EntryTime' ? <Box component="span" sx={visuallyHidden}>{order === 'desc' ? 'sorted descending' : 'sorted ascending'}</Box> : null}
                  </TableSortLabel>
                </StyledTableCell>
                <StyledTableCell align="right">
                  <TableSortLabel active={orderBy === 'ExitTime'} direction={orderBy === 'ExitTime' ? order : 'asc'} onClick={handleSort('ExitTime')}>
                    Çıkış Zamanı
                    {orderBy === 'ExitTime' ? <Box component="span" sx={visuallyHidden}>{order === 'desc' ? 'sorted descending' : 'sorted ascending'}</Box> : null}
                  </TableSortLabel>
                </StyledTableCell>
                <StyledTableCell align="right">
                  <TableSortLabel active={orderBy === 'TotalHours'} direction={orderBy === 'TotalHours' ? order : 'asc'} onClick={handleSort('TotalHours')}>
                    Toplam Saat
                    {orderBy === 'TotalHours' ? <Box component="span" sx={visuallyHidden}>{order === 'desc' ? 'sorted descending' : 'sorted ascending'}</Box> : null}
                  </TableSortLabel>
                </StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {entries.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                <StyledTableRow key={row.id}>
                  <TableCell component="th" scope="row">
                    {row.id}
                  </TableCell>
                  <TableCell align="right">{row.EmployeeID}</TableCell>
                  <TableCell align="right">{row.EntryTime}</TableCell>
                  <TableCell align="right">{row.ExitTime}</TableCell>
                  <TableCell align="right">{row.TotalHours}</TableCell>
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination rowsPerPageOptions={[5, 10, 25]} component="div" count={entries.length} rowsPerPage={rowsPerPage} page={page} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage} sx={{ marginTop: 2 }} />
      </Grid>
    </Box>
  );
}

export default Attendance;