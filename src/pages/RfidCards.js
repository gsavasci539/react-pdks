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
    Button,
    Snackbar,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
} from '@mui/material';
import axios from 'axios';

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    fontWeight: 'bold',
}));

function RfidCardsPage() {
    const [rfidCards, setRfidCards] = useState([]);
    const [newCardId, setNewCardId] = useState('');
    const [selectedCardId, setSelectedCardId] = useState('');
    const [updateCardId, setUpdateCardId] = useState('');
    const [deleteCardId, setDeleteCardId] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState(null);
    const [pendingActionData, setPendingActionData] = useState(null);
    const [selectedCardDetails, setSelectedCardDetails] = useState(null);
    const [isGetCardDetailsOpen, setIsGetCardDetailsOpen] = useState(false);

    const apiBaseUrl = 'http://89.252.184.134:5001';

    useEffect(() => {
        fetchRfidCards();
    }, []);

    const fetchRfidCards = () => {
        axios.get(`${apiBaseUrl}/rfidcard`)
            .then(response => setRfidCards(response.data))
            .catch(err => {
                console.error('RFID kartları alınırken hata oluştu:', err);
                setError('RFID kartları alınırken bir hata oluştu.');
                setSnackbarSeverity('error');
                setSnackbarOpen(true);
            });
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setMessage('');
        setError('');
        if (name === 'newCardId') {
            setNewCardId(value);
        } else if (name === 'selectedCardId') {
            setSelectedCardId(value);
        } else if (name === 'updateCardId') {
            setUpdateCardId(value);
        } else if (name === 'deleteCardId') {
            setDeleteCardId(value);
        }
    };

    const showSnackbar = (severity, msg) => {
        setSnackbarSeverity(severity);
        setMessage('');
        setError('');
        if (severity === 'success') {
            setMessage(msg);
        } else {
            setError(msg);
        }
        setSnackbarOpen(true);
    };

    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbarOpen(false);
    };

    const handleOpenConfirmDialog = (action, data = null) => {
        setPendingAction(action);
        setPendingActionData(data);
        setConfirmDialogOpen(true);
    };

    const handleCloseConfirmDialog = () => {
        setConfirmDialogOpen(false);
        setPendingAction(null);
        setPendingActionData(null);
    };

    const handleConfirmAction = () => {
        if (pendingAction === 'add') {
            handleAddCardConfirmed();
        } else if (pendingAction === 'update') {
            handleUpdateCardConfirmed();
        } else if (pendingAction === 'delete') {
            handleDeleteCardConfirmed();
        }
        handleCloseConfirmDialog();
    };

    const handleAddCard = () => {
        if (!newCardId) {
            showSnackbar('warning', 'Lütfen bir kart ID girin.');
            return;
        }
        handleOpenConfirmDialog('add', { card_id: newCardId });
    };

    const handleAddCardConfirmed = () => {
        axios.post(`${apiBaseUrl}/rfidcards`, { card_id: newCardId })
            .then(response => {
                showSnackbar('success', response.data.message);
                setNewCardId('');
                fetchRfidCards();
            })
            .catch(err => {
                console.error('RFID kartı eklenirken hata oluştu:', err);
                showSnackbar('error', err.response?.data?.message || 'RFID kartı eklenirken bir hata oluştu.');
            });
    };

    const handleGetCard = () => {
        if (!selectedCardId) {
            showSnackbar('warning', 'Lütfen bir kart ID girin.');
            return;
        }
        axios.get(`${apiBaseUrl}/rfidcards/${selectedCardId}`)
            .then(response => {
                setSelectedCardDetails(response.data);
                setIsGetCardDetailsOpen(true);
            })
            .catch(err => {
                console.error('RFID kart detayları alınırken hata oluştu:', err);
                showSnackbar('error', err.response?.data?.message || 'RFID kart detayları bulunamadı.');
                setSelectedCardDetails(null);
                setIsGetCardDetailsOpen(false);
            });
    };

    const handleCloseGetCardDetails = () => {
        setIsGetCardDetailsOpen(false);
        setSelectedCardDetails(null);
        setSelectedCardId('');
    };

    const handleUpdateCard = () => {
        if (!selectedCardId || !updateCardId) {
            showSnackbar('warning', 'Lütfen güncellenecek kart ID ve yeni kart ID girin.');
            return;
        }
        handleOpenConfirmDialog('update', { selectedCardId, updateCardId });
    };

    const handleUpdateCardConfirmed = () => {
        axios.put(`${apiBaseUrl}/rfidcards/${pendingActionData.selectedCardId}`, { card_id: pendingActionData.updateCardId })
            .then(response => {
                showSnackbar('success', response.data.message);
                setSelectedCardId('');
                setUpdateCardId('');
                fetchRfidCards();
            })
            .catch(err => {
                console.error('RFID kartı güncellenirken hata oluştu:', err);
                showSnackbar('error', err.response?.data?.message || 'RFID kartı güncellenirken bir hata oluştu.');
            });
    };

    const handleDeleteCard = () => {
        if (!deleteCardId) {
            showSnackbar('warning', 'Lütfen silinecek kart ID girin.');
            return;
        }
        handleOpenConfirmDialog('delete', { deleteCardId });
    };

    const handleDeleteCardConfirmed = () => {
        axios.delete(`${apiBaseUrl}/rfidcards/${pendingActionData.deleteCardId}`)
            .then(response => {
                showSnackbar('success', response.data.message);
                setDeleteCardId('');
                fetchRfidCards();
            })
            .catch(err => {
                console.error('RFID kartı silinirken hata oluştu:', err);
                showSnackbar('error', err.response?.data?.message || 'RFID kartı silinirken bir hata oluştu.');
            });
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <Box sx={{ flexGrow: 1, padding: 3 }}>
            <Typography variant="h4" gutterBottom>
                RFID Kart Yönetimi
            </Typography>

            <StyledPaper elevation={3}>
                <Typography variant="h6" gutterBottom>
                    RFID Kart Listesi
                </Typography>
                <TableContainer>
                    <Table aria-label="rfid cards table">
                        <TableHead>
                            <TableRow>
                                <StyledTableCell>Kart ID</StyledTableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rfidCards.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((card) => (
                                <TableRow key={card.card_id}>
                                    <TableCell component="th" scope="row">
                                        {card.card_id}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={rfidCards.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </StyledPaper>

            <StyledPaper elevation={3}>
                <Typography variant="h6" gutterBottom>
                    RFID Kart İşlemleri
                </Typography>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={6} md={4}>
                        <TextField
                            label="Yeni Kart ID"
                            variant="outlined"
                            name="newCardId"
                            value={newCardId}
                            onChange={handleInputChange}
                            fullWidth
                            margin="normal"
                        />
                        <Button variant="contained" color="primary" onClick={handleAddCard} fullWidth>
                            Ekle
                        </Button>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <TextField
                            label="Kart ID"
                            variant="outlined"
                            name="selectedCardId"
                            value={selectedCardId}
                            onChange={handleInputChange}
                            fullWidth
                            margin="normal"
                        />
                        <Button variant="contained" color="info" onClick={handleGetCard} fullWidth>
                            Detayları Getir
                        </Button>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <TextField
                            label="Silinecek Kart ID"
                            variant="outlined"
                            name="deleteCardId"
                            value={deleteCardId}
                            onChange={handleInputChange}
                            fullWidth
                            margin="normal"
                        />
                        <Button variant="contained" color="error" onClick={handleDeleteCard} fullWidth>
                            Sil
                        </Button>
                    </Grid>
                </Grid>
            </StyledPaper>

            <StyledPaper elevation={3}>
                <Typography variant="h6" gutterBottom>
                    RFID Kart Güncelle
                </Typography>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={6} md={4}>
                        <TextField
                            label="Güncellenecek Kart ID"
                            variant="outlined"
                            name="selectedCardId"
                            value={selectedCardId}
                            onChange={handleInputChange}
                            fullWidth
                            margin="normal"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <TextField
                            label="Yeni Kart ID"
                            variant="outlined"
                            name="updateCardId"
                            value={updateCardId}
                            onChange={handleInputChange}
                            fullWidth
                            margin="normal"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Button variant="contained" color="warning" onClick={handleUpdateCard} fullWidth>
                            Güncelle
                        </Button>
                    </Grid>
                </Grid>
            </StyledPaper>

            {/* Bildirim (Toast) */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
                    {message || error}
                </Alert>
            </Snackbar>

            {/* Onay Diyaloğu */}
            {confirmDialogOpen && (
                <Dialog
                    open={confirmDialogOpen}
                    onClose={handleCloseConfirmDialog}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">
                        {pendingAction === 'add' && 'Yeni Kart Ekleme Onayı'}
                        {pendingAction === 'update' && 'Kart Güncelleme Onayı'}
                        {pendingAction === 'delete' && 'Kart Silme Onayı'}
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            {pendingAction === 'add' &&
                                `"${pendingActionData?.card_id}" ID'li yeni kartı eklemek istediğinize emin misiniz?`}
                            {pendingAction === 'update' &&
                                `"${pendingActionData?.selectedCardId}" ID'li kartın ID'sini "${pendingActionData?.updateCardId}" olarak güncellemek istediğinize emin misiniz?`}
                            {pendingAction === 'delete' &&
                                `"${pendingActionData?.deleteCardId}" ID'li kartı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseConfirmDialog}>İptal</Button>
                        <Button onClick={handleConfirmAction} autoFocus>
                            Onayla
                        </Button>
                    </DialogActions>
                </Dialog>
            )}

            {/* RFID Kart Detayları Diyaloğu */}
            <Dialog
                open={isGetCardDetailsOpen}
                onClose={handleCloseGetCardDetails}
                aria-labelledby="rfid-card-details-title"
                aria-describedby="rfid-card-details-description"
            >
                <DialogTitle id="rfid-card-details-title">RFID Kart Detayları</DialogTitle>
                <DialogContent>
                    {selectedCardDetails ? (
                        <TableContainer>
                            <Table aria-label="rfid card details">
                                <TableHead>
                                    <TableRow>
                                        <StyledTableCell>Alan</StyledTableCell>
                                        <StyledTableCell>Değer</StyledTableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    <TableRow key="employee_id">
                                        <TableCell component="th" scope="row">
                                            Çalışan ID
                                        </TableCell>
                                        <TableCell>{selectedCardDetails.employee_id}</TableCell>
                                    </TableRow>
                                    <TableRow key="first_name">
                                        <TableCell component="th" scope="row">
                                            Adı
                                        </TableCell>
                                        <TableCell>{selectedCardDetails.first_name}</TableCell>
                                    </TableRow>
                                    <TableRow key="last_name">
                                        <TableCell component="th" scope="row">
                                            Soyadı
                                        </TableCell>
                                        <TableCell>{selectedCardDetails.last_name}</TableCell>
                                    </TableRow>
                                    <TableRow key="rfid_card_id">
                                        <TableCell component="th" scope="row">
                                            RFID Kart ID
                                        </TableCell>
                                        <TableCell>{selectedCardDetails.rfid_card_id}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>
                    ) : (
                        <Typography>Kart detayları yükleniyor...</Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseGetCardDetails}>Kapat</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default RfidCardsPage;