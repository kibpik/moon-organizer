// @flow

import moment from 'moment'
import _ from 'lodash'
import lunarDays from './lunardays'
import moonPhase from './moonphase'
import zodiacSign from './zodiacsign'
import getDayContent from './daypicker'
/* eslint-disable no-unused-vars */
// @$FlowIgnore
import ru from 'moment/locale/ru'

const isToday = (m: moment$Moment) => m.isSame(moment(), 'day')
const getMonths = (m: moment$Moment) => m.months()
const weekOfMonth = (m: moment$Moment) => m.week() - moment(m).startOf('month').week()

const getCurrentLunarDay = (lunarDays: Array<LunarDay>): LunarDay => {
  return moment().isBetween(lunarDays[0].start, lunarDays[0].end) ? lunarDays[0] : lunarDays[1]
}

const getWeekDays = (m: moment$Moment) => {
  // transform array
  // first weekDay Must be first in array
  // @$FlowIgnore
  const shortLocales = m.localeData().weekdaysShort()
  // @$FlowIgnore
  const fullEn = moment().locale('en').localeData().weekdays()
  const weekdays = shortLocales
    .map((short, index) => {
      return {
        shortLocale: short,
        fullEn: fullEn[index].toLowerCase()
      }
    })
  // @$FlowIgnore
  let i = m.localeData().firstDayOfWeek()
  let start = weekdays.slice(i)
  let end = weekdays.slice(0, i)
  return start.concat(end)
}

const style = (day: moment$Moment): DayStyle => {
  const maxNumberOfRows = 6
  const topStep = 100 / maxNumberOfRows
  const leftStep = 100 / 7

  const weekday = day.weekday()
  const weekNumber = weekOfMonth(day)
  return {
    top: weekNumber * topStep + '%',
    left: weekday * leftStep + '%'
  }
}

const maxDurationDay = (date, ld: Array<LunarDay>) => {
  const dateStart = moment(date).startOf('day')
  const dateEnd = moment(date).endOf('day')

  let newLd = ld.map((d: LunarDay) => {
    let s = moment.max(moment(d.start), moment(dateStart))
    let e = moment.min(moment(d.end), moment(dateEnd))
    let diff = moment(e).diff(moment(s))
    let duration = moment.duration(diff).asMilliseconds()
    return Object.assign({}, d, {duration})
  })
  return _.maxBy(newLd, d => d.duration)
}

const calculateDayInfo = (currentDay: moment$Moment, locale: string, latitude: number, longitude: number): Day => {
  // calculate all day fields
  const _isToday: boolean = isToday(currentDay)
  const _lunarDays: Array<LunarDay> = lunarDays(currentDay, latitude, longitude)
  const _maxLunarDay: LunarDay = maxDurationDay(currentDay, _lunarDays)
  const _showedLunarDay: LunarDay = _maxLunarDay
  const _day = currentDay.date()
  const _date = currentDay.toDate()
  const _moonPhase = moonPhase(_showedLunarDay.number)
  const _moonPhaseLogoPath = require(`../assets/moon-phases-color/${_moonPhase.replace(' ', '_').toLowerCase()}.png`)
  const _style = style(currentDay)
  const _zodiac = zodiacSign(currentDay.toDate())
  const _zodiacLogoPath = require(`../assets/zodiac-signs/${_zodiac}.png`)

  const dayInfo: Day = {
    maxLunarDay: _maxLunarDay,
    showedLunarDay: _showedLunarDay,
    lunarDays: _lunarDays,
    isToday: _isToday,
    day: _day,
    date: _date,
    moonPhase: _moonPhase,
    moonPhaseLogoPath: _moonPhaseLogoPath,
    style: _style,
    zodiacLogoPath: _zodiacLogoPath,
    // getters for dynamic get props
    get content () {
      return getDayContent(_showedLunarDay.number, locale)
    },
    get currentLunarDay () {
      getCurrentLunarDay(_lunarDays)
    },
    get zodiac () {
      return _isToday ? zodiacSign(new Date()) : _zodiac
    }
  }
  return dayInfo
}

const month = (date: moment$Moment = moment(),
               locale: string = 'ru', latitude: number = 50, longitude: number = 30): Month => {
  // init data block
  const localeMoment = moment().locale(locale)
  const localeDate = moment(date).locale(locale)
  // get month name using locale
  const monthName = moment(localeDate).format('MMMM')
  // get start of month date
  const startOfMonth = moment(localeDate).startOf('month')
  // get number days in month
  const daysInMonth = localeDate.daysInMonth()
  // get week day number of first day of month [0-6]
  const weekDays = getWeekDays(localeMoment)
  const year = localeDate.year()

  // calculate days
  let days: Array<Day> = []

  const currentDay: moment$Moment = moment(startOfMonth)

  for (let i = 0; i < daysInMonth; i++) {
    const dayInfo = calculateDayInfo(currentDay, locale, latitude, longitude)
    days.push(dayInfo)
    currentDay.add(1, 'd')
  }

  return {days, monthName, weekDays, year}
}

export {
  month,
  calculateDayInfo
}
