import {
  Box,
  Card,
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
import CompactCardContent from './features/TodoLists/components/CompactCardContent'
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
        }}>
        <Container sx={{
          height: '100vh',
        }}>
          <Stack gap={2} justifyContent='start' sx={{
            height: '100%',
            padding: '1rem',
          }}>
            <Card sx={{
              flexShrink: 0,
            }}>
              <CompactCardContent
                cardContentProps={{
                  sx: {
                    display: 'flex',
                    alignItems: 'center',
                  },
                }}>
                <Grid item xs>
                  <Typography variant='h5' fontWeight={800} paddingLeft={2}>// TODOs</Typography>
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
            </Card>
            <TodoListsView />
          </Stack>
        </Container>
      </Box>
    </ThemeProvider>
  )
})

export default App
