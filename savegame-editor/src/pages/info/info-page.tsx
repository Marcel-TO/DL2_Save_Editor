import './info-page.css'
import { NavbarDrawer } from '../../components/navbar-drawer/navbar-drawer'
import { Box, Typography } from '@mui/material'
import ContributorsAvatar from '../../components/contributors/contributors-avatar'

export const InfoPage = (): JSX.Element => {
    return (
        <>
        <div className="page-container">
            <NavbarDrawer pagename={"Info"} pagecontent={infoDetails()}></NavbarDrawer>
        </div>
        </>
    )
}

const infoDetails = (): JSX.Element => {
    return (
        <>
            <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>             
                <Typography variant="h1" component="h1">
                    Grettings Pilgrim! 
                </Typography>
                <Typography paragraph align='center' sx={{ marginTop: '50px' }}>
                    We are thrilled to present the first beta version of our Open-Source Save Editor for the Videogame <strong><i>Dying Light 2</i></strong>. This tool allows players to take control of their game saves, unlocking a realm of possibilities and customization.
                </Typography>
                
                <Typography variant="h2" component="h1" sx={{marginTop: '50px'}}>
                    What has the Editor to offer?
                </Typography>
                <Typography paragraph align='left' sx={{ marginTop: '50px' }}>
                    <ol type='I' style={{maxWidth: '600px'}}>
                        <li>
                            It is fully open source, fostering a collaborative environment where fellow gamers and developers alike can contribute to its evolution.
                        </li>
                        <li>
                            The whole User Interface is customized for *Dying Light 2* and provides not only functionality but a fitting design.
                        </li>
                        <li>
                            Enhancing the gaming experience is the goal of this editor. The community will therefore play a big role regarding future features.
                        </li>
                    </ol>
                </Typography>

                <Typography variant="h2" component="h1" sx={{marginTop: '50px'}}>
                    Key Features
                </Typography>
                <Typography paragraph align='left' sx={{ marginTop: '50px' }}>
                    <ul style={{maxWidth: '600px'}}>
                        <li>
                            All Skills can be adjusted and manipulated.
                        </li>
                        <li>
                            Items can be repaired or switched (currently still limited due to the savefile size).
                        </li>
                        <li>
                            An Index visualization of all IDs currently inside the game.
                        </li>
                        <li>
                            Full stack consumables
                        </li>
                    </ul>
                </Typography>

                <Typography variant="h2" component="h1" sx={{marginTop: '50px'}}>
                    Planned Features
                </Typography>
                <Typography paragraph align='left' sx={{ marginTop: '50px' }}>
                    <ul style={{maxWidth: '600px'}}>
                        <li>
                            Calculating savefile size to switch to every desired weapon.
                        </li>
                        <li>
                            Change Mods
                        </li>
                        <li>
                            Change Stats
                        </li>
                    </ul>
                </Typography>

                <Typography variant="h2" component="h1" sx={{marginTop: '50px'}}>
                    Contributors
                </Typography>
                <Typography paragraph align='center'>
                Currently there are 2 contributers that work hard to increase the experience of Dying Light 2. With the help of Caz`s incredible knowledge of savegamefiles and the coding experience of Marcel, the Editor is not only extremely useful, but has a modern UI with Dying Light 2 themed content. A special thanks to Batang as well. He supported us all the time and played a crucial role for the completion of this editor.
                </Typography>
                <ContributorsAvatar/>
            </Box>
        </>
    )
}