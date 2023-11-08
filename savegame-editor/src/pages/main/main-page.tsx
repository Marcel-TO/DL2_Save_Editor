import './main-page.css'
import { NavbarDrawer } from '../../components/navbar-drawer/navbar-drawer'
import LoadSaveComponent from '../../components/load-save/load-save'

export const MainPage = (): JSX.Element => {
    return (
        <>
        <div className="container">
            <NavbarDrawer pagename={"Main"} pagecontent={<LoadSaveComponent/>}></NavbarDrawer>
        </div>
        </>
    )
}