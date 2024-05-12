import './backpack-page.css'
import { NavbarDrawer } from '../../components/navbar-drawer/navbar-drawer'
import { SettingsManager } from 'tauri-settings'
import { SettingsSchema } from '../../models/settings-schema'

export const BackpackPage = ({settingsManager}: {settingsManager: SettingsManager<SettingsSchema>}): JSX.Element => {
    return (
        <>
        <div className="container">
            <NavbarDrawer pagename={"Backpack"} pagecontent={<h1>Welcome to BackpackPage</h1>} settingsManager={settingsManager}></NavbarDrawer>
        </div>
        </>
    )
}