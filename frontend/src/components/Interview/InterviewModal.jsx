import React, { useState } from 'react'
import AnswerChecker from './AnswerChecker'

export default function InterviewModal({ interview, onClose }) {
  const [answers, setAnswers] = useState({})
  const [results, setResults] = useState(null)

  if (!interview) return null

  const questions = interview.questions || interview.items || interview

  const handleChange = (id, value) => {
    setAnswers(prev => ({ ...prev, [id]: value }))
  }

  const handleCheck = () => {
    const res = questions.map((q) => {
      const userAnswer = (answers[q.id] || '').trim()
      const evalRes = AnswerChecker.evaluate(q, userAnswer)
      return { questionId: q.id, ...evalRes }
    })
    setResults(res)
  }

  const totalScore = results ? Math.round(results.reduce((s, r) => s + (r.score || 0), 0) / (results.length || 1)) : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-[90%] md:w-2/3 max-h-[85vh] overflow-auto rounded-lg p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Interview Questions</h2>
          <div className="flex items-center gap-2">
            {results && <div className="text-sm font-semibold">Overall: {totalScore}</div>}
            <button onClick={onClose} className="text-sm text-primary">Close</button>
          </div>
        </div>

        <div className="space-y-4">
          {questions.map((q, idx) => (
            <div key={q.id || idx} className="border rounded p-3">
              <div className="font-semibold">Q{idx + 1}. {q.text || q.question || q.q}</div>
              {q.category && <div className="text-xs text-on-surface-variant">Category: {q.category}</div>}
              <div className="mt-2">
                <textarea
                  value={answers[q.id] || ''}
                  onChange={(e) => handleChange(q.id, e.target.value)}
                  className="w-full border p-2 rounded"
                  rows={3}
                  placeholder="Type your answer here"
                />
              </div>
              {results && (
                <div className="mt-2 bg-gray-50 p-2 rounded">
                  <div className="text-sm font-medium">Score: {results[idx]?.score} / {results[idx]?.maxScore}</div>
                  <div className="text-xs text-gray-700 mt-1">{results[idx]?.feedback}</div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-end gap-2">
          <button onClick={() => setAnswers({})} className="px-3 py-2 border rounded">Clear</button>
          <button onClick={handleCheck} className="px-4 py-2 bg-primary text-white rounded">Check Answers</button>
        </div>
      </div>
    </div>
  )
}
