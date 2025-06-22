import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import moment from 'moment';
import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon,
  ArrowLeftIcon,
  DocumentDownloadIcon,
} from '@heroicons/react/outline';

const QuizResult = () => {
  const { quizId, resultId } = useParams();
  const [result, setResult] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuizResult = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`/api/quizzes/${quizId}/results/${resultId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.data.success) {
          setQuiz(res.data.quiz);
          setResult(res.data.result);
        } else {
          toast.error('Failed to load quiz results');
        }
      } catch (error) {
        console.error('Error fetching quiz results:', error);
        toast.error('Error loading quiz results');
      } finally {
        setLoading(false);
      }
    };

    fetchQuizResult();
  }, [quizId, resultId]);

  // Function to download quiz results as PDF
  const downloadResults = () => {
    toast.info('Downloading quiz results...');
    // Implement PDF generation and download
    // This would typically use a library like jsPDF or call a server endpoint
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!result || !quiz) {
    return (
      <div className="max-w-3xl mx-auto p-4">
        <div className="bg-red-50 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <ExclamationCircleIcon className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Results not available</h3>
            </div>
          </div>
        </div>
        
        <Link
          to="/dashboard"
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
        >
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const percentage = Math.round((result.score / result.totalPoints) * 100);
  const isPassed = percentage >= (quiz.passScore || 70);

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {/* Header */}
        <div className={`p-6 text-white ${isPassed ? 'bg-green-600' : 'bg-red-600'}`}>
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">{quiz.title} - Results</h1>
            <div className="flex items-center">
              {isPassed ? (
                <CheckCircleIcon className="w-8 h-8 mr-2" />
              ) : (
                <XCircleIcon className="w-8 h-8 mr-2" />
              )}
              <div>
                <div className="text-xl font-bold">{percentage}%</div>
                <div className="text-sm opacity-80">
                  {isPassed ? 'Passed' : 'Failed'}
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 text-sm opacity-80">
            Completed: {moment(result.completedAt).format('MMMM D, YYYY [at] h:mm A')}
          </div>
        </div>
        
        {/* Summary */}
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <div className="text-lg font-semibold">{result.score}/{result.totalPoints}</div>
              <div className="text-xs text-gray-500">Points</div>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <div className="text-lg font-semibold">{result.correctAnswers}/{quiz.questions?.length}</div>
              <div className="text-xs text-gray-500">Correct Answers</div>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <div className="text-lg font-semibold">{quiz.passScore || 70}%</div>
              <div className="text-xs text-gray-500">Passing Score</div>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <div className="text-lg font-semibold">{Math.floor(result.timeTaken / 60)}:{(result.timeTaken % 60).toString().padStart(2, '0')}</div>
              <div className="text-xs text-gray-500">Time Taken</div>
            </div>
          </div>
          
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Question Review</h2>
          
          <div className="space-y-6">
            {quiz.questions?.map((question, idx) => {
              const userAnswer = result.answers.find(a => a.questionId === question._id);
              const isCorrect = userAnswer?.isCorrect;
              
              return (
                <div
                  key={question._id || idx}
                  className={`p-4 rounded-lg border ${
                    isCorrect
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex">
                    <div className="flex-shrink-0 mt-1">
                      {isCorrect ? (
                        <CheckCircleIcon className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircleIcon className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                    <div className="ml-3">
                      <h3 className="font-medium">Question {idx + 1}</h3>
                      <p className="text-gray-800 mt-1">{question.text}</p>
                      
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-500">Your Answer:</p>
                        <div className="mt-1 text-sm">
                          {question.type === 'multiple' ? (
                            <ul className="list-disc pl-5 space-y-1">
                              {userAnswer?.answer.map(answerIdx => (
                                <li key={answerIdx}>
                                  {question.options[answerIdx]}
                                </li>
                              ))}
                            </ul>
                          ) : question.type === 'single' ? (
                            <p>{question.options[userAnswer?.answer]}</p>
                          ) : (
                            <p className="italic">{userAnswer?.answer}</p>
                          )}
                        </div>
                      </div>
                      
                      {!isCorrect && (
                        <div className="mt-3 bg-white p-2 rounded border border-gray-200">
                          <p className="text-sm font-medium text-gray-500">Correct Answer:</p>
                          <div className="mt-1 text-sm">
                            {question.type === 'multiple' ? (
                              <ul className="list-disc pl-5 space-y-1">
                                {question.correctAnswer.map(answerIdx => (
                                  <li key={answerIdx}>
                                    {question.options[answerIdx]}
                                  </li>
                                ))}
                              </ul>
                            ) : question.type === 'single' ? (
                              <p>{question.options[question.correctAnswer]}</p>
                            ) : (
                              <p className="italic">{question.correctAnswer}</p>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {question.explanation && (
                        <div className="mt-3 bg-white p-2 rounded border border-gray-200">
                          <p className="text-sm font-medium text-gray-500">Explanation:</p>
                          <p className="mt-1 text-sm">{question.explanation}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Actions */}
        <div className="px-6 py-4 bg-gray-50 flex justify-between items-center">
          <Link
            to={`/courses/${quiz.course}`}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back to Course
          </Link>
          
          <button
            onClick={downloadResults}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
          >
            <DocumentDownloadIcon className="mr-2 h-4 w-4" />
            Download Results
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizResult;
