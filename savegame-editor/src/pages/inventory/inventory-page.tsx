import './inventory-page.css'
import { NavbarDrawer } from '../../components/navbar-drawer/navbar-drawer'

export const InventoryPage = (): JSX.Element => {
    return (
        <>
        <div className="background"></div>
        <div className="container">
            <NavbarDrawer pagename={"Inventory"}></NavbarDrawer>
        </div>
        </>
    )
}