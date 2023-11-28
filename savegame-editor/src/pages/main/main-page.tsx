import './main-page.css';
import { NavbarDrawer } from '../../components/navbar-drawer/navbar-drawer';
import { IdData, SaveFile } from '../../models/save-models';
import { Backdrop, Button, Card, CardActions, CardContent, CardHeader, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Typography, createTheme } from '@mui/material';
import { ThemeProvider } from '@emotion/react';
import { open, save } from '@tauri-apps/api/dialog';
import { writeBinaryFile } from '@tauri-apps/api/fs';
import { invoke } from "@tauri-apps/api/tauri";
import { Fragment, useState } from 'react';

export const MainPage = ({currentSaveFile, setCurrentSaveFile, setIdData}: {currentSaveFile: SaveFile | undefined, setCurrentSaveFile: Function, setIdData: Function}): JSX.Element => {    
    return (
        <>
            <div className="container">
                <NavbarDrawer pagename={"Main"} pagecontent={<MainContent currentSaveFile={currentSaveFile} setCurrentSaveFile={setCurrentSaveFile} setIdData={setIdData}/>}></NavbarDrawer>
            </div>
        </>
    )
}

const MainContent = ({currentSaveFile, setCurrentSaveFile, setIdData}: {currentSaveFile: SaveFile | undefined, setCurrentSaveFile: Function, setIdData: Function}): JSX.Element => {    
    const [isOpen, setOpen] = useState(false);
    const [isLoadingSave, setLoadingSave] = useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };
    
    const handleResetSave = () => {
        setCurrentSaveFile(undefined);
        handleClose();
    };

    async function handleSetIdData() {
        await setIdData(await invoke<IdData>("get_ids", {}))
    }

    async function handleCurrentSaveFile() {
        setLoadingSave(true);

        let filepath = await open({
            multiple: false,
            filters: [{
              name: 'SAV File',
              extensions: ['sav']
            }],
        });
      
        if (filepath != null && !Array.isArray(filepath)) {
            setCurrentSaveFile(await invoke<SaveFile>("load_save", {file_path: filepath}));
            await handleSetIdData();
        };

        setLoadingSave(false);
    };

    async function saveCurrentSaveFile() {
        let filePath = await save({
            defaultPath: '/save_main_0.sav',
            filters: [{
              name: 'SAV File',
              extensions: ['sav']
            }],
        });

        if(filePath != null && currentSaveFile != undefined) {
            // Save data to file
            await writeBinaryFile(filePath, currentSaveFile.file_content);
        }
    }

    return (
        <>
            <ThemeProvider theme={cardTheme}>
                <Card>
                    <CardHeader>Current Save:</CardHeader>
                    <CardContent sx={{height: '70vh'}}>
                        <Typography gutterBottom variant="h6" component="div" sx={{ height: 50, display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
                            Selected File: {currentSaveFile?.path}
                        </Typography>
                        <Typography gutterBottom variant="h6" component="div" sx={{ height: 50, display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
                            File Size: {currentSaveFile?.file_content.length} Bytes
                        </Typography>
                    </CardContent>
                    <CardActions>                      
                        <Fragment>
                            <Button disableElevation onClick={handleClickOpen}>
                                Reset
                            </Button>
                            <Dialog
                                open={isOpen}
                                onClose={handleClose}
                                aria-labelledby="alert-dialog-title"
                                aria-describedby="alert-dialog-description">
                                <DialogTitle id="alert-dialog-title">
                                {"Are you sure that you want to reset?"}
                                </DialogTitle>
                                <DialogContent>
                                <DialogContentText id="alert-dialog-description">
                                    When resetting, the current save will be deselcted. This means that all unsaved changes
                                    to the save will be lost.If this is not your intention, please save before continuing. 
                                </DialogContentText>
                                </DialogContent>
                                <DialogActions>
                                    <ThemeProvider theme={dialogButtonTheme}>
                                        <Button variant='text' disableElevation onClick={handleClose}>Go Back</Button>
                                        <Button variant='outlined' onClick={() => handleResetSave()} autoFocus>
                                            Reset
                                        </Button>
                                    </ThemeProvider>
                                </DialogActions>
                            </Dialog>
                            </Fragment>

                        <Button onClick={() => handleCurrentSaveFile()} variant='outlined'>Load Save</Button>
                        <Button onClick={() => saveCurrentSaveFile()} variant='outlined' disabled={currentSaveFile !== undefined ? false : true}>Save current Changes</Button>
                    </CardActions>
                </Card> 
            </ThemeProvider>

            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={isLoadingSave}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
        </>
    )
}

const cardTheme = createTheme({
    palette: {
        mode: 'dark',
      },
    components: {
        MuiCard: {
            styleOverrides: {
                root: {
                    backgroundColor: '#00000090',
                    color: '#e9eecd',
                }
            }
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    margin: '0 10px',
                },
                outlined: {
                    color: '#e9eecd', 
                    borderColor: '#e9eecd',
                    '&:hover': {
                        borderColor: '#e9eecd',
                        color: '#526264',
                        backgroundColor: '#e9eecd',
                    },
                    '&:disabled': {
                        borderColor: '#526264',
                        color: '#526264',
                    }
                },
                text: {
                    backgroundColor: 'transparent',
                    color: '#e33e2c',
                    '&:hover': {
                        borderColor: '#e9eecd',
                        color: '#e9eecd',
                        backgroundColor: '#e33e2c',
                    }
                }
            }
        },
        MuiDialog: {
            styleOverrides: {
                paper: {
                    backgroundColor: 'black',
                }
            }
        },
        MuiTypography: {
            styleOverrides: {

            }
        }
    }
})

const dialogButtonTheme = createTheme({
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    margin: '0 10px',
                },
                outlined: {
                    color: '#e33e2c', 
                    borderColor: '#e33e2c',
                    '&:hover': {
                        borderColor: '#e33e2c',
                        color: '#e9eecd',
                        backgroundColor: '#e33e2c',
                    },
                    '&:disabled': {
                        borderColor: '#526264',
                        color: '#526264',
                    }
                },
                text: {
                    backgroundColor: 'transparent',
                    color: '#e33e2c',
                }
            }
        },
    }
});