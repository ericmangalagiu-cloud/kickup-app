'use client'

interface TimePickerProps {
  value: string // "HH:MM"
  onChange: (value: string) => void
  required?: boolean
  minHour?: number // first hour shown in dropdown (inclusive)
}

const allHours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
const minutes = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55']

const selectClass = "px-3 py-3 rounded-xl bg-gray-50 border border-black/[0.08] text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all cursor-pointer appearance-none text-center font-medium"

export function TimePicker({ value, onChange, required, minHour }: TimePickerProps) {
  const [h, m] = value ? value.split(':') : ['', '']

  // If a minHour is set, wrap around midnight so e.g. minHour=23 gives 23,00,01…
  const hours = minHour !== undefined
    ? Array.from({ length: 24 }, (_, i) => (minHour + i) % 24).map(n => String(n).padStart(2, '0'))
    : allHours

  function setHour(hour: string) {
    onChange(`${hour}:${m || '00'}`)
  }

  function setMinute(min: string) {
    onChange(`${h || '08'}:${min}`)
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={h || ''}
        onChange={e => setHour(e.target.value)}
        required={required}
        className={selectClass + ' flex-1'}
      >
        <option value="" disabled>Oră</option>
        {hours.map(hr => (
          <option key={hr} value={hr}>{hr}:00</option>
        ))}
      </select>
      <span className="text-gray-400 font-bold text-lg">:</span>
      <select
        value={m || ''}
        onChange={e => setMinute(e.target.value)}
        required={required}
        className={selectClass + ' flex-1'}
      >
        <option value="" disabled>Min</option>
        {minutes.map(mn => (
          <option key={mn} value={mn}>{mn}</option>
        ))}
      </select>
    </div>
  )
}
