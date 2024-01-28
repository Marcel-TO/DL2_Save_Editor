import './knowledge-vault.css'

import { NavbarDrawer } from '../../components/navbar-drawer/navbar-drawer'
import { Box, Grid } from '@mui/material'
import { Link } from 'react-router-dom'

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

    return (
        <>
            <div className="knowledge-vault-container">
            <Grid container spacing={4} sx={{ marginTop: 1, gridTemplateColumns: 'repeat(3, 1fr)' }}>
                {knowledge.map(([name, link]) => (
                    <a href={link}>{name}</a>
                    ))}
            </Grid>
                
            </div>
        </>
    )
}