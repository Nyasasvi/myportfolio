'use client'

import { Flex, Grid, Icon, Text } from "@/once-ui/components"
import './index.css';
import { projects } from "../resources/consts";


export default function Page() {
 
    return(
        <Grid
  columns="repeat(3, 1fr)"
  mobileColumns = "1col"
  tabletColumns="2col"
  gap="32"
  padding="24"

>
  {projects.map((project,index) => (
    
        <Flex 
          onClick={() => {
            window.open(project.githubLink, '_blank');
          }} 
          key={`project-${index}`} 
          className="elevate" 
          direction="column" 
          border="brand-strong" 
          borderStyle="solid-2"  
          radius="l"
          position="relative"
        >
          <div 
            style={{ backgroundImage: `url(${project.imageUrl})` }}
            className="project-background"
          />
          
          <Flex 
            direction="column" 
            className="project-content"
          >
            <Flex justifyContent="space-between" alignItems="center">
              <Text variant="heading-strong-l">{project.name}</Text>
              <Icon name="githubLink" style={{ display: "flex", alignSelf: "center", padding: 16}} />
            </Flex>
            
            <Text variant="body-default-m" className="project-description">
              {project.description}
            </Text>
          </Flex>
        </Flex>
  ))}
</Grid>
    )
}