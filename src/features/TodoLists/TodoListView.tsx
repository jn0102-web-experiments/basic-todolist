import AddIcon from "@mui/icons-material/Add"
import DeleteIcon from "@mui/icons-material/Delete"
import EditIcon from "@mui/icons-material/Edit"
import InfoIcon from "@mui/icons-material/Info"
import {
    Box,
    Button,
    Card,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    Grid,
    IconButton,
    List,
    ListItem,
    ListSubheader,
    Stack,
    TextField
} from "@mui/material"
import { bindActionCreators } from "@reduxjs/toolkit"
import { useEffect, useMemo, useRef, useState } from "react"
import { ConnectedProps, connect } from "react-redux"
import { AppDispatch } from "../../store"
import MdView from "../components/MdView"
import CompactCardContent from "./components/CompactCardContent"
import { CancelledPromptResult, PromptResultStatus, ResolvedPromptResult, usePrompt } from "./components/hooks/prompt"
import todoListsSlice, { ParentTodoInfo, TodoInfo, TodoList } from "./state/todoListsSlice"

const todoListConnector = connect(
    undefined,
    (dispatch: AppDispatch) => bindActionCreators(
        todoListsSlice.actions,
        dispatch
    ),
)

interface TodoListViewProps extends ConnectedProps<typeof todoListConnector> {
    listIndex: number
    todoList: TodoList
}

const TodoListView = todoListConnector((props: TodoListViewProps) => {

    const [shouldScrollToLastTodoItemView, toggleShouldScrollToLastTodoItemView] = useState(false)

    const todoFormControlRef = useRef<TodoFormDialogControl | null>(null)
    const todoListRenameDialogControlRef = useRef<TodoListRenameDialogControl | null>(null)
    const todoDetailedViewControlRef = useRef<TodoItemDetailViewDialogControl | null>(null)

    const lastAddedTodoItemViewRef = useRef<HTMLElement | null>(null)

    useEffect(() => {
        if (!shouldScrollToLastTodoItemView) {
            return
        }

        lastAddedTodoItemViewRef.current?.scrollIntoView({ behavior: 'smooth' })
        toggleShouldScrollToLastTodoItemView(false)
    }, [shouldScrollToLastTodoItemView])

    return (
        <>
            <TodoListRenameDialog controlRef={todoListRenameDialogControlRef} />
            <TodoFormDialog controlRef={todoFormControlRef} />
            <TodoItemDetailView controlRef={todoDetailedViewControlRef} />
            <Grid container gap={2} position='relative' height='100%' overflow='auto'>
                <List
                    sx={{
                        width: '100%',
                    }}
                    disablePadding
                    subheader={<li />}>
                    <ListSubheader
                        sx={{
                            width: '100%',
                            whiteSpace: 'nowrap',
                            marginBottom: 1,
                        }}
                        disableGutters>
                        <Card sx={{ border: 'thin solid #3335', }}>
                            <CompactCardContent
                                cardContentProps={{ sx: { d: 'flex' } }}>
                                <Grid container alignItems='center'>
                                    <Grid item xs component='h3' width={0} overflow='hidden' textOverflow='ellipsis' paddingLeft='0.5rem'>
                                        {props.todoList.name}
                                    </Grid>
                                    <Grid item xs='auto'>
                                        <Stack direction='row' gap={1}>
                                            <IconButton
                                                title='Rename TODO List'
                                                onClick={async () => {
                                                    const result = await todoListRenamePrompt(props.todoList.name)

                                                    if (result.status === PromptResultStatus.CANCELLED) {
                                                        return
                                                    }

                                                    props.renameGroup([props.listIndex, result.value])
                                                }}>
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton
                                                title='Add TODO Item'
                                                onClick={() => {
                                                    props.addTodo([props.listIndex, new ParentTodoInfo(`TODO #${props.todoList.todos.length + 1}`)])
                                                    toggleShouldScrollToLastTodoItemView(true)
                                                }}>
                                                <AddIcon />
                                            </IconButton>
                                        </Stack>
                                    </Grid>
                                </Grid>
                            </CompactCardContent>
                        </Card>
                    </ListSubheader>
                    {props.todoList.todos.map(
                        (todoInfo, idx) => (
                            <ListItem
                                key={idx}
                                sx={{
                                    width: '100%',
                                    display: 'block',
                                    padding: 0,
                                    marginY: 2,
                                    overflow: 'hidden',
                                }}
                                disableGutters>
                                <TodoItemView
                                    containerElRef={htmlEl => {
                                        if (props.todoList.todos.length - 1 !== idx) {
                                            return
                                        }

                                        lastAddedTodoItemViewRef.current = htmlEl
                                    }}
                                    todoInfo={todoInfo}
                                    onCheckToggled={() => {
                                        const updated = { ...todoInfo }
                                        updated.isDone = !updated.isDone
                                        props.updateTodo([props.listIndex, idx, updated])
                                    }}
                                    onDetailedViewBtnClick={() => todoDetailedViewPrompt(todoInfo)}
                                    onEditBtnClick={async () => {
                                        const promptResult = await todoFormPrompt(todoInfo)

                                        if (promptResult.status !== PromptResultStatus.RESOLVED) {
                                            return
                                        }

                                        props.updateTodo([props.listIndex, idx, promptResult.value!])
                                    }}
                                    onDeleteBtnClick={() => props.deleteTodo([props.listIndex, idx])}
                                />
                            </ListItem>
                        )
                    )}
                </List>
            </Grid>
        </>
    )

    function todoListRenamePrompt(currentName: string) {
        return todoListRenameDialogControlRef.current!.prompt(currentName)
    }

    function todoFormPrompt(todoInfo: TodoInfo) {
        return todoFormControlRef.current!.prompt(todoInfo)
    }

    function todoDetailedViewPrompt(todoInfo: TodoInfo) {
        return todoDetailedViewControlRef.current!.prompt(todoInfo)
    }
})

interface TodoItemViewProps {
    containerElRef: ((instance: HTMLDivElement | null) => void) | React.RefObject<HTMLDivElement> | null
    todoInfo: ParentTodoInfo
    onCheckToggled?(): void
    onDetailedViewBtnClick?(): void
    onEditBtnClick?(): void
    onDeleteBtnClick?(): void
}

function TodoItemView({
    containerElRef: ref,
    todoInfo,
    onCheckToggled,
    onDetailedViewBtnClick,
    onEditBtnClick,
    onDeleteBtnClick,
}: TodoItemViewProps) {
    const stateObj = {
        todoTitle: todoInfo.title,
        todoDescription: todoInfo.description,
        todoInfo,
    }
    const stateRef = useRef(stateObj)
    stateRef.current = stateObj

    return (
        <Card
            ref={ref}
            sx={{
                border: 'thin solid #3335',
            }}>
            <CompactCardContent>
                <Grid container flexWrap='nowrap'>
                    <Grid item xs flexShrink={1} sx={{
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        width: 0,

                    }}>
                        <FormControlLabel
                            control={<Checkbox checked={todoInfo.isDone} onChange={onCheckToggled} />}
                            label={todoInfo.title}
                            sx={{
                                width: '100%',
                            }}
                            slotProps={{
                                typography: {
                                    fontWeight: 'bold',
                                    display: 'block',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                },
                            }}
                        />
                    </Grid>
                    <Grid item xs='auto' flexShrink={0}>
                        <Stack
                            direction='row'
                            gap={1}
                            sx={{
                                marginLeft: 'auto',
                            }}>
                            <Box sx={{
                                display: todoInfo.description ? 'initial' : 'none',
                            }}>
                                <IconButton title='TODO Item Details' onClick={onDetailedViewBtnClick}>
                                    <InfoIcon />
                                </IconButton>
                            </Box>
                            <IconButton title='Edit TODO Item' onClick={onEditBtnClick}>
                                <EditIcon />
                            </IconButton>
                            <IconButton
                                title='Delete TODO Item'
                                color={'error'}
                                onClick={onDeleteBtnClick}>
                                <DeleteIcon />
                            </IconButton>
                        </Stack>
                    </Grid>
                </Grid>
            </CompactCardContent>
        </Card>
    )
}

interface TodoItemDetailViewDialogControl {
    prompt(todoInfo: TodoInfo): Promise<ResolvedPromptResult<void> | CancelledPromptResult>
}

interface TodoItemDetailViewProps {
    controlRef: React.MutableRefObject<TodoItemDetailViewDialogControl | null>
}

function TodoItemDetailView({ controlRef }: TodoItemDetailViewProps) {

    const [todoTitle, setTodoTitle] = useState('')
    const [todoDescription, setTodoDescription] = useState<string | undefined>('')

    const [
        isPromptActive,
        activatePrompt,
        resolvePrompt,
    ] = usePrompt<void>()

    const control = useMemo<TodoItemDetailViewDialogControl>(() => ({
        prompt(todoInfo) {
            setTodoTitle(todoInfo.title)
            setTodoDescription(todoInfo.description)

            return activatePrompt()
        },
    }), [])

    useEffect(() => {
        controlRef.current = control
    }, [])

    return (
        <Dialog open={isPromptActive} maxWidth='lg' fullWidth>
            <DialogTitle sx={{ overflowX: 'hidden' }} textOverflow='ellipsis'>{todoTitle}</DialogTitle>
            <DialogContent>
                <MdView>
                    {todoDescription}
                </MdView>
            </DialogContent>
            <DialogActions>
                <Button onClick={resolvePrompt}>CLOSE</Button>
            </DialogActions>
        </Dialog>
    )
}

interface TodoFormDialogControl {
    prompt(todoInfo: TodoInfo): Promise<ResolvedPromptResult<TodoInfo> | CancelledPromptResult>
}

interface TodoFormDialogProps {
    controlRef: React.MutableRefObject<TodoFormDialogControl | null>
}

function TodoFormDialog({ controlRef }: TodoFormDialogProps) {

    const [todoTitle, setTodoTitle] = useState('')
    const [todoDescription, setTodoDescription] = useState<string | undefined>('')

    const isTitleUnset = !todoTitle?.trim()

    const stateObj = {
        title: todoTitle,
        description: todoDescription,
    }
    const stateRef = useRef(stateObj)
    stateRef.current = stateObj

    const [
        isPromptActive,
        activatePrompt,
        resolvePrompt,
        cancelPrompt,
    ] = usePrompt(() => {
        return new TodoInfo(stateRef.current.title, stateRef.current.description)
    })

    const control = useMemo<TodoFormDialogControl>(() => ({
        prompt(todoInfo) {
            setTodoTitle(todoInfo.title)
            setTodoDescription(todoInfo.description)

            return activatePrompt()
        },
    }), [])

    useEffect(() => {
        controlRef.current = control
    }, [])

    return (
        <Dialog open={isPromptActive} maxWidth='lg' fullWidth>
            <DialogTitle>TODO Info</DialogTitle>
            <DialogContent>
                <Stack direction='column' gap={1} marginTop={1}>
                    <TextField
                        required
                        variant='filled'
                        label='TODO Title'
                        value={todoTitle}
                        onChange={evt => setTodoTitle(evt.target.value)}
                        error={isTitleUnset}
                        helperText={isTitleUnset ? 'Required' : null}
                    />
                    <TextField
                        multiline
                        variant='filled'
                        minRows={3}
                        maxRows={10}
                        label='TODO Description'
                        value={todoDescription}
                        onChange={evt => setTodoDescription(evt.target.value)}
                    />
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={cancelPrompt}>DISCARD</Button>
                <Button disabled={isTitleUnset} onClick={resolvePrompt}>APPLY</Button>
            </DialogActions>
        </Dialog>
    )
}

interface TodoListRenameDialogControl {
    prompt(currentName: string): Promise<ResolvedPromptResult<string> | CancelledPromptResult>
}

interface TodoListRenameDialogProps {
    controlRef: React.MutableRefObject<TodoListRenameDialogControl | null>
}

function TodoListRenameDialog({ controlRef }: TodoListRenameDialogProps) {

    const [name, setName] = useState('')

    const isNameUnset = !name?.trim()

    const stateObj = {
        name,
    }
    const stateRef = useRef(stateObj)
    stateRef.current = stateObj

    const [
        isPromptActive,
        activatePrompt,
        resolvePrompt,
        cancelPrompt,
    ] = usePrompt(() => {
        return stateRef.current.name
    })

    const control = useMemo<TodoListRenameDialogControl>(() => ({
        prompt(name) {
            setName(name)

            return activatePrompt()
        },
    }), [])

    useEffect(() => {
        controlRef.current = control
    }, [])

    return (
        <Dialog open={isPromptActive} maxWidth='sm' fullWidth>
            <DialogTitle>Rename TODO List</DialogTitle>
            <DialogContent>
                <Stack direction='column' gap={2} marginTop={1}>
                    <TextField
                        label='TODO List Name'
                        required
                        variant='filled'
                        value={name}
                        onChange={evt => setName(evt.target.value)}
                        error={isNameUnset}
                        helperText={isNameUnset ? 'Required' : null}
                    />
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={cancelPrompt}>DISCARD</Button>
                <Button disabled={isNameUnset} onClick={applyBtnClicked}>APPLY</Button>
            </DialogActions>
        </Dialog>
    )

    function applyBtnClicked() {
        resolvePrompt()
    }
}

export default TodoListView
