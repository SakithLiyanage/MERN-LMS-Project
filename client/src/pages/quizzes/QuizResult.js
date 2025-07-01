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
  const { id: quizId } = useParams();
  const [result, setResult] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuizResult = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`/api/quizzes/${quizId}/result`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
          setResult(res.data.result);
          // Fetch quiz details separately if needed
          const quizRes = await axios.get(`/api/quizzes/${quizId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (quizRes.data.success) {
            setQuiz(quizRes.data.data);
          }
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
  }, [quizId]);

  // Function to download quiz results as PDF
  const downloadResults = () => {
    // Create a text-based report that can be downloaded
    const report = generateQuizReport();
    const blob = new Blob([report], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${quiz?.title || 'Quiz'}_Results_${moment().format('YYYY-MM-DD_HH-mm')}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    toast.success('Results downloaded successfully!');
  };

  // Function to generate quiz report
  const generateQuizReport = () => {
    const correctAnswers = result.answers?.filter(a => a.isCorrect).length || 0;
    const totalQuestions = result.answers?.length || 0;
    const percentage = result.totalPossibleScore ? Math.round((result.score / result.totalPossibleScore) * 100) : 0;
    const isPassed = percentage >= 70;
    
    // Format time taken
    const formatTime = (seconds) => {
      if (!seconds) return 'Not recorded';
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      
      if (hours > 0) {
        return `${hours}h ${minutes}m ${secs}s`;
      } else if (minutes > 0) {
        return `${minutes}m ${secs}s`;
      } else {
        return `${secs}s`;
      }
    };

    let report = `QUIZ RESULTS REPORT\n`;
    report += `==================\n\n`;
    report += `Quiz Title: ${quiz?.title || 'Unknown Quiz'}\n`;
    report += `Completed: ${moment(result.submittedAt).format('MMMM D, YYYY [at] h:mm A')}\n`;
    report += `Time Taken: ${formatTime(result.timeTaken)}\n`;
    report += `Score: ${result.score}/${result.totalPossibleScore} (${percentage}%)\n`;
    report += `Status: ${isPassed ? 'PASSED' : 'FAILED'}\n`;
    report += `Correct Answers: ${correctAnswers}/${totalQuestions}\n\n`;
    
    report += `QUESTION REVIEW\n`;
    report += `===============\n\n`;
    
    result.answers?.forEach((answer, idx) => {
      const questionNum = idx + 1;
      report += `Question ${questionNum}:\n`;
      report += `Question: ${answer.questionText}\n`;
      report += `Your Answer: `;
      
      if (answer.textAnswer) {
        report += answer.textAnswer;
      } else if (answer.selectedOptionTexts && answer.selectedOptionTexts.length > 0) {
        report += answer.selectedOptionTexts.join(', ');
      } else {
        report += 'No answer provided';
      }
      
      report += `\nResult: ${answer.isCorrect ? 'CORRECT' : 'INCORRECT'}\n`;
      
      if (!answer.isCorrect) {
        report += `Correct Answer: `;
        if (answer.correctTextAnswers && answer.correctTextAnswers.length > 0) {
          report += answer.correctTextAnswers.join(', ');
        } else if (answer.correctOptionTexts && answer.correctOptionTexts.length > 0) {
          report += answer.correctOptionTexts.join(', ');
        } else {
          report += 'Not available';
        }
        report += `\n`;
      }
      
      if (answer.explanation) {
        report += `Explanation: ${answer.explanation}\n`;
      }
      
      report += `\n`;
    });
    
    return report;
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

  // Calculate correct answers and percentage
  const correctAnswers = result.answers?.filter(a => a.isCorrect).length || 0;
  const totalQuestions = result.answers?.length || 0;
  const percentage = result.totalPossibleScore ? Math.round((result.score / result.totalPossibleScore) * 100) : 0;
  const isPassed = percentage >= 70; // Default passing score

  // Format time taken
  const formatTime = (seconds) => {
    if (!seconds) return 'Not recorded';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {/* Header */}
        <div className={`p-6 text-white ${isPassed ? 'bg-green-600' : 'bg-red-600'}`}>
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">{quiz?.title || 'Quiz'} - Results</h1>
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
            Completed: {moment(result.submittedAt).format('MMMM D, YYYY [at] h:mm A')}
          </div>
        </div>
        
        {/* Summary */}
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <div className="text-lg font-semibold">{result.score}/{result.totalPossibleScore}</div>
              <div className="text-xs text-gray-500">Points</div>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <div className="text-lg font-semibold">{correctAnswers}/{totalQuestions}</div>
              <div className="text-xs text-gray-500">Correct Answers</div>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <div className="text-lg font-semibold">70%</div>
              <div className="text-xs text-gray-500">Passing Score</div>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <div className="text-lg font-semibold">{formatTime(result.timeTaken)}</div>
              <div className="text-xs text-gray-500">Time Taken</div>
            </div>
          </div>
          
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Question Review</h2>
          
          <div className="space-y-6">
            {result.answers?.map((answer, idx) => {
              const isCorrect = answer.isCorrect;
              
              return (
                <div
                  key={answer.question || idx}
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
                    <div className="ml-3 flex-1">
                      <h3 className="font-medium">Question {idx + 1}</h3>
                      <p className="text-gray-800 mt-1">{answer.questionText}</p>
                      
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-500">Your Answer:</p>
                        <div className="mt-1 text-sm">
                          {answer.textAnswer ? (
                            <p className="italic bg-gray-100 p-2 rounded">{answer.textAnswer}</p>
                          ) : answer.selectedOptionTexts ? (
                            <ul className="list-disc pl-5 space-y-1">
                              {answer.selectedOptionTexts.map((text, i) => (
                                <li key={i} className="bg-gray-100 p-1 rounded">
                                  {text}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-gray-400 italic">No answer provided</p>
                          )}
                        </div>
                      </div>
                      
                      {!isCorrect && (
                        <div className="mt-3 bg-white p-2 rounded border border-gray-200">
                          <p className="text-sm font-medium text-gray-500">Correct Answer:</p>
                          <div className="mt-1 text-sm">
                            {answer.correctTextAnswers ? (
                              <ul className="list-disc pl-5 space-y-1">
                                {answer.correctTextAnswers.map((text, i) => (
                                  <li key={i} className="text-green-700 font-medium">
                                    {text}
                                  </li>
                                ))}
                              </ul>
                            ) : answer.correctOptionTexts ? (
                              <ul className="list-disc pl-5 space-y-1">
                                {answer.correctOptionTexts.map((text, i) => (
                                  <li key={i} className="text-green-700 font-medium">
                                    {text}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-gray-400 italic">Correct answer not available</p>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {answer.explanation && (
                        <div className="mt-3 bg-blue-50 p-2 rounded border border-blue-200">
                          <p className="text-sm font-medium text-blue-700">Explanation:</p>
                          <p className="mt-1 text-sm text-blue-800">{answer.explanation}</p>
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
            to={`/courses/${quiz?.course || '#'}`}
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
