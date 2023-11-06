import './experience-page.css'
import { NavbarDrawer } from '../../components/navbar-drawer/navbar-drawer'

export const ExperiencePage = (): JSX.Element => {
    return (
        <>
        <div className="container">
            <NavbarDrawer pagename={"Experience"}></NavbarDrawer>
        </div>
        </>
    )
}