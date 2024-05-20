import './player-page.css'
import { NavbarDrawer } from '../../components/navbar-drawer/navbar-drawer'
import { SettingsManager } from 'tauri-settings'
import { SettingsSchema } from '../../models/settings-schema'

export const PlayerPage = ({settingsManager}: {settingsManager: SettingsManager<SettingsSchema>}): JSX.Element => {
    return (
        <>
        <div className="container">
            <NavbarDrawer pagename={"Player"} pagecontent={<h1>Welcome to PlayerPage</h1>} settingsManager={settingsManager}></NavbarDrawer>
        </div>
        </>
    )
}