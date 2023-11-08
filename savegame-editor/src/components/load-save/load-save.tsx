import * as React from 'react';
import Box from '@mui/material/Box';
import Backdrop from '@mui/material/Backdrop';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import FileCopyIcon from '@mui/icons-material/FileCopyOutlined';
import SaveIcon from '@mui/icons-material/Save';
import PrintIcon from '@mui/icons-material/Print';
import ShareIcon from '@mui/icons-material/Share';
import { Button } from '@mui/material';
import { invoke } from '@tauri-apps/api';

const actions = [
  { icon: <FileCopyIcon />, name: 'Copy' },
  { icon: <SaveIcon />, name: 'Save' },
  { icon: <PrintIcon />, name: 'Print' },
  { icon: <ShareIcon />, name: 'Share' },
];

export default function LoadSaveComponent() {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

    const loadSave = () => {
        invoke("load_save", {})
    }

  return (
    // <Box sx={{ height: 330, transform: 'translateZ(0px)', flexGrow: 1 }}>
    //   <Backdrop open={open} />
    //   <SpeedDial
    //     ariaLabel="SpeedDial tooltip example"
    //     sx={{ position: 'absolute', bottom: 16, right: 16 }}
    //     icon={<SpeedDialIcon />}
    //     onClose={handleClose}
    //     onOpen={handleOpen}
    //     open={open}
    //     direction='down'
    //   >
    //     {actions.map((action) => (
    //       <SpeedDialAction
    //       sx={{backgroundColor: 'transparent'}}
    //         key={action.name}
    //         icon={action.icon}
    //         tooltipTitle={action.name}
    //         tooltipOpen
    //         onClick={handleClose}
    //       />
    //     ))}
    //   </SpeedDial>
    // </Box>
    <>
        <Button onClick={loadSave} variant='outlined' sx={{color: '#e9eecd', borderColor: '#e9eecd'}}>Load Save</Button>
    </>
  );
}