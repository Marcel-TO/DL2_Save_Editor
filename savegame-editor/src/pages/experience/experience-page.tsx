import './experience-page.css'
import { NavbarDrawer } from '../../components/navbar-drawer/navbar-drawer'
import { SettingsManager } from 'tauri-settings'
import { SettingsSchema } from '../../models/settings-schema'

export const ExperiencePage = ({settingsManager}: {settingsManager: SettingsManager<SettingsSchema>}): JSX.Element => {
    return (
        <>
        <div className="container">
            <NavbarDrawer pagename={"Experience"} pagecontent={<h1>Welcome to ExperiencePage</h1>} settingsManager={settingsManager}></NavbarDrawer>
        </div>
        </>
    )
}