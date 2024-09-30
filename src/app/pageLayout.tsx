'use client'
import { Background, Flex } from "@/once-ui/components"
import { Header } from "./components/header"
import Footer from "./components/footer"
import { Inter, Sora, Source_Code_Pro } from "next/font/google";
import "@/once-ui/styles/index.scss";
import "@/once-ui/tokens/index.scss";
import classNames from 'classnames';
import { useEffect, useState } from "react";

type FontConfig = {
	variable: string;
};
const primary = Inter({
	variable: '--font-primary',
	subsets: ['latin'],
	display: 'swap'
});



const secondary = Sora({
	variable: '--font-secondary',
	subsets: ['latin'],
	display: 'swap'
});

const tertiary: FontConfig | undefined = undefined;

const code = Source_Code_Pro({
	variable: '--font-code',
	subsets: ['latin'],
	display: 'swap',
});


export default function PageLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const [theme, setTheme] = useState("");
	const [loading, setLoading] = useState(true);
	useEffect(() => {
		if (typeof window !== 'undefined') {
			const storedTheme = localStorage.getItem('theme') || 'dark';
			setTheme(storedTheme);
			setLoading(false)
		}
	}, []);
	const onThemeSwitch = () => {
		setTheme(theme == "dark" ? "light" : "dark");
		localStorage.setItem('theme', theme == "dark" ? "light" : "dark");
	}
	return (

		<Flex
			as="html" lang="en"
			fillHeight background="page"
			data-theme={theme}
			data-brand="green"
			data-accent="aqua"
			data-neutral="gray"
			data-border="rounded"
			data-solid="color"
			data-solid-style="flat"
			data-surface="filled"
			data-transition="all"
			className={classNames(
				primary.variable,
				secondary ? secondary.variable : '',
				tertiary ? tertiary.variable : '',
				code.variable,
				'root')}
			justifyContent="center">

			<Flex
				style={{ width: "80%" }}
				as="body"
				fillHeight marginX="4"
				direction="column"

			>
				<Background />
				<Flex
					fillWidth
					minHeight="16">
				</Flex>
				<Header theme={theme == "dark" ? "light" : "dark"} onThemeSwitch={onThemeSwitch} />
				<Flex
					zIndex={0}
					paddingY="l" paddingX="l"
					justifyContent="center" flex={1}>
					<Flex
						justifyContent="center"
						fillWidth minHeight="0">

						{children}

					</Flex>
				</Flex>
				<Footer />
			</Flex>
		</Flex>
	)
}