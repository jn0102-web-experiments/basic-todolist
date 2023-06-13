import { PayloadAction, createSlice } from "@reduxjs/toolkit"

export class TodoInfo {
    title: string
    description?: string
    isDone: boolean

    constructor(title: string, description?: string) {
        this.title = title
        this.description = description
        this.isDone = false
    }
}

export class ParentTodoInfo extends TodoInfo {
    subTodos: TodoInfo[]

    constructor(title: string, description?: string) {
        super(title, description)
        this.subTodos = []
    }

    clone() {
        const clone = new ParentTodoInfo(this.title, this.description)
        clone.subTodos = this.subTodos
        return clone
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

const initialState: TodoList[] = [
    new TodoList('TODO List', 'Default List Description', [
        new ParentTodoInfo('Sample', 'Sample Description'),
    ]),
]

const todoListsSlice = createSlice({
    name: 'todoLists',
    initialState,
    reducers: {
        addGroup(state, action: PayloadAction<[string, string?]>) {
            const [name, description] = action.payload
            state.push(new TodoList(name, description))
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
            state[groupIndex].todos[todoIndex].title = todoInfo.title
            state[groupIndex].todos[todoIndex].description = todoInfo.description

            state[groupIndex].todos.splice(todoIndex, 1, state[groupIndex].todos[todoIndex])
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
