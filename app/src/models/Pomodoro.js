/* eslint-disable camelcase */

const MINUTES = 60 * 1000

const nowToISOString = () => {
  return (new Date()).toISOString()
}

const toTimestamp = (date) => {
  return (new Date(date)).getTime()
}

class Pomodoro {
  constructor (pomodoro = {}) {
    const {type, minutes, startedAt, cancelled_at} = pomodoro
    this.type = type
    this.minutes = minutes
    this.startedAt = startedAt
    if (cancelled_at) {
      this.cancelled_at = cancelled_at
    }
  }

  toJSON () {
    let json = {
      type: this.type,
      minutes: this.minutes,
      startedAt: this.startedAt
    }
    if (this.cancelled_at) {
      json.cancelled_at = this.cancelled_at
    }
    return json
  }

  duration () {
    const {startedAt, cancelled_at, minutes} = this
    if (cancelled_at) {
      return toTimestamp(cancelled_at) - toTimestamp(startedAt)
    }
    return minutes * MINUTES
  }

  isType (type) {
    return this.type === type
  }

  timestamps () {
    const {startedAt, cancelled_at} = this
    let timestamps = {
      startedAt: toTimestamp(startedAt),
      ended_at: toTimestamp(startedAt) + this.minutes * MINUTES
    }
    if (cancelled_at) {
      timestamps.cancelled_at = toTimestamp(cancelled_at)
      timestamps.ended_at = timestamps.cancelled_at
    }
    return timestamps
  }

  cancel () {
    this.cancelled_at = nowToISOString()
  }

  isCancelled () {
    const {cancelled_at} = this
    return !!cancelled_at
  }
}

Pomodoro.create = ({type, minutes}) => {
  return new Pomodoro({
    type,
    minutes,
    startedAt: nowToISOString()
  })
}

export default Pomodoro
