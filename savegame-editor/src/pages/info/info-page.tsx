import './info-page.css'
import { NavbarDrawer } from '../../components/navbar-drawer/navbar-drawer'
import { Box, Chip, Typography, createTheme } from '@mui/material'
import ContributorsAvatar from '../../components/contributors/contributors-avatar'
import { useEffect, useState } from 'react'
import { ThemeProvider } from '@emotion/react'
import { SettingsManager } from 'tauri-settings'
import { SettingsSchema } from '../../models/settings-schema'

export const InfoPage = ({settingsManager}: {settingsManager: SettingsManager<SettingsSchema>}): JSX.Element => {
    return (
        <>
            <div className="page-container">
                <NavbarDrawer pagename={"Info"} pagecontent={infoDetails()} settingsManager={settingsManager}></NavbarDrawer>
            </div>
        </>
    )
}

const infoDetails = (): JSX.Element => {
    const [amountOfDownloads, setAmountOfDownloads] = useState(0);

    useEffect(() => {
        const fetchReleaseInfo = async () => {
            try {
                const response = await fetch(
                    'https://api.github.com/repos/Marcel-TO/DL2_Save_Editor/releases'
                );

                if (!response.ok) {
                    throw new Error('Failed to fetch release information');
                }

                const releases = await response.json();

                // Calculate total downloads for all releases and assets
                const downloads = releases.reduce((total: any, release: { assets: any[] }) => {
                    return (
                        total +
                        release.assets.reduce((assetTotal: any, asset: { download_count: any }) => {
                            return assetTotal + asset.download_count;
                        }, 0)
                    );
                }, 0);

                setAmountOfDownloads(downloads);
            } catch (error) {
                console.error('Error fetching GitHub release information:', error);
            }
        };

        fetchReleaseInfo();
    }, []);

    return (
        <>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography variant="h1" component="h1">
                    Greetings Pilgrim!
                </Typography>
                <Typography paragraph align='center' sx={{ marginTop: '50px' }}>
                    We are thrilled to present the Open-Source Save Editor for the Videogame <strong><i>Dying Light 2</i></strong>. This tool allows players to take control of their game saves, unlocking a realm of possibilities and customization.
                </Typography>

                <Typography variant="h2" component="h1" sx={{ marginTop: '50px' }}>
                    What has the Editor to offer?
                </Typography>
                <Typography paragraph align='left' sx={{ marginTop: '50px' }}>
                    <ol type='I' style={{ maxWidth: '600px' }}>
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

                <Typography variant="h2" component="h1" sx={{ marginTop: '50px' }}>
                    Key Features
                </Typography>
                <Typography paragraph align='left' sx={{ marginTop: '50px' }}>
                    <ul style={{ maxWidth: '600px' }}>
                        <li>All Skills can be adjusted and manipulated. </li>
                        <li>An Index visualization of all IDs currently inside the game.</li>
                        <li>Items can be repaired or switched (currently still limited due to the savefile size).</li>
                        <li>Change Inventory Item Stats (Level, Seed, Amount, Durability)</li>
                        <li>Swap Inventory Weapons</li>
                        <li>Change Skill Values</li>
                        <li>Use Templates (for example: to add max durability to all weapons)</li>
                        <li>Compress/Decompress Feature</li>
                    </ul>
                </Typography>

                <Typography variant="h2" component="h1" sx={{ marginTop: '50px' }}>
                    Planned Features
                </Typography>
                <Typography paragraph align='left' sx={{ marginTop: '50px' }}>
                    <ul style={{ maxWidth: '600px' }}>
                        <li>Calculating savefile size to switch to every desired weapon or remove an item.</li>
                        <li>Change Mods</li>
                        <li>Gallery View for items</li>
                        <li>Edit Backpack</li>
                        <li>Caz Outpost (Stay tuned to learn more about it)</li>
                        <li>Automatically update IDs</li>
                    </ul>
                </Typography>

                <Typography variant="h2" component="h1" sx={{ marginTop: '50px' }}>
                    Contributors
                </Typography>
                <Typography paragraph align='center'>
                    Currently there are 2 contributers that work hard to increase the experience of Dying Light 2. With the help of Caz`s incredible knowledge of savegamefiles and the coding experience of Marcel, the Editor is not only extremely useful, but has a modern UI with Dying Light 2 themed content. A special thanks to Batang as well. He supported us all the time and played a crucial role for the completion of this editor.
                </Typography>
                <ContributorsAvatar />

            </Box>

            <ThemeProvider theme={chipTheme}>
                <Chip
                    sx={{
                        position: 'fixed',
                        bottom: '0',
                        right: '0',
                        margin: '1rem'
                    }}
                    label={`Total Downloads: ${amountOfDownloads}`}
                />
            </ThemeProvider>
        </>
    )
}

const chipTheme = createTheme({
    components: {
        MuiChip: {
            styleOverrides: {
                root: {
                    borderColor: '#e9eecd',
                    color: '#899994',
                    backgroundColor: '#526264',

                }
            }
        }
    }
});