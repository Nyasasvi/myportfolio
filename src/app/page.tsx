"use client";

import React, { useState, useEffect } from 'react';
import { 
	Heading, 
	Flex, 
	Button, 
	LetterFx, 
	Avatar, 
	Text, 
	Grid,
	Tag,
	StatusIndicator,
	Icon,
	Background,
	IconButton
} from '@/once-ui/components';
import { homepageData } from './resources/consts';
import { motion, AnimatePresence } from 'framer-motion';
import './homepage.css';

export default function Home() {
	// Rotating photos array
	const profilePhotos = [
		'/images/profilePic.png',
		'/images/IMG_4940.jpg',
		'/images/IMG_7264.jpg',
		'/images/IMG_7613.jpg'
	];

	const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

	// Auto-rotate photos every 4 seconds
	useEffect(() => {
		const interval = setInterval(() => {
			setCurrentPhotoIndex((prev) => (prev + 1) % profilePhotos.length);
		}, 4000);
		return () => clearInterval(interval);
	}, [profilePhotos.length]);

	const topSkills = [
		{ name: 'Java', icon: 'code', color: 'accent' },
		{ name: 'Spring Boot', icon: 'server', color: 'accent' },
		{ name: 'React', icon: 'components', color: 'info' },
		{ name: 'TypeScript', icon: 'code', color: 'info' },
		{ name: 'AWS', icon: 'cloud', color: 'success' },
		{ name: 'Docker', icon: 'box', color: 'success' },
		{ name: 'Kubernetes', icon: 'layers', color: 'success' },
		{ name: 'AI/ML', icon: 'sparkles', color: 'warning' }
	];

	return (
		<Flex
			as="main"
			direction="column" 
			justifyContent="center"
			fillWidth 
			fillHeight 
			padding="l" 
			gap="l"
			style={{ position: 'relative', overflow: 'hidden' }}
		>
			{/* Enhanced Background with Once UI */}
			<Background
				position="absolute"
				style={{
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					zIndex: 0
				}}
			/>
			<div className="homepage-background">
				<div className="gradient-orb orb-1" />
				<div className="gradient-orb orb-2" />
				<div className="gradient-orb orb-3" />
				<div className="grid-overlay" />
			</div>

			<Grid
				columns="1fr 1.5fr"
				mobileColumns="1col"
				tabletColumns="1col"
				gap="48"
				fillWidth
				style={{ 
					position: 'relative', 
					zIndex: 1, 
					alignItems: 'center',
					background: 'transparent',
					padding: '2rem'
				}}
			>
				{/* Left Column - Avatar & Stats */}
				<Flex
					direction="column"
					justifyContent="center"
					alignItems="center"
					gap="l"
					paddingX="l"
				>
					{/* Rotating Avatar Carousel */}
					<motion.div
						initial={{ opacity: 0, scale: 0.8 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 0.6, ease: "easeOut" }}
					>
						<motion.div
							animate={{ y: [0, -12, 0] }}
							transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
							className="avatar-container"
						>
							<AnimatePresence mode="wait">
								<motion.div
									key={currentPhotoIndex}
									initial={{ opacity: 0, scale: 0.9, rotateY: -90 }}
									animate={{ opacity: 1, scale: 1, rotateY: 0 }}
									exit={{ opacity: 0, scale: 0.9, rotateY: 90 }}
									transition={{ duration: 0.6, ease: "easeInOut" }}
									style={{ position: 'relative' }}
								>
									<Avatar
										size="xl"
										src={profilePhotos[currentPhotoIndex]}
										style={{ 
											boxShadow: '0 20px 60px rgba(102, 126, 234, 0.4)',
											border: '4px solid rgba(102, 126, 234, 0.3)',
											position: 'relative',
											zIndex: 2
										}}
									/>
								</motion.div>
							</AnimatePresence>
							<div className="avatar-ring" />
							<div className="avatar-pulse" />
							
							{/* Photo Indicators */}
							<div className="photo-indicators">
								{profilePhotos.map((_, index) => (
									<button
										key={index}
										className={`photo-indicator ${index === currentPhotoIndex ? 'active' : ''}`}
										onClick={() => setCurrentPhotoIndex(index)}
										aria-label={`View photo ${index + 1}`}
									/>
								))}
							</div>
						</motion.div>
					</motion.div>

					{/* Status Indicator with Once UI */}
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.3 }}
					>
						<Flex
							alignItems="center"
							gap="s"
							padding="s"
							paddingX="m"
							radius="full"
							style={{ 
								backdropFilter: 'blur(8px) saturate(180%)',
								background: 'rgba(16, 185, 129, 0.03)',
								border: '1px solid rgba(16, 185, 129, 0.15)',
								boxShadow: '0 2px 8px rgba(16, 185, 129, 0.05)'
							}}
						>
							<StatusIndicator size="s" color="green" />
							<Text variant="label-default-s" onBackground="success-strong">
								Available for opportunities
							</Text>
						</Flex>
					</motion.div>

					{/* Quick Stats with Grid */}
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.5 }}
						style={{ width: '100%' }}
					>
						<Flex
							direction="column"
							gap="m"
							padding="l"
							radius="l"
							border="neutral-medium"
							borderStyle="solid-1"
							style={{ 
								backdropFilter: 'blur(10px) saturate(180%)',
								background: 'rgba(255, 255, 255, 0.02)',
								boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)',
								border: '1px solid rgba(255, 255, 255, 0.05)'
							}}
						>
							<Grid columns="3" gap="m" fillWidth>
								<Flex direction="column" alignItems="center" gap="xs">
									<Text variant="display-strong-s" style={{ color: '#667eea' }}>
										5+
									</Text>
									<Text variant="label-default-xs" onBackground="neutral-weak" align="center">
										Years
									</Text>
								</Flex>
								<Flex direction="column" alignItems="center" gap="xs">
									<Text variant="display-strong-s" style={{ color: '#3b82f6' }}>
										50+
									</Text>
									<Text variant="label-default-xs" onBackground="neutral-weak" align="center">
										Tech
									</Text>
								</Flex>
								<Flex direction="column" alignItems="center" gap="xs">
									<Text variant="display-strong-s" style={{ color: '#10b981' }}>
										8
									</Text>
									<Text variant="label-default-xs" onBackground="neutral-weak" align="center">
										Projects
									</Text>
								</Flex>
							</Grid>
						</Flex>
					</motion.div>

					{/* Social Links with IconButtons */}
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.5, delay: 0.6 }}
					>
						<Flex gap="s" justifyContent="center">
							<IconButton
								icon="github"
								href="https://github.com/Nyasasvi/"
								variant="ghost"
								size="m"
								aria-label="GitHub Profile"
							/>
							<IconButton
								icon="linkedin"
								href="https://www.linkedin.com/in/yasasvi-nellore/"
								variant="ghost"
								size="m"
								aria-label="LinkedIn Profile"
							/>
							<IconButton
								icon="mail"
								href="mailto:yasasvi.nellore@gmail.com"
								variant="ghost"
								size="m"
								aria-label="Email Me"
							/>
						</Flex>
					</motion.div>
				</Flex>

				{/* Right Column - Content */}
				<Flex
					direction="column"
					justifyContent="center"
					gap="l"
					paddingX="l"
				>
					{/* Main Heading with LetterFx */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.2 }}
					>
						<Heading
							wrap="balance"
							variant="display-strong-s"
							marginBottom="m"
						>
							<span className="font-code main-heading">
								<LetterFx
									charset={['0', '1']}
									trigger="custom"
									onTrigger={(eventHandler) => {
										setTimeout(() => {
											eventHandler();
										}, 3000)
									}}
									speed='medium'>
									{homepageData.description}
								</LetterFx>
							</span>
						</Heading>
					</motion.div>

					{/* Professional Summary */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.3 }}
					>
						<Text 
							variant="body-default-l"
							onBackground="neutral-medium"
							style={{ lineHeight: '1.7' }}
						>
							Full-Stack Engineer specializing in{' '}
							<Text 
								as="span" 
								variant="body-strong-l"
								style={{ 
									background: 'linear-gradient(135deg, #667eea, #764ba2)',
									WebkitBackgroundClip: 'text',
									WebkitTextFillColor: 'transparent'
								}}
							>
								Java/Spring Boot microservices
							</Text>
							{' '}and{' '}
							<Text 
								as="span" 
								variant="body-strong-l"
								style={{ 
									background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
									WebkitBackgroundClip: 'text',
									WebkitTextFillColor: 'transparent'
								}}
							>
								React/TypeScript
							</Text>
							, building cloud-native, AI-powered systems
						</Text>
					</motion.div>

					{/* Top Skills with Tags */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.4 }}
					>
						<Flex direction="column" gap="m">
							<Flex alignItems="center" gap="s">
								<Icon name="sparkles" size="s" />
								<Text variant="heading-strong-xs" onBackground="neutral-strong">
									TOP SKILLS
								</Text>
							</Flex>
							<Flex gap="xs" style={{ flexWrap: 'wrap' }}>
								{topSkills.map((skill, index) => (
									<motion.div
										key={skill.name}
										initial={{ opacity: 0, scale: 0.8 }}
										animate={{ opacity: 1, scale: 1 }}
										transition={{ duration: 0.3, delay: 0.4 + index * 0.05 }}
									>
										<Tag
											label={skill.name}
											variant={skill.color as any}
											size="m"
										/>
									</motion.div>
								))}
							</Flex>
						</Flex>
					</motion.div>

					{/* Enhanced Key Achievements */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.5 }}
					>
						<Flex direction="column" gap="m">
							<Flex alignItems="center" gap="s" style={{ marginBottom: '8px' }}>
								<Icon name="sparkles" size="s" style={{ color: '#667eea' }} />
								<Text variant="label-strong-s" onBackground="neutral-strong">
									KEY ACHIEVEMENTS
								</Text>
							</Flex>
							
							<div className="achievements-container">
								<motion.div
									className="achievement-card"
									initial={{ opacity: 0, scale: 0.8 }}
									animate={{ opacity: 1, scale: 1 }}
									transition={{ duration: 0.4, delay: 0.6 }}
									whileHover={{ scale: 1.05, y: -5 }}
								>
									<div className="achievement-icon uptime-icon">
										<Icon name="zap" size="l" />
									</div>
									<div className="achievement-content">
										<Text variant="display-strong-xs" style={{ color: '#f59e0b', fontSize: '28px' }}>
											99.99%
										</Text>
										<Text variant="label-strong-s" onBackground="neutral-medium">
											Uptime
										</Text>
									</div>
									<div className="achievement-glow" style={{ background: 'linear-gradient(135deg, #f59e0b20, #d9770620)' }} />
								</motion.div>

								<motion.div
									className="achievement-card"
									initial={{ opacity: 0, scale: 0.8 }}
									animate={{ opacity: 1, scale: 1 }}
									transition={{ duration: 0.4, delay: 0.7 }}
									whileHover={{ scale: 1.05, y: -5 }}
								>
									<div className="achievement-icon events-icon">
										<Icon name="trending-up" size="l" />
									</div>
									<div className="achievement-content">
										<Text variant="display-strong-xs" style={{ color: '#10b981', fontSize: '28px' }}>
											5M+
										</Text>
										<Text variant="label-strong-s" onBackground="neutral-medium">
											Events/Day
										</Text>
									</div>
									<div className="achievement-glow" style={{ background: 'linear-gradient(135deg, #10b98120, #05966920)' }} />
								</motion.div>

								<motion.div
									className="achievement-card"
									initial={{ opacity: 0, scale: 0.8 }}
									animate={{ opacity: 1, scale: 1 }}
									transition={{ duration: 0.4, delay: 0.8 }}
									whileHover={{ scale: 1.05, y: -5 }}
								>
									<div className="achievement-icon aws-icon">
										<Icon name="award" size="l" />
									</div>
									<div className="achievement-content">
										<Text variant="display-strong-xs" style={{ color: '#3b82f6', fontSize: '28px' }}>
											AWS
										</Text>
										<Text variant="label-strong-s" onBackground="neutral-medium">
											Certified
										</Text>
									</div>
									<div className="achievement-glow" style={{ background: 'linear-gradient(135deg, #3b82f620, #1d4ed820)' }} />
								</motion.div>

								<motion.div
									className="achievement-card"
									initial={{ opacity: 0, scale: 0.8 }}
									animate={{ opacity: 1, scale: 1 }}
									transition={{ duration: 0.4, delay: 0.9 }}
									whileHover={{ scale: 1.05, y: -5 }}
								>
									<div className="achievement-icon ai-icon">
										<Icon name="cpu" size="l" />
									</div>
									<div className="achievement-content">
										<Text variant="display-strong-xs" style={{ color: '#8b5cf6', fontSize: '28px' }}>
											AI/ML
										</Text>
										<Text variant="label-strong-s" onBackground="neutral-medium">
											Expert
										</Text>
									</div>
									<div className="achievement-glow" style={{ background: 'linear-gradient(135deg, #8b5cf620, #7c3aed20)' }} />
								</motion.div>
							</div>
						</Flex>
					</motion.div>

					{/* CTA Buttons Grid */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.6 }}
					>
						<Grid 
							columns="2"
							mobileColumns="1col"
							gap="m"
						>
							<motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
								<Button
									href="/about"
									suffixIcon="chevronRight"
									variant="primary"
									size="l"
									style={{ 
										width: '100%',
										background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
										boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)'
									}}
								>
									About Me
								</Button>
							</motion.div>
							
							<motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
								<Button
									href="/skills"
									suffixIcon="sparkles"
									variant="primary"
									size="l"
									style={{ 
										width: '100%',
										background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
										boxShadow: '0 4px 20px rgba(59, 130, 246, 0.4)'
									}}
								>
									View Skills
								</Button>
							</motion.div>
							
							<motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
								<Button
									href="/projects"
									suffixIcon="chevronRight"
									variant="primary"
									size="l"
									style={{ 
										width: '100%',
										background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
										boxShadow: '0 4px 20px rgba(16, 185, 129, 0.4)'
									}}
								>
									Projects
								</Button>
							</motion.div>
							
							<motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
								<Button
									href="/newsletter"
									suffixIcon="mail"
									variant="primary"
									size="l"
									style={{ 
										width: '100%',
										background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
										boxShadow: '0 4px 20px rgba(139, 92, 246, 0.4)'
									}}
								>
									AI Newsletter
								</Button>
							</motion.div>
							
							<motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
								<Button
									href="/job-match"
									suffixIcon="search"
									variant="primary"
									size="l"
									style={{ 
										width: '100%',
										background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
										boxShadow: '0 4px 20px rgba(245, 158, 11, 0.4)'
									}}
								>
									Job Match
								</Button>
							</motion.div>
							
							<motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
								<Button
									href="/skill-assessment"
									suffixIcon="sparkles"
									variant="primary"
									size="l"
									style={{ 
										width: '100%',
										background: 'linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%)',
										boxShadow: '0 4px 20px rgba(139, 92, 246, 0.4)'
									}}
								>
									Skill Assessment
								</Button>
							</motion.div>
							
							<motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
								<Button
									onClick={() => window.open("/assets/resume.pdf", '_blank')}
									suffixIcon="download"
									variant="secondary"
									size="l"
									style={{ 
										width: '100%',
										borderColor: '#667eea',
										borderWidth: '2px'
									}}
								>
									Resume
								</Button>
							</motion.div>
						</Grid>
					</motion.div>

					{/* Additional Quick Action */}
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.5, delay: 0.7 }}
					>
						<Flex
							justifyContent="space-between"
							alignItems="center"
							padding="m"
							radius="m"
							style={{ 
								cursor: 'pointer',
								background: 'rgba(255, 255, 255, 0.02)',
								backdropFilter: 'blur(8px) saturate(180%)',
								border: '1px solid rgba(255, 255, 255, 0.05)',
								boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
								transition: 'all 0.3s ease'
							}}
							onClick={() => window.location.href = '/contact'}
							onMouseEnter={(e) => {
								e.currentTarget.style.background = 'rgba(102, 126, 234, 0.05)';
								e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.15)';
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
								e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
							}}
						>
							<Flex alignItems="center" gap="m">
								<Icon name="mail" size="m" />
								<Flex direction="column" gap="2">
									<Text variant="label-strong-s" onBackground="neutral-strong">
										Ready to hire?
									</Text>
									<Text variant="body-default-xs" onBackground="neutral-weak">
										Get in touch for opportunities
									</Text>
								</Flex>
							</Flex>
							<Icon name="chevronRight" size="m" />
						</Flex>
					</motion.div>
				</Flex>
			</Grid>

			{/* Scroll Indicator */}
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.5, delay: 0.9 }}
				className="scroll-indicator"
			>
				<motion.div
					animate={{ y: [0, 8, 0] }}
					transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
				>
					<Icon name="chevronDown" size="m" />
				</motion.div>
				<Text variant="label-default-xs" onBackground="neutral-weak">
					Scroll to explore
				</Text>
			</motion.div>
		</Flex>
	);
}
