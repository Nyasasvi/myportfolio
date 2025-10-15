'use client'

import { useState } from 'react';
import { Flex, Text } from "@/once-ui/components"
import { motion } from 'framer-motion';
import './index.css'
import { skillsData } from "../resources/consts"

export default function SkillsPage() {
    const [activeCategory, setActiveCategory] = useState('all');
    const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);

    const categories = [
        { id: 'all', label: 'All Skills', icon: '🎯' },
        { id: 'languages', label: 'Languages', icon: '💻' },
        { id: 'frontend', label: 'Frontend', icon: '🎨' },
        { id: 'backend', label: 'Backend', icon: '⚙️' },
        { id: 'cloud', label: 'Cloud & DevOps', icon: '☁️' },
        { id: 'database', label: 'Databases', icon: '🗄️' },
        { id: 'aiml', label: 'AI & ML', icon: '🤖' },
        { id: 'tools', label: 'Tools & Testing', icon: '🔧' }
    ];

    const filteredSkills = activeCategory === 'all' 
        ? skillsData 
        : skillsData.filter(skill => skill.category === activeCategory);

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
            {/* Header Section */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <Flex
                    direction="column"
                    fillWidth
                    gap="s"
                    style={{ textAlign: 'center', marginBottom: '24px' }}
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
                        Skills & Expertise
                    </Text>
                    <Text 
                        variant="body-default-l" 
                        onBackground="neutral-medium"
                        style={{ maxWidth: '600px', margin: '0 auto' }}
                    >
                        5+ years of experience building scalable, cloud-native applications with modern technologies
                    </Text>
                </Flex>
            </motion.div>

            {/* Category Filter Pills */}
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
                        </motion.button>
                    ))}
                </Flex>
            </motion.div>

            {/* Skills Grid */}
            <motion.div
                layout
                style={{ width: '100%' }}
            >
                <Flex
                    fillWidth
                    gap="m"
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                        gap: '20px'
                    }}
                >
                    {filteredSkills.map((skill, index) => (
                        <motion.div
                            key={skill.name}
                            layout
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ 
                                duration: 0.4, 
                                delay: index * 0.05,
                                layout: { duration: 0.3 }
                            }}
                            className="skill-card"
                            onMouseEnter={() => setHoveredSkill(skill.name)}
                            onMouseLeave={() => setHoveredSkill(null)}
                        >
                            <Flex direction="column" gap="m" fillWidth>
                                {/* Skill Header */}
                                <Flex alignItems="center" gap="s">
                                    <div className="skill-icon">
                                        {skill.icon}
                                    </div>
                                    <Flex direction="column" gap="4">
                                        <Text variant="heading-strong-s" style={{ fontSize: '18px' }}>
                                            {skill.name}
                                        </Text>
                                        {skill.experience && (
                                            <Text 
                                                variant="body-default-xs" 
                                                onBackground="neutral-weak"
                                                style={{ fontSize: '12px' }}
                                            >
                                                {skill.experience}
                                            </Text>
                                        )}
                                    </Flex>
                                </Flex>

                                {/* Proficiency Bar */}
                                <Flex direction="column" gap="4" fillWidth>
                                    <Flex justifyContent="space-between" alignItems="center">
                                        <Text variant="body-default-xs" onBackground="neutral-medium">
                                            Proficiency
                                        </Text>
                                        <Text variant="body-default-xs" style={{ 
                                            color: skill.level >= 90 ? '#10b981' : 
                                                   skill.level >= 75 ? '#3b82f6' : 
                                                   skill.level >= 60 ? '#f59e0b' : '#ef4444',
                                            fontWeight: 600
                                        }}>
                                            {skill.level}%
                                        </Text>
                                    </Flex>
                                    <div className="proficiency-bar-container">
                                        <motion.div
                                            className="proficiency-bar"
                                            initial={{ width: 0 }}
                                            animate={{ 
                                                width: hoveredSkill === skill.name ? `${skill.level}%` : `${skill.level}%`
                                            }}
                                            transition={{ duration: 1, delay: index * 0.05 }}
                                            style={{
                                                background: skill.level >= 90 
                                                    ? 'linear-gradient(90deg, #10b981, #059669)' 
                                                    : skill.level >= 75 
                                                    ? 'linear-gradient(90deg, #3b82f6, #2563eb)' 
                                                    : skill.level >= 60 
                                                    ? 'linear-gradient(90deg, #f59e0b, #d97706)' 
                                                    : 'linear-gradient(90deg, #ef4444, #dc2626)'
                                            }}
                                        />
                                    </div>
                                </Flex>

                                {/* Tags */}
                                {skill.tags && skill.tags.length > 0 && (
                                    <Flex gap="4" style={{ flexWrap: 'wrap' }}>
                                        {skill.tags.map((tag) => (
                                            <span key={tag} className="skill-tag">
                                                {tag}
                                            </span>
                                        ))}
                                    </Flex>
                                )}
                            </Flex>

                            {/* Hover Effect Overlay */}
                            <motion.div
                                className="skill-card-overlay"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: hoveredSkill === skill.name ? 1 : 0 }}
                                transition={{ duration: 0.3 }}
                            />
                        </motion.div>
                    ))}
                </Flex>
            </motion.div>

            {/* Stats Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                style={{ marginTop: '40px' }}
            >
                <Flex
                    fillWidth
                    gap="m"
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '16px'
                    }}
                >
                    <div className="stat-card">
                        <Text variant="display-strong-s" style={{ fontSize: '48px' }}>
                            50+
                        </Text>
                        <Text variant="body-default-m" onBackground="neutral-medium">
                            Technologies
                        </Text>
                    </div>
                    <div className="stat-card">
                        <Text variant="display-strong-s" style={{ fontSize: '48px' }}>
                            5+
                        </Text>
                        <Text variant="body-default-m" onBackground="neutral-medium">
                            Years Experience
                        </Text>
                    </div>
                    <div className="stat-card">
                        <Text variant="display-strong-s" style={{ fontSize: '48px' }}>
                            100+
                        </Text>
                        <Text variant="body-default-m" onBackground="neutral-medium">
                            Projects Delivered
                        </Text>
                    </div>
                    <div className="stat-card">
                        <Text variant="display-strong-s" style={{ fontSize: '48px' }}>
                            99.9%
                        </Text>
                        <Text variant="body-default-m" onBackground="neutral-medium">
                            System Uptime
                        </Text>
                    </div>
                </Flex>
            </motion.div>
        </Flex>
    );
}

