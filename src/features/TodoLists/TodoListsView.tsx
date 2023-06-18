import AddIcon from "@mui/icons-material/Add"
import DeleteIcon from "@mui/icons-material/Delete"
import DataArrayIcon from "@mui/icons-material/DataArray"
import {
    Card,
    CardContent,
    FormControl, Grid,
    IconButton,
    InputLabel,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    ListSubheader,
    MenuItem,
    Select,
    Stack,
} from "@mui/material"
import { bindActionCreators } from "@reduxjs/toolkit"
import { useEffect, useRef, useState } from "react"
import { ConnectedProps, connect } from "react-redux"
import { AppDispatch, RootState } from "../../store"
import TodoListView from "./TodoListView"
import CompactCardContent from "./components/CompactCardContent"
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

    const selectedTodoListOptionRef = useRef<HTMLElement | null>(null)

    const selectedTodoList = props.todoLists[Math.min(selectedTodoListIndex, props.todoLists.length - 1)]

    useEffect(() => {
        if (props.todoLists.length <= stateRef.current.selectedTodoListIndex) {
            setSelectedTodoListIndex(props.todoLists.length - 1)
        }

    }, [props.todoLists.length])

    useEffect(() => {
        if (props.todoLists.length - 1 > selectedTodoListIndex) {
            return
        }
        selectedTodoListOptionRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [selectedTodoListIndex])

    return (
        <>
            <Grid container sx={{
                display: {
                    xs: 'initial',
                    sm: 'none',
                },
            }}>
                <Grid item xs>
                    <Card sx={{
                        border: 'thin solid #3335',
                    }}>
                        <CompactCardContent>
                            <Grid container gap={2}>
                                <Grid item xs flexShrink={1} width={0}>
                                    <FormControl size='small' fullWidth>
                                        <InputLabel>TODO List</InputLabel>
                                        <Select
                                            id='dropdown-todolist'
                                            label='TODO List'
                                            value={selectedTodoListIndex}
                                            onChange={evt => setSelectedTodoListIndex(+evt.target.value)}>
                                            {
                                                props.todoLists.map((todoList, idx) => (
                                                    <MenuItem key={idx} value={idx}>
                                                        {todoList.name}
                                                    </MenuItem>
                                                ))
                                            }
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs='auto'>
                                    <Stack direction='row' gap={1}>
                                        <IconButton
                                            title='Delete TODO List'
                                            color={'error'}
                                            disabled={props.todoLists.length < 1}
                                            onClick={() => {
                                                props.deleteGroup(stateRef.current.selectedTodoListIndex)
                                            }}>
                                            <DeleteIcon />
                                        </IconButton>
                                        <IconButton title='Add TODO List' onClick={() => {
                                            props.addGroup([`TODO List #${props.todoLists.length + 1}`])
                                            setSelectedTodoListIndex(props.todoLists.length)
                                        }}>
                                            <AddIcon />
                                        </IconButton>
                                    </Stack>
                                </Grid>
                            </Grid>
                        </CompactCardContent>
                    </Card>
                </Grid>
            </Grid>
            <Grid
                container
                gap={2}
                sx={{
                    overflowY: 'hidden',
                }}
                height='100%'
                paddingBottom={1}>
                <Grid item component={Card} sm={4} lg={3} sx={{
                    overflowY: 'auto',
                    display: {
                        xs: 'none',
                        sm: 'initial',
                    },
                }} height='100%' border='thin solid #3335'>
                    <List
                        disablePadding
                        subheader={<li />}
                        sx={{
                            '.list-todolists .list-todolist-delete-btn': {
                                transform: 'translateX(100%)',
                                opacity: 0,
                                transition: 'opacity 0.2s ease-in-out, transform 0.3s ease-in-out',
                            },
                            '.list-todolists': {
                                '&:hover, &:focus': {
                                    '.list-todolist-delete-btn': {
                                        transform: 'translateX(0%)',
                                        opacity: 1,
                                    },
                                },
                            },
                        }}>
                        <Grid container component={ListSubheader}>
                            <Grid item xs>TODO Lists</Grid>
                            <Grid item xs='auto'>
                                <IconButton title='Add TODO List' onClick={() => {
                                    props.addGroup([`TODO List #${props.todoLists.length + 1}`])
                                    setSelectedTodoListIndex(props.todoLists.length)
                                }}>
                                    <AddIcon />
                                </IconButton>
                            </Grid>
                        </Grid>
                        {
                            props.todoLists.map((todoList, idx) => (
                                <ListItem ref={htmlEl => {
                                    if (stateRef.current.selectedTodoListIndex !== idx) {
                                        return
                                    }

                                    selectedTodoListOptionRef.current = htmlEl
                                }} className='list-todolists' key={idx} disablePadding>
                                    <ListItemButton
                                        title={todoList.name}
                                        selected={idx === selectedTodoListIndex}
                                        onClick={() => setSelectedTodoListIndex(idx)}>
                                        <ListItemText
                                            primaryTypographyProps={{
                                                overflow: 'hidden',
                                                whiteSpace: 'nowrap',
                                                textOverflow: 'ellipsis',
                                            }}
                                            primary={todoList.name}
                                        />
                                        <IconButton
                                            color={'error'}
                                            className='list-todolist-delete-btn'
                                            title='Delete TODO List'
                                            onClick={() => {
                                                props.deleteGroup(idx)
                                            }}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </ListItemButton>
                                </ListItem>
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
                                <Card sx={{
                                    height: '100%',
                                    border: 'thin solid #3335',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '200%',
                                    opacity: 0.3,
                                }}>
                                    <CardContent sx={{ textAlign: 'center', }}>
                                        <Stack justifyContent='center' alignItems='center'>
                                            <DataArrayIcon sx={{ fontSize: '60pt', }} />
                                            <div>NO TODO LISTS YET</div>
                                        </Stack>
                                    </CardContent>
                                </Card>
                            )
                    }
                </Grid>
            </Grid>
        </>
    )
})

export default TodoListsView
