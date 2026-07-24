import React, { 
  useState, 
  useEffect, 
  useRef, 
  useMemo,
  useCallback,
  ReactNode, 
  CSSProperties,
  forwardRef
} from 'react';
import { motion, AnimatePresence, useInView, useAnimation } from 'motion/react';

// 动画预设类型
export type AnimationPreset = 
  | 'fadeIn' 
  | 'slideUp' 
  | 'slideDown' 
  | 'slideLeft' 
  | 'slideRight'
  | 'scaleIn' 
  | 'scaleOut'
  | 'rotateIn' 
  | 'bounceIn'
  | 'flipIn'
  | 'glitch'
  | 'terminal'
  | 'matrix'
  | 'cyber';

// 动画配置接口
interface AnimationConfig {
  initial: any;
  animate: any;
  exit?: any;
  transition: any;
}

// 组件属性接口
interface AnimationSystemProps {
  children: ReactNode;
  preset?: AnimationPreset;
  delay?: number;
  duration?: number;
  repeatCount?: number;
  repeatDelay?: number;
  triggerOnView?: boolean;
  viewThreshold?: number;
  className?: string;
  style?: CSSProperties;
  onAnimationStart?: () => void;
  onAnimationComplete?: () => void;
  customAnimation?: AnimationConfig;
  enableHover?: boolean;
  enableClick?: boolean;
  stagger?: number;
  direction?: 'normal' | 'reverse' | 'alternate';
}

// 动画预设配置
const animationPresets: Record<AnimationPreset, AnimationConfig> = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
  },
  
  slideUp: {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -30 },
    transition: { duration: 0.7, ease: [0.4, 0, 0.2, 1] }
  },
  
  slideDown: {
    initial: { opacity: 0, y: -30 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 30 },
    transition: { duration: 0.7, ease: [0.4, 0, 0.2, 1] }
  },
  
  slideLeft: {
    initial: { opacity: 0, x: 30 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 },
    transition: { duration: 0.7, ease: [0.4, 0, 0.2, 1] }
  },
  
  slideRight: {
    initial: { opacity: 0, x: -30 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 30 },
    transition: { duration: 0.7, ease: [0.4, 0, 0.2, 1] }
  },
  
  scaleIn: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
    transition: { duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }
  },
  
  scaleOut: {
    initial: { opacity: 0, scale: 1.2 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.2 },
    transition: { duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }
  },
  
  rotateIn: {
    initial: { opacity: 0, rotate: -10, scale: 0.9 },
    animate: { opacity: 1, rotate: 0, scale: 1 },
    exit: { opacity: 0, rotate: 10, scale: 0.9 },
    transition: { duration: 0.8, ease: [0.4, 0, 0.2, 1] }
  },
  
  bounceIn: {
    initial: { opacity: 0, scale: 0.3 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.3 },
    transition: { 
      duration: 0.8, 
      ease: [0.68, -0.55, 0.265, 1.55],
      scale: {
        type: "spring",
        damping: 15,
        stiffness: 400
      }
    }
  },
  
  flipIn: {
    initial: { opacity: 0, rotateX: -90 },
    animate: { opacity: 1, rotateX: 0 },
    exit: { opacity: 0, rotateX: 90 },
    transition: { 
      duration: 0.8, 
      ease: [0.4, 0, 0.2, 1],
      rotateX: {
        type: "spring",
        damping: 20,
        stiffness: 300
      }
    }
  },
  
  glitch: {
    initial: { 
      opacity: 0, 
      skewX: -10,
      x: -10,
      filter: "hue-rotate(0deg)"
    },
    animate: { 
      opacity: 1, 
      skewX: 0,
      x: 0,
      filter: "hue-rotate(0deg)"
    },
    exit: { 
      opacity: 0, 
      skewX: 10,
      x: 10,
      filter: "hue-rotate(180deg)"
    },
    transition: { 
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  },
  
  terminal: {
    initial: { 
      opacity: 0, 
      scaleX: 0,
      transformOrigin: "left"
    },
    animate: { 
      opacity: 1, 
      scaleX: 1 
    },
    exit: { 
      opacity: 0, 
      scaleX: 0 
    },
    transition: { 
      duration: 0.8,
      ease: [0.4, 0, 0.2, 1],
      scaleX: {
        type: "tween",
        ease: [0.4, 0, 0.2, 1]
      }
    }
  },
  
  matrix: {
    initial: { 
      opacity: 0, 
      y: -20,
      filter: "brightness(0.5) saturate(2)",
      textShadow: "0 0 10px #00ff00"
    },
    animate: { 
      opacity: 1, 
      y: 0,
      filter: "brightness(1) saturate(1.5)",
      textShadow: "0 0 5px #00ff00"
    },
    exit: { 
      opacity: 0, 
      y: 20,
      filter: "brightness(0.3) saturate(3)"
    },
    transition: { 
      duration: 1,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  
  cyber: {
    initial: { 
      opacity: 0, 
      scale: 0.95,
      filter: "blur(2px) hue-rotate(0deg)",
      boxShadow: "0 0 0 rgba(59, 130, 246, 0)"
    },
    animate: { 
      opacity: 1, 
      scale: 1,
      filter: "blur(0px) hue-rotate(0deg)",
      boxShadow: "0 0 20px rgba(59, 130, 246, 0.3)"
    },
    exit: { 
      opacity: 0, 
      scale: 1.05,
      filter: "blur(1px) hue-rotate(180deg)"
    },
    transition: { 
      duration: 0.9,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

// 悬停动画预设
const hoverAnimations = {
  lift: { y: -8, scale: 1.02 },
  scale: { scale: 1.05 },
  glow: { 
    boxShadow: "0 0 30px rgba(59, 130, 246, 0.5)",
    filter: "brightness(1.1)"
  },
  rotate: { rotate: 2 },
  shake: { 
    x: [-2, 2, -2, 2, 0],
    transition: { duration: 0.4 }
  },
  pulse: {
    scale: [1, 1.05, 1],
    transition: { duration: 0.6, repeat: Infinity }
  }
};

// 点击动画预设
const clickAnimations = {
  tap: { scale: 0.95 },
  bounce: { 
    scale: [1, 0.9, 1.1, 1],
    transition: { duration: 0.4 }
  },
  ripple: {
    scale: [1, 1.2, 1],
    opacity: [1, 0.7, 1],
    transition: { duration: 0.3 }
  }
};

const AnimationSystem: React.FC<AnimationSystemProps> = ({
  children,
  preset = 'fadeIn',
  delay = 0,
  duration,
  repeatCount = 1,
  repeatDelay = 0,
  triggerOnView = true,
  viewThreshold = 0.1,
  className = '',
  style = {},
  onAnimationStart,
  onAnimationComplete,
  customAnimation,
  enableHover = false,
  enableClick = false,
  stagger = 0,
  direction = 'normal'
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  const isInView = useInView(ref, { 
    threshold: viewThreshold,
    once: true 
  });
  
  const [animationState, setAnimationState] = useState<'initial' | 'animate' | 'complete'>('initial');
  const [hoverState, setHoverState] = useState(false);

  // 获取动画配置
  const animationConfig = useMemo(() => {
    const config = customAnimation || animationPresets[preset];
    const finalConfig = { ...config };
    
    // 应用持续时间覆盖
    if (duration) {
      finalConfig.transition = {
        ...finalConfig.transition,
        duration
      };
    }
    
    return finalConfig;
  }, [customAnimation, preset, duration]);

  // 生成最终的动画配置，包含所有修改
  const finalAnimationConfig = useMemo(() => {
    const config = { ...animationConfig };
    
    // 应用延迟
    if (delay > 0 || stagger > 0) {
      config.transition = {
        ...config.transition,
        delay: delay + stagger
      };
    }

    // 应用重复
    if (repeatCount > 1) {
      config.transition = {
        ...config.transition,
        repeat: repeatCount === Infinity ? Infinity : repeatCount - 1,
        repeatDelay,
        repeatType: direction === 'alternate' ? 'reverse' : 'loop'
      };
    }
    
    return config;
  }, [animationConfig, delay, stagger, repeatCount, repeatDelay, direction]);

  // 触发动画 - 优化依赖防止无限循环
  useEffect(() => {
    if (animationState !== 'initial') return;
    
    if (triggerOnView && isInView) {
      setAnimationState('animate');
      controls.start('animate');
      onAnimationStart?.();
    } else if (!triggerOnView) {
      setAnimationState('animate');
      controls.start('animate');
      onAnimationStart?.();
    }
  }, [isInView, triggerOnView, animationState, controls]);

  // 处理动画完成
  const handleAnimationComplete = () => {
    setAnimationState('complete');
    onAnimationComplete?.();
  };

  // 悬停处理
  const handleHoverStart = () => {
    if (enableHover && animationState === 'complete') {
      setHoverState(true);
    }
  };

  const handleHoverEnd = () => {
    if (enableHover) {
      setHoverState(false);
    }
  };

  // 点击处理
  const handleTap = () => {
    if (enableClick && animationState === 'complete') {
      // 触发点击动画
    }
  };

  return (
    <motion.div
      ref={ref}
      className={`animation-container ${className}`}
      style={style}
      initial={finalAnimationConfig.initial}
      animate={controls}
      exit={finalAnimationConfig.exit}
      transition={finalAnimationConfig.transition}
      variants={{
        initial: finalAnimationConfig.initial,
        animate: finalAnimationConfig.animate,
        exit: finalAnimationConfig.exit
      }}
      onAnimationComplete={handleAnimationComplete}
      onHoverStart={handleHoverStart}
      onHoverEnd={handleHoverEnd}
      onTap={handleTap}
      whileHover={enableHover ? hoverAnimations.lift : undefined}
      whileTap={enableClick ? clickAnimations.tap : undefined}
      data-animation-preset={preset}
      data-animation-state={animationState}
      data-in-view={isInView}
    >
      {children}
    </motion.div>
  );
};

// 页面转场动画组件
export const PageTransition: React.FC<{
  children: ReactNode;
  mode?: 'fade' | 'slide' | 'scale' | 'terminal';
  duration?: number;
}> = ({ 
  children, 
  mode = 'fade', 
  duration = 0.5 
}) => {
  const variants = {
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 }
    },
    slide: {
      initial: { opacity: 0, x: 20 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -20 }
    },
    scale: {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 1.05 }
    },
    terminal: {
      initial: { opacity: 0, scaleX: 0, transformOrigin: "left" },
      animate: { opacity: 1, scaleX: 1 },
      exit: { opacity: 0, scaleX: 0 }
    }
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants[mode]}
      transition={{ 
        duration, 
        ease: [0.4, 0, 0.2, 1] 
      }}
      className="page-transition"
    >
      {children}
    </motion.div>
  );
};

// 交错动画容器
export const StaggerContainer: React.FC<{
  children: ReactNode;
  staggerDelay?: number;
  preset?: AnimationPreset;
  className?: string;
}> = ({ 
  children, 
  staggerDelay = 0.1, 
  preset = 'slideUp',
  className = '' 
}) => {
  return (
    <motion.div 
      className={`stagger-container ${className}`}
      initial="initial"
      animate="animate"
      variants={{
        initial: {},
        animate: {
          transition: {
            staggerChildren: staggerDelay
          }
        }
      }}
    >
      {React.Children.map(children, (child, index) => (
        <AnimationSystem
          preset={preset}
          delay={index * staggerDelay}
          triggerOnView={true}
          key={index}
        >
          {child}
        </AnimationSystem>
      ))}
    </motion.div>
  );
};

// 加载动画组件
export const LoadingAnimation: React.FC<{
  type?: 'spinner' | 'dots' | 'pulse' | 'terminal';
  size?: 'small' | 'medium' | 'large';
  color?: string;
}> = ({ 
  type = 'spinner', 
  size = 'medium',
  color = '#3b82f6'
}) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  const loadingVariants = {
    spinner: (
      <motion.div
        className={`border-2 border-t-transparent rounded-full ${sizeClasses[size]}`}
        style={{ borderColor: `${color}40`, borderTopColor: color }}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
    ),
    dots: (
      <div className="flex space-x-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className={`${size === 'small' ? 'w-2 h-2' : size === 'large' ? 'w-4 h-4' : 'w-3 h-3'} rounded-full`}
            style={{ backgroundColor: color }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [1, 0.5, 1]
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2
            }}
          />
        ))}
      </div>
    ),
    pulse: (
      <motion.div
        className={`rounded-full ${sizeClasses[size]}`}
        style={{ backgroundColor: color }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [1, 0.7, 1]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: [0.4, 0, 0.6, 1]
        }}
      />
    ),
    terminal: (
      <motion.div
        className={`border-l-2 ${size === 'small' ? 'h-4' : size === 'large' ? 'h-8' : 'h-6'}`}
        style={{ borderColor: color }}
        animate={{ opacity: [1, 0] }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    )
  };

  return (
    <div className="loading-animation flex items-center justify-center">
      {loadingVariants[type]}
    </div>
  );
};

// 工具函数：创建预设动画组件
export const createAnimatedComponent = (preset: AnimationPreset) => {
  return forwardRef<HTMLDivElement, Omit<AnimationSystemProps, 'preset'>>((props, ref) => (
    <AnimationSystem preset={preset} {...props} />
  ));
};

// 预定义动画组件
export const FadeIn = createAnimatedComponent('fadeIn');
export const SlideUp = createAnimatedComponent('slideUp');
export const ScaleIn = createAnimatedComponent('scaleIn');
export const TerminalIn = createAnimatedComponent('terminal');
export const CyberIn = createAnimatedComponent('cyber');
export const GlitchIn = createAnimatedComponent('glitch');

export default AnimationSystem;