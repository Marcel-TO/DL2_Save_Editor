import './inventory-page.css'
import { NavbarDrawer } from '../../components/navbar-drawer/navbar-drawer'
import { SaveFile } from '../../models/save-models'
import { Box, Button, Divider, List, ListItemButton, ListItemIcon, ListItemText, Menu, MenuItem, Tab, Tabs, Typography, createTheme, styled } from '@mui/material'
import { Fragment, useState } from 'react';
import { ThemeProvider } from '@emotion/react';
import ConstructionRoundedIcon from '@mui/icons-material/ConstructionRounded';
import template from '../../models/item-templates.json';

export const InventoryPage = ({ currentSaveFile }: { currentSaveFile: SaveFile | undefined }): JSX.Element => {
    return (
        <>
            <div className="container">
                <NavbarDrawer pagename={"Inventory"} pagecontent={<InventoryContent currentSaveFile={currentSaveFile} />}></NavbarDrawer>
            </div>
        </>
    )
}

const InventoryContent = ({ currentSaveFile }: { currentSaveFile: SaveFile | undefined }) => {
    const [tabIndex, setValue] = useState(0);

    const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const isOpen = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <>
        <Box sx={{display: 'flex', justifyContent: 'center', width: '100%'}}>

            <ThemeProvider theme={tabTheme}>
                <Box sx={{backgroundColor: '#00000070' }}>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', display: 'flex', flexDirection: 'row', position: 'relative', maxWidth: { xs: 320, sm: 2000 } }}>
                        <Tabs 
                            value={tabIndex} 
                            onChange={handleChange}
                            variant="scrollable"
                            scrollButtons="auto"
                            allowScrollButtonsMobile>
                            {currentSaveFile?.items.map((itemrow, index) => (
                                <StyledTab
                                    key={index}
                                    icon={<ConstructionRoundedIcon />}
                                    iconPosition="bottom"
                                    label={itemrow.name}
                                    {...a11yProps(index)}
                                />
                            ))}
                        </Tabs>
                    </Box>
                    {currentSaveFile?.items?.map((itemArray, index) => (
                        <CustomTabPanel key={index} value={tabIndex} index={index}>
                            <List
                                sx={{ width: '100%', minWidth: 360, bgcolor: 'transparent' }}
                                component="nav"
                                aria-labelledby="nested-list-subheader"
                            >
                                {/* {itemArray.items.map((item, itemIndex) => (
                                    <Fragment key={itemIndex}>
                                        <ListItemButton>
                                            <ListItemIcon>
                                                <ConstructionRoundedIcon sx={{ color: '#e9eecd' }} />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={item.name}
                                                secondary={
                                                    <ThemeProvider theme={listItemTheme}>
                                                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                                            <Box sx={{ display: 'flex', flexDirection: 'row', marginLeft: '40px', alignItems: 'center' }}>
                                                                <Typography
                                                                    sx={{ minWidth: '100px' }}
                                                                    variant="subtitle1">
                                                                    {"Index: "}
                                                                </Typography>
                                                                <Typography
                                                                    variant='body2'>
                                                                    {item.chunk_data.index}
                                                                </Typography>
                                                            </Box>


                                                            <Box sx={{ display: 'flex', flexDirection: 'row', marginLeft: '40px', alignItems: 'center' }}>
                                                                <Typography
                                                                    sx={{ minWidth: '100px' }}
                                                                    variant="subtitle1">
                                                                    {"Level: "}
                                                                </Typography>
                                                                <Typography
                                                                    variant='body2'>
                                                                    {item.chunk_data.level_value}
                                                                </Typography>
                                                            </Box>

                                                            <Box sx={{ display: 'flex', flexDirection: 'row', marginLeft: '40px', alignItems: 'center' }}>
                                                                <Typography
                                                                    sx={{ minWidth: '100px' }}
                                                                    variant="subtitle1">
                                                                    {"Seed: "}
                                                                </Typography>
                                                                <Typography
                                                                    variant='body2'>
                                                                    {item.chunk_data.seed_value}
                                                                </Typography>
                                                            </Box>

                                                            <Box sx={{ display: 'flex', flexDirection: 'row', marginLeft: '40px', alignItems: 'center' }}>
                                                                <Typography
                                                                    sx={{ minWidth: '100px' }}
                                                                    variant="subtitle1">
                                                                    {"Amount: "}
                                                                </Typography>
                                                                <Typography
                                                                    variant='body2'>
                                                                    {item.chunk_data.amount_value}
                                                                </Typography>
                                                            </Box>

                                                            <Box sx={{ display: 'flex', flexDirection: 'row', marginLeft: '40px', alignItems: 'center' }}>
                                                                <Typography
                                                                    sx={{ minWidth: '100px' }}
                                                                    variant="subtitle1">
                                                                    {"Durability: "}
                                                                </Typography>
                                                                <Typography
                                                                    variant='body2'>
                                                                    {item.chunk_data.durability_value}
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                    </ThemeProvider>
                                                } />
                                        </ListItemButton>
                                        <Divider />
                                    </Fragment>
                                ))} */}
                            </List>
                        </CustomTabPanel>
                    ))}
                </Box>

                <div className='template-button'>
                    <Button
                        id="basic-button"
                        aria-controls={isOpen ? 'basic-menu' : undefined}
                        aria-haspopup="true"
                        aria-expanded={isOpen ? 'true' : undefined}
                        onClick={handleClick}
                        variant='outlined'
                        sx={{
                            borderColor: '#e9eecd',
                            color: '#e9eecd',
                            backgroundColor: '#52626450',
                            '&:hover': {
                                backgroundColor: '#e9eecd',
                                color: '#526264',
                                borderColor: '#526264',
                            }
                        }}
                    >
                        Templates
                    </Button>
                    <Menu
                        id="basic-menu"
                        anchorEl={anchorEl}
                        open={isOpen}
                        onClose={handleClose}
                        MenuListProps={{
                            'aria-labelledby': 'basic-button',
                        }}
                    >
                        {template['inventory-items'].map((item) => (
                            <MenuItem onClick={handleClose}>{`Execute: ${item.name}`}</MenuItem>
                        ))}
                    </Menu>
                </div>
            </ThemeProvider>
        </Box>
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