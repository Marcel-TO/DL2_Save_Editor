import './player-page.css'
import { NavbarDrawer } from '../../components/navbar-drawer/navbar-drawer'

export const PlayerPage = (): JSX.Element => {
    return (
        <>
        <div className="container">
            <NavbarDrawer pagename={"Player"} pagecontent={<h1>Welcome to PlayerPage</h1>}></NavbarDrawer>
        </div>
        </>
    )
}