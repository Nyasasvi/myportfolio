'use client'
import { Flex, IconButton, SegmentedControl } from "@/once-ui/components";
import { usePathname } from "next/navigation";

interface HeaderProps {
	onThemeSwitch ?: () => void;
	theme?: string;
}
const Header: React.FC<HeaderProps> = ({onThemeSwitch,theme }) => {
	//console.log("pathname",pathname)
	const pathname = usePathname() ?? '';
	return (
		<Flex
			maxWidth={35}
			position='relative'
			justifyContent="center"
			style={{ alignSelf: "center", alignItems:"center" }}
		>
			<SegmentedControl
				style={{ color: "blue" }}
				buttons={[
					{
						label: 'Home',
						prefixIcon: '',
						suffixIcon: '',
						value: "/"
					},
					{
						label: 'About',
						prefixIcon: '',
						suffixIcon: '',
						value: "/about"
					},
					{
						label: 'Skills',
						prefixIcon: '',
						suffixIcon: '',
						value: "/skills"
					},
					{
						label: 'Projects',
						prefixIcon: '',
						suffixIcon: '',
						value: "/projects"
					},
					{
						label: 'Newsletter',
						prefixIcon: '',
						suffixIcon: '',
						value: "/newsletter"
					},
					{
						label: 'Job Match',
						prefixIcon: '',
						suffixIcon: '',
						value: "/job-match"
					},
				{
					label: 'AR Experience',
					prefixIcon: '',
					suffixIcon: '',
					value: "/ar-experience"
				},
				{
					label: 'Skill Assessment',
					prefixIcon: '',
					suffixIcon: '',
					value: "/skill-assessment"
				},
				{
					label: 'Analytics',
					prefixIcon: '',
					suffixIcon: '',
					value: "/analytics"
				},
				{
					label: 'Contact',
					prefixIcon: '',
					suffixIcon: '',
					value: "/contact"
				}
				]}
				onToggle={(e) => {
					// console.log(e)
				}}
				selected={pathname}
				defaultSelected={pathname}
			/>
			<IconButton
				style={{marginLeft:10}}
				onClick={onThemeSwitch}
				icon={theme}
				size="s"
				variant="ghost"
			/>
		</Flex>
	)
}

Header.displayName = 'Header'
export { Header }