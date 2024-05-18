import './start-page.css'
import { SettingsManager } from 'tauri-settings'
import { SettingsSchema } from '../../models/settings-schema'
import { NavbarDrawer } from '../../components/navbar-drawer/navbar-drawer'
import { ThemeProvider } from '@emotion/react'
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, createTheme } from '@mui/material'
import { Link } from 'react-router-dom'
import { useState } from 'react'

export const StartPage = ({settingsManager, redirectPath, setRedirectPath}: {settingsManager: SettingsManager<SettingsSchema>, redirectPath: string, setRedirectPath: Function}): JSX.Element => {
    return (
        <>
        <div className="container">
            <NavbarDrawer pagename={"Start"} pagecontent={<StartContent settingsManager={settingsManager} redirectPath={redirectPath} setRedirectPath={setRedirectPath}/>} settingsManager={settingsManager}></NavbarDrawer>
        </div>
        </>
    )
}

const StartContent = ({settingsManager, redirectPath, setRedirectPath}: {settingsManager: SettingsManager<SettingsSchema>, redirectPath: string, setRedirectPath: Function}): JSX.Element => {
    const [isNew, setIsNew] = useState<boolean>(settingsManager ? settingsManager.settings && settingsManager.settings.isNewToEditor : false)

    
    return (
        <>
            {isNew ? (
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
                </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <ThemeProvider theme={dialogButtonTheme}>
                        <Button variant='outlined' component={Link} to={'/main'} autoFocus>
                            Start Editing
                        </Button>
                    </ThemeProvider>
                </DialogActions>
            </Dialog>
            ): (
            <Dialog
                open={true}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description">
                <DialogTitle sx={{color: '#e9eecd'}}>
                {"Welcome to the Dying Light 2 Save Editor"}
                </DialogTitle>
                <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    This tool allows you to take control of your game save, unlocking a realm of possibilities and customization. 
                    It is fully open source, so if you like to change something or want to collaborate to improve the experience for all.
                </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <ThemeProvider theme={dialogButtonTheme}>
                        <Button variant='outlined' component={Link} to={'/redirect'} autoFocus>
                            Start Editing
                        </Button>
                    </ThemeProvider>
                </DialogActions>
            </Dialog>
            )}
        </>
    )
}

const dialogButtonTheme = createTheme({
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
                    color: '#e33e2c',
                }
            }
        },
    }
});