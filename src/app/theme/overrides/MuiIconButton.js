import { fade } from '@material-ui/core/styles';

const MuiIconButton = theme => ({
    root: {
        "&:hover": {
            backgroundColor: fade(theme.palette.text.primary, 0.05),
        }
    }
});
  
export default MuiIconButton;
