import './settings-page.css'
import { NavbarDrawer } from '../../components/navbar-drawer/navbar-drawer'
import { SettingsSchema } from '../../models/settings-schema';
import { SettingsManager } from 'tauri-settings';
import { Box, Button, Divider, Switch, ThemeProvider, Typography, createTheme } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const SettingsPage = ({settingsManager}: {settingsManager: SettingsManager<SettingsSchema>}): JSX.Element => {
    return (
        <>
        <div className="container">
            <NavbarDrawer pagename={"Settings"} pagecontent={<SettingsContent settingsManager={settingsManager}/>} settingsManager={settingsManager}></NavbarDrawer>
        </div>
        </>
    )
}

const SettingsContent = ({settingsManager}: {settingsManager: SettingsManager<SettingsSchema>}) => {
    const [isDebug, setIsDebug] = useState<boolean>(settingsManager ? settingsManager.settings && settingsManager.settings.debugMode : false)
    const navigate = useNavigate();

    async function changeDebugSetting(option: boolean) {
        setIsDebug(option)
        settingsManager?.setCache('debugMode', option);
        // settingsManager.setCache('isNewToEditor', true);
    }

    async function saveSettings() {
        await settingsManager?.syncCache();
        navigate('/main')
    }
    

    return(
        <>
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'center',
                        width: '60%',
                        alignItems: 'center',
                        margin: '2rem',
                    }}>
                    <Typography sx={{width: '60%'}}>Debug Mode</Typography>
                    <Switch
                        checked={isDebug}
                        onChange={() => changeDebugSetting(!isDebug)}
                        inputProps={{ 'aria-label': 'controlled' }}
                    />
                </Box>
            </Box>
            
            <ThemeProvider theme={settingsTheme}>
                {/* <Button variant='outlined' onClick={getIsDebug}>Log Debug</Button> */}
                <Button variant='outlined' onClick={saveSettings}>Save Settings</Button>
            </ThemeProvider>
        </>
    )
}

const settingsTheme = createTheme({
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