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
            <Box>
                <Typography variant="h1" component="h1">
                    Hello there, 
                </Typography>                
                <Typography variant="h1" component="h1">
                    fellow Nightrunner! 
                </Typography>
                <Typography paragraph align='center' sx={{marginTop: '50px'}}>
                    Introducing our work-in-progress application, the first public Dying Light 2 Editor! Developed by a dedicated team of two passionate gamers, our editor empowers you to take control of your Dying Light 2 experience like never before. With this tool, you can manipulate stats and customize items to tailor your in-game adventure to your liking. While not all features are implemented just yet, we're committed to continuously improving and expanding our editor to enhance your gaming journey. Stay tuned for updates and join us in shaping your Dying Light 2 experience!
                </Typography>
                <Typography variant="h2" component="h1" sx={{marginTop: '50px'}}>
                    Contributors
                </Typography>
                <Typography paragraph align='center'>
                Currently there are 2 contributers that work hard to increase the experience of Dying Light 2. With the help of Caz`s incredible knowledge of savegamefiles and the coding experience of Marcel, the Editor is not only extremely useful, but has a modern UI with Dying Light 2 themed content.
                </Typography>
                <ContributorsAvatar/>
            </Box>
        </>
    )
}