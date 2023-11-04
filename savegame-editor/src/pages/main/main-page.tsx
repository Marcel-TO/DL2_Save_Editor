import { NavbarDrawer } from '../../components/navbar-drawer/navbar-drawer'
import './main-page.css'

export const MainPage = (): JSX.Element => {
    return (
        <>
        <div className="background"></div>
        <div className="container">
            <div className="navbar">
                <NavbarDrawer pagename={"Main"}></NavbarDrawer>
            </div>
        </div>
        </>
    )
}