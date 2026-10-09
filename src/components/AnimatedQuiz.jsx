import React, { useState, useEffect } from 'react';
import { X, Trophy, AlertCircle, CheckCircle2, ChevronRight, Zap } from 'lucide-react';

const AnimatedQuiz = ({ skill, onClose }) => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    // Generate a dynamic mock quiz based on the skill
    const generateQuiz = () => {
      setQuestions([
        {
          id: 1,
          question: `Which of the following is a core concept associated with ${skill}?`,
          options: [
            "Data Encapsulation and Modularization",
            "Hardware-level CPU instruction manipulation",
            "Analog signal processing",
            "Legacy Fortran syntax compilation"
          ],
          correctIdx: 0,
          explanation: `In modern ${skill}, modularization and encapsulation are key to building scalable, maintainable architectures.`
        },
        {
          id: 2,
          question: `When implementing ${skill} in a production environment, what is the primary concern?`,
          options: [
            "Visual aesthetics of the IDE",
            "Performance optimization and scalability",
            "Using the oldest possible version for stability",
            "Disabling all security protocols to speed up execution"
          ],
          correctIdx: 1,
          explanation: `Performance and scalability are always the top priorities when deploying ${skill} solutions to real users.`
        },
        {
          id: 3,
          question: `What is a common pitfall developers face when first learning ${skill}?`,
          options: [
            "Typing too fast",
            "Over-engineering simple problems",
            "Using a dark-themed text editor",
            "Listening to music while coding"
          ],
          correctIdx: 1,
          explanation: `Beginners often over-complicate solutions. Mastering ${skill} means knowing when to keep things simple.`
        }
      ]);
      setLoading(false);
    };

    // Simulate AI loading time
    setTimeout(generateQuiz, 1200);
  }, [skill]);

  const handleSelect = (idx) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);
    
    if (idx === questions[currentQuestionIdx].correctIdx) {
      setScore(s => s + 1);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx(idx => idx + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setShowResults(true);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-secondary/80 backdrop-blur-sm animate-in fade-in duration-300">
        <div className="bg-card/90 border border-blue/50 rounded-2xl p-10 flex flex-col items-center shadow-glass relative overflow-hidden">
           <div className="absolute inset-0 bg-primary/10 animate-pulse"></div>
           <Zap className="text-primary animate-bounce mb-4" size={48} />
           <h2 className="text-2xl font-display font-bold text-foreground relative z-10">Generating Quiz...</h2>
           <p className="text-muted-foreground mt-2 text-center max-w-xs relative z-10">AI is crafting a challenge tailored specifically to your {skill} gaps.</p>
        </div>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-secondary/80 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-card/90 border border-border rounded-2xl p-10 max-w-md w-full shadow-glass text-center relative overflow-hidden">
          {score === questions.length && <div className="absolute inset-0 bg-emerald-500/10 pointer-events-none"></div>}
          
          <Trophy size={64} className={`mx-auto mb-6 ${score > 1 ? 'text-warning' : 'text-line'}`} />
          <h2 className="text-3xl font-display font-bold text-foreground mb-2">Quiz Complete!</h2>
          <p className="text-muted-foreground mb-6">You scored <span className="text-primary font-bold text-xl">{score}</span> out of {questions.length} on <strong>{skill}</strong>.</p>
          
          <div className="w-full bg-line/50 rounded-full h-3 mb-8 overflow-hidden">
             <div 
               className={`h-full ${score === questions.length ? 'bg-emerald-500' : score > 0 ? 'bg-primary' : 'bg-rose'}`}
               style={{ width: `${(score / questions.length) * 100}%`, transition: 'width 1s ease-out' }}
             ></div>
          </div>

          <button 
            onClick={onClose}
            className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-600 transition-colors shadow-md"
          >
            Return to Roadmap
          </button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestionIdx];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-secondary/80 backdrop-blur-md animate-in fade-in duration-300 p-4">
      <div className="bg-card border border-border rounded-3xl max-w-2xl w-full shadow-[0_0_50px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-soft to-card p-6 border-b border-border flex justify-between items-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10"></div>
          <div>
            <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Knowledge Check</div>
            <h2 className="text-xl font-display font-bold text-foreground flex items-center gap-2">
              <Zap size={20} className="text-warning" /> {skill}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 text-muted-foreground hover:bg-background rounded-full transition-colors relative z-10">
            <X size={24} />
          </button>
        </div>

        {/* Progress */}
        <div className="w-full bg-line/30 h-1.5">
          <div 
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${((currentQuestionIdx) / questions.length) * 100}%` }}
          ></div>
        </div>

        {/* Question Body */}
        <div className="p-8">
          <div className="text-sm font-bold text-muted-foreground mb-4 flex justify-between">
            <span>Question {currentQuestionIdx + 1} of {questions.length}</span>
            <span>Score: {score}</span>
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-8 leading-snug">{currentQ.question}</h3>
          
          <div className="space-y-3">
            {currentQ.options.map((option, idx) => {
              let btnClass = "w-full text-left p-4 rounded-xl border-2 font-medium transition-all duration-300 flex justify-between items-center group ";
              
              if (!isAnswered) {
                btnClass += "border-border bg-background hover:border-blue/50 hover:bg-primary-soft/30 hover:-translate-y-0.5 cursor-pointer";
              } else {
                if (idx === currentQ.correctIdx) {
                  btnClass += "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400";
                } else if (idx === selectedOption) {
                  btnClass += "border-rose bg-destructive/10 text-destructive";
                } else {
                  btnClass += "border-border/50 bg-background/50 text-muted-foreground opacity-50";
                }
              }

              return (
                <button 
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  disabled={isAnswered}
                  className={btnClass}
                >
                  <span className="flex-1 pr-4">{option}</span>
                  {isAnswered && idx === currentQ.correctIdx && <CheckCircle2 className="text-emerald-500 shrink-0 animate-in zoom-in" size={20} />}
                  {isAnswered && idx === selectedOption && idx !== currentQ.correctIdx && <AlertCircle className="text-destructive shrink-0 animate-in zoom-in" size={20} />}
                  {!isAnswered && <div className="w-5 h-5 rounded-full border-2 border-border group-hover:border-blue/50 shrink-0"></div>}
                </button>
              );
            })}
          </div>

          {isAnswered && (
            <div className="mt-8 animate-in slide-in-from-bottom-4 duration-500">
              <div className={`p-4 rounded-xl flex items-start gap-3 ${selectedOption === currentQ.correctIdx ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-destructive/10 border border-rose/20'}`}>
                {selectedOption === currentQ.correctIdx ? (
                  <CheckCircle2 className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" size={20} />
                ) : (
                  <AlertCircle className="text-destructive shrink-0 mt-0.5" size={20} />
                )}
                <div>
                  <div className={`font-bold mb-1 ${selectedOption === currentQ.correctIdx ? 'text-emerald-700 dark:text-emerald-400' : 'text-destructive'}`}>
                    {selectedOption === currentQ.correctIdx ? 'Spot On!' : 'Not Quite.'}
                  </div>
                  <p className="text-sm text-muted-foreground">{currentQ.explanation}</p>
                </div>
              </div>
              
              <button 
                onClick={nextQuestion}
                className="mt-6 w-full py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary-600 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg group"
              >
                {currentQuestionIdx < questions.length - 1 ? 'Next Question' : 'See Results'} 
                <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnimatedQuiz;
