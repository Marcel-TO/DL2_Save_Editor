import './knowledge-vault.css'

import { NavbarDrawer } from '../../components/navbar-drawer/navbar-drawer'
import { EmblaOptionsType } from 'embla-carousel'
import EmblaCarousel from '../../components/embla-carousel/embla-carousel'
import { SettingsManager } from 'tauri-settings'
import { SettingsSchema } from '../../models/settings-schema'

export const KnowledgeVaultPage = ({settingsManager}: {settingsManager: SettingsManager<SettingsSchema>}): JSX.Element => {
    return (
        <>        
        <div className="caz-outpost"></div>

        <div className="container">
            <NavbarDrawer pagename={"Knowledge Vault"} pagecontent={<KnowledgeVaultContent/>} settingsManager={settingsManager}></NavbarDrawer>
        </div>
        </>
    )
}

const KnowledgeVaultContent = (): JSX.Element => {    
    const knowledge: [string, string][] = [
        ['Getting Started', 'https://marcel-to.notion.site/Getting-Started-with-the-Editor-496ffcc2b46a4f39b6e7ca04ed1b3b32'], 
        ['Tutorial', 'https://marcel-to.notion.site/Tutorial-95ff57c3d2c14314b6e89613f0f14a7a'],
        ['Commonly Asked Questions', 'https://marcel-to.notion.site/Commonly-asked-Questions-QnA-5c05da103a304c3e99b9bc024c35cf7d'],
        ['Prerequisites for Programming', 'https://marcel-to.notion.site/Prerequisites-for-Programming-bcd84864e7e4454283bac25d619015e7'],
        ['The Editor in Detail: Frontend', 'https://marcel-to.notion.site/The-Editor-in-Detail-Frontend-9c72b33073eb43c2acfbf9210ff80c71'],
        ['Video Tutorial', 'https://youtu.be/BfgnVI4v-Jo?si=onXnwUkU9Oc7HEf'],
        ['Feature Release Plan', 'https://github.com/users/Marcel-TO/projects/2/views/2'],
    ];
    
    const OPTIONS: EmblaOptionsType = { loop: true }

    return (
        <>
            <div className="knowledge-vault-container">
            <section className="sandbox__carousel">
                <EmblaCarousel slides={knowledge} options={OPTIONS} />
            </section>

            </div>
        </>
    )
}