import './debug-page.css'
import { NavbarDrawer } from '../../components/navbar-drawer/navbar-drawer'
import { SettingsManager } from 'tauri-settings'
import { SettingsSchema } from '../../models/settings-schema'

export const DebugPage = ({settingsManager}: {settingsManager: SettingsManager<SettingsSchema>}): JSX.Element => {
    return (
        <>
        <div className="container">
            <NavbarDrawer pagename={"Debug"} pagecontent={<DebugContent/>} settingsManager={settingsManager}></NavbarDrawer>
        </div>
        </>
    )
}

const DebugContent = () => {
    return(
        <>
        </>
    )
}