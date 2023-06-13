import {
  Box,
  Container,
  Grid,
  IconButton,
  PaletteMode,
  Stack,
  Theme,
  ThemeProvider,
  Typography,
  createTheme,
} from '@mui/material'
import { ConnectedProps, connect } from 'react-redux'
// import './css/App.css'
import DarkModeIcon from "@mui/icons-material/DarkMode"
import LightModeIcon from "@mui/icons-material/LightMode"
import { bindActionCreators } from '@reduxjs/toolkit'
import { useRef } from 'react'
import TodoListsView from './features/TodoLists/TodoListsView'
import { CompactCardContent, PaperCard } from './features/TodoLists/components/PaperCard'
import themingSlice from './state/themingSlice'
import { AppDispatch, RootState } from './store'

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
})

const lightTheme = createTheme({
  palette: {
    mode: 'light',
  },
})

const themeMap: Map<PaletteMode, Theme> = new Map([
  ['dark', darkTheme],
  ['light', lightTheme],
])

const themingConnector = connect(
  ({ theme }: RootState) => ({
    theme,
  }),
  (dispatch: AppDispatch) => bindActionCreators(themingSlice.actions, dispatch)
)

const App = themingConnector((props: ConnectedProps<typeof themingConnector>) => {
  console.log("@theme:", props.theme, themeMap.get(props.theme));

  const activeTheme = themeMap.get(props.theme) ?? darkTheme;

  const stateObj = {
    activeTheme,
  };
  const stateRef = useRef(stateObj);
  stateRef.current = stateObj;

  return (
    <ThemeProvider theme={activeTheme}>
      <Box
        bgcolor={activeTheme.palette.background.default}
        sx={{
          m: 0,
          width: '100%',
          height: '100vh',
          overflowY: 'scroll',
        }}>
        <Container sx={{
          height: '100vh',
        }}>
          <Stack gap={2} justifyContent='start' sx={{
            height: '100vh',
            padding: '1rem',
          }}>
            <PaperCard>
              <CompactCardContent
                cardContentProps={{
                  sx: {
                    display: 'flex',
                    alignItems: 'center',
                  },
                }}>
                <Grid item xs>
                  <Typography variant='h5'>TODOs...</Typography>
                </Grid>
                <Grid item xs='auto'>
                  <IconButton onClick={() => {
                    switch (props.theme) {
                      case 'light':
                        props.setTheme('dark')
                        break
                      default:
                        props.setTheme('light')
                        break
                    }
                  }}>
                    {(theme => {
                      switch (theme) {
                        case 'dark': return <DarkModeIcon />
                        default: return <LightModeIcon />
                      }
                    })(props.theme)}
                  </IconButton>
                </Grid>
              </CompactCardContent>
            </PaperCard>
            <TodoListsView />
          </Stack>
        </Container>
      </Box>
    </ThemeProvider>
  )
})

export default App