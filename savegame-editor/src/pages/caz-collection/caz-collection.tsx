import './caz-collection.css'

import { NavbarDrawer } from '../../components/navbar-drawer/navbar-drawer'
import { SettingsManager } from 'tauri-settings'
import { SettingsSchema } from '../../models/settings-schema'

export const CazCollectionPage = ({settingsManager}: {settingsManager: SettingsManager<SettingsSchema>}): JSX.Element => {
    return (
        <>        
        <div className="caz-outpost"></div>

        <div className="container">
            <NavbarDrawer pagename={"Caz Collection"} pagecontent={<CollectionContent/>} settingsManager={settingsManager}></NavbarDrawer>
        </div>
        </>
    )
}

const CollectionContent = (): JSX.Element => {    
    return (
        <>
        </>
    )
}