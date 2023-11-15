import './skill-page.css'
import { NavbarDrawer } from '../../components/navbar-drawer/navbar-drawer'
import { SaveFile } from '../../models/save-models'
import { Box, Divider, List, ListItemButton, ListItemIcon, ListItemText, Tab, Tabs, Typography, createTheme, styled } from '@mui/material'
import { Fragment, useState } from 'react';
import { ThemeProvider } from '@emotion/react';
import AccountTreeRoundedIcon from '@mui/icons-material/AccountTreeRounded';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';


export const SkillPage = ({currentSaveFile}: {currentSaveFile: SaveFile | undefined, setCurrentSaveFile: Function}): JSX.Element => {    
    return (
        <>
        <div className="container">
            <NavbarDrawer pagename={"Skills"} pagecontent={<SkillContent currentSaveFile={currentSaveFile}/>}></NavbarDrawer>
        </div>
        </>
    )
}

const SkillContent = ({currentSaveFile}: {currentSaveFile: SaveFile | undefined}) => {
    const [value, setValue] = useState(0);

    const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };
    
    return (
        <>
            <ThemeProvider theme={tabTheme}>
                <Box sx={{ width: '100%', backgroundColor: '#00000070'}}>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                            <StyledTab icon={<FitnessCenterIcon />} iconPosition="bottom" label="Base Skills" {...a11yProps(0)} />
                            <StyledTab icon={<EmojiEventsIcon />} iconPosition="bottom" label="Legend Skills" {...a11yProps(1)} />
                        </Tabs>
                    </Box>
                    <CustomTabPanel value={value} index={0}>
                        <List
                            sx={{ width: '100%', minWidth: 360, bgcolor: 'transparent' }}
                            component="nav"
                            aria-labelledby="nested-list-subheader">
                            {currentSaveFile?.skills.base_skills.map((item) => (
                                <Fragment key={item.name}>
                                    <ListItemButton>
                                        <ListItemIcon>
                                            <AccountTreeRoundedIcon sx={{ color: '#e9eecd' }} />
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

                                                        
                                                        <Box sx={{display: 'flex', flexDirection: 'row', marginLeft: '40px', alignItems: 'center'}}>
                                                            <Typography
                                                                sx={{ minWidth: '100px' }}
                                                                variant="subtitle1">
                                                                    {"Value: "}
                                                            </Typography>
                                                            <Typography
                                                                variant='body2'>
                                                                {item.points_value}
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
                    </CustomTabPanel>
                    <CustomTabPanel value={value} index={1}>
                        <List
                            sx={{ width: '100%', minWidth: 360, bgcolor: 'transparent' }}
                            component="nav"
                            aria-labelledby="nested-list-subheader">
                            {currentSaveFile?.skills.legend_skills.map((item) => (
                                <Fragment key={item.name}>
                                    <ListItemButton>
                                        <ListItemIcon>
                                            <AccountTreeRoundedIcon sx={{ color: '#e9eecd' }} />
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

                                                        
                                                        <Box sx={{display: 'flex', flexDirection: 'row', marginLeft: '40px', alignItems: 'center'}}>
                                                            <Typography
                                                                sx={{ minWidth: '100px' }}
                                                                variant="subtitle1">
                                                                    {"Value: "}
                                                            </Typography>
                                                            <Typography
                                                                variant='body2'>
                                                                {item.points_value}
                                                            </Typography> 
                                                        </Box>
                                                    </Box>
                                                </ThemeProvider>
                                            }/>
                                    </ListItemButton>
                                </Fragment>
                            ))}
                        </List>
                    </CustomTabPanel>
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