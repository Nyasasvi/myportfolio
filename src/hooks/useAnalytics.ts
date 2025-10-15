import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { track } from '@vercel/analytics';

export const useAnalytics = () => {
  const pathname = usePathname();
  const sessionId = useRef<string>();
  const startTime = useRef<number>();
  
  useEffect(() => {
    // Generate session ID if not exists
    if (!sessionId.current) {
      sessionId.current = generateSessionId();
    }
    
    // Track page view
    trackPageView(pathname);
    
    // Track time on page
    startTime.current = Date.now();
    
    return () => {
      if (startTime.current) {
        const timeSpent = Date.now() - startTime.current;
        trackPageExit(pathname, timeSpent);
      }
    };
  }, [pathname]);
  
  const trackPageView = (pagePath: string) => {
    track('page_view', {
      page: pagePath,
      sessionId: sessionId.current || 'unknown' || 'unknown',
      timestamp: new Date().toISOString()
    });
  };
  
  const trackPageExit = (pagePath: string, timeSpent: number) => {
    track('page_exit', {
      page: pagePath,
      timeSpent: Math.round(timeSpent / 1000), // Convert to seconds
      sessionId: sessionId.current || 'unknown'
    });
  };
  
  const trackProjectClick = (projectName: string, projectUrl: string) => {
    track('project_click', {
      project: projectName,
      url: projectUrl,
      page: pathname,
      sessionId: sessionId.current || 'unknown'
    });
  };
  
  const trackResumeDownload = () => {
    track('resume_download', {
      page: pathname,
      sessionId: sessionId.current || 'unknown' || 'unknown',
      timestamp: new Date().toISOString()
    });
  };
  
  const trackContactForm = (formType: string) => {
    track('contact_form', {
      type: formType,
      page: pathname,
      sessionId: sessionId.current || 'unknown'
    });
  };
  
  const trackSkillAssessment = (skill: string, score: number) => {
    track('skill_assessment', {
      skill,
      score,
      page: pathname,
      sessionId: sessionId.current || 'unknown'
    });
  };
  
  const trackJobMatch = (jobTitle: string, matchScore: number) => {
    track('job_match', {
      jobTitle,
      matchScore,
      page: pathname,
      sessionId: sessionId.current || 'unknown'
    });
  };
  
  const trackNewsletterSubscribe = () => {
    track('newsletter_subscribe', {
      page: pathname,
      sessionId: sessionId.current || 'unknown'
    });
  };
  
  const trackNewsletterGenerate = () => {
    track('newsletter_generate', {
      page: pathname,
      sessionId: sessionId.current || 'unknown'
    });
  };
  
  const trackARExperience = (interaction: string) => {
    track('ar_experience', {
      interaction,
      page: pathname,
      sessionId: sessionId.current || 'unknown'
    });
  };
  
  const trackChatbotInteraction = (message: string, response: string) => {
    track('chatbot_interaction', {
      messageLength: message.length,
      responseLength: response.length,
      page: pathname,
      sessionId: sessionId.current || 'unknown'
    });
  };
  
  const trackButtonClick = (buttonName: string, location: string) => {
    track('button_click', {
      button: buttonName,
      location,
      page: pathname,
      sessionId: sessionId.current || 'unknown'
    });
  };
  
  const trackScrollDepth = (depth: number) => {
    track('scroll_depth', {
      depth,
      page: pathname,
      sessionId: sessionId.current || 'unknown'
    });
  };
  
  const trackVideoPlay = (videoName: string) => {
    track('video_play', {
      video: videoName,
      page: pathname,
      sessionId: sessionId.current || 'unknown'
    });
  };
  
  const trackExternalLink = (url: string, linkText: string) => {
    track('external_link', {
      url,
      linkText,
      page: pathname,
      sessionId: sessionId.current || 'unknown'
    });
  };
  
  const trackSearch = (query: string, results: number) => {
    track('search', {
      query,
      results,
      page: pathname,
      sessionId: sessionId.current || 'unknown'
    });
  };
  
  const trackError = (error: string, context: string) => {
    track('error', {
      error,
      context,
      page: pathname,
      sessionId: sessionId.current || 'unknown'
    });
  };
  
  return {
    track,
    trackProjectClick,
    trackResumeDownload,
    trackContactForm,
    trackSkillAssessment,
    trackJobMatch,
    trackNewsletterSubscribe,
    trackNewsletterGenerate,
    trackARExperience,
    trackChatbotInteraction,
    trackButtonClick,
    trackScrollDepth,
    trackVideoPlay,
    trackExternalLink,
    trackSearch,
    trackError
  };
};

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Hook for tracking scroll depth
export const useScrollTracking = () => {
  const { trackScrollDepth } = useAnalytics();
  
  useEffect(() => {
    let maxScrollDepth = 0;
    
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercentage = Math.round((scrollTop / scrollHeight) * 100);
      
      if (scrollPercentage > maxScrollDepth) {
        maxScrollDepth = scrollPercentage;
        
        // Track at 25%, 50%, 75%, and 100%
        if ([25, 50, 75, 100].includes(scrollPercentage)) {
          trackScrollDepth(scrollPercentage);
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [trackScrollDepth]);
};

// Hook for tracking time on page
export const useTimeTracking = () => {
  const { track } = useAnalytics();
  
  useEffect(() => {
    const startTime = Date.now();
    
    const handleBeforeUnload = () => {
      const timeSpent = Date.now() - startTime;
      track('time_on_page', {
        duration: Math.round(timeSpent / 1000),
        timestamp: new Date().toISOString()
      });
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [track]);
};

// Hook for tracking mouse movements (heatmap data)
export const useHeatmapTracking = () => {
  const { track } = useAnalytics();
  
  useEffect(() => {
    let mousePositions: Array<{x: number, y: number, timestamp: number}> = [];
    
    const handleMouseMove = (e: MouseEvent) => {
      mousePositions.push({
        x: e.clientX,
        y: e.clientY,
        timestamp: Date.now()
      });
      
      // Send data every 10 seconds or when array gets too large
      if (mousePositions.length >= 50) {
        track('mouse_movements', {
          positions: JSON.stringify(mousePositions),
          page: window.location.pathname
        });
        mousePositions = [];
      }
    };
    
    const interval = setInterval(() => {
      if (mousePositions.length > 0) {
        track('mouse_movements', {
          positions: JSON.stringify(mousePositions),
          page: window.location.pathname
        });
        mousePositions = [];
      }
    }, 10000);
    
    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      clearInterval(interval);
    };
  }, [track]);
};
