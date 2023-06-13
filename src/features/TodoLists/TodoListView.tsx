import AddIcon from "@mui/icons-material/Add"
import DeleteIcon from "@mui/icons-material/Delete"
import EditIcon from "@mui/icons-material/Edit"
import InfoIcon from "@mui/icons-material/Info"
import {
    Box,
    Button,
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
import { CompactCardContent, PaperCard } from "./components/PaperCard"
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

    const todoFormControlRef = useRef<TodoFormDialogControl | null>(null)
    const todoDetailedViewControlRef = useRef<TodoItemDetailViewDialogControl | null>(null)

    return (
        <>
            <TodoFormDialog controlRef={todoFormControlRef} />
            <TodoItemDetailView controlRef={todoDetailedViewControlRef} />
            <Grid container gap={2} position='relative' height='100%' overflow='auto'>
                <Grid item xs={8} position='sticky'>
                    <List sx={{
                        display: 'block',
                        width: '100%',
                        gap: 2,
                    }}>
                        <ListSubheader sx={{
                            width: '100%',
                        }}>
                            <PaperCard>
                                <CompactCardContent cardContentProps={{ sx: { d: 'flex' } }}>
                                    <Grid container alignItems='center'>
                                        <Grid item xs component='h3' paddingLeft='0.5rem'>
                                            {props.todoList.name}
                                        </Grid>
                                        <Grid item xs='auto'>
                                            <Stack direction='row' gap={1}>
                                                <IconButton
                                                    onClick={() => props.deleteGroup(props.listIndex)}>
                                                    <DeleteIcon />
                                                </IconButton>
                                                <IconButton
                                                    onClick={() => props.addTodo([props.listIndex, new ParentTodoInfo('TODO')])}>
                                                    <AddIcon />
                                                </IconButton>
                                            </Stack>
                                        </Grid>
                                    </Grid>
                                </CompactCardContent>
                            </PaperCard>
                        </ListSubheader>
                        {props.todoList.todos.map(
                            (todoInfo, idx) => (
                                <ListItem key={idx} sx={{
                                    width: '100%',
                                    display: 'block',
                                }}>
                                    <TodoItemView
                                        todoInfo={todoInfo}
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
                <Grid item xs></Grid>
            </Grid>
        </>
    )

    function todoFormPrompt(todoInfo: TodoInfo) {
        return todoFormControlRef.current!.prompt(todoInfo)
    }

    function todoDetailedViewPrompt(todoInfo: TodoInfo) {
        return todoDetailedViewControlRef.current!.prompt(todoInfo)
    }
})

interface TodoItemViewProps {
    todoInfo: ParentTodoInfo
    onDetailedViewBtnClick?(): void
    onEditBtnClick?(): void
    onDeleteBtnClick?(): void
}

function TodoItemView({
    todoInfo,
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
        <PaperCard>
            <CompactCardContent>
                <Grid container flexWrap='nowrap'>
                    <Grid item xs flexShrink={1}>
                        <FormControlLabel
                            control={<Checkbox />}
                            label={todoInfo.title}
                            slotProps={{
                                typography: {
                                    fontWeight: 'bold',
                                    width: '100%',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
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
                                <IconButton title='Details' onClick={onDetailedViewBtnClick}>
                                    <InfoIcon />
                                </IconButton>
                            </Box>
                            <IconButton title='Edit' onClick={onEditBtnClick}>
                                <EditIcon />
                            </IconButton>
                            <IconButton title='Delete' onClick={onDeleteBtnClick}>
                                <DeleteIcon />
                            </IconButton>
                        </Stack>
                    </Grid>
                </Grid>
            </CompactCardContent>
        </PaperCard>
    )
}

interface TodoItemDetailViewDialogControl {
    prompt(todoInfo: TodoInfo): Promise<ResolvedPromptResult<void> | CancelledPromptResult>
}

function TodoItemDetailView({ controlRef }: { controlRef: React.MutableRefObject<TodoItemDetailViewDialogControl | null> }) {

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

    useEffect(() => {
        if (isPromptActive) {
            return
        }

        setTodoTitle('')
        setTodoDescription('')
    }, [isPromptActive])

    return (
        <Dialog open={isPromptActive} maxWidth='lg' fullWidth>
            <DialogTitle>{todoTitle}</DialogTitle>
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

function TodoFormDialog({ controlRef }: { controlRef: React.MutableRefObject<TodoFormDialogControl | null> }) {

    const [todoTitle, setTodoTitle] = useState('')
    const [todoDescription, setTodoDescription] = useState<string | undefined>('')

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

    useEffect(() => {
        if (isPromptActive) {
            return
        }

        setTodoTitle('')
        setTodoDescription('')
    }, [isPromptActive])

    return (
        <Dialog open={isPromptActive} maxWidth='lg' fullWidth>
            <DialogTitle>TODO Info</DialogTitle>
            <DialogContent>
                <Stack direction='column' gap={2} marginTop={1}>
                    <TextField
                        label='TODO Title'
                        value={todoTitle}
                        onChange={evt => setTodoTitle(evt.target.value)}
                    />
                    <TextField
                        multiline
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
                <Button onClick={resolvePrompt}>APPLY</Button>
            </DialogActions>
        </Dialog>
    )
}

export default TodoListView