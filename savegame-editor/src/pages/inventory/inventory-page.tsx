import './inventory-page.css'
import { NavbarDrawer } from '../../components/navbar-drawer/navbar-drawer'
import { SaveFile } from '../../models/save-models'
import { Box, List, ListItemButton, ListItemIcon, ListItemText, Tab, Tabs, Typography, createTheme, styled } from '@mui/material'
import { Fragment, useState } from 'react';
import { ThemeProvider } from '@emotion/react';
import ConstructionRoundedIcon from '@mui/icons-material/ConstructionRounded';


export const InventoryPage = ({currentSaveFile}: {currentSaveFile: SaveFile | undefined}): JSX.Element => {
    return (
        <>
        <div className="container">
            <NavbarDrawer pagename={"Inventory"} pagecontent={<InventoryContent currentSaveFile={currentSaveFile}/>}></NavbarDrawer>
        </div>
        </>
    )
}

const InventoryContent = ({currentSaveFile}: {currentSaveFile: SaveFile | undefined}) => {
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
                        {currentSaveFile?.items.map((_, index) => (
                                <StyledTab
                                    key={index}
                                    icon={<ConstructionRoundedIcon />}
                                    iconPosition="bottom"
                                    label={`Tab ${index + 1}`}
                                    {...a11yProps(index)}
                                />
                            ))}
                        </Tabs>
                    </Box>
                    {currentSaveFile?.items.map((itemArray, index) => (
                        <CustomTabPanel key={index} value={value} index={index}>
                            <List
                                sx={{ width: '100%', minWidth: 360, bgcolor: 'transparent' }}
                                component="nav"
                                aria-labelledby="nested-list-subheader"
                            >
                                {itemArray.map((item, itemIndex) => (
                                    <Fragment key={itemIndex}>
                                        <ListItemButton>
                                            <ListItemIcon>
                                                <ConstructionRoundedIcon sx={{ color: '#e9eecd' }} />
                                            </ListItemIcon>
                                            <ListItemText primary={item.name} />
                                        </ListItemButton>
                                    </Fragment>
                                ))}
                            </List>
                        </CustomTabPanel>
                    ))}
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
})