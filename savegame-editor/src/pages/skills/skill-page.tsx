import './skill-page.css'
import { NavbarDrawer } from '../../components/navbar-drawer/navbar-drawer'
import { InventoryItem, SaveFile, SkillItem } from '../../models/save-models'
import { Backdrop, Box, Button, Card, CardContent, CardHeader, Divider, List, ListItemButton, ListItemIcon, ListItemText, Tab, Tabs, TextField, Typography, createTheme, styled } from '@mui/material'
import { ChangeEvent, Fragment, useState } from 'react';
import { ThemeProvider } from '@emotion/react';
import AccountTreeRoundedIcon from '@mui/icons-material/AccountTreeRounded';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { invoke } from '@tauri-apps/api';
import { info } from 'tauri-plugin-log-api';


export const SkillPage = ({currentSaveFile, setCurrentSaveFile}: {currentSaveFile: SaveFile | undefined, setCurrentSaveFile: Function}): JSX.Element => {    
    return (
        <>
        <div className="container">
            <NavbarDrawer pagename={"Skills"} pagecontent={<SkillContent currentSaveFile={currentSaveFile} setCurrentSaveFile={setCurrentSaveFile}/>}></NavbarDrawer>
        </div>
        </>
    )
}

const SkillContent = ({currentSaveFile, setCurrentSaveFile}: {currentSaveFile: SaveFile | undefined, setCurrentSaveFile: Function}) => {
    const [currentTab, setCurrentTab] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [currentSkill, setCurrentSkill] = useState<SkillItem>();
    const [currentSkillIndex, setCurrentSkillIndex] = useState(0);
    const [currentSelectedSkillValue, setCurrentSelectedSkillValue] = useState('');

    const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
        setCurrentTab(newValue);
    };

    const handleSelectSkill = (selectedSkill: SkillItem, index: number) => {
        setCurrentSkill(selectedSkill);
        setCurrentSkillIndex(index);
        setCurrentSelectedSkillValue(selectedSkill.points_value.toString());
        setIsOpen(true);
    };

    const handleCloseSkill = () => {
        setCurrentSkill(undefined);
        setIsOpen(false);
    };

    const handleSelectedValue = (event: ChangeEvent<HTMLInputElement>) => {
        // Allow only numbers
        var value = event.target.value.replace(/[^0-9]/g, '');

        // If the input is empty, set it to '0'
        setCurrentSelectedSkillValue((value === '' || (value === '0' && event.target.selectionStart === 1)) ? '0' : value);    
    }

    async function submitChangedValue() {
        let skillValue = Number(currentSelectedSkillValue);
        
        await setCurrentSaveFile(await invoke("handle_edit_skill", {
            current_skill: currentSkill,
            current_skill_index: currentSkillIndex,
            is_base_skill: true,
            new_value: skillValue,
            save_file: currentSaveFile
        }));

        setIsOpen(false);
    }
    
    return (
        <>
            <ThemeProvider theme={tabTheme}>
                <Box sx={{ width: '100%', backgroundColor: '#00000070'}}>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <Tabs value={currentTab} onChange={handleChange} aria-label="basic tabs example">
                            <StyledTab icon={<FitnessCenterIcon />} iconPosition="bottom" label="Base Skills" {...a11yProps(0)} />
                            <StyledTab icon={<EmojiEventsIcon />} iconPosition="bottom" label="Legend Skills" {...a11yProps(1)} />
                        </Tabs>
                    </Box>
                    <CustomTabPanel value={currentTab} index={0}>
                        <List
                            sx={{ width: '100%', minWidth: 360, bgcolor: 'transparent' }}
                            component="nav"
                            aria-labelledby="nested-list-subheader">
                            {currentSaveFile?.skills.base_skills.map((item, index) => (
                                <Fragment key={item.name}>
                                    <ListItemButton onClick={() => handleSelectSkill(item, index)}>
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
                    <CustomTabPanel value={currentTab} index={1}>
                        <List
                            sx={{ width: '100%', minWidth: 360, bgcolor: 'transparent' }}
                            component="nav"
                            aria-labelledby="nested-list-subheader">
                            {currentSaveFile?.skills.legend_skills.map((item, index) => (
                                <Fragment key={item.name}>
                                    <ListItemButton onClick={() => handleSelectSkill(item, index)}>
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

            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={isOpen}
                onClick={handleCloseSkill}
            >
                <Card onClick={(e) => e.stopPropagation()} variant='outlined'>
                    <CardContent>
                        <Typography gutterBottom variant="h5" component="div">
                            {currentSkill?.name}
                        </Typography>

                        <TextField
                            label="Value"
                            variant="outlined"
                            type="text"
                            value={currentSelectedSkillValue}
                            onChange={handleSelectedValue}
                            inputProps={{
                                inputMode: 'numeric',
                                pattern: '[0-9]*',
                            }}
                        />

                        <Button onClick={() => submitChangedValue}>Change</Button>
                    </CardContent>
                </Card>
            </Backdrop>
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