import { useState } from 'react';

const SurveyModal = ({ questions, onSubmit, onClose, errorMessage, eventTitle }) => {
  const [answers, setAnswers] = useState({});

  const handleChange = (question, option, checked, textValue) => {
    setAnswers(prev => {
      let newAns = { ...prev };
      if (question.questionType === 'single') {
        newAns[question.questionId] = { optionId: option.optionId, [`text_${option.optionId}`]: textValue || '' };
      } else if (question.questionType === 'multiple') {
        if (!newAns[question.questionId]) {
          newAns[question.questionId] = { options: [] };
        }
        
        let arr = [...(newAns[question.questionId].options || [])];
        if (checked) {
          if (!arr.includes(option.optionId)) {
            arr.push(option.optionId);
          }
        } else {
          arr = arr.filter(id => id !== option.optionId);
        }
        newAns[question.questionId] = { 
          ...newAns[question.questionId],
          options: arr 
        };
      }
      return newAns;
    });
  };

  const handleTextChange = (question, option, value) => {
    setAnswers(prev => ({
      ...prev,
      [question.questionId]: {
        ...(prev[question.questionId] || {}),
        [`text_${option.optionId}`]: value
      }
    }));
  };

  const handleSubmit = () => {
    onSubmit(answers);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full">
        <h2 className="text-lg font-bold mb-2">Khảo sát trước khi đăng ký</h2>
        {eventTitle && (
          <div className="text-sm text-gray-600 mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <strong>Sự kiện:</strong> {eventTitle}
          </div>
        )}
        {errorMessage && (
          <div className="text-red-600 text-sm mb-2">{errorMessage}</div>
        )}
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {questions.map(q => (
            <div key={q.questionId}>
              <div className="font-medium mb-1">{q.questionText}</div>
              <div>
                {q.options.map(opt => (
                  <div key={opt.optionId} className="flex items-center mb-1">
                    {q.questionType === 'single' ? (
                      <input
                        type="radio"
                        name={`q${q.questionId}`}
                        checked={answers[q.questionId]?.optionId === opt.optionId}
                        onChange={() => handleChange(q, opt, true)}
                        className="mr-2"
                      />
                    ) : (
                      <input
                        type="checkbox"
                        checked={answers[q.questionId]?.options?.includes(opt.optionId) || false}
                        onChange={e => {
                          handleChange(q, opt, e.target.checked);
                        }}
                        className="mr-2"
                      />
                    )}
                    <span>{opt.optionText}</span>
                    {opt.requireText && (
                      <input
                        type="text"
                        placeholder="Nhập chi tiết"
                        className="ml-2 border px-2 py-1 rounded"
                        value={answers[q.questionId]?.[`text_${opt.optionId}`] || ''}
                        onChange={e => handleTextChange(q, opt, e.target.value)}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end mt-4 space-x-2">
          <button onClick={onClose} className="px-3 py-1 rounded bg-gray-300">Hủy</button>
          <button onClick={handleSubmit} className="px-3 py-1 rounded bg-red-600 text-white">Gửi khảo sát</button>
        </div>
      </div>
    </div>
  );
};

export default SurveyModal; 