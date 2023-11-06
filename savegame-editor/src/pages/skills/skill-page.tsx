import './skill-page.css'
import { NavbarDrawer } from '../../components/navbar-drawer/navbar-drawer'

export const SkillPage = (): JSX.Element => {
    return (
        <>
        <div className="container">
            <NavbarDrawer pagename={"Skills"}></NavbarDrawer>
        </div>
        </>
    )
}