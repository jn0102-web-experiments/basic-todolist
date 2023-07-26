import { PayloadAction, createSlice } from "@reduxjs/toolkit"

export class TodoInfo {
    /**
     * see `DATE_TIME_FMT` in [constants.ts](../../../constants.ts)
     */
    date: string
    title: string
    description?: string
    isDone: boolean

    /**
     * @param title
     * @param date see `DATE_TIME_FMT` in [constants.ts](../../../constants.ts)
     * @param description
     */
    constructor(title: string, date: string, description?: string) {
        this.title = title
        this.date = date
        this.description = description
        this.isDone = false
    }
}

export class ParentTodoInfo extends TodoInfo {
    subTodos: TodoInfo[]

    constructor(title: string, date: string, description?: string) {
        super(title, date, description)
        this.subTodos = []
    }
}

export class TodoList {
    name: string
    description?: string
    todos: ParentTodoInfo[]

    constructor(name: string, description?: string, todos = [] as ParentTodoInfo[]) {
        this.name = name
        this.description = description
        this.todos = todos
    }
}

const initialState: TodoList[] = []

const todoListsSlice = createSlice({
    name: 'todoLists',
    initialState,
    reducers: {
        addGroup(state, action: PayloadAction<[string, string?]>) {
            const [name, description] = action.payload
            state.push(new TodoList(name, description))
        },
        renameGroup(state, action: PayloadAction<[number, string]>) {
            const [groupIndex, name] = action.payload
            state[groupIndex].name = name
            state.splice(groupIndex, 1, { ...state[groupIndex] })
        },
        deleteGroup(state, action: PayloadAction<number>) {
            state.splice(action.payload, 1)
        },
        addTodo(state, action: PayloadAction<[number, ParentTodoInfo]>) {
            const [groupIndex, todoInfo] = action.payload
            state[groupIndex].todos.push(todoInfo)
            state.splice(groupIndex, 1, { ...state[groupIndex] })
        },
        addSubTodo(state, action: PayloadAction<[number, number, TodoInfo]>) {
            const [groupIndex, parentIndex, todoInfo] = action.payload
            state[groupIndex].todos[parentIndex].subTodos.push(todoInfo)
            state.splice(groupIndex, 1, { ...state[groupIndex] })
        },
        updateTodo(state, action: PayloadAction<[number, number, TodoInfo]>) {
            const [groupIndex, todoIndex, todoInfo] = action.payload
            const updatableTodo = state[groupIndex].todos[todoIndex]

            updatableTodo.isDone = todoInfo.isDone
            updatableTodo.title = todoInfo.title
            updatableTodo.date = todoInfo.date
            updatableTodo.description = todoInfo.description

            state[groupIndex].todos.splice(todoIndex, 1, updatableTodo)
            state.splice(groupIndex, 1, { ...state[groupIndex] })
        },
        deleteTodo(state, action: PayloadAction<[number, number]>) {
            const [groupIndex, todoIndex] = action.payload
            state[groupIndex].todos.splice(todoIndex, 1)
            state.splice(groupIndex, 1, { ...state[groupIndex] })
        },
    },
})

export const todoListsSliceReducer = todoListsSlice.reducer

export default todoListsSlice
