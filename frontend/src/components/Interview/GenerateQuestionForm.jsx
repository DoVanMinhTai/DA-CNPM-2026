import React, { useState } from 'react'

export default function GenerateQuestionForm({ cvId, onGenerate, disabled }) {
  const [jobDescription, setJobDescription] = useState('')

  const submit = (e) => {
    e.preventDefault()
    if (!onGenerate) return
    onGenerate({ cvId, jobDescription })
  }

  return (
    <form onSubmit={submit} className="bg-surface-container-lowest rounded-lg p-5 border border-outline-variant">
      <label className="block text-sm font-medium mb-2">Optional Job Description</label>
      <textarea
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
        className="w-full p-2 border rounded mb-3"
        rows={5}
        placeholder="Paste job description or role details to tailor interview questions"
      />

      <div className="flex gap-2">
        <button type="submit" disabled={disabled} className="px-4 py-2 bg-primary text-white rounded">
          Generate Questions
        </button>
      </div>
    </form>
  )
}
