import './caz-outpost.css'

import { NavbarDrawer } from '../../components/navbar-drawer/navbar-drawer'
import { Box, Typography } from '@mui/material'
import { Link } from 'react-router-dom';
import { SettingsManager } from 'tauri-settings';
import { SettingsSchema } from '../../models/settings-schema';


export const CazOutpostPage = ({settingsManager}: {settingsManager: SettingsManager<SettingsSchema>}): JSX.Element => {
    return (
        <>        
        <div className="caz-outpost"></div>

        <div className="container">
            <NavbarDrawer pagename={"Caz Outpost"} pagecontent={<OutpostContent/>} settingsManager={settingsManager}></NavbarDrawer>
        </div>
        </>
    )
}

const OutpostContent = (): JSX.Element => {    

    return (
        <>
            <div className="caz-outpost-container">
                <Box sx={{
                    backgroundColor: '#00000050',
                    borderRadius: '50px',
                    width: '100%',
                    height: '100%',
                    border: '2px solid #e9eecd',
                    margin: '3rem',
                    transition: '.2s all',
                    cursor: 'pointer',
                    position: 'relative',
                    display: 'flex',
                    justifyContent: 'center',
                    textAlign: 'center',
                    alignItems: 'center',
                    '&:hover': {
                        '-webkit-box-shadow':'0px 0px 60px 2px rgba(233,238,205,0.41)',
                        '-moz-box-shadow': '0px 0px 60px 2px rgba(233,238,205,0.41)',
                        'box-shadow': '0px 0px 60px 2px rgba(233,238,205,0.41)',
                    }
                }}
                component={Link} to={'/caz-collection'}
                >
                    <Typography sx={{
                        color: '#e9eecd'

                    }}
                    variant='h4'
                    >
                        Caz Collection
                    </Typography>
                </Box>
                
                <Box sx={{
                    backgroundColor: '#00000050',
                    borderRadius: '50px',
                    width: '100%',
                    height: '100%',
                    border: '2px solid #e9eecd',
                    margin: '3rem',
                    transition: '.2s all',
                    cursor: 'pointer',
                    position: 'relative',
                    display: 'flex',
                    justifyContent: 'center',
                    textAlign: 'center',
                    alignItems: 'center',
                    '&:hover': {
                        '-webkit-box-shadow':'0px 0px 60px 2px rgba(233,238,205,0.41)',
                        '-moz-box-shadow': '0px 0px 60px 2px rgba(233,238,205,0.41)',
                        'box-shadow': '0px 0px 60px 2px rgba(233,238,205,0.41)',
                    }
                }}
                component={Link} to={'/knowledge-vault'}
                >
                    <Typography sx={{
                        color: '#e9eecd'

                    }}
                    variant='h4'
                    >
                        Knowledge Vault
                    </Typography>
                </Box>
            </div>
        </>
    )
}