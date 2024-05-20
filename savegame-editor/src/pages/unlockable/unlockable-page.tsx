import './unlockable-page.css'
import { NavbarDrawer } from '../../components/navbar-drawer/navbar-drawer'
import { SaveFile, UnlockableItem } from '../../models/save-models'
import { ThemeProvider } from '@emotion/react'
import { Box, ListItemButton, ListItemIcon, ListItemText, TextField, createTheme } from '@mui/material'
import { useState, ChangeEvent } from 'react'
import LockOpenIcon from '@mui/icons-material/LockOpen';
import { FixedSizeList } from 'react-window'
import { SettingsManager } from 'tauri-settings'
import { SettingsSchema } from '../../models/settings-schema'

export const UnlockablePage = ({currentSaveFile, settingsManager}: {currentSaveFile: SaveFile | undefined, settingsManager: SettingsManager<SettingsSchema>}): JSX.Element => {    
    return (
        <>
          <div className="container">
            <NavbarDrawer 
                pagename={"Unlockables"} 
                pagecontent={
                    currentSaveFile ? (
                      <UnlockableContent unlockableItems={currentSaveFile != undefined ? currentSaveFile.unlockable_items : []}/>
                    ) : (
                      <h1>You need to load a save first</h1>
                    )}
                settingsManager={settingsManager}
            ></NavbarDrawer>
        </div>
        </>
    )
}

// The content of the ID page
const UnlockableContent = ({unlockableItems}: {unlockableItems: UnlockableItem[]}): JSX.Element => {
    // The handled data
    const [currentSearch, setCurrentSearch] = useState<string>("");
    const [matchingItems, setMatchingItems] = useState<UnlockableItem[]>(unlockableItems);
  
    // Handles the current search.
    function handleCurrentSelected(event: ChangeEvent<HTMLInputElement>) {
        var value = event.target.value
        
        setCurrentSearch(value);
        
        if (value === '') {
            setMatchingItems(unlockableItems);
        } else {
            setMatchingItems(getAllMatchingItems(value));
        }
    } 

    function getAllMatchingItems(value: string): UnlockableItem[] {
        let matching: UnlockableItem[] = [];

        for (let i = 0; i < unlockableItems.length; i++) {
            if (unlockableItems[i].name.toLocaleLowerCase().includes(value.toLocaleLowerCase())) {
                matching.push(unlockableItems[i]);
            }
        }

        return matching;
    }
  
    return (
        <>
            <div className="id-list-container">
                <ThemeProvider theme={searchbarTheme}>
                    <TextField
                        label="Search"
                        variant="outlined"
                        type="text"
                        value={currentSearch}
                        onChange={handleCurrentSelected}
                        InputLabelProps={{
                            sx: {
                                color: "#899994",
                                "&.Mui-focused": { color: "#e9eecd" }
                            },
                        }}
                        sx={{
                            width: '100%'
                        }}
                    />

                </ThemeProvider>

                <VirtualizedList items={matchingItems} minWidth={360} />
            </div>
        </>
    )
  }
  
  // Represents the collapsed nested list.
  // Using FixedSizedList instead of normal list to improve performance when opening a bracket.
  const VirtualizedList = ({
    items,
    minWidth,
  }: {
    items: UnlockableItem[];
    minWidth: number;
  }): JSX.Element => { 
    // Represents the row of the collapsed nested list.
    const VirtualizedRow = ({ item, style }: { item: UnlockableItem; style: React.CSSProperties }) => {
      return (
        <>
          <ListItemButton key={item.index} sx={{ pl: 4, minWidth: 360 }} style={style}>
            <ListItemIcon>
              <LockOpenIcon sx={{color: '#e9eecd'}}/>
            </ListItemIcon>
            <ListItemText primary={item.name} />
          </ListItemButton>
        </>
      );
    };
  
    return (
      <>
      <Box sx={{ height: '100%', minWidth: minWidth }}>
        <FixedSizeList
          height={500}
          width='100%'
          itemSize={60}
          itemCount={items?.length || 0}
          className='fixedSizeListContainer'
        >
          {({ index, style }) => (
            <>
              <VirtualizedRow item={items[index]} style={style} />
            </>
          )}
        </FixedSizeList>
      </Box>
      </>
    );
  };

const searchbarTheme = createTheme({
    palette: {
        mode: 'dark',
    },
    components: {
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
    }
});