import './campaign-page.css'
import { NavbarDrawer } from '../../components/navbar-drawer/navbar-drawer'

export const CampaignPage = (): JSX.Element => {
    return (
        <>
        <div className="container">
            <NavbarDrawer pagename={"Campaign"} pagecontent={<h1>Welcome to CampaignPage</h1>}></NavbarDrawer>
        </div>
        </>
    )
}