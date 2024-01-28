import './caz-collection.css'

import { NavbarDrawer } from '../../components/navbar-drawer/navbar-drawer'
import { SaveFile } from '../../models/save-models'

export const CazCollectionPage = ({ setCurrentSaveFile }: { setCurrentSaveFile: Function}): JSX.Element => {
    return (
        <>        
        <div className="caz-outpost"></div>

        <div className="container">
            <NavbarDrawer pagename={"Caz Collection"} pagecontent={<CollectionContent setCurrentSaveFile={setCurrentSaveFile}/>}></NavbarDrawer>
        </div>
        </>
    )
}

const CollectionContent = ({ setCurrentSaveFile }: { setCurrentSaveFile: Function}): JSX.Element => {    

    return (
        <>
        </>
    )
}