'use client'

import { Flex, Tag, Text } from "@/once-ui/components"
import './index.css'
import { experience, aboutMe } from "../resources/consts"


export default function Page() {

    return (
        <Flex
            as="main"
            direction="column" justifyContent="normal"
            fillWidth fillHeight padding="xs" gap="xs">
                <Flex fillWidth
                direction="column"
            >
                            <Text
                    variant="heading-strong-xl"
                    style={{ fontSize: "32px" }}
                    onBackground="accent-medium"
                    marginBottom="s"
                >
                    ABOUT ME
                </Text>
                <Text marginBottom="m" variant="body-default-m">{aboutMe}</Text>
            </Flex>
            <Flex fillWidth
                direction="column"
                marginBottom="m"
            >
                <Text
                    variant="heading-strong-xl"
                    style={{ fontSize: "32px" }}
                    onBackground="accent-medium"
                    marginBottom="m"
                >

                    WORK EXPERIENCE
                </Text>
                {experience.map((experience, index) => (<Flex
                    key={`${experience.company}-${experience.role}-${index}`}
                    fillWidth
                    direction="column"
                    marginBottom="xs">
                    <Flex
                        fillWidth
                        justifyContent="space-between"
                        alignItems="flex-end"
                        marginBottom="4"
                        style={{margin: "4px 0px 4px 0px"}}>
                        <Text style={{marginRight: 16}}
                            id={experience.role}
                            variant="heading-strong-m">
                            {experience.role}
                        </Text>
                        <Text style={{marginLeft: 16}}
                            variant="heading-default-xs"
                            onBackground="neutral-weak">
                            {experience.timeframe}
                        </Text>
                    </Flex>
                    <Text
                        variant="body-default-s"
                        onBackground="accent-weak"
                        marginBottom="xs">
                        {experience.company}
                    </Text>
                    <Flex
                        as="ul"
                        direction="column" gap="4" style={{marginLeft:"16px"}}>
                        {experience.achievements.map((achievement, index) => (
                            <Text
                                as="li"
                                variant="body-default-m"
                                key={`${experience.company}-${index}`}
                                style={{ listStylePosition: "unset" }}>
                                {achievement}
                            </Text>
                        ))}
                    </Flex>

                </Flex>
                ))}
            </Flex>
           
        </Flex>
    )
}