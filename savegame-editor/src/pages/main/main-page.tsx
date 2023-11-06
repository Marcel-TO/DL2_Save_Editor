import './main-page.css'
import { NavbarDrawer } from '../../components/navbar-drawer/navbar-drawer'

export const MainPage = (): JSX.Element => {
    return (
        <>
        <div className="container">
            <NavbarDrawer pagename={"Main"}></NavbarDrawer>
        </div>
        </>
    )
}