import './unlockable-page.css'
import { NavbarDrawer } from '../../components/navbar-drawer/navbar-drawer'
import { SaveFile, SkillItem } from '../../models/save-models'
import { ThemeProvider } from '@emotion/react'
import styled from '@emotion/styled'
import { Box, Tabs, List, ListItemButton, ListItemIcon, ListItemText, Typography, Divider, Backdrop, Card, CardContent, TextField, Button, Tab, createTheme } from '@mui/material'
import { useState, ChangeEvent, Fragment } from 'react'
import LockOpenIcon from '@mui/icons-material/LockOpen';

export const UnlockablePage = ({currentSaveFile, setCurrentSaveFile}: {currentSaveFile: SaveFile | undefined, setCurrentSaveFile: Function}): JSX.Element => {    
    return (
        <>
        <div className="container">
            <NavbarDrawer pagename={"Skills"} pagecontent={<UnlockableContent currentSaveFile={currentSaveFile} setCurrentSaveFile={setCurrentSaveFile}/>}></NavbarDrawer>
        </div>
        </>
    )
}

const UnlockableContent = ({currentSaveFile, setCurrentSaveFile}: {currentSaveFile: SaveFile | undefined, setCurrentSaveFile: Function}) => {
    const [currentTab, setCurrentTab] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [currentSkill, setCurrentSkill] = useState<SkillItem>();
    const [currentSkillIndex, setCurrentSkillIndex] = useState(0);
    const [currentSelectedSkillValue, setCurrentSelectedSkillValue] = useState('');
    const [displayedSaveFile] = useState<SaveFile | undefined>(currentSaveFile);

    const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
        setCurrentTab(newValue);
    };
    
    return (
        <>
            <ThemeProvider theme={tabTheme}>
                <Box sx={{ width: '100%', backgroundColor: '#00000070'}}>
                    <List
                        sx={{ width: '100%', minWidth: 360, bgcolor: 'transparent' }}
                        component="nav"
                        aria-labelledby="nested-list-subheader"
                    >
                        {displayedSaveFile?.unlockable_items.map((item, index) => (
                            <Fragment key={item.name}>
                                <ListItemButton>
                                    <ListItemIcon>
                                        <LockOpenIcon sx={{ color: '#e9eecd' }} />
                                    </ListItemIcon>
                                    <ListItemText 
                                        primary={item.name} 
                                        secondary={
                                            <ThemeProvider theme={listItemTheme}>
                                                <Box sx={{display: 'flex', flexDirection: 'column'}}>
                                                    <Box sx={{display: 'flex', flexDirection: 'row', marginLeft: '40px', alignItems: 'center'}}>
                                                        <Typography
                                                            sx={{ minWidth: '100px' }}
                                                            variant="subtitle1">
                                                                {"Index: "}
                                                        </Typography>
                                                        <Typography
                                                            variant='body2'>
                                                            {item.index}
                                                        </Typography> 
                                                    </Box>
                                                </Box>
                                            </ThemeProvider>
                                        }/>
                                </ListItemButton>
                                <Divider/>
                            </Fragment>
                        ))}
                    </List>
                </Box>
            </ThemeProvider>
        </>
    )
}

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function CustomTabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
        >
        {value === index && (
            <Box sx={{ p: 3 }}>
            <Typography>{children}</Typography>
            </Box>
        )}
        </div>
    );
}

const StyledTab = styled(Tab)({
    "&.Mui-selected": {
      backgroundColor: "#e9eecd",
      color: '#526264',
    }
  });

function a11yProps(index: number) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

const tabTheme = createTheme({
    palette: {
        mode: 'dark',
    },
    components: {
        MuiTabs: {
            styleOverrides: {
                indicator: {
                    backgroundColor: '#e9eecd',
                }
            }
        },
        MuiTab: {
            styleOverrides: {
                root: {
                    color: '#e9eecd',
                    borderRadius: '10% 10% 0 0',
                    '&:hover': {
                        backgroundColor: '#52626450',
                      }
                },
            }
        },
    }
});

const listItemTheme = createTheme({
    palette: {
        mode: 'dark',
    },
    components: {
        MuiTypography: {
            styleOverrides: {
                root: {
                    color: 'white',
                }
            }
        }
    }
});

const selectedSkillCardTheme = createTheme({
    palette: {
        mode: 'dark',
    },
    components: {
        MuiCard: {
            styleOverrides: {
                root: {
                    color: '#e9eecd',
                    borderColor: '#526264'
                }
            }
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    color: 'red',
                },
            }
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    color: '#e9eecd',
                    "& fieldset": {
                    borderColor: "#526264",
                    },
                    "&:hover fieldset": {
                    borderColor: "#899994 !important"
                    },
                    "&.Mui-focused fieldset": {
                    borderColor: "#e9eecd !important"
                    }
                }
            }
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    color: '#899994',
                    '&:hover': {
                        color: '#e9eecd'
                    }
                }
            }
        }
    }
});