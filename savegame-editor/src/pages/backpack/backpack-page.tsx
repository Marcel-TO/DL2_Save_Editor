import './backpack-page.css'
import { NavbarDrawer } from '../../components/navbar-drawer/navbar-drawer'

export const BackpackPage = (): JSX.Element => {
    return (
        <>
        <div className="container">
            <NavbarDrawer pagename={"Backpack"} pagecontent={<h1>Welcome to BackpackPage</h1>}></NavbarDrawer>
        </div>
        </>
    )
}