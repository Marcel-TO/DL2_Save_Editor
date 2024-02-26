import './caz-collection.css'

import { NavbarDrawer } from '../../components/navbar-drawer/navbar-drawer'

export const CazCollectionPage = (): JSX.Element => {
    return (
        <>        
        <div className="caz-outpost"></div>

        <div className="container">
            <NavbarDrawer pagename={"Caz Collection"} pagecontent={<CollectionContent/>}></NavbarDrawer>
        </div>
        </>
    )
}

const CollectionContent = (): JSX.Element => {    
    return (
        <>
        </>
    )
}