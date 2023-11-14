import './contributors-avatar.css';
import { styled } from '@mui/material/styles';
import Badge from '@mui/material/Badge';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import { AvatarGroup, Tooltip, TooltipProps, tooltipClasses } from '@mui/material';

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: '#e9eecd',
    color: '#e9eecd',
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      animation: 'ripple 5s infinite ease-in-out',
      border: '1px solid currentColor',
      content: '""',
    },
  },
  '@keyframes ripple': {
    '0%': {
      transform: 'scale(.8)',
      opacity: 1,
    },
    '100%': {
      transform: 'scale(2.4)',
      opacity: 0,
    },
  },
}));

const CustomToolTip = styled(({ className, ...props }: TooltipProps) => (
    <Tooltip {...props} arrow classes={{ popper: className }} />
  ))(({ theme }) => ({
    [`& .${tooltipClasses.arrow}`]: {
      color: theme.palette.common.black,
    },
    [`& .${tooltipClasses.tooltip}`]: {
      backgroundColor: theme.palette.common.black,
    },
}));

export default function ContributorsAvatar() {
  return (
    <Stack direction="row" spacing={2} sx={{display: 'flex', justifyContent: 'center'}}>
        <AvatarGroup max={4}>
            <CustomToolTip title="McHawk">
                <a href='https://github.com/Marcel-TO' target='_blank'>
                    <StyledBadge
                        overlap="circular"
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        badgeContent=" ">                    
                        <Avatar 
                            alt="McHawk" 
                            sx={{ width: 56, height: 56 }} 
                            >
                              <div className="contributor-mchawk-image"></div>
                            </Avatar>
                    </StyledBadge>
                </a>
            </CustomToolTip>
            <CustomToolTip title="Caz">
                <a href='https://github.com/zCaazual' target='_blank'>
                    <StyledBadge
                        overlap="circular"
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        badgeContent=" ">                    
                        <Avatar 
                          alt="Caz" 
                          sx={{ width: 56, height: 56, backgroundColor: '#e9eecd' }} >
                         <div className="contributor-caz-image"></div>
                        </Avatar>
                    </StyledBadge>
                </a>
            </CustomToolTip>
    </AvatarGroup>
    </Stack>
  );
}