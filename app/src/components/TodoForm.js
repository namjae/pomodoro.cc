import React, { Component } from 'react'
import Todo from './Todo'
import './TodoForm.styl'

class TodoForm extends Component {
  addTodo (event) {
    if (event.keyCode !== 13) return
    const { actions } = this.props
    const text = ((event.target && event.target.value) || '').trim()
    if (!text) return
    actions.addTodo({
      completed: false,
      text
    })
    event.target.value = ''
  }

  render () {
    const { todos, actions, editable } = this.props
    console.log('editable', editable)
    const newTodos = todos.filter(t => !t.deleted).filter(t => !t.completed)
    const doneTodos = todos.filter(t => !t.deleted).filter(t => t.completed)

    return <div className='todo-form-container'>
      {editable && <input
        type='text'
        onKeyDown={this.addTodo.bind(this)}
        placeholder='What do you need to do?'
        id='todo-input'
        className='todo-input' />}

      {editable && <div>
        {newTodos.length > 0 && <h1 className='no-m m-t'>Todo</h1>}
        {renderTodoListWith(newTodos, actions)}
      </div>}

      <h1 className='no-m m-t'>Done</h1>
      {renderTodoListWith(doneTodos, actions)}
    </div>
  }
}

export default TodoForm

export function renderTodoListWith (todos, actions, {completable, editable, deletable} = {completable: true, editable: true, deletable: true}) {
  return <ul className='todo-form'>
    {todos.map((todo) => {
      return <Todo key={todo.id} index={todo.id} todo={todo} todos={todos} actions={actions} completable={completable} editable={editable} deletable={deletable} />
    })}
  </ul>
}