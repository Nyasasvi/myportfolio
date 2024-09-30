import "@/once-ui/styles/index.scss";
import "@/once-ui/tokens/index.scss";

import PageLayout from "./pageLayout";

export default function RootLayout({
  	children,
}: Readonly<{
  	children: React.ReactNode;
}>) {
	
	return (
			<PageLayout children={children}/>
		 
	);
}
