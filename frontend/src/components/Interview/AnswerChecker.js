const normalize = (s) => (s || '').toString().toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean)

const calcOverlapScore = (rubricText, answer) => {
  const rWords = normalize(rubricText)
  const aWords = normalize(answer)
  if (rWords.length === 0 || aWords.length === 0) return 0
  const setR = new Set(rWords)
  const matched = aWords.filter(w => setR.has(w)).length
  return matched / Math.max(rWords.length, 1)
}

const mapToScore = (ratio) => {
  if (ratio >= 0.7) return 5
  if (ratio >= 0.4) return 3
  if (ratio > 0) return 1
  return 0
}

const evaluate = (question, answer) => {
  // question.rubric may be object with score5/score3/score1 or string
  let rubric = question.rubric
  let rubricText = ''
  if (!rubric) rubricText = ''
  else if (typeof rubric === 'string') rubricText = rubric
  else if (Array.isArray(rubric)) rubricText = rubric.join(' ')
  else if (typeof rubric === 'object') {
    // prefer score5 then score3 then score1
    rubricText = rubric.score5 || rubric.score3 || rubric.score1 || JSON.stringify(rubric)
  }

  const ratio = calcOverlapScore(rubricText, answer)
  const score = mapToScore(ratio)
  const maxScore = 5
  const feedback = score === 0 ? 'No matching keywords detected. Try to address the rubric points.' : `Matched ${Math.round(ratio * 100)}% of rubric keywords.`
  return { score, maxScore, feedback }
}

export default { evaluate }
