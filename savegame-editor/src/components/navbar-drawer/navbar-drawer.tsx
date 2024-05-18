import * as React from 'react';
import { styled, useTheme, Theme, CSSObject, createTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import { Link } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import { Container, List } from '@mui/material';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { ThemeProvider } from '@emotion/react';
import { SettingsManager } from 'tauri-settings';
import { SettingsSchema } from '../../models/settings-schema';

import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItemIcon from '@mui/material/ListItemIcon';
import AccountTreeRoundedIcon from '@mui/icons-material/AccountTreeRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import BackpackRoundedIcon from '@mui/icons-material/BackpackRounded';
import AssignmentLateRoundedIcon from '@mui/icons-material/AssignmentLateRounded';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import StoreRoundedIcon from '@mui/icons-material/StoreRounded';
import SettingsIcon from '@mui/icons-material/Settings';
import BugReportIcon from '@mui/icons-material/BugReport';
import { useEffect, useState } from 'react';

// Themes
const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
  backgroundColor: '#00000080',
  color: '#e9eecd',
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
  backgroundColor: '#00000080',
  color: '#e9eecd',
});

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  zIndex: theme.zIndex.drawer + 2,
  margin: 0,
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  backgroundColor: '#00000080',
  color: '#e9eecd',
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    backgroundColor: '#00000080',
    color: '#e9eecd',
  }),
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...(open && {
      ...openedMixin(theme),
      '& .MuiDrawer-paper': openedMixin(theme),
    }),
    ...(!open && {
      ...closedMixin(theme),
      '& .MuiDrawer-paper': closedMixin(theme),
    }),
  }),
);

const drawerTheme = createTheme({
  palette: {
    mode: 'dark',
  },
  components: {
    MuiDrawer: {
      styleOverrides: {
        root: {
          backgroundColor: "transparent !important",
        }
      }
    }
  }
});

// constant values
const drawerWidth = 240;

// The different pages
const itemPages: [string, JSX.Element, string, boolean][] = [
  ['Skills', <AccountTreeRoundedIcon/>, '/skills', false], 
  ['Unlockables', <LockOpenIcon/>, '/unlockables', false], 
  ['Inventory', <Inventory2RoundedIcon/>, '/inventory', false], 
  ['Backpack', <BackpackRoundedIcon/>, '/backpack', true], 
  ['Campaign', <AssignmentLateRoundedIcon/>, '/campaign', true],
];
const otherPages: [string, JSX.Element, string, boolean][] = [
  ['Player', <AccountCircleOutlinedIcon/>, '/player', true],
  ['IDs', <FingerprintIcon/>, '/ids', false], 
  ['Settings', <SettingsIcon/>, '/settings', false],
];
const infoPages: [string, JSX.Element, string, boolean][] = [
  ['Home', <HomeRoundedIcon/>, '/main', false],
  ['Info', <HelpOutlineRoundedIcon/>, '/info', false],
  ['Caz Outpost', <StoreRoundedIcon/>, '/outpost', false], 
];

// Props
interface NavbarDrawerProps {
  pagename: string,
  pagecontent: JSX.Element,
  settingsManager: SettingsManager<SettingsSchema> | undefined
}

// Actual Navbar
export const NavbarDrawer = ({pagename, pagecontent, settingsManager}: NavbarDrawerProps): JSX.Element => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [isDebugSelected, setIsDebugSelected] = useState(settingsManager ? settingsManager.settings && settingsManager.settings.debugMode : false)

  useEffect(() => {
    setIsDebugSelected(settingsManager ? settingsManager.settings && settingsManager.settings.debugMode : false);
  }, [])

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  return (
    <>
      <div className="navbar-container">
        <ThemeProvider theme={drawerTheme}>
          <Box sx={{ display: 'flex', backgroundColor: 'transparent'}}>
            <CssBaseline/>
            <AppBar position="fixed" open={open}>
              <Toolbar>
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  onClick={handleDrawerOpen}
                  edge="start"
                  sx={{
                    marginRight: 5,
                    opacity: '1',
                    ...(open && { display: 'none' }),
                  }}
                >
                  <MenuIcon />
                </IconButton>
                <Typography variant="h6" noWrap component="div">
                  {pagename}
                </Typography>
              </Toolbar>
            </AppBar>
              <Drawer variant="permanent" open={open}>
                <DrawerHeader>
                  <IconButton onClick={handleDrawerClose}
                    sx={{
                      opacity: '1',
                      color: '#e9eecd',
                      ...(!open && { display: 'none' }),
                    }}>
                    {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                  </IconButton>
                </DrawerHeader>
                <Divider sx={{ backgroundColor: '#e9eecd60' }} />
                <List>
                  {infoPages.map(([text, icon, link, isDisabled]) => (
                    <ListItem key={text} disablePadding sx={{
                      display: 'block',
                      color: '#e9eecd',
                    }}>
                      <ListItemButton
                        sx={{
                          minHeight: 48,
                          justifyContent: open ? 'initial' : 'center',
                          px: 2.5,
                          '&:hover': {
                            color: '#e9eecd',
                            backgroundColor: '#526264',
                          },
                        }}
                        component={Link} to={link}
                        disabled={isDisabled}
                      >
                        <ListItemIcon
                          sx={{
                            minWidth: 0,
                            mr: open ? 3 : 'auto',
                            justifyContent: 'center',
                            color: '#e9eecd',
                          }}
                        >
                          {icon}
                        </ListItemIcon>
                        <ListItemText
                          primary={text}
                          sx={{
                            opacity: open ? 1 : 0,
                          }} />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
                <Divider sx={{ backgroundColor: '#e9eecd60' }} />
                <List>
                  {itemPages.map(([text, icon, link, isDisabled]) => (
                    <ListItem key={text} disablePadding sx={{
                      display: 'block',
                      color: '#e9eecd',
                    }}>
                      <ListItemButton
                        sx={{
                          minHeight: 48,
                          justifyContent: open ? 'initial' : 'center',
                          px: 2.5,
                          '&:hover': {
                            color: '#e9eecd',
                            backgroundColor: '#526264',
                          },
                        }}
                        component={Link} to={link}
                        disabled={isDisabled}
                      >
                        <ListItemIcon
                          sx={{
                            minWidth: 0,
                            mr: open ? 3 : 'auto',
                            justifyContent: 'center',
                            color: '#e9eecd',
                          }}
                        >
                          {icon}
                        </ListItemIcon>
                        <ListItemText
                          primary={text}
                          sx={{
                            opacity: open ? 1 : 0,
                          }} />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
                <Divider sx={{ backgroundColor: '#e9eecd60' }} />
                <List>
                  {otherPages.map(([text, icon, link, isDisabled]) => (
                    <ListItem key={text} disablePadding sx={{
                      display: 'block',
                      color: '#e9eecd',
                    }}>
                      <ListItemButton
                        sx={{
                          minHeight: 48,
                          justifyContent: open ? 'initial' : 'center',
                          px: 2.5,
                          '&:hover': {
                            color: '#e9eecd',
                            backgroundColor: '#526264',
                          },
                        }}
                        component={Link} to={link}
                        disabled={isDisabled}
                      >
                        <ListItemIcon
                          sx={{
                            minWidth: 0,
                            mr: open ? 3 : 'auto',
                            justifyContent: 'center',
                            color: '#e9eecd',
                          }}
                        >
                          {icon}
                        </ListItemIcon>
                        <ListItemText
                          primary={text}
                          sx={{
                            opacity: open ? 1 : 0,
                          }} />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
                {isDebugSelected ? (
                  <>
                  <Divider sx={{ backgroundColor: '#e9eecd60' }} />
                  <List>
                  <ListItem key='debug' disablePadding sx={{
                        display: 'block',
                        color: '#e9eecd',
                      }}>
                        <ListItemButton
                          sx={{
                            minHeight: 48,
                            justifyContent: open ? 'initial' : 'center',
                            px: 2.5,
                            '&:hover': {
                              color: '#e9eecd',
                              backgroundColor: '#526264',
                            },
                          }}
                          component={Link} to='/debug'
                          disabled={!isDebugSelected}
                        >
                          <ListItemIcon
                            sx={{
                              minWidth: 0,
                              mr: open ? 3 : 'auto',
                              justifyContent: 'center',
                              color: '#e9eecd',
                            }}
                          >
                            {<BugReportIcon/>}
                          </ListItemIcon>
                          <ListItemText
                            primary={'Debug'}
                            sx={{
                              opacity: open ? 1 : 0,
                            }} />
                        </ListItemButton>
                      </ListItem>
                  </List>
                  </>
                ): (
                  <></>
                )}
              </Drawer>
            <Container sx={{
              flexGrow: 1,
              p: 3,
              color: '#e9eecd',
            }}>
              {pagecontent}
            </Container>
          </Box>
        </ThemeProvider>
      </div>
    </>
  );
}