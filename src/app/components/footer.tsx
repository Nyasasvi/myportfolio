'use client'

import { Button, Flex, IconButton, Text } from "@/once-ui/components"
import { footerButtonLinks } from "../resources/consts";
export default function Footer() {

    return (
        <Flex
                mobileDirection="column"
				as="footer"
				position="relative"
				fillWidth paddingX="2"  paddingY="s"
				justifyContent="space-between">
				<Flex key="copyright" justifyContent="center" alignItems="center" padding="s">
                <Text
					variant="body-default-s" onBackground="neutral-weak">
						© 2024 Rakshith Reddy Kokonda. 
				</Text>
                </Flex>
                
				<Flex key= "links" justifyContent="center" alignItems="center"
					gap="12">
                {footerButtonLinks.map((button) =>(
                    true ? 
                    <IconButton key= {button.label} icon={button.icon} href = {button.href} size="s" variant="ghost"/>
                    :
                    <Button
                    key= {button.label}
						href= {button.href}
						prefixIcon={button.icon} size="s" variant="tertiary">
						{button.label}
					</Button>
                ))}


				</Flex>
			</Flex>
    )
}