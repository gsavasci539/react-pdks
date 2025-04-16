import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  styled,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

// Arka plan resmini stilize edilmiş bir Box bileşeni ile ekliyoruz
const BackgroundBox = styled(Box)({
  backgroundImage: `url('https://www.softwareaggov.com/wp-content/uploads/2020/12/IOT-Icons.jpeg')`, // Rastgele ofis/çalışma yeri resmi
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const success = await login(email, password);
      if (success) {
        navigate('/');
      } else {
        setError('Geçersiz e-posta veya şifre');
      }
    } catch (err) {
      setError('Giriş sırasında bir hata oluştu');
    }
  };

  return (
    <BackgroundBox>
      <Container component="main" maxWidth="xs">
        <Paper elevation={3} sx={{ p: 4, width: '100%', backdropFilter: 'blur(5px)', backgroundColor: 'rgba(255, 255, 255, 0.8)' }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            PDKS Giriş
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="E-posta Adresi"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={!!error}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Şifre"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={!!error}
              helperText={error}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Giriş Yap
            </Button>
          </Box>
        </Paper>
      </Container>
    </BackgroundBox>
  );
}

export default Login;