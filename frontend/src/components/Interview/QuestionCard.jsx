import React from 'react'

export default function QuestionCard({ question = {} }) {
  const text = question.text || question.question || question.q || ''

  return (
    <div className="p-4 bg-white rounded-lg border shadow-sm">
      <div className="font-semibold text-on-surface">{text}</div>
      {question.category && <div className="text-xs text-on-surface-variant mt-1">Category: {question.category}</div>}
      {question.difficulty && <div className="text-xs text-on-surface-variant">Difficulty: {question.difficulty}</div>}
      {question.rubric && (
        <div className="mt-2 text-sm text-on-surface-variant">
          {typeof question.rubric === 'string' ? (
            question.rubric
          ) : Array.isArray(question.rubric) ? (
            question.rubric.map((r, i) => (
              <div key={i} className="mb-1">{typeof r === 'string' ? r : JSON.stringify(r)}</div>
            ))
          ) : (
            Object.entries(question.rubric).map(([k, v]) => (
              <div key={k} className="mb-1"><strong className="mr-1">{k}:</strong>{typeof v === 'string' ? v : JSON.stringify(v)}</div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
