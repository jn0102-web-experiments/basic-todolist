import { PaletteMode } from "@mui/material"
import { PayloadAction, createSlice } from "@reduxjs/toolkit"

const themingSlice = createSlice({
    name: 'theme',
    initialState: 'dark' as PaletteMode,
    reducers: {
        setTheme(_state, action: PayloadAction<PaletteMode>) {
            return action.payload
        }
    },
})

export const themingSliceReducer = themingSlice.reducer

export default themingSlice
