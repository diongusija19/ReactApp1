import { useEffect, useMemo, useState } from 'react'
import './App.css'

type FocusSession = {
  id: number
  taskName: string
  durationSeconds: number
}

type SessionListProps = {
  sessions: FocusSession[]
}

function SessionList({ sessions }: SessionListProps) {
  if (sessions.length === 0) {
    return <p className="empty">No completed sessions yet.</p>
  }

  return (
    <ul className="session-list" aria-live="polite">
      {sessions.map((session) => (
        <li key={session.id}>
          <span className="task">{session.taskName}</span>
          <span className="duration">{session.durationSeconds}s</span>
        </li>
      ))}
    </ul>
  )
}

function App() {
  const [taskName, setTaskName] = useState<string>('')
  const [seconds, setSeconds] = useState<number>(0)
  const [isRunning, setIsRunning] = useState<boolean>(false)
  const [sessions, setSessions] = useState<FocusSession[]>([])

  // Increment elapsed time once per second while a session is active.
  useEffect(() => {
    if (!isRunning) {
      return
    }

    const intervalId = window.setInterval(() => {
      setSeconds((prevSeconds) => prevSeconds + 1)
    }, 1000)

    return () => window.clearInterval(intervalId)
  }, [isRunning])

  const trimmedTask = taskName.trim()
  const canStart = !isRunning && trimmedTask.length > 0
  const canStop = isRunning

  const totalFocusSeconds = useMemo(
    () => sessions.reduce((sum, session) => sum + session.durationSeconds, 0),
    [sessions],
  )

  const startSession = () => {
    if (!canStart) {
      return
    }

    setSeconds(0)
    setIsRunning(true)
  }

  const stopSession = () => {
    if (!canStop) {
      return
    }

    const completedSession: FocusSession = {
      id: Date.now(),
      taskName: trimmedTask,
      durationSeconds: seconds,
    }

    setSessions((prevSessions) => [completedSession, ...prevSessions])
    setIsRunning(false)
    setSeconds(0)
    setTaskName('')
  }

  return (
    <main className="app-shell">
      <section className="panel">
        <h1>Focus Session Tracker</h1>
        <p className="subtitle">Track what you work on and how long you stay focused.</p>

        <div className="controls">
          <label htmlFor="taskName">Task name</label>
          <input
            id="taskName"
            type="text"
            placeholder="Write API tests"
            value={taskName}
            onChange={(event) => setTaskName(event.target.value)}
            disabled={isRunning}
          />

          <div className="buttons">
            <button type="button" onClick={startSession} disabled={!canStart}>
              Start
            </button>
            <button type="button" onClick={stopSession} disabled={!canStop}>
              Stop
            </button>
          </div>
        </div>

        <div className="timer" role="status" aria-live="polite">
          {seconds}s
        </div>
      </section>

      <section className="panel">
        <h2>Completed Sessions</h2>
        <p className="subtitle">
          {sessions.length} session(s), {totalFocusSeconds}s total focus time
        </p>
        <SessionList sessions={sessions} />
      </section>
    </main>
  )
}

export default App
