import './main-page.css';
import { NavbarDrawer } from '../../components/navbar-drawer/navbar-drawer';
import { IdData, SaveFile } from '../../models/save-models';
import { Backdrop, Box, Button, Card, CardActions, CardContent, CardHeader, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, Typography, createTheme } from '@mui/material';
import { ThemeProvider } from '@emotion/react';
import { open, save } from '@tauri-apps/api/dialog';
import { writeBinaryFile } from '@tauri-apps/api/fs';
import { invoke } from "@tauri-apps/api/tauri";
import { Fragment, useEffect, useState } from 'react';
import { listen } from '@tauri-apps/api/event';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { SettingsManager } from 'tauri-settings';
import { SettingsSchema } from '../../models/settings-schema';
import { useNavigate } from 'react-router-dom';

export const MainPage = ({currentSaveFile, setCurrentSaveFile, setIdData, settingsManager}: {currentSaveFile: SaveFile | undefined, setCurrentSaveFile: Function, setIdData: Function, settingsManager: SettingsManager<SettingsSchema>}): JSX.Element => {    
    const [isNew, setIsNew] = useState<boolean>(false);
    const navigate = useNavigate();

    async function handleChangeIsNew(option: boolean) {
        settingsManager.setCache('isNewToEditor', option);
        await settingsManager.syncCache();
        setIsNew(option)

        navigate('/knowledge-vault')
    }

    async function skipTutorial(option: boolean) {
        settingsManager.setCache('isNewToEditor', option);
        await settingsManager.syncCache();
        setIsNew(option)
    }
    
    return (
        <>
            {isNew ? (
                <ThemeProvider theme={newToTheEditorTheme}>
                    <Dialog
                    open={true}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description">
                    <DialogTitle sx={{color: '#e9eecd'}}>
                    {"New to the Editor?"}
                    </DialogTitle>
                    <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        If you are new to using the Editor, welcome! 
                        I know the process might seem overwhelming at first, but if you follow the steps below, using the Editor should become a breeze.
                        You will get directed to the Knowledge Vault. This is a collection where all information regarding this Editor (for example the Tutorial, QnA and more) is stored.
                    </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button variant='text' disableElevation onClick={() => skipTutorial(!isNew)}>Skip Tutorial</Button>
                        <Button variant='outlined'onClick={() => handleChangeIsNew(!isNew)} autoFocus>
                            Getting Started
                        </Button>
                    </DialogActions>
                </Dialog>
                </ThemeProvider>
            ): (
                <div className="container">
                    <NavbarDrawer pagename={"Main"} pagecontent={<MainContent currentSaveFile={currentSaveFile} setCurrentSaveFile={setCurrentSaveFile} setIdData={setIdData} settingsManager={settingsManager}/>} settingsManager={settingsManager}></NavbarDrawer>
                </div>
            )}
        </>
    )
}

const MainContent = ({currentSaveFile, setCurrentSaveFile, setIdData, settingsManager}: {currentSaveFile: SaveFile | undefined, setCurrentSaveFile: Function, setIdData: Function, settingsManager: SettingsManager<SettingsSchema>}): JSX.Element => {    
    const [isOpen, setOpen] = useState(false);
    const [isOpeningSave, setOpeningSave] = useState(false);
    const [currentSavePath, setCurrentSavePath] = useState('');
    const [catchedError, setCatchedError] = useState<string>();
    const [isDebug, setIsDebug] = useState<boolean>(settingsManager ? true : true)
    const [hasAutomaticBackup, setAutomaticBackup] = useState<boolean>(settingsManager ? true : true)
    setIsDebug(true)
    setAutomaticBackup(true)

    useEffect(() => {
        handleSetIdData();
      }, []);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setOpeningSave(false);
    };

    const handleCloseErrorMessage = () => {
        setCatchedError(undefined);
    }
    
    const handleResetSave = () => {
        setCurrentSaveFile(undefined);
        setCurrentSavePath('');
        handleClose();
    };

    async function handleSetIdData() {
        await setIdData(await invoke<IdData>("get_ids", {}))
    }

    async function selectCurrentSaveFile() {
        let filepath = await open({
            multiple: false,
            filters: [{
              name: 'SAV File',
              extensions: ['sav']
            }],
        });
      
        if (filepath != null && !Array.isArray(filepath)) {
            let newSave = await invoke<SaveFile>("load_save", {file_path: filepath, is_debugging: isDebug, has_automatic_backup: hasAutomaticBackup}).catch((err) => {
              setCatchedError(err);
            });

            await setCurrentSaveFile(newSave);
            await handleSetIdData();
        };

        setOpeningSave(false);
    }

    async function handleCurrentSaveFile() {
        setOpeningSave(true);
        listenDragDrop()
    };

    async function listenDragDrop() {
        listen<string>('tauri://file-drop', async event => {
            let filepath = event.payload[0];

            setCurrentSavePath(filepath);
        })
    }

    async function continueWithCurrentFile() {
        if (currentSavePath.length == 0) {
            return;
        }

        let newSave = await invoke<SaveFile>("load_save", {file_path: currentSavePath, is_debugging: isDebug, has_automatic_backup: hasAutomaticBackup}).catch((err) => {
              setCatchedError(err);
            });
        
        setCurrentSaveFile(newSave);
        await handleSetIdData();

        setOpeningSave(false);
    }

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

        setOpeningSave(false);
    }

    async function exportForPC() {
        let filePath = await save({
            defaultPath: '/save_main_0.sav',
            filters: [{
              name: 'SAV File',
              extensions: ['sav']
            }],
        });

        if(filePath != null && currentSaveFile != undefined) {
            // Save data to file   
            let compressed = await invoke<Uint8Array>('export_for_pc', {data: currentSaveFile.file_content})
            await writeBinaryFile(filePath, compressed);
        }

        setOpeningSave(false);
    }

    async function importFromPC() {
        let filepath = await open({
            multiple: false,
            filters: [{
              name: 'SAV File',
              extensions: ['sav']
            }],
        });
      
        if (filepath != null && !Array.isArray(filepath)) {
            let newSave = await invoke<SaveFile>("load_save_pc", {file_path: filepath, is_debugging: isDebug, has_automatic_backup: hasAutomaticBackup}).catch((err) => {
              setCatchedError(err);
            });
            
            await setCurrentSaveFile(newSave);
            await handleSetIdData();
        };

        setOpeningSave(false);
    }


    return (
        <>
            <ThemeProvider theme={cardTheme}>
                <Card>
                    <CardHeader>Current Save:</CardHeader>
                    <CardContent sx={{height: '70vh'}}>
                    <Box sx={{height: '100%', overflow: 'scroll', display: 'flex', flexDirection: 'column', textAlign: 'left'}}>
                        <Typography gutterBottom variant="h6" component="div" sx={{ height: 50, display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
                            Selected File: {currentSaveFile?.path}
                        </Typography>
                        <Typography gutterBottom variant="h6" component="div" sx={{ height: 50, marginTop: '20px', display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
                            File Size: {currentSaveFile?.file_content.length} Bytes
                        </Typography>
                        <Divider/>
                    </Box>
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
                                    to the save will be lost. If this is not your intention, please save before continuing. 
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
                        <Button onClick={() => exportForPC()} variant='outlined' disabled={currentSaveFile !== undefined ? false : true}>Compress / Export for PC</Button>
                        <Button onClick={() => importFromPC()} variant='outlined'>Decompress / Load from PC</Button>
                    </CardActions>
                </Card> 
            </ThemeProvider>


            <ThemeProvider theme={loadSaveCardTheme}>
                <Backdrop
                    sx={{ 
                        color: '#fff', 
                        zIndex: (theme) => theme.zIndex.drawer + 1 
                    }}
                    open={isOpeningSave}
                    onClick={() => setOpeningSave(false)}
                >
                    <Card onClick={(e) => {
                            e.stopPropagation; 
                            e.preventDefault();
                            e.nativeEvent.stopPropagation();
                            e.nativeEvent.stopImmediatePropagation();
                        }} variant='outlined'>
                        <CardContent 
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                maxWidth: '70vw'
                            }}
                        >
                            <Card>
                                <CardContent>
                                    <UploadFileIcon/>
                                    <Typography gutterBottom variant="h5" component="div">
                                        Drag your <strong>.sav</strong> file here 
                                    </Typography>

                                    <Typography gutterBottom variant="body1" component="div">
                                        {currentSavePath}
                                    </Typography>
                                    
                                    <Button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            selectCurrentSaveFile();
                                        }}
                                        sx={{
                                            marginTop: '40px'
                                        }}
                                    >
                                        Pick a Save manually
                                    </Button>
                                </CardContent>

                            </Card>
                            
                            <Button 
                                sx={{
                                    marginTop: '30px'
                                }} 
                                disabled={currentSavePath == '' ? true : false} onClick={continueWithCurrentFile}>Continue with selected Save</Button>
                        </CardContent>
                    </Card>
                </Backdrop>
            </ThemeProvider>

            <ThemeProvider theme={newToTheEditorTheme}>
                <Dialog
                    open={catchedError ? true : false}
                    onClose={handleCloseErrorMessage}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description">
                    <DialogTitle sx={{color: '#e33e2c'}}>
                    {'Error'}
                    </DialogTitle>
                    <DialogContent>
                    <DialogContentText sx={{color: '#e9eecd'}}>
                        {catchedError}
                    </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button variant='outlined' disableElevation onClick={handleCloseErrorMessage} autoFocus>
                            I understand
                        </Button>
                    </DialogActions>
                </Dialog>
            </ThemeProvider>
        </>
    )
}

const newToTheEditorTheme = createTheme({
    palette: {
        mode: 'dark'
    },
    components: {
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
                    color: '#e9eecd',
                }
            }
        }
    }
})

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

const loadSaveCardTheme = createTheme({
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
})
