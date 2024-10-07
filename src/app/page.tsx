"use client";

import React from 'react';

import { Heading, Flex, Button, LetterFx, Avatar } from '@/once-ui/components';
import { homepageData } from './resources/consts';
export default function Home() {

	return (
		<Flex
			as="main"
			direction="column" justifyContent="center"
			fillWidth fillHeight padding="l" gap="l">
			<Flex
				mobileDirection="column"
				fillWidth gap="24">
				<Flex
					position="relative"
					flex={2} paddingX="xl">
					<Avatar
						size="xl"
						src="/images/profilePic.png"
					/>
				</Flex>
				<Flex
					justifyContent='center'
					position="relative"
					flex={4} gap="24" marginBottom="104"
					direction="column">
					<Heading
						wrap="balance"
						variant="display-strong-s">
						<span className="font-code">
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
					<Flex mobileDirection="column" direction='row' justifyContent='normal' gap='m'>
						<Button
							href="/about"
							suffixIcon="chevronRight"
							variant="primary"

						>
							{homepageData.aboutButtonText}
						</Button>
						<Button
							onClick={() => {
								window.open("/assets/resume.pdf", '_blank');
							}}
							suffixIcon="download"
							variant="primary"
						>
							{homepageData.resumeButtonText}
						</Button>

					</Flex>

				</Flex>
			</Flex>
		</Flex>
	);
}
