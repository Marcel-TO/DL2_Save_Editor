import './caz-outpost.css'

import { NavbarDrawer } from '../../components/navbar-drawer/navbar-drawer'
import { Box, Button, Slide, Snackbar, Typography } from '@mui/material'
import { Link } from 'react-router-dom';
import { SettingsManager } from 'tauri-settings';
import { SettingsSchema } from '../../models/settings-schema';
import { useState } from 'react';


export const CazOutpostPage = ({settingsManager}: {settingsManager: SettingsManager<SettingsSchema>}): JSX.Element => {
    return (
        <>        
        <div className="caz-outpost"></div>

        <div className="container">
            <NavbarDrawer pagename={"Outpost"} pagecontent={<OutpostContent/>} settingsManager={settingsManager}></NavbarDrawer>
        </div>
        </>
    )
}

const OutpostContent = (): JSX.Element => {  
    // The Properties of the selected id.
    interface SnackProps {
        name: string,
        isOpen: boolean,
    }

    // The handled data
    const [state, setState] = useState<SnackProps>({name: '', isOpen: false});

    // Handles the click event of the snackbar if an id is selected.
    const handleClick = (props: SnackProps) => {
        setState(props);
    };

    // Handles the close event of the snackbar after an id is selected.
    const handleClose = () => {
        setState({
        name: "",
        isOpen: false,
        });
    };  

    return (
        <>
            <div className="caz-outpost-container">
                <Snackbar
                    open={state.isOpen}
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                    onClose={handleClose}
                    TransitionComponent={Slide}
                    message={`${state.name} is still under maintenance. Have patience.`}
                    key={'top' + 'left'}/>
                <Button 
                    sx={{
                        width: '100%',
                        height: '100%',
                        padding: '0',
                        margin: '0'
                    }}
                    onClick={() => handleClick({name: 'Caz Collection', isOpen: true})}
                >
                    <Box sx={{
                        backgroundColor: '#00000050',
                        borderRadius: '50px',
                        width: '100%',
                        height: '100%',
                        // border: '2px solid #e9eecd',
                        border: '2px solid #526264',
                        margin: '3rem',
                        transition: '.2s all',
                        cursor: 'pointer',
                        position: 'relative',
                        display: 'flex',
                        justifyContent: 'center',
                        textAlign: 'center',
                        alignItems: 'center',
                        // '&:hover': {
                        //     '-webkit-box-shadow':'0px 0px 60px 2px rgba(233,238,205,0.41)',
                        //     '-moz-box-shadow': '0px 0px 60px 2px rgba(233,238,205,0.41)',
                        //     'box-shadow': '0px 0px 60px 2px rgba(233,238,205,0.41)',
                        // }
                    }}
                    // component={Link} to={'/caz-collection'}
                    >
                        <Typography sx={{
                            // color: '#e9eecd'
                            color: '#526264'

                        }}
                        variant='h4'
                        >
                            Caz Collection
                        </Typography>
                    </Box>
                </Button>
                
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