'use client'

import { Flex, Text } from "@/once-ui/components"
import './index.css'
import { experience, researchExperience, aboutMe } from "../resources/consts"
import { motion } from 'framer-motion'
import { useState } from 'react'

export default function Page() {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

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
                            marginBottom: '16px'
                        }}
                    >
                        About Me
                    </Text>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <div className="about-me-card">
                            <Text
                                variant="body-default-l"
                                style={{
                                    lineHeight: '1.8',
                                    maxWidth: '900px',
                                    margin: '0 auto',
                                    fontSize: '18px'
                                }}
                            >
                                {aboutMe}
                            </Text>
                        </div>
                    </motion.div>
                </Flex>
            </motion.div>

            {/* Professional Experience Section */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
            >
                <Flex direction="column" fillWidth gap="l">
                    <Flex
                        justifyContent="center"
                        alignItems="center"
                        gap="m"
                        style={{ marginBottom: '24px' }}
                    >
                        <div className="section-divider-left" />
                        <Text
                            variant="heading-strong-xl"
                            style={{
                                fontSize: "36px",
                                textAlign: 'center',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}
                        >
                            💼 Professional Experience
                        </Text>
                        <div className="section-divider-right" />
                    </Flex>

                    {/* Timeline Container */}
                    <div className="timeline-container">
                        {experience.map((exp, index) => (
                            <motion.div
                                key={`${exp.company}-${index}`}
                                className="timeline-item"
                                initial={{ opacity: 0, x: -50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.4 + index * 0.15 }}
                                onMouseEnter={() => setHoveredIndex(index)}
                                onMouseLeave={() => setHoveredIndex(null)}
                            >
                                {/* Timeline Dot */}
                                <div className="timeline-marker">
                                    <motion.div
                                        className="timeline-dot"
                                        style={{
                                            background: `linear-gradient(135deg, ${exp.color}, ${exp.color}dd)`
                                        }}
                                        animate={{
                                            scale: hoveredIndex === index ? 1.3 : 1,
                                            boxShadow: hoveredIndex === index
                                                ? `0 0 20px ${exp.color}99`
                                                : `0 0 0px ${exp.color}99`
                                        }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <span className="timeline-icon">{exp.icon}</span>
                                    </motion.div>
                                    {index < experience.length - 1 && (
                                        <div
                                            className="timeline-line"
                                            style={{
                                                background: `linear-gradient(180deg, ${exp.color} 0%, ${experience[index + 1].color} 100%)`
                                            }}
                                        />
                                    )}
                                </div>

                                {/* Experience Card */}
                                <motion.div
                                    className="experience-card"
                                    animate={{
                                        y: hoveredIndex === index ? -8 : 0,
                                    }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {/* Card Header */}
                                    <div className="card-header">
                                        <Flex
                                            direction="column"
                                            gap="xs"
                                            style={{ flex: 1 }}
                                        >
                                            <Text
                                                variant="heading-strong-l"
                                                style={{ fontSize: '24px', color: exp.color }}
                                            >
                                                {exp.role}
                                            </Text>
                                            <Flex alignItems="center" gap="s" style={{ flexWrap: 'wrap' }}>
                                                <Text
                                                    variant="heading-default-m"
                                                    style={{ fontSize: '18px' }}
                                                >
                                                    {exp.company}
                                                </Text>
                                                <span className="location-badge">
                                                    📍 {exp.location}
                                                </span>
                                            </Flex>
                                        </Flex>
                                        <Flex direction="column" alignItems="flex-end" gap="xs">
                                            <div
                                                className="time-badge"
                                                style={{ borderColor: exp.color }}
                                            >
                                                📅 {exp.timeframe}
                                            </div>
                                            <div
                                                className="type-badge"
                                                style={{
                                                    background: `${exp.color}22`,
                                                    color: exp.color,
                                                    borderColor: exp.color
                                                }}
                                            >
                                                {exp.type}
                                            </div>
                                        </Flex>
                                    </div>

                                    {/* Achievements List */}
                                    <Flex
                                        as="ul"
                                        direction="column"
                                        gap="m"
                                        style={{
                                            marginLeft: '0',
                                            paddingLeft: '0',
                                            listStyle: 'none'
                                        }}
                                    >
                                        {exp.achievements.map((achievement, achIndex) => (
                                            <motion.li
                                                key={`${exp.company}-achievement-${achIndex}`}
                                                className="achievement-item"
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{
                                                    opacity: hoveredIndex === index ? 1 : 0.95,
                                                    x: 0
                                                }}
                                                transition={{
                                                    duration: 0.3,
                                                    delay: hoveredIndex === index ? achIndex * 0.05 : 0
                                                }}
                                            >
                                                <span
                                                    className="achievement-bullet"
                                                    style={{ background: exp.color }}
                                                />
                                                <Text
                                                    variant="body-default-m"
                                                    style={{ flex: 1, lineHeight: '1.7' }}
                                                >
                                                    {achievement}
                                                </Text>
                                            </motion.li>
                                        ))}
                                    </Flex>

                                    {/* Card Hover Overlay */}
                                    <motion.div
                                        className="card-overlay"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: hoveredIndex === index ? 1 : 0 }}
                                        style={{
                                            background: `radial-gradient(circle at top right, ${exp.color}15 0%, transparent 70%)`
                                        }}
                                    />
                                </motion.div>
                            </motion.div>
                        ))}
                    </div>
                </Flex>
            </motion.div>

            {/* Research Experience Section */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.8 }}
            >
                <Flex direction="column" fillWidth gap="l" style={{ marginTop: '40px' }}>
                    <Flex
                        justifyContent="center"
                        alignItems="center"
                        gap="m"
                        style={{ marginBottom: '24px' }}
                    >
                        <div className="section-divider-left" />
                        <Text
                            variant="heading-strong-xl"
                            style={{
                                fontSize: "36px",
                                textAlign: 'center',
                                background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}
                        >
                            🔬 Research Experience
                        </Text>
                        <div className="section-divider-right" />
                    </Flex>

                    <motion.div
                        className="research-card"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.9 }}
                        whileHover={{ y: -8, scale: 1.01 }}
                    >
                        <div className="research-header">
                            <div className="research-icon">{researchExperience.icon}</div>
                            <Flex direction="column" gap="xs" style={{ flex: 1 }}>
                                <Text
                                    variant="heading-strong-l"
                                    style={{ fontSize: '24px', color: researchExperience.color }}
                                >
                                    {researchExperience.title}
                                </Text>
                                <Text
                                    variant="heading-default-m"
                                    style={{ fontSize: '18px' }}
                                >
                                    {researchExperience.company}
                                </Text>
                                <Flex alignItems="center" gap="m" style={{ flexWrap: 'wrap' }}>
                                    <span className="location-badge">
                                        📍 {researchExperience.location}
                                    </span>
                                    <div
                                        className="time-badge"
                                        style={{ borderColor: researchExperience.color }}
                                    >
                                        📅 {researchExperience.timeframe}
                                    </div>
                                </Flex>
                            </Flex>
                        </div>

                        <Flex
                            as="ul"
                            direction="column"
                            gap="m"
                            style={{
                                marginLeft: '0',
                                paddingLeft: '0',
                                listStyle: 'none'
                            }}
                        >
                            {researchExperience.achievements.map((achievement, index) => (
                                <motion.li
                                    key={`research-achievement-${index}`}
                                    className="achievement-item"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.3, delay: 1 + index * 0.1 }}
                                >
                                    <span
                                        className="achievement-bullet"
                                        style={{ background: researchExperience.color }}
                                    />
                                    <Text
                                        variant="body-default-m"
                                        style={{ flex: 1, lineHeight: '1.7' }}
                                    >
                                        {achievement}
                                    </Text>
                                </motion.li>
                            ))}
                        </Flex>
                    </motion.div>
                </Flex>
            </motion.div>

            {/* Stats Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.2 }}
                style={{ marginTop: '48px' }}
            >
                <Flex
                    fillWidth
                    gap="m"
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '20px'
                    }}
                >
                    <motion.div
                        className="stat-card-about"
                        whileHover={{ scale: 1.05, y: -5 }}
                    >
                        <div className="stat-icon">💼</div>
                        <Text variant="display-strong-s" style={{ fontSize: '42px', color: '#667eea' }}>
                            5+
                        </Text>
                        <Text variant="body-default-m" onBackground="neutral-medium">
                            Years Experience
                        </Text>
                    </motion.div>
                    <motion.div
                        className="stat-card-about"
                        whileHover={{ scale: 1.05, y: -5 }}
                    >
                        <div className="stat-icon">🏢</div>
                        <Text variant="display-strong-s" style={{ fontSize: '42px', color: '#3b82f6' }}>
                            4
                        </Text>
                        <Text variant="body-default-m" onBackground="neutral-medium">
                            Companies
                        </Text>
                    </motion.div>
                    <motion.div
                        className="stat-card-about"
                        whileHover={{ scale: 1.05, y: -5 }}
                    >
                        <div className="stat-icon">⚡</div>
                        <Text variant="display-strong-s" style={{ fontSize: '42px', color: '#10b981' }}>
                            99.9%
                        </Text>
                        <Text variant="body-default-m" onBackground="neutral-medium">
                            System Uptime
                        </Text>
                    </motion.div>
                    <motion.div
                        className="stat-card-about"
                        whileHover={{ scale: 1.05, y: -5 }}
                    >
                        <div className="stat-icon">🚀</div>
                        <Text variant="display-strong-s" style={{ fontSize: '42px', color: '#f59e0b' }}>
                            5M+
                        </Text>
                        <Text variant="body-default-m" onBackground="neutral-medium">
                            Events/Day Handled
                        </Text>
                    </motion.div>
                </Flex>
            </motion.div>
        </Flex>
    )
}
