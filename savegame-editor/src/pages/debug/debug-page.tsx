import './debug-page.css'
import { NavbarDrawer } from '../../components/navbar-drawer/navbar-drawer'
import { SettingsManager } from 'tauri-settings'
import { SettingsSchema } from '../../models/settings-schema'
import { SaveFile } from '../../models/save-models'
import { Box, Button, Card, CardActions, CardContent, CardHeader, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Slide, Snackbar, ThemeProvider, Typography, createTheme } from '@mui/material'
import { Fragment, useState } from 'react'
import { FixedSizeList } from 'react-window'

export const DebugPage = ({settingsManager, currentSaveFile}: {settingsManager: SettingsManager<SettingsSchema>, currentSaveFile: SaveFile | undefined}): JSX.Element => {
    return (
        <>
        <div className="container">
            <NavbarDrawer pagename={"Debug"} pagecontent={<DebugContent currentSaveFile={currentSaveFile}/>} settingsManager={settingsManager}></NavbarDrawer>
        </div>
        </>
    )
}

const DebugContent = ({currentSaveFile}: {currentSaveFile: SaveFile | undefined}) => {    
    return(
        <>
            <ThemeProvider theme={debugTheme}>
                <Card>
                    <CardContent sx={{height: '80vh'}}>
                        <VirtualizedList ids={currentSaveFile? currentSaveFile.log_history : []}/>
                    </CardContent>
                </Card> 
            </ThemeProvider>
        </>
    )
}

// Represents the collapsed nested list.
// Using FixedSizedList instead of normal list to improve performance when opening a bracket.
const VirtualizedList = ({
    ids
  }: {
    ids: string[];
  }): JSX.Element => {
    // Represents the row of the collapsed nested list.
    const VirtualizedRow = ({ id, style }: { id: string; style: React.CSSProperties }) => {
      return (
        <>
          <ListItemButton key={id} sx={{ pl: 4, minWidth: 360 }} style={style}>
            <ListItemText primary={`Line item ${id}`} />
          </ListItemButton>
        </>
      );
    };
  
    return (
      <>
      <Box sx={{ height: '100%' }}>
        <FixedSizeList
          height={600}
          width='100%'
          itemSize={60}
          itemCount={ids?.length || 0}
          className='fixedSizeListContainer'
        >
          {({ index, style }) => (
            <>
              <VirtualizedRow id={ids[index]} style={style} />
            </>
          )}
        </FixedSizeList>
      </Box>
      </>
    );
  };

const debugTheme = createTheme({
    palette: {
        mode: 'dark'
    },
    components: {
        MuiCard: {
            styleOverrides: {
                root: {
                    color: '#e9eecd',
                }
            }
        },
    }
})