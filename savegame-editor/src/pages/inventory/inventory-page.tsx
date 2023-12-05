import './inventory-page.css'
import { NavbarDrawer } from '../../components/navbar-drawer/navbar-drawer'
import { IdData, InventoryItem, InventoryItemRow, SaveFile } from '../../models/save-models'
import { Backdrop, Box, Button, Card, CardContent, Divider, ListItemButton, ListItemIcon, ListItemText, Menu, MenuItem, Tab, Tabs, TextField, Typography, createTheme, styled } from '@mui/material'
import { ChangeEvent, Fragment, useState } from 'react';
import { ThemeProvider } from '@emotion/react';
import ConstructionRoundedIcon from '@mui/icons-material/ConstructionRounded';
import BorderColorIcon from '@mui/icons-material/BorderColor';
import template from '../../models/item-templates.json';
import { FixedSizeList } from 'react-window';
import { invoke } from '@tauri-apps/api';
import AsyncAutocomplete from '../../components/async-autocomplete/async-autocomplete';

export const InventoryPage = ({ currentSaveFile, setCurrentSaveFile, idDatas }: { currentSaveFile: SaveFile | undefined, setCurrentSaveFile: Function, idDatas: IdData[] }): JSX.Element => {
    return (
        <>
            <div className="container">
                <NavbarDrawer pagename={"Inventory"} pagecontent={<InventoryContent currentSaveFile={currentSaveFile} setCurrentSaveFile={setCurrentSaveFile} idDatas={idDatas} />}></NavbarDrawer>
            </div>
        </>
    )
}

const InventoryContent = ({ currentSaveFile, setCurrentSaveFile, idDatas }: { currentSaveFile: SaveFile | undefined, setCurrentSaveFile: Function, idDatas: IdData[] }) => {
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
            <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>

                <ThemeProvider theme={tabTheme}>
                    <Box sx={{ backgroundColor: '#00000070' }}>
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
                                <VirtualizedList 
                                    itemRow={itemArray}
                                    itemIndex={index} 
                                    minWidth={360}
                                    currentSaveFile={currentSaveFile}
                                    setCurrentSaveFile={setCurrentSaveFile}
                                    idDatas={idDatas} />
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

// Represents the collapsed nested list.
// Using FixedSizedList instead of normal list to improve performance when opening a bracket.
const VirtualizedList = ({
    itemRow,
    itemIndex,
    minWidth,
    currentSaveFile, 
    setCurrentSaveFile,
    idDatas,
}: {
    itemRow: InventoryItemRow,
    itemIndex: number,
    minWidth: number,
    currentSaveFile: SaveFile | undefined, 
    setCurrentSaveFile: Function,
    idDatas: IdData[],
}): JSX.Element => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<InventoryItem>();
    const [currentItemIndex, setCurrentItemIndex] = useState(itemIndex);
    const [items, setItems] = useState<InventoryItem[]>(itemRow.inventory_items);

    const [currentSelectedID, setCurrentSelectedID] = useState('');
    const [currentSelectedItemLevel, setCurrentSelectedItemLevel] = useState('');
    const [currentSelectedItemSeed, setCurrentSelectedItemSeed] = useState('');
    const [currentSelectedItemAmount, setCurrentSelectedItemAmount] = useState('');
    const [currentSelectedItemDurability, setCurrentSelectedItemDurability] = useState('');
    const [possibleIDs, setPossibleIDs] = useState<string[]>([]);
    
    const [changeItemIsOpen, setChangeItemIsOpen] = useState(false);

    const idMapping: [string, string[]][] = [
        ['Weapons', ['Melee']],
        ['Outfits/Craftresources', ['CraftComponent', 'OutfitPart', 'LootPack']],
        ['Consumables', ['Medkit', 'Powerup']],
        ['Accessories', ['Throwable', 'ThrowableLiquid']],
        ['Ammunition', ['Ammo']],
    ];
    
    const handleCLickChangeItem = () => {
        setChangeItemIsOpen(!changeItemIsOpen);
    };

    const handleSelectedItem = (selectedItem: InventoryItem, index: number) => {
        setCurrentItem(selectedItem);
        setCurrentItemIndex(index);
        setCurrentSelectedID(selectedItem.name);
        setCurrentSelectedItemLevel(selectedItem.chunk_data.level_value.toString());
        setCurrentSelectedItemSeed(selectedItem.chunk_data.seed_value.toString());
        setCurrentSelectedItemAmount(selectedItem.chunk_data.amount_value.toString());
        setCurrentSelectedItemDurability(selectedItem.chunk_data.durability_value.toString());
        handlePossibleIDs(selectedItem.size);
        setIsOpen(true);
    }

    const handleCloseItem = () => {
        setCurrentItem(undefined);
        setIsOpen(false);
    }

    const handlePossibleIDs = (size: number) => {
        let iDs: string[] = [];
    
        idMapping.forEach(([rowName, idNames]) => {
            if (itemRow.name === rowName) {
                const matchingIdDatas = idDatas.filter((idData) => idNames.indexOf(idData.filename) > -1);
    
                for (let i = 0; i < matchingIdDatas.length; i++) {
                    matchingIdDatas[i].ids.forEach((id) => {
                        if (id.length <= size) {
                            iDs.push(id);
                        }
                    });
                }
                
                setPossibleIDs(iDs);
            }
        });
    };

    const handleLevelValue = (event: ChangeEvent<HTMLInputElement>) => {
        const maxValue = 65535;

        // Allow only numbers
        var value = event.target.value.replace(/[^0-9]/g, '');

        // Check Max Range
        if (Number(value) > maxValue) {
            value = maxValue.toString();
        }

        // If the input is empty, set it to '0'
        if (value === '') {
            setCurrentSelectedItemLevel('0');
        } else if (value.charAt(0) === '0') {
            setCurrentSelectedItemLevel(value.substring(1));
        } else {
            setCurrentSelectedItemLevel(value);
        }
    }

    const handleSeedValue = (event: ChangeEvent<HTMLInputElement>) => {
        const maxValue = 65535;

        // Allow only numbers
        var value = event.target.value.replace(/[^0-9]/g, '');

        // Check Max Range
        if (Number(value) > maxValue) {
            value = maxValue.toString();
        }

        // If the input is empty, set it to '0'
        if (value === '') {
            setCurrentSelectedItemSeed('0');
        } else if (value.charAt(0) === '0') {
            setCurrentSelectedItemSeed(value.substring(1));
        } else {
            setCurrentSelectedItemSeed(value);
        }
    }

    const handleAmountValue = (event: ChangeEvent<HTMLInputElement>) => {
        const maxValue = 9999;

        // Allow only numbers
        var value = event.target.value.replace(/[^0-9]/g, '');

        // Check Max Range
        if (Number(value) > maxValue) {
            value = maxValue.toString();
        }

        // If the input is empty, set it to '0'
        if (value === '') {
            setCurrentSelectedItemAmount('0');
        } else if (value.charAt(0) === '0') {
            setCurrentSelectedItemAmount(value.substring(1));
        } else {
            setCurrentSelectedItemAmount(value);
        }
    }

    const handleDurabilityValue = (event: ChangeEvent<HTMLInputElement>) => {
        const maxValue = 9999;

        // Allow only numbers
        var value = event.target.value.replace(/[^-0-9]/g, '');

        // Check Max Range
        if (Number(value) > maxValue) {
            value = maxValue.toString();
        }

        // If the input is empty, set it to '0'
        if (value === '') {
            setCurrentSelectedItemDurability('0');
        } else if (value.charAt(0) === '0') {
            setCurrentSelectedItemDurability(value.substring(1));
        } else {
            setCurrentSelectedItemDurability(value);
        }
    }

    async function handleChangeValues() {
        let levelValue = Number(currentSelectedItemLevel);
        let seedValue = Number(currentSelectedItemSeed);
        let amountValue = Number(currentSelectedItemAmount);
        let durabilityValue = Number(currentSelectedItemDurability);

        // Rewrite locally for performance reasons.
        if (items != undefined) {
            items[currentItemIndex].name = currentSelectedID;
            items[currentItemIndex].chunk_data.level_value = levelValue;
            items[currentItemIndex].chunk_data.seed_value = seedValue;
            items[currentItemIndex].chunk_data.amount_value = amountValue;
            items[currentItemIndex].chunk_data.durability_value = durabilityValue;
            setItems(items);
        }

        // setIsOpen(false);
        submitItemValues(levelValue, seedValue, amountValue, durabilityValue);
    }

    async function submitItemValues(levelValue: number, seedValue: number, amountValue: number, durabilityValue: number) {
        invoke<Uint8Array>("handle_edit_item_chunk", {
            current_item_index: currentItem?.index,
            new_id: currentSelectedID.slice(0, -4),
            current_item_chunk_index: currentItem?.chunk_data.index,
            current_item_size: currentItem?.size,
            new_level: levelValue,
            new_seed: seedValue,
            new_amount: amountValue,
            new_durability: durabilityValue,
            save_file_content: currentSaveFile?.file_content
        }).then((new_save_content) => {
            if (currentSaveFile != null) {
                currentSaveFile.file_content = new_save_content;
                itemRow.inventory_items = items;

                for (let i = 0; i < currentSaveFile.items.length; i++) {
                    if (itemRow.name == currentSaveFile.items[i].name &&
                        itemRow.inventory_items.length == currentSaveFile.items[i].inventory_items.length) {
                            currentSaveFile.items[i] = itemRow;
                            setCurrentSaveFile(currentSaveFile);
                            return;
                    }
                }
            }
        })
    }

    return (
        <>
            <Box sx={{ height: '100%', minWidth: minWidth }}>
                <FixedSizeList
                    height={700}
                    width='100%'
                    itemSize={200}
                    itemCount={items?.length || 0}
                    className='fixedSizeListContainer'
                >
                    {({ index, style }) => (
                        <>
                            <Fragment key={index}>
                                <ListItemButton style={style} onClick={() => handleSelectedItem(items[index], index)}>
                                    <ListItemIcon>
                                        <ConstructionRoundedIcon sx={{ color: '#e9eecd' }} />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={items[index].name}
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
                                                            {items[index].index}
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
                                                            {items[index].chunk_data.level_value}
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
                                                            {items[index].chunk_data.seed_value}
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
                                                            {items[index].chunk_data.amount_value}
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
                                                            {items[index].chunk_data.durability_value}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                                <Divider />
                                            </ThemeProvider>
                                        } />
                                </ListItemButton>
                            </Fragment>
                        </>
                    )}
                </FixedSizeList>
            </Box>

            <ThemeProvider theme={selectedItemCardTheme}>
                <Backdrop
                    sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                    open={isOpen}
                    onClick={handleCloseItem}
                >
                    <Card onClick={(e) => e.stopPropagation()} variant='outlined'>
                        <CardContent sx={{
                            display: 'flex',
                            flexDirection: 'column'
                        }}>

                            <Box sx={{
                                display: 'flex', 
                                flexDirection: 'row',
                                justifyContent: 'center',
                                marginTop: '20px'
                            }}>
                                <Box sx={{width:'500px'}}>
                                    {changeItemIsOpen ? (
                                        <AsyncAutocomplete 
                                            currentID={currentSelectedID}
                                            iDs={possibleIDs}
                                            changeCurrentID={setCurrentSelectedID}
                                        />
                                    ) : (
                                        <Typography gutterBottom variant="h5" component="div">
                                        {currentItem?.name}
                                        </Typography>
                                    )}
                                </Box>

                                
                                {possibleIDs.length > 0 ? (
                                    <Button 
                                        sx={{
                                            marginLeft: '10px',
                                            cursor: 'pointer',
                                            "&:hover": {
                                                backgroundColor: '#52626450'
                                            }
                                        }}
                                        onClick={handleCLickChangeItem}
                                            >
                                        <BorderColorIcon/>
                                    </Button>
                                ) : (
                                    <Button 
                                        sx={{
                                            marginLeft: '10px',
                                            cursor: 'pointer',
                                            "&:hover": {
                                                backgroundColor: '#52626450'
                                            }
                                        }}
                                        onClick={handleCLickChangeItem}
                                        disabled={true}
                                            >
                                        <BorderColorIcon/>
                                    </Button>
                                )}
                                

                            </Box>
                            
                            <Box sx={{
                                display: 'flex', 
                                flexDirection: 'row',
                                justifyContent: 'center',
                                marginTop: '20px'
                            }}>
                                <TextField
                                    label="Level"
                                    variant="outlined"
                                    type="text"
                                    value={currentSelectedItemLevel}
                                    onChange={handleLevelValue}
                                    inputProps={{
                                        inputMode: 'numeric',
                                        pattern: '[0-9]*',
                                    }}
                                    InputLabelProps={{
                                        sx: {
                                            color: "#899994",
                                            "&.Mui-focused": { color: "#e9eecd" }
                                        },
                                    }}
                                />

                                <Button onClick={handleChangeValues}>Change</Button>
                            </Box>

                            <Box sx={{
                                display: 'flex', 
                                flexDirection: 'row',
                                justifyContent: 'center',
                                marginTop: '20px'
                            }}>
                                <TextField
                                    label="Seed"
                                    variant="outlined"
                                    type="text"
                                    value={currentSelectedItemSeed}
                                    onChange={handleSeedValue}
                                    inputProps={{
                                        inputMode: 'numeric',
                                        pattern: '[0-9]*',
                                    }}
                                    InputLabelProps={{
                                        sx: {
                                            color: "#899994",
                                            "&.Mui-focused": { color: "#e9eecd" }
                                        },
                                    }}
                                />

                                <Button onClick={handleChangeValues}>Change</Button>
                            </Box>

                            <Box sx={{
                                display: 'flex', 
                                flexDirection: 'row',
                                justifyContent: 'center',
                                marginTop: '20px'
                            }}>
                                <TextField
                                    label="Amount"
                                    variant="outlined"
                                    type="text"
                                    value={currentSelectedItemAmount}
                                    onChange={handleAmountValue}
                                    inputProps={{
                                        inputMode: 'numeric',
                                        pattern: '[0-9]*',
                                    }}
                                    InputLabelProps={{
                                        sx: {
                                            color: "#899994",
                                            "&.Mui-focused": { color: "#e9eecd" }
                                        },
                                    }}
                                />

                                <Button onClick={handleChangeValues}>Change</Button>
                            </Box>

                            <Box sx={{
                                display: 'flex', 
                                flexDirection: 'row',
                                justifyContent: 'center',
                                marginTop: '20px'
                            }}>
                                <TextField
                                    label="Durability"
                                    variant="outlined"
                                    type="text"
                                    value={currentSelectedItemDurability}
                                    onChange={handleDurabilityValue}
                                    inputProps={{
                                        inputMode: 'numeric',
                                        pattern: '[0-9]*',
                                    }}
                                    InputLabelProps={{
                                        sx: {
                                            color: "#899994",
                                            "&.Mui-focused": { color: "#e9eecd" }
                                        },
                                    }}
                                />

                                <Button onClick={handleChangeValues}>Change</Button>
                            </Box>

                            <Button sx={{marginTop: '40px', color: '#e9eecd'}} onClick={() => {
                                handleChangeValues();
                                setIsOpen(false);
                            }}>Change All</Button>
                        </CardContent>
                    </Card>
                </Backdrop>
            </ThemeProvider>
        </>
    );
};

const selectedItemCardTheme = createTheme({
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