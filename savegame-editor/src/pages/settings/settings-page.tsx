import './settings-page.css'
import { NavbarDrawer } from '../../components/navbar-drawer/navbar-drawer'
import { SettingsManager } from 'tauri-settings';
import { Button } from '@mui/material';

export const SettingsPage = (): JSX.Element => {
    return (
        <>
        <div className="container">
            <NavbarDrawer pagename={"Settings"} pagecontent={<SettingsContent/>}></NavbarDrawer>
        </div>
        </>
    )
}

const SettingsContent = () => {
    type Schema = {
        theme: 'dark' | 'light';
        startFullscreen: boolean;
    }

    const settingsManager = new SettingsManager<Schema>(
        { // defaults
            theme: 'light',
            startFullscreen: true
        },
        { // options
            fileName: 'customization-settings'
        }
    );

    async function initManager() {
        // checks whether the settings file exists and created it if not
        // loads the settings if it exists
        settingsManager.initialize();
    }

    const changeTheme = () => {
        settingsManager.setCache('theme', 'dark');
    }
    
    const getIsDebug = () => {
        var res = settingsManager.getCache('theme')
        console.log("SettingsManger Theme: ", res)
    }

    async function saveSettings() {
        await settingsManager.syncCache();
    }
    

    return(
        <>
            <Button onClick={initManager}>INIT</Button>
            <Button onClick={changeTheme}>Change</Button>
            <Button onClick={getIsDebug}>Log</Button>
            <Button onClick={saveSettings}>SAVE</Button>
        </>
    )
}