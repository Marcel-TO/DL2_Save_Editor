import './ids-page.css'
import { NavbarDrawer } from '../../components/navbar-drawer/navbar-drawer'
import { Fragment, useEffect, useState } from 'react'
import { IdData } from '../../models/save-models';
import CatchingPokemonIcon from '@mui/icons-material/CatchingPokemon';
import { Box, Collapse, List, ListItemButton, ListItemIcon, ListItemText, Slide, Snackbar } from '@mui/material';
import SavedSearchIcon from '@mui/icons-material/SavedSearch';
import { FixedSizeList } from 'react-window';


// The ID page
export const IDsPage = ({idData, handleIdData}: {idData: IdData[], handleIdData: Function}): JSX.Element => {
  useEffect(() => {
    if (idData.length == 0) {
      handleIdData();
    }
  }, [idData, handleIdData])  
  
  return (
        <>
        <div className="container">
            <NavbarDrawer pagename={"IDs"} pagecontent={<IdContent idData={idData}/>}></NavbarDrawer>
        </div>
        </>
    )
}

// The content of the ID page
const IdContent = ({idData}: {idData: IdData[]}): JSX.Element => {
  // The handled data
  const [currentSelected, setCurrentSelected] = useState<string>("");

  // Handles the current selected file.
  function handleCurrentSelected(filename: string) {
      if (currentSelected == filename) {
          setCurrentSelected("");
          return;
      }

      setCurrentSelected(filename);
  } 

  return (
      <>
          <div className="id-list-container">
            <List
              sx={{ width: '100%', minWidth: 360, bgcolor: 'transparent' }}
              component="nav"
              aria-labelledby="nested-list-subheader">
              {idData.map((item) => (
                  <Fragment key={item.filename}>
                      <ListItemButton
                          onClick={() => handleCurrentSelected(item.filename)}>
                          <ListItemIcon>
                          <CatchingPokemonIcon sx={{ color: '#e9eecd' }} />
                          </ListItemIcon>
                          <ListItemText primary={item.filename} />
                      </ListItemButton>
                      <Collapse in={currentSelected === item.filename} timeout="auto" unmountOnExit>
                          <VirtualizedList ids={item.ids} minWidth={360}/>
                      </Collapse>
                  </Fragment>
              ))}
              </List>
          </div>
      </>
  )
}

// Represents the collapsed nested list.
// Using FixedSizedList instead of normal list to improve performance when opening a bracket.
const VirtualizedList = ({
  ids,
  minWidth,
}: {
  ids: string[];
  minWidth: number;
}): JSX.Element => {
  // The Properties of the selected id.
  interface SnackProps {
    name: string,
    isOpen: boolean,
  }

  // The handled data
  const [state, setState] = useState<SnackProps>({name: '', isOpen: false});

  // Handles the click event of the snackbar if an id is selected.
  const handleClick = (props: SnackProps) => {
    setState(props);
  };

  // Handles the close event of the snackbar after an id is selected.
  const handleClose = () => {
    setState({
      name: "",
      isOpen: false,
    });
  };

  // Handles the event if id is selected
  const handleCopyID = (id: string) => {
    navigator.clipboard.writeText(id);
    handleClick({name: id, isOpen: true});
  };

  // Represents the row of the collapsed nested list.
  const VirtualizedRow = ({ id, style }: { id: string; style: React.CSSProperties }) => {
    return (
      <>
        <ListItemButton key={id} sx={{ pl: 4, minWidth: 360 }} style={style} onClick={() => handleCopyID(id)}>
          <ListItemIcon>
            <SavedSearchIcon sx={{color: '#e9eecd'}}/>
          </ListItemIcon>
          <ListItemText primary={id} />
        </ListItemButton>
      </>
    );
  };

  return (
    <>
    <Box sx={{ height: '100%', minWidth: minWidth }}>
      <FixedSizeList
        height={500}
        width='100%'
        itemSize={60}
        itemCount={ids?.length || 0}
        className='fixedSizeListContainer'
      >
        {({ index, style }) => (
          <>
            <VirtualizedRow id={ids[index]} style={style} />
          </>
        )}
      </FixedSizeList>
    </Box>
    <Snackbar
              open={state.isOpen}
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
              onClose={handleClose}
              TransitionComponent={Slide}
              message={`Copied ${state.name} to clipboard.`}
              key={'top' + 'left'}/>
    </>
  );
};