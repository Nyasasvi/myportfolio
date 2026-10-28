'use client'

import { useState, useEffect } from 'react';
import { motion, MotionConfig } from 'framer-motion';
import { Check, CheckCircle2, Lightbulb, Loader2, XCircle } from 'lucide-react';
import './index.css';

interface Challenge {
    id: string;
    title: string;
    description: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    category: string;
    starterCode: string;
    testCases: string[];
    hints: string[];
    icon: string;
    color: string;
}

interface UserProgress {
    completedChallenges: string[];
    skillLevel: {
        [category: string]: number;
    };
    totalAttempts: number;
}

const challenges: Challenge[] = [
    {
        id: 'reverse-string',
        title: 'Reverse a String',
        description: 'Write a function that reverses a string. Input: "hello" → Output: "olleh"',
        difficulty: 'Easy',
        category: 'JavaScript',
        starterCode: 'function reverseString(str) {\n  // Your code here\n  \n}',
        testCases: [
            'reverseString("hello") === "olleh"',
            'reverseString("world") === "dlrow"',
            'reverseString("") === ""'
        ],
        hints: [
            'You can use the split(), reverse(), and join() methods',
            'Or try a for loop starting from the end'
        ],
        icon: '📝',
        color: '#10b981'
    },
    {
        id: 'fizzbuzz',
        title: 'FizzBuzz',
        description: 'Print numbers 1-100. For multiples of 3 print "Fizz", for multiples of 5 print "Buzz", for both print "FizzBuzz"',
        difficulty: 'Easy',
        category: 'JavaScript',
        starterCode: 'function fizzBuzz() {\n  // Your code here\n  \n}',
        testCases: [
            'Output should contain "Fizz" at positions divisible by 3',
            'Output should contain "Buzz" at positions divisible by 5',
            'Output should contain "FizzBuzz" at positions divisible by 15'
        ],
        hints: [
            'Use the modulo operator (%) to check divisibility',
            'Check for 15 first, then 5, then 3'
        ],
        icon: '🎯',
        color: '#3b82f6'
    },
    {
        id: 'palindrome',
        title: 'Palindrome Checker',
        description: 'Check if a given string is a palindrome (reads the same forward and backward)',
        difficulty: 'Easy',
        category: 'JavaScript',
        starterCode: 'function isPalindrome(str) {\n  // Your code here\n  \n}',
        testCases: [
            'isPalindrome("racecar") === true',
            'isPalindrome("hello") === false',
            'isPalindrome("A man a plan a canal Panama") === true (ignore spaces and case)'
        ],
        hints: [
            'Convert to lowercase and remove spaces first',
            'Compare string with its reverse'
        ],
        icon: '🔄',
        color: '#8b5cf6'
    },
    {
        id: 'two-sum',
        title: 'Two Sum',
        description: 'Given an array of numbers and a target, return indices of two numbers that add up to the target',
        difficulty: 'Medium',
        category: 'Algorithms',
        starterCode: 'function twoSum(nums, target) {\n  // Your code here\n  \n}',
        testCases: [
            'twoSum([2,7,11,15], 9) returns [0,1]',
            'twoSum([3,2,4], 6) returns [1,2]'
        ],
        hints: [
            'Use a hash map to store seen numbers',
            'For each number, check if target - number exists in the map'
        ],
        icon: '🔢',
        color: '#f59e0b'
    },
    {
        id: 'valid-parentheses',
        title: 'Valid Parentheses',
        description: 'Check if a string containing (), {}, [] is valid. Each opening bracket must be closed in correct order',
        difficulty: 'Medium',
        category: 'Algorithms',
        starterCode: 'function isValid(s) {\n  // Your code here\n  \n}',
        testCases: [
            'isValid("()") === true',
            'isValid("()[]{}") === true',
            'isValid("(]") === false'
        ],
        hints: [
            'Use a stack data structure',
            'Push opening brackets, pop and match closing brackets'
        ],
        icon: '🔗',
        color: '#ec4899'
    },
    {
        id: 'merge-sorted-arrays',
        title: 'Merge Sorted Arrays',
        description: 'Merge two sorted arrays into one sorted array',
        difficulty: 'Medium',
        category: 'Algorithms',
        starterCode: 'function mergeSortedArrays(arr1, arr2) {\n  // Your code here\n  \n}',
        testCases: [
            'mergeSortedArrays([1,3,5], [2,4,6]) === [1,2,3,4,5,6]',
            'mergeSortedArrays([1], [2]) === [1,2]'
        ],
        hints: [
            'Use two pointers, one for each array',
            'Compare elements and add the smaller one to result'
        ],
        icon: '🔀',
        color: '#06b6d4'
    },
    {
        id: 'binary-search',
        title: 'Binary Search',
        description: 'Implement binary search to find a target value in a sorted array. Return the index or -1',
        difficulty: 'Hard',
        category: 'Algorithms',
        starterCode: 'function binarySearch(arr, target) {\n  // Your code here\n  \n}',
        testCases: [
            'binarySearch([1,2,3,4,5], 3) === 2',
            'binarySearch([1,2,3,4,5], 6) === -1'
        ],
        hints: [
            'Use left and right pointers',
            'Compare middle element with target and adjust pointers'
        ],
        icon: '🎯',
        color: '#ef4444'
    },
    {
        id: 'quicksort',
        title: 'Quick Sort',
        description: 'Implement the quicksort algorithm to sort an array',
        difficulty: 'Hard',
        category: 'Algorithms',
        starterCode: 'function quickSort(arr) {\n  // Your code here\n  \n}',
        testCases: [
            'quickSort([5,2,8,1,9]) === [1,2,5,8,9]',
            'quickSort([3,2,1]) === [1,2,3]'
        ],
        hints: [
            'Choose a pivot element',
            'Partition array into elements less than and greater than pivot',
            'Recursively sort the partitions'
        ],
        icon: '⚡',
        color: '#667eea'
    }
];

export default function SkillAssessmentPage() {
    const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
    const [userCode, setUserCode] = useState('');
    const [isEvaluating, setIsEvaluating] = useState(false);
    const [evaluation, setEvaluation] = useState<any>(null);
    const [showHints, setShowHints] = useState(false);
    const [activeCategory, setActiveCategory] = useState('all');
    const [userProgress, setUserProgress] = useState<UserProgress>({
        completedChallenges: [],
        skillLevel: {
            'JavaScript': 0,
            'Algorithms': 0
        },
        totalAttempts: 0
    });

    // Load progress from localStorage
    useEffect(() => {
        const savedProgress = localStorage.getItem('skillAssessmentProgress');
        if (savedProgress) {
            setUserProgress(JSON.parse(savedProgress));
        }
    }, []);

    // Save progress to localStorage
    useEffect(() => {
        localStorage.setItem('skillAssessmentProgress', JSON.stringify(userProgress));
    }, [userProgress]);

    const categories = [
        { id: 'all', label: 'All Challenges', icon: '🎯', count: challenges.length },
        { id: 'JavaScript', label: 'JavaScript', icon: '💻', count: challenges.filter(c => c.category === 'JavaScript').length },
        { id: 'Algorithms', label: 'Algorithms', icon: '⚡', count: challenges.filter(c => c.category === 'Algorithms').length },
    ];

    const filteredChallenges = activeCategory === 'all'
        ? challenges
        : challenges.filter(c => c.category === activeCategory);

    const handleChallengeSelect = (challenge: Challenge) => {
        setSelectedChallenge(challenge);
        setUserCode(challenge.starterCode);
        setEvaluation(null);
        setShowHints(false);
    };

    const handleEvaluate = async () => {
        if (!selectedChallenge) return;

        setIsEvaluating(true);
        setEvaluation(null);

        try {
            const response = await fetch('/api/skill-assessment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    challengeId: selectedChallenge.id,
                    code: userCode,
                    testCases: selectedChallenge.testCases
                }),
            });

            const data = await response.json();
            setEvaluation(data);

            // Update progress
            setUserProgress(prev => {
                const newProgress = { ...prev };
                newProgress.totalAttempts += 1;

                if (data.passed) {
                    if (!newProgress.completedChallenges.includes(selectedChallenge.id)) {
                        newProgress.completedChallenges.push(selectedChallenge.id);
                        newProgress.skillLevel[selectedChallenge.category] += 10;
                    }
                }

                return newProgress;
            });

        } catch (error) {
            console.error('Evaluation error:', error);
            setEvaluation({
                passed: false,
                feedback: 'Your solution couldn\'t be evaluated because the server didn\'t respond. Try again in a moment.',
                recommendations: []
            });
        } finally {
            setIsEvaluating(false);
        }
    };

    const isDone = (id: string) => userProgress.completedChallenges.includes(id);

    return (
        <MotionConfig reducedMotion="user">
            <main className="sa">
                <header className="sa-intro">
                    <h1 className="ds-h1">Skill assessment</h1>
                    <p className="ds-lede">
                        Solve short coding challenges and get AI feedback on your solution. Progress is saved in this browser.
                    </p>
                </header>

                <dl className="sa-progress">
                    <div>
                        <dt>{userProgress.completedChallenges.length}<span>/{challenges.length}</span></dt>
                        <dd>challenges solved</dd>
                    </div>
                    <div>
                        <dt>{userProgress.skillLevel['JavaScript']}</dt>
                        <dd>JavaScript XP</dd>
                    </div>
                    <div>
                        <dt>{userProgress.skillLevel['Algorithms']}</dt>
                        <dd>Algorithms XP</dd>
                    </div>
                    <div>
                        <dt>{userProgress.totalAttempts}</dt>
                        <dd>attempts</dd>
                    </div>
                </dl>

                <div className={`sa-workspace${selectedChallenge ? ' has-selection' : ''}`}>
                    <nav className="sa-list" aria-label="Challenges">
                        <div className="ds-segmented" role="group" aria-label="Filter challenges">
                            {categories.map((category) => {
                                const active = activeCategory === category.id;
                                return (
                                    <button
                                        key={category.id}
                                        type="button"
                                        className={`ds-segmented__btn${active ? ' is-active' : ''}`}
                                        aria-pressed={active}
                                        onClick={() => setActiveCategory(category.id)}
                                    >
                                        {active && (
                                            <motion.span
                                                layoutId="sa-filter-indicator"
                                                className="ds-segmented__indicator"
                                                transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                                            />
                                        )}
                                        <span className="ds-segmented__label">{category.id === 'all' ? 'All' : category.label}</span>
                                        <span className="ds-segmented__count">{category.count}</span>
                                    </button>
                                );
                            })}
                        </div>

                        <ul className="sa-challenges" role="list">
                            {filteredChallenges.map((challenge) => {
                                const selected = selectedChallenge?.id === challenge.id;
                                return (
                                    <li key={challenge.id}>
                                        <button
                                            type="button"
                                            className={`sa-challenge${selected ? ' is-selected' : ''}`}
                                            aria-current={selected ? 'true' : undefined}
                                            onClick={() => handleChallengeSelect(challenge)}
                                        >
                                            <span className="sa-challenge__title">
                                                {challenge.title}
                                                {isDone(challenge.id) && (
                                                    <span className="sa-done">
                                                        <Check aria-hidden="true" />
                                                        <span className="ds-visually-hidden">Solved</span>
                                                    </span>
                                                )}
                                            </span>
                                            <span className="sa-challenge__meta">
                                                <span className={`sa-difficulty sa-difficulty--${challenge.difficulty.toLowerCase()}`}>{challenge.difficulty}</span>
                                                {challenge.category}
                                            </span>
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>

                    {selectedChallenge ? (
                        <section className="sa-detail" aria-labelledby="sa-challenge-title" key={selectedChallenge.id}>
                            <div className="ds-card sa-brief">
                                <div className="sa-brief__head">
                                    <h2 id="sa-challenge-title" className="ds-h2">{selectedChallenge.title}</h2>
                                    <span className={`sa-difficulty sa-difficulty--${selectedChallenge.difficulty.toLowerCase()}`}>{selectedChallenge.difficulty}</span>
                                </div>
                                <p className="sa-brief__desc">{selectedChallenge.description}</p>

                                <div className="sa-tests">
                                    <h3 className="sa-subhead">Test cases</h3>
                                    <ul role="list">
                                        {selectedChallenge.testCases.map((testCase, i) => (
                                            <li key={i}><code>{testCase}</code></li>
                                        ))}
                                    </ul>
                                </div>

                                <details className="sa-hints" open={showHints} onToggle={(e) => setShowHints((e.target as HTMLDetailsElement).open)}>
                                    <summary>
                                        <Lightbulb aria-hidden="true" />
                                        {showHints ? 'Hide hints' : `Show ${selectedChallenge.hints.length} hints`}
                                    </summary>
                                    <ol>
                                        {selectedChallenge.hints.map((hint, i) => <li key={i}>{hint}</li>)}
                                    </ol>
                                </details>
                            </div>

                            <div className="ds-card sa-editor">
                                <label htmlFor="sa-code" className="sa-subhead">Your solution</label>
                                <textarea
                                    id="sa-code"
                                    className="sa-code"
                                    value={userCode}
                                    onChange={(e) => setUserCode(e.target.value)}
                                    onKeyDown={(e) => {
                                        // Tab inserts two spaces instead of leaving the editor; Escape then Tab still moves focus out
                                        if (e.key === 'Tab' && !e.shiftKey) {
                                            e.preventDefault();
                                            const el = e.currentTarget;
                                            const { selectionStart: start, selectionEnd: end } = el;
                                            const next = userCode.slice(0, start) + '  ' + userCode.slice(end);
                                            setUserCode(next);
                                            requestAnimationFrame(() => el.setSelectionRange(start + 2, start + 2));
                                        }
                                        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && !isEvaluating) {
                                            e.preventDefault();
                                            handleEvaluate();
                                        }
                                    }}
                                    spellCheck={false}
                                    autoCapitalize="off"
                                    autoCorrect="off"
                                    aria-describedby="sa-code-hint"
                                />
                                <div className="sa-editor__foot">
                                    <p id="sa-code-hint" className="ds-meta">Tab indents. Press Ctrl or ⌘ + Enter to evaluate.</p>
                                    <button
                                        type="button"
                                        className="ds-btn ds-btn--primary"
                                        onClick={handleEvaluate}
                                        disabled={isEvaluating}
                                        aria-busy={isEvaluating}
                                    >
                                        {isEvaluating ? <><Loader2 className="sa-spin" aria-hidden="true" />Evaluating</> : 'Evaluate solution'}
                                    </button>
                                </div>
                            </div>

                            <div aria-live="polite">
                                {evaluation && (
                                    <div className={`sa-result ${evaluation.passed ? 'is-pass' : 'is-fail'}`}>
                                        <h3 className="sa-result__title">
                                            {evaluation.passed ? <CheckCircle2 aria-hidden="true" /> : <XCircle aria-hidden="true" />}
                                            {evaluation.passed ? 'All tests passed' : 'Not passing yet'}
                                        </h3>
                                        <p className="sa-result__feedback">{evaluation.feedback}</p>
                                        {evaluation.recommendations && evaluation.recommendations.length > 0 && (
                                            <div>
                                                <h4 className="sa-subhead">What to look at next</h4>
                                                <ul className="sa-result__recs">
                                                    {evaluation.recommendations.map((rec: string, i: number) => <li key={i}>{rec}</li>)}
                                                </ul>
                                            </div>
                                        )}
                                        {evaluation.passed && (
                                            <p className="sa-result__xp">+10 {selectedChallenge.category} XP</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </section>
                    ) : (
                        <div className="sa-empty">
                            <h2 className="ds-h3">Pick a challenge to start</h2>
                            <p className="ds-body-text">
                                {challenges.length} challenges, from string basics to sorting. Your code is checked against the test cases and reviewed by AI.
                            </p>
                        </div>
                    )}
                </div>
            </main>
        </MotionConfig>
    );
}
