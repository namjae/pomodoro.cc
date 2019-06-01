import React, {Component} from 'react'
import Timer from './Timer'
import TimerButtons from './TimerButtons'

export default class Pomodoro extends Component {
  render () {
    const {timer, actions} = this.props
    const {team = false, channelId} = this.props

    return <div>
      <Timer timer={timer} />
      <TimerButtons actions={actions} team={team} channelId={channelId} />
    </div>
  }
}
