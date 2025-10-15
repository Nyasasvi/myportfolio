'use client'

import { useState } from 'react';
import { Flex, Text } from "@/once-ui/components"
import './index.css';
import { projects } from "../resources/consts";
import { motion, AnimatePresence } from 'framer-motion';

export default function Page() {
    const [activeCategory, setActiveCategory] = useState('all');
    const [hoveredProject, setHoveredProject] = useState<string | null>(null);

    const categories = [
        { id: 'all', label: 'All Projects', icon: '🎯', count: projects.length },
        { id: 'ai', label: 'AI & ML', icon: '🤖', count: projects.filter(p => p.category === 'ai').length },
        { id: 'fullstack', label: 'Full-Stack', icon: '💻', count: projects.filter(p => p.category === 'fullstack').length },
        { id: 'algorithm', label: 'Algorithms', icon: '⚡', count: projects.filter(p => p.category === 'algorithm').length },
        { id: 'featured', label: 'Featured', icon: '⭐', count: projects.filter(p => p.featured).length }
    ];

    const filteredProjects = activeCategory === 'all'
        ? projects
        : activeCategory === 'featured'
        ? projects.filter(p => p.featured)
        : projects.filter(p => p.category === activeCategory);

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
                        Featured Projects
                    </Text>
                    <Text
                        variant="body-default-l"
                        onBackground="neutral-medium"
                        style={{ maxWidth: '700px', margin: '0 auto' }}
                    >
                        A collection of innovative projects showcasing AI/ML, full-stack development, and algorithmic expertise
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
                            className={`project-category-pill ${activeCategory === category.id ? 'active' : ''}`}
                            onClick={() => setActiveCategory(category.id)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <span className="category-icon-projects">{category.icon}</span>
                            <span>{category.label}</span>
                            <span className="project-count">{category.count}</span>
                        </motion.button>
                    ))}
                </Flex>
            </motion.div>

            {/* Projects Grid */}
            <motion.div layout style={{ width: '100%', marginTop: '24px' }}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeCategory}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
                            gap: '24px',
                            width: '100%'
                        }}
                    >
                        {filteredProjects.map((project, index) => (
                            <motion.div
                                key={project.name}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{
                                    duration: 0.4,
                                    delay: index * 0.1,
                                    layout: { duration: 0.3 }
                                }}
                                className="project-card-container"
                                onMouseEnter={() => setHoveredProject(project.name)}
                                onMouseLeave={() => setHoveredProject(null)}
                            >
                                <div className="project-card-wrapper">
                                    {/* Featured Badge */}
                                    {project.featured && (
                                        <motion.div
                                            className="featured-badge"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: 0.3 + index * 0.1, type: "spring" }}
                                        >
                                            ⭐ Featured
                                        </motion.div>
                                    )}

                                    {/* Project Image Section */}
                                    <div className="project-image-container">
                                        <div
                                            className="project-image"
                                            style={{ backgroundImage: `url(${project.imageUrl})` }}
                                        >
                                            <motion.div
                                                className="image-overlay"
                                                initial={{ opacity: 0 }}
                                                animate={{
                                                    opacity: hoveredProject === project.name ? 1 : 0
                                                }}
                                                style={{
                                                    background: `linear-gradient(135deg, ${project.color}dd, ${project.color}99)`
                                                }}
                                            />
                                        </div>
                                        <div className="project-icon" style={{ background: project.color }}>
                                            {project.icon}
                                        </div>
                                    </div>

                                    {/* Project Content */}
                                    <div className="project-content-section">
                                        <Flex direction="column" gap="m" fillWidth>
                                            {/* Title */}
                                            <Text
                                                variant="heading-strong-l"
                                                style={{
                                                    fontSize: '22px',
                                                    color: project.color,
                                                    lineHeight: '1.3'
                                                }}
                                            >
                                                {project.name}
                                            </Text>

                                            {/* Description */}
                                            <Text
                                                variant="body-default-m"
                                                onBackground="neutral-medium"
                                                style={{
                                                    lineHeight: '1.6',
                                                    fontSize: '14px'
                                                }}
                                            >
                                                {project.description}
                                            </Text>

                                            {/* Features */}
                                            <Flex direction="column" gap="xs">
                                                <Text
                                                    variant="label-default-s"
                                                    onBackground="neutral-weak"
                                                    style={{ fontSize: '12px', fontWeight: 600 }}
                                                >
                                                    KEY FEATURES
                                                </Text>
                                                <Flex gap="xs" style={{ flexWrap: 'wrap' }}>
                                                    {project.features.map((feature) => (
                                                        <span key={feature} className="feature-tag">
                                                            ✓ {feature}
                                                        </span>
                                                    ))}
                                                </Flex>
                                            </Flex>

                                            {/* Technologies */}
                                            <Flex direction="column" gap="xs">
                                                <Text
                                                    variant="label-default-s"
                                                    onBackground="neutral-weak"
                                                    style={{ fontSize: '12px', fontWeight: 600 }}
                                                >
                                                    TECH STACK
                                                </Text>
                                                <Flex gap="xs" style={{ flexWrap: 'wrap' }}>
                                                    {project.technologies.map((tech) => (
                                                        <span
                                                            key={tech}
                                                            className="tech-tag"
                                                            style={{ borderColor: project.color }}
                                                        >
                                                            {tech}
                                                        </span>
                                                    ))}
                                                </Flex>
                                            </Flex>

                                            {/* Action Buttons */}
                                            <Flex gap="m" style={{ marginTop: '8px' }}>
                                                {project.liveDemo && (
                                                    <motion.button
                                                        className="project-btn primary"
                                                        style={{
                                                            background: `linear-gradient(135deg, ${project.color}, ${project.color}dd)`,
                                                            flex: 1
                                                        }}
                                                        onClick={() => window.open(project.liveDemo, '_blank')}
                                                        whileHover={{ scale: 1.03 }}
                                                        whileTap={{ scale: 0.97 }}
                                                    >
                                                        <span>🚀 Live Demo</span>
                                                    </motion.button>
                                                )}
                                                <motion.button
                                                    className="project-btn secondary"
                                                    style={{
                                                        borderColor: project.color,
                                                        color: project.color,
                                                        flex: project.liveDemo ? 0 : 1
                                                    }}
                                                    onClick={() => window.open(project.githubLink, '_blank')}
                                                    whileHover={{ scale: 1.03 }}
                                                    whileTap={{ scale: 0.97 }}
                                                >
                                                    <span>{project.liveDemo ? '💻' : '💻 View Code'}</span>
                                                </motion.button>
                                            </Flex>
                                        </Flex>
                                    </div>

                                    {/* Hover Glow Effect */}
                                    <motion.div
                                        className="project-card-glow"
                                        initial={{ opacity: 0 }}
                                        animate={{
                                            opacity: hoveredProject === project.name ? 1 : 0
                                        }}
                                        style={{
                                            boxShadow: `0 20px 60px ${project.color}40`
                                        }}
                                    />
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </AnimatePresence>
            </motion.div>

            {/* Stats Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
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
                    <motion.div className="project-stat-card" whileHover={{ scale: 1.05, y: -5 }}>
                        <div className="stat-icon-project">🎯</div>
                        <Text variant="display-strong-s" style={{ fontSize: '42px', color: '#667eea' }}>
                            {projects.length}
                        </Text>
                        <Text variant="body-default-m" onBackground="neutral-medium">
                            Total Projects
                        </Text>
                    </motion.div>
                    <motion.div className="project-stat-card" whileHover={{ scale: 1.05, y: -5 }}>
                        <div className="stat-icon-project">🤖</div>
                        <Text variant="display-strong-s" style={{ fontSize: '42px', color: '#8b5cf6' }}>
                            5
                        </Text>
                        <Text variant="body-default-m" onBackground="neutral-medium">
                            AI/ML Projects
                        </Text>
                    </motion.div>
                    <motion.div className="project-stat-card" whileHover={{ scale: 1.05, y: -5 }}>
                        <div className="stat-icon-project">⭐</div>
                        <Text variant="display-strong-s" style={{ fontSize: '42px', color: '#f59e0b' }}>
                            {projects.filter(p => p.featured).length}
                        </Text>
                        <Text variant="body-default-m" onBackground="neutral-medium">
                            Featured
                        </Text>
                    </motion.div>
                    <motion.div className="project-stat-card" whileHover={{ scale: 1.05, y: -5 }}>
                        <div className="stat-icon-project">🚀</div>
                        <Text variant="display-strong-s" style={{ fontSize: '42px', color: '#10b981' }}>
                            Live
                        </Text>
                        <Text variant="body-default-m" onBackground="neutral-medium">
                            Deployed Apps
                        </Text>
                    </motion.div>
                </Flex>
            </motion.div>
        </Flex>
    );
}
