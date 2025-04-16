import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import {
  People as PeopleIcon,
  EventNote as EventNoteIcon,
  Work as WorkIcon,
  AttachMoney as AttachMoneyIcon,
  Assignment as AssignmentIcon,
  MeetingRoom as MeetingRoomIcon,
  AccountBalanceWallet as AccountBalanceWalletIcon,
} from '@mui/icons-material';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar } from 'recharts';

function Dashboard() {
  const [employeeCount, setEmployeeCount] = useState(0);
  const [leaveCount, setLeaveCount] = useState(0);
  const [projectCount, setProjectCount] = useState(0);
  const [departmentCount, setDepartmentCount] = useState(0);
  const [salaryAverage, setSalaryAverage] = useState(0);
  const [activeProjectCount, setActiveProjectCount] = useState(0);
  const [meetingRoomCount, setMeetingRoomCount] = useState(0);
  const [payrollCount, setPayrollCount] = useState(0);
  const [departmentData, setDepartmentData] = useState([]);
  const [hireDateData, setHireDateData] = useState([]);
  const [salaryData, setSalaryData] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [workingHoursData, setWorkingHoursData] = useState([]);
  const [selectedStat, setSelectedStat] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [employeeData, setEmployeeData] = useState([]);
  const [leaveData, setLeaveData] = useState([]);
  const [projectData, setProjectData] = useState([]);
  const [meetingRoomData, setMeetingRoomData] = useState([]);
  const [payrollData, setPayrollData] = useState([]);
  const [selectedJsonData, setSelectedJsonData] = useState(null);
  const [openJsonTableDialog, setOpenJsonTableDialog] = useState(false);

  useEffect(() => {
    const fetchEmployees = () => {
      fetch('http://89.252.184.134:5001/employees')
        .then((response) => response.json())
        .then((data) => {
          setEmployeeCount(data.length);
          // Departmanları büyük/küçük harf uyumlu al
          const departments = new Set(data.map((employee) => employee.Department || employee.department));
          setDepartmentCount(departments.size);
          const deptData = Array.from(departments).map((dept) => ({
            name: dept,
            value: data.filter((emp) => (emp.Department || emp.department) === dept).length
          }));
          setDepartmentData(deptData);

          // İŞE ALIM TARİHİ DAĞILIMI: Yıllara göre grupla
          const hireYearMap = {};
          data.forEach((emp) => {
            let rawDate = emp.HireDate || emp.hireDate;
            let year = 'Bilinmiyor';
            if (rawDate && typeof rawDate === 'string') {
              // Tarih stringinden yıl bilgisini al
              const dateObj = new Date(rawDate);
              if (!isNaN(dateObj.getTime())) {
                year = String(dateObj.getFullYear());
              }
            }
            if (!hireYearMap[year]) hireYearMap[year] = 0;
            hireYearMap[year] += 1;
          });
          const hireData = Object.keys(hireYearMap).map((year) => ({
            hireDate: year,
            value: hireYearMap[year],
          }));
          setHireDateData(hireData);

          const totalSalary = data.reduce((sum, employee) => sum + Number(employee.salary || employee.base_salary || employee.BaseSalary || 0), 0);
          setSalaryAverage(data.length > 0 ? totalSalary / data.length : 0);

          const salData = data.map((emp) => {
            let salary = emp.salary || emp.base_salary || emp.BaseSalary || 0;
            salary = isNaN(Number(salary)) ? 0 : Number(salary);
            return { salary };
          });
          setSalaryData(salData);
          setEmployeeData(data);
          console.log('salaryData:', salData);
        })
        .catch((error) => {
          console.error('Çalışan verileri alınırken hata oluştu:', error);
        });
    };

    const fetchLeaves = () => {
      fetch('http://89.252.184.134:5001/leave-requests')
        .then((response) => response.json())
        .then((data) => {
          setLeaveCount(data.length);
          setLeaveData(data);
        })
        .catch((error) => {
          console.error('İzin verileri alınırken hata oluştu:', error);
        });
    };

    const fetchProjects = () => {
      fetch('http://89.252.184.134:5001/projects')
        .then((response) => response.json())
        .then((data) => {
          setProjectCount(data.length);
          const activeProjects = data.filter((project) => project.status === 'Active');
          setActiveProjectCount(activeProjects.length);
          setProjectData(data);
        })
        .catch((error) => {
          console.error('Proje verileri alınırken hata oluştu:', error);
        });
    };

    const fetchMeetingRooms = () => {
      fetch('http://89.252.184.134:5001/meeting-rooms')
        .then((response) => response.json())
        .then((data) => {
          setMeetingRoomCount(data.length);
          setMeetingRoomData(data);
        })
        .catch((error) => {
          console.error('Toplantı odası verileri alınırken hata oluştu:', error);
        });
    };

    const fetchPayrolls = () => {
      fetch('http://89.252.184.134:5001/payrolls')
        .then((response) => response.json())
        .then((data) => {
          setPayrollCount(data.length);
          setPayrollData(data);
        })
        .catch((error) => {
          console.error('Bordro verileri alınırken hata oluştu:', error);
        });
    };

    const fetchAttendance = () => {
      fetch('http://89.252.184.134:5001/attendance')
        .then((response) => response.json())
        .then((data) => {
          const attendanceMap = new Map();
          data.attendance.forEach((item) => {
            if (!attendanceMap.has(item.EmployeeID) || new Date(item.EntryTime) > new Date(attendanceMap.get(item.EmployeeID).EntryTime)) {
              attendanceMap.set(item.EmployeeID, item);
            }
          });

          const formattedAttendanceData = Array.from(attendanceMap.values()).map((item) => ({
            employeeName: item.EmployeeID,
            entryTime: formatDate(item.EntryTime),
            exitTime: formatDate(item.ExitTime),
            totalHours: calculateTotalHours(item.EntryTime, item.ExitTime),
          }));
          setAttendanceData(formattedAttendanceData);
        })
        .catch((error) => {
          console.error('Giriş-çıkış verileri alınırken hata oluştu:', error);
        });
    };

    fetchEmployees();
    fetchLeaves();
    fetchProjects();
    fetchMeetingRooms();
    fetchPayrolls();
    fetchAttendance();

    const intervalId = setInterval(() => {
      fetchEmployees();
      fetchLeaves();
      fetchProjects();
      fetchMeetingRooms();
      fetchPayrolls();
      fetchAttendance();
    }, 10 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const dailyHourLimit = 8;
    const result = attendanceData.map((row) => {
      const total = parseFloat(row.totalHours);
      const overtime = total > dailyHourLimit ? (total - dailyHourLimit) : 0;
      return {
        employeeName: row.employeeName,
        totalHours: total.toFixed(2),
        overtimeHours: overtime.toFixed(2),
      };
    });
    setWorkingHoursData(result);
  }, [attendanceData]);

  const formatDate = (dateString) => {
    if (!dateString) {
      return 'Bilinmiyor';
    }
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${month}-${day}-${year} ${hours}:${minutes}:${seconds}`;
  };

  const calculateTotalHours = (entryTime, exitTime) => {
    if (!entryTime || !exitTime) {
      return 'Bilinmiyor';
    }
    const entry = new Date(entryTime);
    const exit = new Date(exitTime);
    const totalMilliseconds = exit - entry;
    const totalHours = totalMilliseconds / (1000 * 60 * 60);
    return totalHours.toFixed(2);
  };

  const stats = [
    {
      title: 'Toplam Çalışan',
      value: employeeCount,
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      color: '#1976d2',
      details: `Toplam çalışan sayısı: ${employeeCount}`,
    },
    {
      title: 'İzinli Çalışan',
      value: leaveCount,
      icon: <EventNoteIcon sx={{ fontSize: 40 }} />,
      color: '#ed6c02',
      details: `Toplam izinli çalışan sayısı: ${leaveCount}`,
    },
    {
      title: 'Toplam Proje',
      value: projectCount,
      icon: <AssignmentIcon sx={{ fontSize: 40 }} />,
      color: '#3f51b5',
      details: `Toplam proje sayısı: ${projectCount}`,
    },
    {
      title: 'Departmanlar',
      value: departmentCount,
      icon: <WorkIcon sx={{ fontSize: 40 }} />,
      color: '#9c27b0',
      details: `Toplam departman sayısı: ${departmentCount}`,
    },
    {
      title: 'Ortalama Maaş',
      value: `${salaryAverage.toFixed(2)} ₺`,
      icon: <AttachMoneyIcon sx={{ fontSize: 40 }} />,
      color: '#4caf50',
      details: `Ortalama maaş: ${salaryAverage.toFixed(2)} ₺`,
    },
    {
      title: 'Aktif Projeler',
      value: activeProjectCount,
      icon: <AssignmentIcon sx={{ fontSize: 40 }} />,
      color: '#ff9800',
      details: `Toplam aktif proje sayısı: ${activeProjectCount}`,
    },
    {
      title: 'Toplantı Odaları',
      value: meetingRoomCount,
      icon: <MeetingRoomIcon sx={{ fontSize: 40 }} />,
      color: '#00bcd4',
      details: `Toplam toplantı odası sayısı: ${meetingRoomCount}`,
    },
    {
      title: 'Bordrolar',
      value: payrollCount,
      icon: <AccountBalanceWalletIcon sx={{ fontSize: 40 }} />,
      color: '#ff5722',
      details: `Toplam bordro sayısı: ${payrollCount}`,
    },
  ];

  const pieColors = ['#1976d2', '#ed6c02', '#3f51b5', '#9c27b0', '#4caf50', '#ff9800', '#00bcd4', '#ff5722'];

  const handleCardClick = (stat) => {
    setSelectedStat(stat);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleStatCardClick = (data) => {
    setSelectedJsonData(data);
    setOpenJsonTableDialog(true);
  };

  const handleCloseJsonTableDialog = () => {
    setOpenJsonTableDialog(false);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={3}>
        {stats.map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.title}>
            <Paper elevation={3}>
              <Card onClick={() => {
                if (stat.title === 'Toplam Çalışan') {
                  handleStatCardClick(employeeData);
                } else if (stat.title === 'İzinli Çalışan') {
                  handleStatCardClick(leaveData);
                } else if (stat.title === 'Toplam Proje') {
                  handleStatCardClick(projectData);
                } else if (stat.title === 'Toplantı Odaları') {
                  handleStatCardClick(meetingRoomData);
                } else if (stat.title === 'Bordrolar') {
                  handleStatCardClick(payrollData);
                }
              }}>
                <CardContent>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      mb: 1,
                    }}
                  >
                    <Box
                      sx={{
                        backgroundColor: stat.color,
                        borderRadius: 1,
                        p: 1,
                        color: 'white',
                        mr: 2,
                      }}
                    >
                      {stat.icon}
                    </Box>
                    <Box>
                      <Typography variant="h4" component="div" sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {stat.value}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {stat.title}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Paper>
          </Grid>
        ))}
        <Grid item xs={12} md={6}>
          <Paper elevation={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="div" gutterBottom>
                  Departman Dağılımı
                </Typography>
                <PieChart width={400} height={300}>
                  <Pie
                    data={departmentData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {departmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </CardContent>
            </Card>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper elevation={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="div" gutterBottom>
                  İşe Alım Tarihi Dağılımı
                </Typography>
                <LineChart width={400} height={300} data={hireDateData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hireDate" />
                  <YAxis />
                  <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} />
                </LineChart>
              </CardContent>
            </Card>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper elevation={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="div" gutterBottom>
                  Maaş Dağılımı
                </Typography>
                <BarChart width={400} height={300} data={salaryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="salary" />
                  <YAxis />
                  <Bar dataKey="salary" fill="#8884d8" />
                </BarChart>
              </CardContent>
            </Card>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper elevation={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="div" gutterBottom>
                  Giriş-Çıkış Tablosu
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Çalışan Adı</TableCell>
                        <TableCell>Giriş Saati</TableCell>
                        <TableCell>Çıkış Saati</TableCell>
                        <TableCell>Toplam Çalışma Süresi</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {attendanceData.map((row) => (
                        <TableRow key={row.employeeName}>
                          <TableCell>{row.employeeName}</TableCell>
                          <TableCell>{row.entryTime}</TableCell>
                          <TableCell>{row.exitTime}</TableCell>
                          <TableCell>{row.totalHours}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper elevation={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="div" gutterBottom>
                  Çalışma Süresi Tablosu
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Çalışan Adı</TableCell>
                        <TableCell>Toplam Çalışma Süresi</TableCell>
                        <TableCell>Fazla Mesai Süresi</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {workingHoursData.map((row) => (
                        <TableRow key={row.employeeName}>
                          <TableCell>{row.employeeName}</TableCell>
                          <TableCell>{row.totalHours}</TableCell>
                          <TableCell>{row.overtimeHours}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper elevation={3}>

          </Paper>
        </Grid>
      </Grid>
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{selectedStat?.title}</DialogTitle>
        <DialogContent>
          <Typography>{selectedStat?.details}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Kapat
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={openJsonTableDialog} onClose={handleCloseJsonTableDialog} fullWidth maxWidth="md">
        <DialogTitle>JSON Verileri</DialogTitle>
        <DialogContent>
          {selectedJsonData && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    {Object.keys(selectedJsonData[0]).map((key) => (
                      <TableCell key={key}>{key}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedJsonData.map((row, index) => (
                    <TableRow key={index}>
                      {Object.values(row).map((value, cellIndex) => (
                        <TableCell key={cellIndex}>{String(value)}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseJsonTableDialog} color="primary">
            Kapat
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Dashboard;