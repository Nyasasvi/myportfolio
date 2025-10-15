'use client'

import { useState, useEffect } from 'react';
import { Flex, Text, Button, Spinner, Tag } from "@/once-ui/components";
import { motion, AnimatePresence } from 'framer-motion';
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
                feedback: 'Failed to evaluate solution. Please try again.',
                recommendations: []
            });
        } finally {
            setIsEvaluating(false);
        }
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'Easy': return '#10b981';
            case 'Medium': return '#f59e0b';
            case 'Hard': return '#ef4444';
            default: return '#667eea';
        }
    };

    return (
        <Flex
            as="main"
            direction="column"
            justifyContent="normal"
            fillWidth
            fillHeight
            padding="xs"
            gap="l"
        >
            {/* Hero Section */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <Flex
                    direction="column"
                    fillWidth
                    gap="m"
                    style={{ textAlign: 'center', marginBottom: '32px' }}
                >
                    <Text
                        variant="heading-strong-xl"
                        style={{
                            fontSize: "48px",
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            marginBottom: '8px'
                        }}
                    >
                        🎓 Skill Assessment Agent
                    </Text>
                    <Text
                        variant="body-default-l"
                        onBackground="neutral-medium"
                        style={{ maxWidth: '700px', margin: '0 auto' }}
                    >
                        Practice coding challenges, get AI-powered feedback, and track your progress
                    </Text>
                </Flex>
            </motion.div>

            {/* Progress Dashboard */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
            >
                <Flex
                    fillWidth
                    gap="m"
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '20px',
                        marginBottom: '32px'
                    }}
                >
                    <motion.div className="progress-stat-card" whileHover={{ scale: 1.05, y: -5 }}>
                        <div className="stat-icon">🏆</div>
                        <Text variant="display-strong-s" style={{ fontSize: '42px', color: '#667eea' }}>
                            {userProgress.completedChallenges.length}
                        </Text>
                        <Text variant="body-default-m" onBackground="neutral-medium">
                            Completed
                        </Text>
                    </motion.div>
                    <motion.div className="progress-stat-card" whileHover={{ scale: 1.05, y: -5 }}>
                        <div className="stat-icon">💻</div>
                        <Text variant="display-strong-s" style={{ fontSize: '42px', color: '#10b981' }}>
                            {userProgress.skillLevel['JavaScript']}%
                        </Text>
                        <Text variant="body-default-m" onBackground="neutral-medium">
                            JavaScript
                        </Text>
                    </motion.div>
                    <motion.div className="progress-stat-card" whileHover={{ scale: 1.05, y: -5 }}>
                        <div className="stat-icon">⚡</div>
                        <Text variant="display-strong-s" style={{ fontSize: '42px', color: '#f59e0b' }}>
                            {userProgress.skillLevel['Algorithms']}%
                        </Text>
                        <Text variant="body-default-m" onBackground="neutral-medium">
                            Algorithms
                        </Text>
                    </motion.div>
                    <motion.div className="progress-stat-card" whileHover={{ scale: 1.05, y: -5 }}>
                        <div className="stat-icon">🎯</div>
                        <Text variant="display-strong-s" style={{ fontSize: '42px', color: '#8b5cf6' }}>
                            {userProgress.totalAttempts}
                        </Text>
                        <Text variant="body-default-m" onBackground="neutral-medium">
                            Total Attempts
                        </Text>
                    </motion.div>
                </Flex>
            </motion.div>

            {/* Category Filter */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
            >
                <Flex
                    fillWidth
                    gap="xs"
                    style={{
                        overflowX: 'auto',
                        padding: '8px 0',
                        justifyContent: 'center',
                        flexWrap: 'wrap'
                    }}
                >
                    {categories.map((category) => (
                        <motion.button
                            key={category.id}
                            className={`category-pill ${activeCategory === category.id ? 'active' : ''}`}
                            onClick={() => setActiveCategory(category.id)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <span className="category-icon">{category.icon}</span>
                            <span>{category.label}</span>
                            <span className="count-badge">{category.count}</span>
                        </motion.button>
                    ))}
                </Flex>
            </motion.div>

            {/* Main Content Area */}
            <Flex
                fillWidth
                gap="l"
                direction="row"
                mobileDirection="column"
                style={{ alignItems: 'flex-start' }}
            >
                {/* Challenge List */}
                <Flex
                    direction="column"
                    gap="m"
                    style={{ flex: selectedChallenge ? '0 0 350px' : '1', minWidth: '300px' }}
                >
                    <Text variant="heading-strong-l" style={{ marginBottom: '8px' }}>
                        Challenges
                    </Text>
                    
                    <div className="challenge-list">
                        <AnimatePresence mode="wait">
                            {filteredChallenges.map((challenge, index) => (
                                <motion.div
                                    key={challenge.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                    className={`challenge-item ${selectedChallenge?.id === challenge.id ? 'selected' : ''} ${userProgress.completedChallenges.includes(challenge.id) ? 'completed' : ''}`}
                                    onClick={() => handleChallengeSelect(challenge)}
                                >
                                    <Flex alignItems="center" gap="m" fillWidth>
                                        <div className="challenge-icon" style={{ background: challenge.color }}>
                                            {challenge.icon}
                                        </div>
                                        <Flex direction="column" gap="xs" style={{ flex: 1 }}>
                                            <Flex alignItems="center" gap="s">
                                                <Text variant="body-strong-m">{challenge.title}</Text>
                                                {userProgress.completedChallenges.includes(challenge.id) && (
                                                    <span className="completed-badge">✓</span>
                                                )}
                                            </Flex>
                                            <Flex gap="xs" alignItems="center">
                                                <span
                                                    className="difficulty-badge"
                                                    style={{ background: getDifficultyColor(challenge.difficulty) }}
                                                >
                                                    {challenge.difficulty}
                                                </span>
                                                <Text variant="body-default-xs" onBackground="neutral-weak">
                                                    {challenge.category}
                                                </Text>
                                            </Flex>
                                        </Flex>
                                    </Flex>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </Flex>

                {/* Challenge Detail & Code Editor */}
                {selectedChallenge && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4 }}
                        style={{ flex: 1, minWidth: 0 }}
                    >
                        <Flex direction="column" gap="m" fillWidth>
                            {/* Challenge Header */}
                            <div className="challenge-detail-card">
                                <Flex direction="column" gap="m">
                                    <Flex alignItems="center" gap="m">
                                        <div className="challenge-icon-large" style={{ background: selectedChallenge.color }}>
                                            {selectedChallenge.icon}
                                        </div>
                                        <Flex direction="column" gap="xs" style={{ flex: 1 }}>
                                            <Text variant="heading-strong-l">{selectedChallenge.title}</Text>
                                            <Flex gap="s" alignItems="center">
                                                <span
                                                    className="difficulty-badge"
                                                    style={{ background: getDifficultyColor(selectedChallenge.difficulty) }}
                                                >
                                                    {selectedChallenge.difficulty}
                                                </span>
                                                <Tag label={selectedChallenge.category} variant="info" size="s" />
                                            </Flex>
                                        </Flex>
                                    </Flex>

                                    <Text variant="body-default-l" onBackground="neutral-medium">
                                        {selectedChallenge.description}
                                    </Text>

                                    {/* Test Cases */}
                                    <Flex direction="column" gap="xs">
                                        <Text variant="label-strong-s" onBackground="neutral-strong">
                                            TEST CASES:
                                        </Text>
                                        {selectedChallenge.testCases.map((testCase, i) => (
                                            <div key={i} className="test-case">
                                                <Text variant="body-default-s" style={{ fontFamily: 'monospace' }}>
                                                    {testCase}
                                                </Text>
                                            </div>
                                        ))}
                                    </Flex>

                                    {/* Hints Toggle */}
                                    <Button
                                        variant="secondary"
                                        size="s"
                                        onClick={() => setShowHints(!showHints)}
                                        style={{ width: 'fit-content' }}
                                    >
                                        {showHints ? '🔒 Hide Hints' : '💡 Show Hints'}
                                    </Button>

                                    {/* Hints */}
                                    <AnimatePresence>
                                        {showHints && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <Flex direction="column" gap="xs" className="hints-container">
                                                    <Text variant="label-strong-s" onBackground="neutral-strong">
                                                        💡 HINTS:
                                                    </Text>
                                                    {selectedChallenge.hints.map((hint, i) => (
                                                        <div key={i} className="hint-item">
                                                            <Text variant="body-default-s">
                                                                {i + 1}. {hint}
                                                            </Text>
                                                        </div>
                                                    ))}
                                                </Flex>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </Flex>
                            </div>

                            {/* Code Editor */}
                            <div className="code-editor-card">
                                <Flex direction="column" gap="m">
                                    <Text variant="heading-strong-m">Your Solution</Text>
                                    <textarea
                                        className="code-editor"
                                        value={userCode}
                                        onChange={(e) => setUserCode(e.target.value)}
                                        placeholder="Write your code here..."
                                        spellCheck={false}
                                    />
                                    <Button
                                        variant="primary"
                                        size="l"
                                        onClick={handleEvaluate}
                                        disabled={isEvaluating}
                                        style={{
                                            width: '100%',
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                        }}
                                    >
                                        {isEvaluating ? (
                                            <Flex alignItems="center" gap="s">
                                                <Spinner size="s" />
                                                <span>Evaluating...</span>
                                            </Flex>
                                        ) : (
                                            '🚀 Evaluate Solution'
                                        )}
                                    </Button>
                                </Flex>
                            </div>

                            {/* Evaluation Results */}
                            <AnimatePresence>
                                {evaluation && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.4 }}
                                        className={`evaluation-card ${evaluation.passed ? 'success' : 'error'}`}
                                    >
                                        <Flex direction="column" gap="m">
                                            <Flex alignItems="center" gap="m">
                                                <div className="evaluation-icon">
                                                    {evaluation.passed ? '✅' : '❌'}
                                                </div>
                                                <Text variant="heading-strong-l">
                                                    {evaluation.passed ? 'Great Job! 🎉' : 'Not Quite Right'}
                                                </Text>
                                            </Flex>

                                            <Text variant="body-default-l" onBackground="neutral-medium">
                                                {evaluation.feedback}
                                            </Text>

                                            {evaluation.recommendations && evaluation.recommendations.length > 0 && (
                                                <Flex direction="column" gap="xs">
                                                    <Text variant="label-strong-s" onBackground="neutral-strong">
                                                        📚 LEARNING RECOMMENDATIONS:
                                                    </Text>
                                                    {evaluation.recommendations.map((rec: string, i: number) => (
                                                        <div key={i} className="recommendation-item">
                                                            <Text variant="body-default-s">
                                                                • {rec}
                                                            </Text>
                                                        </div>
                                                    ))}
                                                </Flex>
                                            )}

                                            {evaluation.passed && (
                                                <Text variant="body-default-s" onBackground="success-medium">
                                                    🎓 +10 {selectedChallenge.category} XP earned!
                                                </Text>
                                            )}
                                        </Flex>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </Flex>
                    </motion.div>
                )}

                {/* Empty State */}
                {!selectedChallenge && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}
                    >
                        <Flex direction="column" gap="m" alignItems="center" style={{ textAlign: 'center', padding: '48px' }}>
                            <Text variant="display-strong-l" style={{ fontSize: '64px' }}>
                                🎯
                            </Text>
                            <Text variant="heading-strong-l" onBackground="neutral-strong">
                                Select a Challenge to Begin
                            </Text>
                            <Text variant="body-default-l" onBackground="neutral-medium" style={{ maxWidth: '400px' }}>
                                Choose from {challenges.length} coding challenges to practice your skills and get AI-powered feedback
                            </Text>
                        </Flex>
                    </motion.div>
                )}
            </Flex>
        </Flex>
    );
}

