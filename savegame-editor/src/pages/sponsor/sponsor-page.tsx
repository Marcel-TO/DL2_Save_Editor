import "./sponsor-page.css";
import { NavbarDrawer } from "../../components/navbar-drawer/navbar-drawer";
import { SettingsManager } from "tauri-settings";
import { SettingsSchema } from "../../models/settings-schema";
import { Box, Button, Typography } from "@mui/material";
import { Sponsor } from "../../models/models";
import SponsorsAvatar from "../../components/sponsors/sponsors-avatar";
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { Link } from "react-router-dom";

export const SponsorPage = ({
  settingsManager,
}: {
  settingsManager: SettingsManager<SettingsSchema>;
}): JSX.Element => {
  return (
    <>
      <div className="container">
        <NavbarDrawer
          pagename={"Sponsor"}
          pagecontent={<SponsorContent />}
          settingsManager={settingsManager}
        ></NavbarDrawer>
      </div>
    </>
  );
};

const Sponsors: Sponsor[] = [
  {
    name: "Easily Spooked",
    avatar: "src/assets/pictures/sponsors/easily-spooked.jpeg",
    link: "https://discord.com/users/1250386184379564103",
    tier: "Top Sonsor",
  },
];

const SponsorContent = (): JSX.Element => {
  return (
    <>
      <Box
        sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}
      >
        <Typography variant="h1" component="h1">
          Thank you!
        </Typography>
        <Typography paragraph align="center" sx={{ marginTop: "50px" }}>
          As you know, this project is open-source and free to use. However, it
          is not free to maintain.
          <br />
          <br />
          If you would like to support the editor, please consider sponsoring
          the project. Your support will help keep the project alive and
          well-maintained.
        </Typography>
        <Typography paragraph align="center" sx={{ marginTop: "20px" }}>
          By sponsoring the editor, you're not just supporting a project; you're
          investing in a tool that you rely on for your gaming experience. Your
          sponsorship helps the developer to continuously improve the editor by
          adding new features, enhancing existing ones, and fixing bugs. This
          means a more efficient, reliable, and enjoyable experience for you and
          the community. Plus, sponsors often have a say in future developments,
          ensuring the editor evolves in ways that serve your needs best. Join
          us in making this tool even better for everyone.
        </Typography>

        <Typography variant="h2" component="h1" sx={{ marginTop: "50px" }}>
          Hall of Fame
        </Typography>
        <Typography paragraph align="center">
          The Hall of Fame showcases the generous sponsors who have supported
          the editor. Thank you for your contribution!
        </Typography>

        <SponsorsAvatar sponsors={Sponsors} />

        <div className="sponsor-button">
          <Button
            id="basic-button"
            variant="outlined"
            component={Link} to={'https://github.com/sponsors/Marcel-TO'} target="blank"
            sx={{
              borderColor: "#e9eecd",
              color: "#e9eecd",
              backgroundColor: "#52626450",
              "&:hover": {
                backgroundColor: "#e9eecd",
                color: "#526264",
                borderColor: "#526264",
              },
            }}
          >
            <FavoriteBorderIcon sx={{marginRight: '10px'}}/>
            Sponsor the Editor
          </Button>
        </div>
      </Box>
    </>
  );
};
