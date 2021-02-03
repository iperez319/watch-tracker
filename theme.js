import {createMuiTheme} from "@material-ui/core/styles";
import {deepPurple} from "@material-ui/core/colors";


const theme = createMuiTheme({
    palette: {
        type: 'dark',
        primary: deepPurple,
        // secondary: {
        //     main: '#19857b',
        // },
        // error: {
        //     main: red.A400,
        // },
        // background: {
        //     default: '#fff',
        // },
    },
});

export default theme;
