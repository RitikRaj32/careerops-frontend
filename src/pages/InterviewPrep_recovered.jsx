
  // --- Mock Interview State ---
  const [mockRole, setMockRole] = useState(user?.targetRole || 'Frontend Developer');
  const [mockLevel, setMockLevel] = useState('Mid-Level');
  const [mockType, setMockType] = useState('Technical');
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [mockQuestions, setMockQuestions] = useState([]);
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState(null); 
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // --- Question Bank State ---
  const [qbRole, setQbRole] = useState('Frontend Developer');
  const [qbSkill, setQbSkill] = useState('JavaScript');
  const [qbCompany, setQbCompany] = useState('Startup');
  const [bankQuestions, setBankQuestions] = useState([]);
  const [isGeneratingQb, setIsGeneratingQb] = useState(false);

  // --- Resume & Skill Gap State ---
  const [resumeQuestions, setResumeQuestions] = useState([]);
  const [isGeneratingResume, setIsGeneratingResume] = useState(false);
  
  const [skillGaps, setSkillGaps] = useState([]);
  const [selectedGap, setSelectedGap] = useState(null);
  const [gapQuestions, setGapQuestions] = useState([]);
  const [isGeneratingGaps, setIsGeneratingGaps] = useState(false);
  const [isGeneratingGapQs, setIsGeneratingGapQs] = useState(false);

  useEffect(() => {
    if (activeTab === 'skillgap' && skillGaps.length === 0) {
      const fetchGaps = async () => {
        setIsGeneratingGaps(true);
        try {
          const res = await fetch((import.meta.env.VITE_API_URL || "") + '/api/roadmap/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              targetRole: user?.targetRole || qbRole || 'Software Engineer', 
              currentSkills: user?.skillsList ? user.skillsList.split(',') : ['HTML', 'CSS']
            })
          });
          const data = await res.json();
          if (data.success && data.gaps) {
            const gaps = data.gaps.map(g => g.skill);
            setSkillGaps(gaps);
            if (gaps.length > 0) setSelectedGap(gaps[0]);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setIsGeneratingGaps(false);
        }
      };
      fetchGaps();
    }
  }, [activeTab]);

  useEffect(() => {
    if (selectedGap) {
      const fetchGapQuestions = async () => {
        setIsGeneratingGapQs(true);
        try {
          const res = await fetch((import.meta.env.VITE_API_URL || "") + '/api/interview/gap', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ gap: selectedGap, role: user?.targetRole || qbRole || 'Software Engineer' })
          });
          const data = await res.json();
          if (data.success && data.questions) {
            setGapQuestions(data.questions);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setIsGeneratingGapQs(false);
        }
      };
      fetchGapQuestions();
    }
  }, [selectedGap]);

  // Voice removed, using manual text input now.

  // --- Mock Interview Actions ---
  const startMockInterview = () => {
    setMockQuestions([
      { q: `Based on your role as a ${mockLevel} ${mockRole}, can you explain a complex problem you solved recently?` },
      { q: `How do you ensure your code is maintainable and scalable?` },
      { q: `Tell me about a time you disagreed with a senior team member.` }
    ]);
    setIsInterviewStarted(true);
    setCurrentQuestionIndex(0);
    setFeedback(null);
    setTranscript('');
  };