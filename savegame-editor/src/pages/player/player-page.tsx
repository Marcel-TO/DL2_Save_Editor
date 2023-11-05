import './player-page.css'
import { NavbarDrawer } from '../../components/navbar-drawer/navbar-drawer'

export const PlayerPage = (): JSX.Element => {
    return (
        <>
        <div className="background"></div>
        <div className="container">
            <NavbarDrawer pagename={"Player"}></NavbarDrawer>
        </div>
        </>
    )
}