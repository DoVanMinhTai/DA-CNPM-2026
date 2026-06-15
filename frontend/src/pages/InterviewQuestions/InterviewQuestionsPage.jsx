import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import GenerateQuestionForm from '../../components/Interview/GenerateQuestionForm'
import QuestionsDisplay from '../../components/Interview/QuestionsDisplay'
import InterviewModal from '../../components/Interview/InterviewModal'
import interviewApi from '../../api/interviewApi'

export default function InterviewQuestionsPage() {
  const { cvId } = useParams()
  const [interviews, setInterviews] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedInterview, setSelectedInterview] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const res = await interviewApi.getInterviewsByCv(cvId)
        setInterviews(res || [])
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    if (cvId) load()
  }, [cvId])

  const handleGenerate = async (payload) => {
    try {
      setLoading(true)
      const res = await interviewApi.generateQuestions(payload)
      // prepend the newly created interview (API shape may vary)
      if (res) setInterviews(prev => [res, ...prev])
      // open modal for the newly generated interview
      if (res) setSelectedInterview(res)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Interview Questions</h1>
        <Link to={`/cv/${cvId}`} className="text-sm text-primary">Back to CV</Link>
      </div>

      <GenerateQuestionForm cvId={cvId} onGenerate={handleGenerate} disabled={loading} />

      <div className="mt-6">
        <QuestionsDisplay questions={interviews} loading={loading} onOpenInterview={(it) => setSelectedInterview(it)} />
      </div>

      {selectedInterview && (
        <InterviewModal interview={selectedInterview} onClose={() => setSelectedInterview(null)} />
      )}
    </div>
  )
}
