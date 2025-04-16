import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  Toolbar,
  Typography,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  People,
  AccessTime,
  EventNote,
  Logout,
  MonetizationOn,
  ChevronLeft, // Kapatma ikonu
  ExpandLess,
  ExpandMore,
  Settings, // Ayarlar ikonu
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { styled, useTheme } from '@mui/material/styles';
import MuiAppBar from '@mui/material/AppBar';

const drawerWidth = 240;

const AppBarStyled = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
  boxShadow: theme.shadows[4],
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

const FooterStyled = styled('footer')(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(2),
  textAlign: 'center',
}));

function Layout() {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [subOpen, setSubOpen] = useState({});
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);
  const drawerRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= theme.breakpoints.values.sm);
      if (window.innerWidth <= theme.breakpoints.values.sm) {
        setOpen(false); // Mobil görünümde çekmeceyi otomatik olarak kapat
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const handleClickOutsideDrawer = (event) => {
      if (isMobile && open && drawerRef.current && !drawerRef.current.contains(event.target)) {
        handleDrawerClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutsideDrawer);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mousedown', handleClickOutsideDrawer);
    };
  }, [theme.breakpoints.values.sm, isMobile, open]);

  const menuItems = [
    { text: 'Anasayfa', icon: <Dashboard />, path: '/' },
    { text: 'Çalışanlar', icon: <People />, path: '/employees' },
    { text: 'Giriş-Çıkış', icon: <AccessTime />, path: '/attendance' },
    { text: 'İzin Talepleri', icon: <EventNote />, path: '/leave-requests' },
    { text: 'Maaş', icon: <MonetizationOn />, path: '/salary' },
    {
      text: 'Ayarlar',
      icon: <Settings />,
      children: [
        { text: 'RFID Kartlar', path: '/rfidcards' },
        // Diğer ayarlar buraya eklenebilir
      ],
    },
  ];

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
    setSubOpen({}); // Çekmece kapanınca alt menüleri de kapat
  };

  const handleSubMenuToggle = (index) => {
    setSubOpen(prevState => ({
      ...prevState,
      [index]: !prevState[index],
    }));
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      handleDrawerClose(); // Mobil görünümde navigasyon sonrası çekmeceyi kapat
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBarStyled position="static" open={open}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{ mr: 2, ...(open && { display: 'none' }) }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            PDKS System
          </Typography>
        </Toolbar>
      </AppBarStyled>
      <Box sx={{ display: 'flex', flexGrow: 1 }}>
        <Drawer
          ref={drawerRef}
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              backgroundColor: '#f5f5f5',
            },
          }}
          variant={isMobile ? 'temporary' : 'persistent'} // Mobil için geçici, masaüstü için kalıcı
          anchor="left"
          open={open}
          onClose={isMobile ? handleDrawerClose : undefined} // Mobil için onClose prop'u ekle
        >
          <DrawerHeader>
            <IconButton onClick={handleDrawerClose}>
              <ChevronLeft />
            </IconButton>
          </DrawerHeader>
          <Divider />
          <List>
            {menuItems.map((item, index) => (
              <React.Fragment key={item.text}>
                {item.children ? (
                  <>
                    <ListItem button onClick={() => handleSubMenuToggle(index)}>
                      <ListItemIcon>{item.icon}</ListItemIcon>
                      <ListItemText primary={item.text} />
                      {subOpen[index] ? <ExpandLess /> : <ExpandMore />}
                    </ListItem>
                    <Collapse in={subOpen[index]} timeout="auto" unmountOnExit>
                      <List component="div" disablePadding>
                        {item.children.map((child) => (
                          <ListItem
                            button
                            key={child.text}
                            onClick={() => handleNavigation(child.path)}
                            sx={{ pl: 4, backgroundColor: location.pathname === child.path ? theme.palette.action.selected : null }}
                          >
                            <ListItemText primary={child.text} />
                          </ListItem>
                        ))}
                      </List>
                    </Collapse>
                  </>
                ) : (
                  <ListItem
                    button
                    onClick={() => handleNavigation(item.path)}
                    sx={{ backgroundColor: location.pathname === item.path ? theme.palette.action.selected : null }}
                  >
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.text} />
                  </ListItem>
                )}
              </React.Fragment>
            ))}
            <Divider />
            <ListItem button onClick={handleLogout}>
              <ListItemIcon>
                <Logout />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItem>
          </List>
        </Drawer>
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            transition: theme.transitions.create('margin', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
            marginLeft: `-${drawerWidth}px`,
            ...(open && !isMobile && { // Sadece masaüstünde açık olduğunda margin uygula
              transition: theme.transitions.create('margin', {
                easing: theme.transitions.easing.easeOut,
                duration: theme.transitions.duration.enteringScreen,
              }),
              marginLeft: 0,
            }),
            ...(open && isMobile && { // Mobilde açık olduğunda margin sıfırla (geçici çekmece)
              marginLeft: 0,
            }),
          }}
        >
          <DrawerHeader />
          <Outlet />
        </Box>
      </Box>
      <FooterStyled>
        <Typography variant="body2" color="text.secondary" align="center">
          {`Copyright © PDKS System By ByteBridge Software Solutions ${new Date().getFullYear()}`}
        </Typography>
      </FooterStyled>
    </Box>
  );
}

export default Layout;