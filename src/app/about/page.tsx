'use client'

import { Flex, Tag, Text } from "@/once-ui/components"
import './index.css'
import { experience, aboutMe } from "../resources/consts"
import { AwsIcon, CIcon, CPlusPlusIcon, CssIcon, DockerIcon, ExpressIcon, GitIcon, GraphQLIcon, HtmlIcon, IntelliJIcon, JavaIcon, JavaScriptIcon, JenkinsIcon, JiraIcon, JUnitIcon, MarkoJsIcon, NestJsIcon, NextJsIcon, NodeJsIcon, PythonIcon, ReactIcon, SeleniumIcon, SpringBootIcon, VscodeIcon } from "../resources/icons"

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
                    SKILLS
                </Text>
                <div className="scroll-container">
                    <div className="fade-start"></div>
                    <div className="scroll-content">
                        <Tag className='item' prefixIconComponent={ReactIcon} size="m" label="ReactJS" />
                        <Tag className='item' prefixIconComponent={JavaIcon} size="m" label="Java" />
                        <Tag className='item' prefixIconComponent={JavaScriptIcon} size="m" label="Javascript" />
                        <Tag className='item' prefixIconComponent={HtmlIcon} size="m" label="HTML" />
                        <Tag className='item' prefixIconComponent={CssIcon} size="m" label="CSS" />
                        <Tag className='item' prefixIconComponent={CIcon} size="m" label="C" />
                        <Tag className='item' prefixIconComponent={CPlusPlusIcon} size="m" label="C++" />
                        <Tag className='item' prefixIconComponent={PythonIcon} size="m" label="Python" />
                        <Tag className='item' prefixIconComponent={NodeJsIcon} size="m" label="Node.js" />
                        <Tag className='item' prefixIconComponent={ExpressIcon} size="m" label="Express" />
                        <Tag className='item' prefixIconComponent={NestJsIcon} size="m" label="Nest.js" />
                        <Tag className='item' prefixIconComponent={MarkoJsIcon} size="m" label="MarkoJS" />
                        <Tag className='item' prefixIconComponent={SeleniumIcon} size="m" label="Selenium" />
                        <Tag className='item' prefixIconComponent={JUnitIcon} size="m" label="JUnit" />
                        <Tag className='item' prefixIconComponent={GraphQLIcon} size="m" label="GraphQL" />
                        <Tag className='item' prefixIconComponent={AwsIcon} size="m" label="AWS" />
                        <Tag className='item' prefixIconComponent={GitIcon} size="m" label="Git" />
                        <Tag className='item' prefixIconComponent={DockerIcon} size="m" label="Docker" />
                        <Tag className='item' prefixIconComponent={JenkinsIcon} size="m" label="Jenkins" />
                        <Tag className='item' prefixIconComponent={JiraIcon} size="m" label="Jira" />
                        <Tag className='item' prefixIconComponent={VscodeIcon} size="m" label="Visual Studio" />
                        <Tag className='item' prefixIconComponent={IntelliJIcon} size="m" label="IntelliJ" />
                        <Tag className='item' prefixIconComponent={SpringBootIcon} size="m" label="Spring Boot" />
                        <Tag className='item' prefixIconComponent={NextJsIcon} size="m" label="Next.js" />
                    </div>
                    <div className="scroll-content-reverse">
                        <Tag className='item' prefixIconComponent={IntelliJIcon} size="m" label="IntelliJ" />
                        <Tag className='item' prefixIconComponent={SpringBootIcon} size="m" label="Spring Boot" />
                        <Tag className='item' prefixIconComponent={CssIcon} size="m" label="CSS" />
                        <Tag className='item' prefixIconComponent={CIcon} size="m" label="C" />
                        <Tag className='item' prefixIconComponent={ReactIcon} size="m" label="ReactJS" />
                        <Tag className='item' prefixIconComponent={JavaIcon} size="m" label="Java" />
                        <Tag className='item' prefixIconComponent={JavaScriptIcon} size="m" label="Javascript" />
                        <Tag className='item' prefixIconComponent={HtmlIcon} size="m" label="HTML" />
                        <Tag className='item' prefixIconComponent={AwsIcon} size="m" label="AWS" />
                        <Tag className='item' prefixIconComponent={GitIcon} size="m" label="Git" />
                        <Tag className='item' prefixIconComponent={DockerIcon} size="m" label="Docker" />
                        <Tag className='item' prefixIconComponent={JenkinsIcon} size="m" label="Jenkins" />
                        <Tag className='item' prefixIconComponent={JiraIcon} size="m" label="Jira" />
                        <Tag className='item' prefixIconComponent={VscodeIcon} size="m" label="Visual Studio" />
                        <Tag className='item' prefixIconComponent={ExpressIcon} size="m" label="Express" />
                        <Tag className='item' prefixIconComponent={NestJsIcon} size="m" label="Nest.js" />
                        <Tag className='item' prefixIconComponent={MarkoJsIcon} size="m" label="MarkoJS" />
                        <Tag className='item' prefixIconComponent={CPlusPlusIcon} size="m" label="C++" />
                        <Tag className='item' prefixIconComponent={PythonIcon} size="m" label="Python" />
                        <Tag className='item' prefixIconComponent={NextJsIcon} size="m" label="Next.js" />
                        <Tag className='item' prefixIconComponent={SeleniumIcon} size="m" label="Selenium" />
                        <Tag className='item' prefixIconComponent={JUnitIcon} size="m" label="JUnit" />
                        <Tag className='item' prefixIconComponent={GraphQLIcon} size="m" label="GraphQL" />
                    </div>
                    <div className="scroll-content">
                        <Tag className='item' prefixIconComponent={MarkoJsIcon} size="m" label="MarkoJS" />
                        <Tag className='item' prefixIconComponent={SeleniumIcon} size="m" label="Selenium" />
                        <Tag className='item' prefixIconComponent={JUnitIcon} size="m" label="JUnit" />
                        <Tag className='item' prefixIconComponent={GraphQLIcon} size="m" label="GraphQL" />
                        <Tag className='item' prefixIconComponent={JavaScriptIcon} size="m" label="Javascript" />
                        <Tag className='item' prefixIconComponent={HtmlIcon} size="m" label="HTML" />
                        <Tag className='item' prefixIconComponent={CssIcon} size="m" label="CSS" />
                        <Tag className='item' prefixIconComponent={CIcon} size="m" label="C" />
                        <Tag className='item' prefixIconComponent={AwsIcon} size="m" label="AWS" />
                        <Tag className='item' prefixIconComponent={GitIcon} size="m" label="Git" />
                        <Tag className='item' prefixIconComponent={DockerIcon} size="m" label="Docker" />
                        <Tag className='item' prefixIconComponent={JenkinsIcon} size="m" label="Jenkins" />
                        <Tag className='item' prefixIconComponent={PythonIcon} size="m" label="Python" />
                        <Tag className='item' prefixIconComponent={NodeJsIcon} size="m" label="Node.js" />
                        <Tag className='item' prefixIconComponent={ExpressIcon} size="m" label="Express" />
                        <Tag className='item' prefixIconComponent={NestJsIcon} size="m" label="Nest.js" />
                        <Tag className='item' prefixIconComponent={JiraIcon} size="m" label="Jira" />
                        <Tag className='item' prefixIconComponent={VscodeIcon} size="m" label="Visual Studio" />
                        <Tag className='item' prefixIconComponent={IntelliJIcon} size="m" label="IntelliJ" />
                        <Tag className='item' prefixIconComponent={SpringBootIcon} size="m" label="Spring Boot" />
                        <Tag className='item' prefixIconComponent={NextJsIcon} size="m" label="Next.js" />
                        <Tag className='item' prefixIconComponent={ReactIcon} size="m" label="ReactJS" />
                        <Tag className='item' prefixIconComponent={JavaIcon} size="m" label="Java" />
                        <Tag className='item' prefixIconComponent={CPlusPlusIcon} size="m" label="C++" />
                        <Tag className='item' prefixIconComponent={PythonIcon} size="m" label="Python" />
                    </div>
                    <div className="fade-end"></div>
                </div>
            </Flex>
            <Flex fillWidth
                direction="column"
            >
                          
                <Text
                    variant="heading-strong-xl"
                    style={{ fontSize: "32px" }}
                    onBackground="accent-medium"
                    marginBottom="s"
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