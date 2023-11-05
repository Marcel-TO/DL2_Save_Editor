import './backpack-page.css'
import { NavbarDrawer } from '../../components/navbar-drawer/navbar-drawer'

export const BackpackPage = (): JSX.Element => {
    return (
        <>
        <div className="background"></div>
        <div className="container">
            <NavbarDrawer pagename={"Backpack"}></NavbarDrawer>
        </div>
        </>
    )
}