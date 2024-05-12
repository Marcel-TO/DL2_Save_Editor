import './settings-page.css'
import { NavbarDrawer } from '../../components/navbar-drawer/navbar-drawer'
import { SettingsSchema } from '../../models/settings-schema';
import { SettingsManager } from 'tauri-settings';
import { Box, Button, Divider, Switch, Typography } from '@mui/material';
import { useState } from 'react';

export const SettingsPage = ({settingsManager}: {settingsManager: SettingsManager<SettingsSchema>}): JSX.Element => {
    return (
        <>
        <div className="container">
            <NavbarDrawer pagename={"Settings"} pagecontent={<SettingsContent settingsManager={settingsManager}/>}></NavbarDrawer>
        </div>
        </>
    )
}

const SettingsContent = ({settingsManager}: {settingsManager: SettingsManager<SettingsSchema>}) => {
    const [isDebug, setIsDebug] = useState<boolean>(settingsManager.settings.debugMode)

    const changeDebugSetting = (option: boolean) => {
        setIsDebug(option)
        settingsManager.setCache('debugMode', option);
    }
    
    const getIsDebug = () => {
        var res = settingsManager.getCache('debugMode')
        console.log("SettingsManger Theme: ", res)
    }

    async function saveSettings() {
        await settingsManager.syncCache();
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

            <Button onClick={getIsDebug}>Log Debug</Button>
            <Button onClick={saveSettings}>Save Settings</Button>
        </>
    )
}