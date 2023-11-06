import './campaign-page.css'
import { NavbarDrawer } from '../../components/navbar-drawer/navbar-drawer'

export const CampaignPage = (): JSX.Element => {
    return (
        <>
        <div className="container">
            <NavbarDrawer pagename={"Campaign"}></NavbarDrawer>
        </div>
        </>
    )
}