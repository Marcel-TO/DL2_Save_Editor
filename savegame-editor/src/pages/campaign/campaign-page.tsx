import './campaign-page.css'
import { NavbarDrawer } from '../../components/navbar-drawer/navbar-drawer'
import { SettingsManager } from 'tauri-settings'
import { SettingsSchema } from '../../models/settings-schema'

export const CampaignPage = ({settingsManager}: {settingsManager: SettingsManager<SettingsSchema>}): JSX.Element => {
    return (
        <>
        <div className="container">
            <NavbarDrawer pagename={"Campaign"} pagecontent={<h1>Welcome to CampaignPage</h1>} settingsManager={settingsManager}></NavbarDrawer>
        </div>
        </>
    )
}