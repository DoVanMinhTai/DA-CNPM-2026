import React from 'react'
import QuestionCard from './QuestionCard'

export default function QuestionsDisplay({ questions = [], loading, onOpenInterview }) {
  if (loading) return <div>Loading...</div>
  if (!questions || questions.length === 0) return <div className="text-sm text-on-surface-variant">No interviews yet.</div>

  // show newest first
  const sorted = [...questions].sort((a, b) => {
    const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0
    const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0
    return tb - ta
  })

  return (
    <div className="space-y-6">
      {sorted.map((entry, idx) => (
        <div key={entry.id || entry.createdAt || idx} className="bg-surface-container-lowest rounded-lg p-4 border border-outline-variant">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm text-on-surface-variant">Interview #{sorted.length - idx} · {entry.createdAt ? new Date(entry.createdAt).toLocaleString() : ''}</div>
            <div>
              <button onClick={() => onOpenInterview && onOpenInterview(entry)} className="text-sm text-primary">Open</button>
            </div>
          </div>
          <div className="grid gap-3">
            {(entry.questions || entry.items || entry).map((q, i) => (
              <div key={i} className="mb-0">
                <QuestionCard question={q} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
