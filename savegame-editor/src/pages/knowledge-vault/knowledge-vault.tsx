import './knowledge-vault.css'

import { NavbarDrawer } from '../../components/navbar-drawer/navbar-drawer'
import { EmblaOptionsType } from 'embla-carousel'
import EmblaCarousel from '../../components/embla-carousel/embla-carousel'

export const KnowledgeVaultPage = (): JSX.Element => {
    return (
        <>        
        <div className="caz-outpost"></div>

        <div className="container">
            <NavbarDrawer pagename={"Knowledge Vault"} pagecontent={<KnowledgeVaultContent/>}></NavbarDrawer>
        </div>
        </>
    )
}

const KnowledgeVaultContent = (): JSX.Element => {    
    const knowledge: [string, string][] = [
        ['Tutorial', 'https://github.com/Marcel-TO/DL2_Save_Editor/blob/main/Tutorial.md'],
        ['Commonly Asked Questions', 'https://github.com/Marcel-TO/DL2_Save_Editor/blob/main/CommonlyAskedQuestions.md'],
        ['Road to Save Editing', 'https://github.com/Marcel-TO/DL2_Save_Editor/blob/main/CommonlyAskedQuestions.md'], 
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