import React, {Component} from 'react'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import dayjs from 'dayjs'
import querystring from 'querystring'
import utc from 'dayjs/plugin/utc'
import * as actions from '../actions'
import TodoForm from '../components/TodoForm'
import toISOSubstring from '../modules/to-iso-substring'
import PomodorosChart from '../components/PomodorosChart'
import './Statistics.styl'
import Subscribe from '../components/Subscribe'
import 'flatpickr/dist/themes/light.css'
import Flatpickr from 'react-flatpickr'

dayjs.extend(utc)

class StatisticsFilters extends Component {
  render () {
    const {analysis = [], date = new Date(), onChangeDate = Function.prototype, toggleOnlyShowCompleted = Function.prototype} = this.props

    return <div className='pad'>
      <div className='pad'>
        <span><strong>Day</strong> <Flatpickr
          value={new Date(date)}
          onChange={date => {
            onChangeDate(date && date[0])
          }} />
        </span>

        &nbsp;
        &nbsp;

        <span className='usn' onClick={() => { toggleOnlyShowCompleted() }}>
          <input type='checkbox' checked={this.props.onlyShowCompleted} />
          <strong>only show completed</strong>
        </span>
      </div>

      <div className='analysis pad'>
        {analysis.map(a => {
          return <span className='tooltip' onClick={() => onChangeDate(a.day)} title={a.day} data-value={a.pomodoros.length}>
            &nbsp;
            {/* <span className='tooltip-content'>{a.day} {a.pomodoros.length}</span> */}
          </span>
        })}
      </div>
    </div>
  }
}

class Statistics extends Component {
  constructor (props) {
    super(props)
    this.state = {
      onlyShowCompleted: false,
      date: undefined
    }
  }
  changeDate (date) {
    const {actions} = this.props

    let dateString = toISOSubstring(date)
    this.setState({
      date: dateString
    })
    actions.apiGetPomodorosForDay(dateString)
    actions.apiGetTodosForDay(dateString)
    actions.apiGetAnalysis()
    window.history.pushState(null, document.title, window.location.pathname + `?date=${dateString}`)
  }

  render () {
    const {api, user, loading, subscription, actions} = this.props

    if (!user || !user.hasActiveSubscription) {
      return <Subscribe user={user} subscription={subscription} actions={actions} />
    }

    if (loading.loadingPomodorosForDay) {
      return <div className='content tac'>
        loading stats...
      </div>
    }

    const qs = querystring.parse(window.location.search.replace('?', ''))
    const urlDate = qs.date || new Date().toISOString().substring(0, 10)

    let {date} = this.state
    if (!date) {
      date = urlDate
      this.changeDate(date)
    }

    const completedTodos = api.todosForDate.todos
      .filter(Boolean)
      .filter(t => t.completedAt)
    const completedPomodoros = api.pomodorosForDate.pomodoros
      .filter(Boolean)
      .filter(p => p.type === 'pomodoro')
      .filter(p => p.completed)
    const allPomodoros = api.pomodorosForDate.pomodoros
      .filter(Boolean)
      .filter(p => p.type === 'pomodoro')

    const pomodorosToShow = this.state.onlyShowCompleted ? (completedPomodoros || allPomodoros) : allPomodoros

    return <div className='content'>
      <h1 className='title tac'>Statistics for {date}</h1>

      <div className='pad'>
        <StatisticsFilters
          date={date}
          analysis={api.analysis}
          onChangeDate={this.changeDate.bind(this)}
          onlyShowCompleted={this.state.onlyShowCompleted}
          toggleOnlyShowCompleted={() => this.setState({
            onlyShowCompleted: !this.state.onlyShowCompleted
          })} />

        {pomodorosToShow.length > 0 &&
          <PomodorosChart pomodoros={pomodorosToShow} micro={false} />}
      </div>

      <br />

      <div className='pad'>
        <div>
          <div className='columns'>
            <div className='column pad-v tac'>
              <h1 className='no-m'>{allPomodoros.length}</h1> all pomodoros
            </div>
            <div className='column pad-v tac'>
              <h1 className='no-m'>{durationInPomodoros(allPomodoros)}</h1>h all
            </div>
          </div>
          <hr style='opacity: 0.2;' />
          <div className='columns'>
            <div className='column pad-v tac'>
              <h1 className='no-m'>{completedPomodoros.length}</h1> completed pomodoros
            </div>
            <div className='column pad-v tac'>
              <h1 className='no-m'>{durationInPomodoros(completedPomodoros)}</h1>h completed
            </div>
          </div>

          <br />

          {completedTodos.length === 0 && <div className='column pad-v'>
            <div className='tac'>
              You haven't completed any todos.
            </div>
          </div>}

          <br />

          {completedTodos.length > 0 && <div className='column pad-v'>
            <div className='tac'>
              You were also quite productive today, with {completedTodos.length} tasks completed
            </div>
            <div className='pad'>
              <TodoForm showDeleted todos={completedTodos} actions={actions} editable={false} completable deletable={false} showTitles />
            </div>
          </div>}
        </div>
      </div>
    </div>
  }
}

function durationInPomodoros (pomodoros) {
  const duration = pomodoros.reduce((acc, pomodoro) => {
    if (pomodoro.startedAt && pomodoro.cancelledAt) {
      const diffInMs = Math.abs(new Date(pomodoro.startedAt) - new Date(pomodoro.cancelledAt))
      const diffInPomodoros = diffInMs / (25 * 60 * 1000)
      return acc + diffInPomodoros
      /*
      1 pomo = 1500000ms
             = 1ms
      */
    }
    return acc + pomodoro.minutes / 25
  }, 0)

  return duration.toFixed(1)
}

export default connect(
  (state) => state,
  (dispatch) => ({
    actions: bindActionCreators(actions, dispatch)
  })
)(Statistics)
