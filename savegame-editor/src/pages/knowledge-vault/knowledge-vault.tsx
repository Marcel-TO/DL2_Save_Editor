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
        ['Getting Started', 'https://github.com/Marcel-TO/DL2_Save_Editor/wiki/getting-started-with-the-editor'], 
        ['Tutorial', 'https://github.com/Marcel-TO/DL2_Save_Editor/wiki/tutorial'],
        ['Commonly Asked Questions', 'https://github.com/Marcel-TO/DL2_Save_Editor/wiki/commonly-asked-questions-(qna)'],
        ['The Editor in Detail: Frontend', 'https://github.com/Marcel-TO/DL2_Save_Editor/wiki/the-editor-in-detail-%7c-frontend'],
        ['Video Tutorial', 'https://youtu.be/BfgnVI4v-Jo?si=onXnwUkU9Oc7HEf'],
        ['Feature Release Plan', 'https://github.com/users/Marcel-TO/projects/2/views/2'],
    ];
    
    const OPTIONS: EmblaOptionsType = { loop: true }

    return (
        <>
            <div className="knowledge-vault-container">
            {/* <Grid container spacing={4} sx={{ marginTop: 1, gridTemplateColumns: 'repeat(3, 1fr)' }}>
                {knowledge.map(([name, link]) => (
                    <a href={link}>{name}</a>
                    ))}
            </Grid> */}

            <section className="sandbox__carousel">
                <EmblaCarousel slides={knowledge} options={OPTIONS} />
            </section>

            </div>
        </>
    )
}