import './ids-page.css'
import { NavbarDrawer } from '../../components/navbar-drawer/navbar-drawer'

export const IDsPage = (): JSX.Element => {
    return (
        <>
        <div className="background"></div>
        <div className="container">
            <NavbarDrawer pagename={"IDs"}></NavbarDrawer>
        </div>
        </>
    )
}