import AnalyticsService from '../modules/AnalyticsService'
import toISOSubstring from '../modules/to-iso-substring'
import pLimit from 'p-limit'

const limit = pLimit(3)

export const API_CREATE_POMODORO = 'API_CREATE_POMODORO'
export const API_CREATE_POMODORO_SUCCESS = 'API_CREATE_POMODORO_SUCCESS'
export const API_CREATE_POMODORO_ERROR = 'API_CREATE_POMODORO_ERROR'

export const API_CREATE_TODO = 'API_CREATE_TODO'
export const API_CREATE_TODO_SUCCESS = 'API_CREATE_TODO_SUCCESS'
export const API_CREATE_TODO_ERROR = 'API_CREATE_TODO_ERROR'

export const API_UPDATE_TODO = 'API_UPDATE_TODO'
export const API_UPDATE_TODO_SUCCESS = 'API_UPDATE_TODO_SUCCESS'
export const API_UPDATE_TODO_ERROR = 'API_UPDATE_TODO_ERROR'

export const API_GET_POMODOROS_FOR_DATE = 'API_GET_POMODOROS_FOR_DATE'
export const API_GET_POMODOROS_FOR_DATE_SUCCESS = 'API_GET_POMODOROS_FOR_DATE_SUCCESS'
export const API_GET_POMODOROS_FOR_DATE_ERROR = 'API_GET_POMODOROS_FOR_DATE_ERROR'

export const API_GET_TODOS_FOR_DAY = 'API_GET_TODOS_FOR_DAY'
export const API_GET_TODOS_FOR_DAY_SUCCESS = 'API_GET_TODOS_FOR_DAY_SUCCESS'
export const API_GET_TODOS_FOR_DAY_ERROR = 'API_GET_TODOS_FOR_DAY_ERROR'

export const API_GET_TODOLIST = 'API_GET_TODOLIST'
export const API_GET_TODOLIST_SUCCESS = 'API_GET_TODOLIST_SUCCESS'
export const API_GET_TODOLIST_ERROR = 'API_GET_TODOLIST_ERROR'

export const API_GET_POMODOROS_FOR_WEEK = 'API_GET_POMODOROS_FOR_WEEK'
export const API_GET_POMODOROS_FOR_WEEK_SUCCESS = 'API_GET_POMODOROS_FOR_WEEK_SUCCESS'
export const API_GET_POMODOROS_FOR_WEEK_ERROR = 'API_GET_POMODOROS_FOR_WEEK_ERROR'

export const API_GET_ANALYSIS = 'API_GET_ANALYSIS'
export const API_GET_ANALYSIS_SUCCESS = 'API_GET_ANALYSIS_SUCCESS'
export const API_GET_ANALYSIS_ERROR = 'API_GET_ANALYSIS_ERROR'

export function apiCreatePomodoro (pomodoro) {
  return (dispatch, getState) => {
    dispatch({type: API_CREATE_POMODORO, payload: null})

    const body = JSON.stringify(pomodoro)
    const url = window.USE_PROD
      ? 'https://api.pomodoro.cc/pomodoros'
      : 'http://localhost:3000/pomodoros'

    window.fetch(url, {
      method: 'POST',
      body,
      cache: 'no-cache',
      mode: 'cors',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        getState().user && AnalyticsService.track('create-pomodoro-error', data.error)
        return dispatch({type: API_CREATE_POMODORO_ERROR, payload: data.error})
      }
      getState().user && AnalyticsService.track('create-pomodoro-success', data)
      dispatch({type: API_CREATE_POMODORO_SUCCESS, payload: data})
      apiGetPomodorosForDay()(dispatch, getState)
    })
    .catch(err => {
      getState().user && AnalyticsService.track('create-pomodoro-error', err)
      return dispatch({type: API_CREATE_POMODORO_ERROR, payload: 'Something went wrong. Please try again'})
    })
  }
}

export function apiCreateTodo (todo) {
  return (dispatch, getState) => {
    dispatch({type: API_CREATE_TODO, payload: null})

    const body = JSON.stringify(todo)
    const url = window.USE_PROD
      ? 'https://api.pomodoro.cc/todos'
      : 'http://localhost:3000/todos'

    window.fetch(url, {
      method: 'POST',
      body,
      cache: 'no-cache',
      mode: 'cors',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        getState().user && AnalyticsService.track('create-todo-error', data.error)
        return dispatch({type: API_CREATE_TODO_ERROR, payload: data.error})
      }
      getState().user && AnalyticsService.track('create-todo-success', data)
      dispatch({type: API_CREATE_TODO_SUCCESS, payload: data})
      apiGetTodolist()(dispatch, getState)
    })
    .catch(err => {
      getState().user && AnalyticsService.track('create-todo-error', err)
      return dispatch({type: API_CREATE_TODO_ERROR, payload: 'Something went wrong. Please try again'})
    })
  }
}

export function apiUpdateTodo (todo) {
  return (dispatch, getState) => {
    dispatch({type: API_UPDATE_TODO, payload: null})

    const body = JSON.stringify(todo)
    const url = window.USE_PROD
      ? 'https://api.pomodoro.cc/todos'
      : 'http://localhost:3000/todos'

    window.fetch(url, {
      method: 'PATCH',
      body,
      cache: 'no-cache',
      mode: 'cors',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        getState().user && AnalyticsService.track('update-todo-error', data.error)
        return dispatch({type: API_UPDATE_TODO_ERROR, payload: data.error})
      }
      getState().user && AnalyticsService.track('update-todo-success', data)
      dispatch({type: API_UPDATE_TODO_SUCCESS, payload: data})
      apiGetTodolist()(dispatch, getState)
    })
    .catch(err => {
      getState().user && AnalyticsService.track('update-todo-error', err)
      return dispatch({type: API_UPDATE_TODO_ERROR, payload: 'Something went wrong. Please try again'})
    })
  }
}

export function apiCreatePomodoros (pomodoros) {
  return (dispatch, getState) => {
    const promises = pomodoros.map(pomodoro => limit(() => {
      dispatch({type: API_CREATE_POMODORO, payload: null})

      const body = JSON.stringify(pomodoro)
      const url = window.USE_PROD
        ? 'https://api.pomodoro.cc/pomodoros'
        : 'http://localhost:3000/pomodoros'

      return window.fetch(url, {
        method: 'POST',
        body,
        cache: 'no-cache',
        mode: 'cors',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          getState().user && AnalyticsService.track('create-pomodoro-error', data.error)
          return dispatch({type: API_CREATE_POMODORO_ERROR, payload: data.error})
        }
        getState().user && AnalyticsService.track('create-pomodoro-success', data)
        dispatch({type: API_CREATE_POMODORO_SUCCESS, payload: data})
        apiGetPomodorosForDay()(dispatch, getState)
      })
      .catch(err => {
        getState().user && AnalyticsService.track('create-pomodoro-error', err)
        return dispatch({type: API_CREATE_POMODORO_ERROR, payload: 'Something went wrong. Please try again'})
      })
    }))

    Promise.all(promises)
  }
}

export function apiCreateTodos (todos) {
  return (dispatch, getState) => {
    const promises = todos.map(todo => limit(() => {
      dispatch({type: API_CREATE_TODO, payload: null})

      const body = JSON.stringify(todo)
      const url = window.USE_PROD
        ? 'https://api.pomodoro.cc/todos'
        : 'http://localhost:3000/todos'

      return window.fetch(url, {
        method: 'POST',
        body,
        cache: 'no-cache',
        mode: 'cors',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          getState().user && AnalyticsService.track('create-todo-error', data.error)
          return dispatch({type: API_CREATE_TODO_ERROR, payload: data.error})
        }
        getState().user && AnalyticsService.track('create-todo-success', data)
        dispatch({type: API_CREATE_TODO_SUCCESS, payload: data})
        apiGetTodolist()(dispatch, getState)
      })
      .catch(err => {
        getState().user && AnalyticsService.track('create-todo-error', err)
        return dispatch({type: API_CREATE_TODO_ERROR, payload: 'Something went wrong. Please try again'})
      })
    }))

    Promise.all(promises)
  }
}

export function apiGetPomodorosForDay (day = toISOSubstring()) {
  return (dispatch, getState) => {
    dispatch({type: API_GET_POMODOROS_FOR_DATE, payload: null})

    let url = window.USE_PROD
      ? 'https://api.pomodoro.cc/pomodoros'
      : 'http://localhost:3000/pomodoros'

    url += `?day=${day}`

    window.fetch(url, {
      method: 'GET',
      cache: 'no-cache',
      mode: 'cors',
      credentials: 'include',
      headers: {
        'Accept': 'application/json'
        // 'Content-Type': 'application/json'
      }
    })
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        getState().user && AnalyticsService.track('get-pomodoros-for-day-error', data.error)
        return dispatch({type: API_GET_POMODOROS_FOR_DATE_ERROR, payload: data.error})
      }
      getState().user && AnalyticsService.track('get-pomodoros-for-day-success', data)
      dispatch({type: API_GET_POMODOROS_FOR_DATE_SUCCESS, payload: {date: day, pomodoros: data}})
    })
    .catch(err => {
      getState().user && AnalyticsService.track('get-pomodoros-for-day-error', err)
      return dispatch({type: API_GET_POMODOROS_FOR_DATE_ERROR, payload: 'Something went wrong. Please try again'})
    })
  }
}

export function apiGetTodosForDay (day = toISOSubstring()) {
  return (dispatch, getState) => {
    dispatch({type: API_GET_TODOS_FOR_DAY, payload: null})

    let url = window.USE_PROD
      ? 'https://api.pomodoro.cc/todos'
      : 'http://localhost:3000/todos'

    url += `?day=${day}`
    url += `&completed=true`

    window.fetch(url, {
      method: 'GET',
      cache: 'no-cache',
      mode: 'cors',
      credentials: 'include',
      headers: {
        'Accept': 'application/json'
        // 'Content-Type': 'application/json'
      }
    })
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        getState().user && AnalyticsService.track('get-todos-for-day-error', data.error)
        return dispatch({type: API_GET_TODOS_FOR_DAY_ERROR, payload: data.error})
      }
      getState().user && AnalyticsService.track('get-todos-for-day-success', data)
      dispatch({type: API_GET_TODOS_FOR_DAY_SUCCESS, payload: {date: day, todos: data}})
    })
    .catch(err => {
      getState().user && AnalyticsService.track('get-todos-for-day-error', err)
      return dispatch({type: API_GET_TODOS_FOR_DAY_ERROR, payload: 'Something went wrong. Please try again'})
    })
  }
}

export function apiGetTodolist () {
  return (dispatch, getState) => {
    dispatch({type: API_GET_TODOLIST, payload: null})

    let url = window.USE_PROD
      ? 'https://api.pomodoro.cc/todos/list'
      : 'http://localhost:3000/todos/list'

    window.fetch(url, {
      method: 'GET',
      cache: 'no-cache',
      mode: 'cors',
      credentials: 'include',
      headers: {
        'Accept': 'application/json'
        // 'Content-Type': 'application/json'
      }
    })
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        getState().user && AnalyticsService.track('get-todolist-error', data.error)
        return dispatch({type: API_GET_TODOLIST_ERROR, payload: data.error})
      }
      getState().user && AnalyticsService.track('get-todolist-success', data)
      dispatch({type: API_GET_TODOLIST_SUCCESS, payload: {todos: data}})
    })
    .catch(err => {
      getState().user && AnalyticsService.track('get-todolist-error', err)
      return dispatch({type: API_GET_TODOLIST_ERROR, payload: 'Something went wrong. Please try again'})
    })
  }
}

export function apiGetPomodorosForWeek (week) {
  return (dispatch, getState) => {
    dispatch({type: API_GET_POMODOROS_FOR_WEEK, payload: null})

    let url = window.USE_PROD
      ? `https://api.pomodoro.cc/pomodoros`
      : `http://localhost:3000/pomodoros`

    url += `?week=${week}`

    window.fetch(url, {
      method: 'GET',
      cache: 'no-cache',
      mode: 'cors',
      credentials: 'include',
      headers: {
        'Accept': 'application/json'
        // 'Content-Type': 'application/json'
      }
    })
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        getState().user && AnalyticsService.track('get-pomodoros-for-week-error', data.error)
        return dispatch({type: API_GET_POMODOROS_FOR_WEEK_ERROR, payload: data.error})
      }
      getState().user && AnalyticsService.track('get-pomodoros-for-week-success', data)
      dispatch({type: API_GET_POMODOROS_FOR_WEEK_SUCCESS, payload: data})
    })
    .catch(err => {
      getState().user && AnalyticsService.track('get-pomodoros-for-week-error', err)
      return dispatch({type: API_GET_POMODOROS_FOR_WEEK_ERROR, payload: 'Something went wrong. Please try again'})
    })
  }
}

export function apiGetAnalysis (day = toISOSubstring()) {
  return (dispatch, getState) => {
    dispatch({type: API_GET_ANALYSIS, payload: null})

    let url = window.USE_PROD
      ? 'https://api.pomodoro.cc/analysis'
      : 'http://localhost:3000/analysis'

    window.fetch(url, {
      method: 'GET',
      cache: 'no-cache',
      mode: 'cors',
      credentials: 'include',
      headers: {
        'Accept': 'application/json'
        // 'Content-Type': 'application/json'
      }
    })
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        getState().user && AnalyticsService.track('get-analysis-error', data.error)
        return dispatch({type: API_GET_ANALYSIS_ERROR, payload: data.error})
      }
      getState().user && AnalyticsService.track('get-analysis-success', data)
      dispatch({type: API_GET_ANALYSIS_SUCCESS, payload: data})
    })
    .catch(err => {
      getState().user && AnalyticsService.track('get-analysis-error', err)
      return dispatch({type: API_GET_ANALYSIS_ERROR, payload: 'Something went wrong. Please try again'})
    })
  }
}
