import AddIcon from "@mui/icons-material/Add"
import { Card, CardContent, Grid, IconButton, List, ListItemButton, ListItemText, ListSubheader } from "@mui/material"
import { bindActionCreators } from "@reduxjs/toolkit"
import { useEffect, useRef, useState } from "react"
import { ConnectedProps, connect } from "react-redux"
import { AppDispatch, RootState } from "../../store"
import TodoListView from "./TodoListView"
import todoListsSlice from "./state/todoListsSlice"

const todoListsConnector = connect(
    ({ todoLists }: RootState) => ({
        todoLists,
    }),
    (dispatch: AppDispatch) => bindActionCreators(
        todoListsSlice.actions,
        dispatch,
    ),
)

const TodoListsView = todoListsConnector((props: ConnectedProps<typeof todoListsConnector>) => {

    const [selectedTodoListIndex, setSelectedTodoListIndex] = useState(0)

    const stateObj = {
        selectedTodoListIndex,
    }
    const stateRef = useRef(stateObj)
    stateRef.current = stateObj

    const selectedTodoList = props.todoLists[Math.min(selectedTodoListIndex, props.todoLists.length - 1)]

    useEffect(() => {
        if (props.todoLists.length <= stateRef.current.selectedTodoListIndex) {
            setSelectedTodoListIndex(props.todoLists.length - 1)
        }
    }, [props.todoLists.length])

    return (
        <Grid container gap={2} height='100%' overflow='hidden'>
            <Grid item height='98%' overflow='auto' component={Card} xs={2} md={3}>
                <List
                    sx={{
                        '& ul': {
                            padding: 0,
                        },
                    }}
                    subheader={<li />}>
                    <Grid container component={ListSubheader}>
                        <Grid item xs>TODO Lists</Grid>
                        <Grid item xs='auto'>
                            <IconButton onClick={() => {
                                props.addGroup(['TODO List'])
                                setSelectedTodoListIndex(props.todoLists.length)
                            }}>
                                <AddIcon />
                            </IconButton>
                        </Grid>
                    </Grid>
                    {
                        props.todoLists.map((todoList, idx) => (
                            <li key={idx}>
                                <ListItemButton selected={idx === selectedTodoListIndex} onClick={() => setSelectedTodoListIndex(idx)}>
                                    <ListItemText primary={todoList.name} />
                                </ListItemButton>
                            </li>
                        ))
                    }
                </List>
            </Grid>
            <Grid item height='100%' xs>
                {
                    selectedTodoList ?
                        (
                            <TodoListView
                                listIndex={selectedTodoListIndex}
                                todoList={selectedTodoList}
                            />
                        ) : (
                            <Card>
                                <CardContent>NO TODO LIST SELECTED</CardContent>
                            </Card>
                        )
                }
            </Grid>
        </Grid>
    )
})

export default TodoListsView
