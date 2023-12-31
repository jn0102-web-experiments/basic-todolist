import AddIcon from "@mui/icons-material/Add"
import DataArrayIcon from "@mui/icons-material/DataArray"
import DeleteIcon from "@mui/icons-material/Delete"
import EditIcon from "@mui/icons-material/Edit"
import InfoIcon from "@mui/icons-material/Info"
import {
    Box,
    Button,
    Card,
    CardContent,
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
    TextField,
    Typography
} from "@mui/material"
import { DatePicker } from "@mui/x-date-pickers"
import { bindActionCreators } from "@reduxjs/toolkit"
import dayjs, { Dayjs } from "dayjs"
import { useEffect, useMemo, useRef, useState } from "react"
import { ConnectedProps, connect } from "react-redux"
import { DATE_TIME_FMT } from "../../constants"
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
                        display: 'flex',
                        flexDirection: 'column',
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
                                    <Grid
                                        item
                                        xs
                                        component='h3'
                                        width={0}
                                        title={props.todoList.name}
                                        overflow='hidden'
                                        textOverflow='ellipsis'
                                        paddingLeft='0.5rem'>
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
                                                    props.addTodo([
                                                        props.listIndex,
                                                        new ParentTodoInfo(`TODO #${props.todoList.todos.length + 1}`, dayjs().format(DATE_TIME_FMT))
                                                    ])
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
                                    marginY: 1,
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

                                        console.log('@test-result:', promptResult)
                                        if (promptResult.status !== PromptResultStatus.RESOLVED) {
                                            return
                                        }

                                        props.updateTodo([props.listIndex, idx, promptResult.value])
                                    }}
                                    onDeleteBtnClick={() => props.deleteTodo([props.listIndex, idx])}
                                />
                            </ListItem>
                        )
                    )}
                    <ListItem disableGutters disablePadding sx={{
                        marginTop: 1,
                        flexGrow: 1,
                        height: 0,
                        opacity: props.todoList.todos.length < 1 ? 0.3 : 0,
                    }}>
                        <Card sx={{ flexGrow: 1, height: '100%', }}>
                            <CardContent sx={{
                                textAlign: 'center',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '200%',
                                width: '100%',
                                height: '100%',
                            }}>
                                <Stack justifyContent='center' alignItems='center'>
                                    <DataArrayIcon sx={{ fontSize: '60pt', }} />
                                    <Typography variant='h5'>NO TODO ITEMS YET</Typography>
                                </Stack>
                            </CardContent>
                        </Card>
                    </ListItem>
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
                            label={<>
                                {todoInfo.title}
                                <Typography variant='caption' sx={{
                                    marginLeft: 2,
                                }}>
                                    {todoInfo.date}
                                </Typography>
                            </>}
                            title={todoInfo.title}
                            sx={{
                                width: '100%',
                                paddingLeft: 1.5,
                                textDecoration: todoInfo.isDone ? 'line-through' : null,
                            }}
                            slotProps={{
                                typography: {
                                    sx: {
                                        opacity: todoInfo.isDone ? 0.5 : 1,
                                    },
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

function CtmDatePicker({ sx, slotProps = {}, ...otherProps }: React.ComponentProps<typeof DatePicker>) {
    const {
        textField,
        ...otherSlotProps
    } = slotProps

    return (
        <>
            <DatePicker
                format={DATE_TIME_FMT}
                slotProps={{
                    textField: {
                        variant: 'filled',
                        ...textField,
                    },
                    ...otherSlotProps,
                }}
                sx={{
                    width: '12rem',
                    flexGrow: 0,
                    ...sx,
                }}
                {...otherProps}
            />
        </>
    )
}

interface TodoFormDialogControl {
    prompt(todoInfo: TodoInfo): Promise<ResolvedPromptResult<TodoInfo> | CancelledPromptResult>
}

interface TodoFormDialogProps {
    controlRef: React.MutableRefObject<TodoFormDialogControl | null>
}

function TodoFormDialog({ controlRef }: TodoFormDialogProps) {

    const [todoDate, setTodoDate] = useState<string>(dayjs().format(DATE_TIME_FMT))
    const [todoTitle, setTodoTitle] = useState('')
    const [todoDescription, setTodoDescription] = useState<string | undefined>('')

    const isTitleUnset = !todoTitle?.trim()

    const stateObj = {
        title: todoTitle,
        date: todoDate,
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
        return new TodoInfo(stateRef.current.title, stateRef.current.date, stateRef.current.description)
    })

    const control = useMemo<TodoFormDialogControl>(() => ({
        prompt(todoInfo) {
            console.log('@test', todoInfo)
            setTodoDate(todoInfo.date)
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
                    <CtmDatePicker
                        value={dayjs(todoDate, DATE_TIME_FMT)}
                        onChange={value => setTodoDate((value as Dayjs).format(DATE_TIME_FMT))}
                        slotProps={{
                            textField: {
                                label: 'Date',
                            },
                        }}
                    />
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
                    <Typography
                        variant='subtitle2'
                        fontStyle='oblique'
                        sx={{ opacity: 0.7, }}>
                        Description can be in Markdown format
                    </Typography>
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
