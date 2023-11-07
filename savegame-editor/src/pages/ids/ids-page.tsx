import './ids-page.css'
import { NavbarDrawer } from '../../components/navbar-drawer/navbar-drawer'
import { Fragment, useState } from 'react'
import { invoke } from '@tauri-apps/api';
import { IdData } from '../../models/idData';
import CatchingPokemonIcon from '@mui/icons-material/CatchingPokemon';
import { Box, Button, Collapse, Divider, List, ListItemButton, ListItemIcon, ListItemText, Slide, Snackbar } from '@mui/material';
import SavedSearchIcon from '@mui/icons-material/SavedSearch';
import { FixedSizeList } from 'react-window';


// The ID page
export const IDsPage = (): JSX.Element => {
    return (
        <>
        <div className="container">
            <NavbarDrawer pagename={"IDs"} pagecontent={idContent()}></NavbarDrawer>
        </div>
        </>
    )
}

// The content of the ID page
const idContent = (): JSX.Element => {
  // The handled data
  const [idDatas, setIdDatas] = useState<IdData[]>([]);
  const [currentSelected, setCurrentSelected] = useState<string>("");

  // Invokes backend and sets IDs.
  async function handleIDs() {
      await setIdDatas( await invoke("get_ids", {}));
  }

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
          <Button onClick={handleIDs}>Get IDs</Button>
          <Divider/>
          <div className="id-list-container">

          <List
              sx={{ width: '100%', minWidth: 360, bgcolor: 'transparent' }}
              component="nav"
              aria-labelledby="nested-list-subheader">
              {idDatas?.map((item) => (
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