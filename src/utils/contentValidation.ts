import { ContentPlatform, MediaFile, OptimizationSuggestion } from '../types/content';

// Platform-specific configuration
const platformConfig = {
  twitter: {
    characterLimit: 280,
    maxImages: 4,
    maxVideos: 1,
    maxVideoSize: 512, // MB
    maxImageSize: 5, // MB
    supportedFormats: {
      image: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      video: ['mp4', 'mov'],
    },
    hashtagLimit: 10,
    mentionLimit: 10,
  },
  linkedin: {
    characterLimit: 3000,
    maxImages: 9,
    maxVideos: 1,
    maxVideoSize: 5120, // MB
    maxImageSize: 100, // MB
    supportedFormats: {
      image: ['jpg', 'jpeg', 'png', 'gif'],
      video: ['mp4', 'mov', 'avi'],
    },
    hashtagLimit: 30,
    mentionLimit: 50,
  },
  instagram: {
    characterLimit: 2200,
    maxImages: 10,
    maxVideos: 1,
    maxVideoSize: 4096, // MB
    maxImageSize: 30, // MB
    supportedFormats: {
      image: ['jpg', 'jpeg', 'png'],
      video: ['mp4', 'mov'],
    },
    hashtagLimit: 30,
    mentionLimit: 20,
  },
  facebook: {
    characterLimit: 63206,
    maxImages: 10,
    maxVideos: 1,
    maxVideoSize: 4096, // MB
    maxImageSize: 100, // MB
    supportedFormats: {
      image: ['jpg', 'jpeg', 'png', 'gif', 'bmp'],
      video: ['mp4', 'mov', 'avi'],
    },
    hashtagLimit: 50,
    mentionLimit: 50,
  },
  youtube: {
    characterLimit: 5000, // Description
    titleLimit: 100,
    maxVideoSize: 256000, // MB (256GB)
    maxThumbnailSize: 2, // MB
    supportedFormats: {
      video: ['mp4', 'mov', 'avi', 'wmv', 'flv', 'webm'],
      thumbnail: ['jpg', 'jpeg', 'png', 'gif', 'bmp'],
    },
    hashtagLimit: 15,
  },
  tiktok: {
    characterLimit: 2200,
    maxVideos: 1,
    maxVideoSize: 287, // MB
    maxImageSize: 20, // MB
    supportedFormats: {
      video: ['mp4', 'mov'],
      image: ['jpg', 'jpeg', 'png'],
    },
    hashtagLimit: 100,
  },
};

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  suggestions: OptimizationSuggestion[];
  score: number; // 0-100
}

export interface ValidationError {
  type: 'content' | 'media' | 'platform' | 'compliance';
  platform?: string;
  field?: string;
  message: string;
  code: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  fixable: boolean;
  autoFix?: {
    action: string;
    preview: string;
  };
}

export interface ValidationWarning {
  type: 'optimization' | 'accessibility' | 'engagement' | 'timing';
  platform?: string;
  message: string;
  suggestion: string;
  impact: 'low' | 'medium' | 'high';
}

export class ContentValidator {
  private content: string;
  private platforms: ContentPlatform[];
  private mediaFiles: MediaFile[];
  private options: ValidationOptions;

  constructor(
    content: string,
    platforms: ContentPlatform[],
    mediaFiles: MediaFile[] = [],
    options: ValidationOptions = {}
  ) {
    this.content = content;
    this.platforms = platforms;
    this.mediaFiles = mediaFiles;
    this.options = {
      checkAccessibility: true,
      checkBrandGuidelines: false,
      checkCompliance: true,
      checkEngagement: true,
      strictMode: false,
      ...options,
    };
  }

  public validate(): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const suggestions: OptimizationSuggestion[] = [];

    // Content validation
    errors.push(...this.validateContent());
    
    // Platform-specific validation
    for (const platform of this.platforms) {
      errors.push(...this.validatePlatform(platform));
      warnings.push(...this.validatePlatformOptimization(platform));
    }

    // Media validation
    errors.push(...this.validateMedia());

    // Accessibility validation
    if (this.options.checkAccessibility) {
      warnings.push(...this.validateAccessibility());
    }

    // Compliance validation
    if (this.options.checkCompliance) {
      errors.push(...this.validateCompliance());
    }

    // Engagement validation
    if (this.options.checkEngagement) {
      warnings.push(...this.validateEngagement());
      suggestions.push(...this.generateEngagementSuggestions());
    }

    // Brand guidelines validation
    if (this.options.checkBrandGuidelines) {
      warnings.push(...this.validateBrandGuidelines());
    }

    const score = this.calculateScore(errors, warnings);
    const isValid = errors.filter(e => e.severity === 'critical').length === 0;

    return {
      isValid,
      errors: errors.sort((a, b) => this.getSeverityWeight(b.severity) - this.getSeverityWeight(a.severity)),
      warnings: warnings.sort((a, b) => this.getImpactWeight(b.impact) - this.getImpactWeight(a.impact)),
      suggestions,
      score,
    };
  }

  private validateContent(): ValidationError[] {
    const errors: ValidationError[] = [];

    // Empty content check
    if (!this.content.trim()) {
      errors.push({
        type: 'content',
        message: 'Content cannot be empty',
        code: 'CONTENT_EMPTY',
        severity: 'critical',
        fixable: false,
      });
      return errors;
    }

    // Excessive whitespace
    if (this.content.includes('   ') || this.content.includes('\n\n\n')) {
      errors.push({
        type: 'content',
        message: 'Excessive whitespace detected',
        code: 'CONTENT_WHITESPACE',
        severity: 'low',
        fixable: true,
        autoFix: {
          action: 'Remove excessive whitespace',
          preview: this.content.replace(/\\s{3,}/g, ' ').replace(/\\n{3,}/g, '\\n\\n'),
        },
      });
    }

    // Suspicious links
    const suspiciousPatterns = [
      /bit\\.ly/gi,
      /tinyurl/gi,
      /t\\.co/gi,
    ];
    
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(this.content)) {
        errors.push({
          type: 'content',
          message: 'Shortened URLs may appear suspicious to users and algorithms',
          code: 'CONTENT_SUSPICIOUS_URL',
          severity: 'medium',
          fixable: false,
        });
        break;
      }
    }

    // Profanity check (basic)
    const profanityWords = ['spam', 'scam', 'fake']; // In reality, this would be more comprehensive
    const foundProfanity = profanityWords.find(word => 
      this.content.toLowerCase().includes(word.toLowerCase())
    );
    
    if (foundProfanity) {
      errors.push({
        type: 'compliance',
        message: `Potentially inappropriate content detected: "${foundProfanity}"`,
        code: 'CONTENT_PROFANITY',
        severity: 'high',
        fixable: false,
      });
    }

    return errors;
  }

  private validatePlatform(platform: ContentPlatform): ValidationError[] {
    const errors: ValidationError[] = [];
    const config = platformConfig[platform.platform as keyof typeof platformConfig];
    
    if (!config) {
      errors.push({
        type: 'platform',
        platform: platform.platform,
        message: `Unsupported platform: ${platform.platform}`,
        code: 'PLATFORM_UNSUPPORTED',
        severity: 'critical',
        fixable: false,
      });
      return errors;
    }

    // Character limit validation
    if (this.content.length > config.characterLimit) {
      const excess = this.content.length - config.characterLimit;
      errors.push({
        type: 'content',
        platform: platform.platform,
        message: `Content exceeds ${platform.platform} character limit by ${excess} characters`,
        code: 'CONTENT_TOO_LONG',
        severity: 'high',
        fixable: true,
        autoFix: {
          action: 'Truncate content',
          preview: this.content.substring(0, config.characterLimit - 3) + '...',
        },
      });
    }

    // Hashtag validation
    const hashtags = this.extractHashtags(this.content);
    if (hashtags.length > config.hashtagLimit) {
      errors.push({
        type: 'content',
        platform: platform.platform,
        message: `Too many hashtags (${hashtags.length}/${config.hashtagLimit}) for ${platform.platform}`,
        code: 'HASHTAGS_LIMIT_EXCEEDED',
        severity: 'medium',
        fixable: true,
      });
    }

    // Mention validation
    const mentions = this.extractMentions(this.content);
    if (config.mentionLimit && mentions.length > config.mentionLimit) {
      errors.push({
        type: 'content',
        platform: platform.platform,
        message: `Too many mentions (${mentions.length}/${config.mentionLimit}) for ${platform.platform}`,
        code: 'MENTIONS_LIMIT_EXCEEDED',
        severity: 'medium',
        fixable: false,
      });
    }

    // YouTube-specific validation
    if (platform.platform === 'youtube') {
      const title = this.content.split('\\n')[0] || '';
      if (title.length > config.titleLimit!) {
        errors.push({
          type: 'content',
          platform: platform.platform,
          message: `YouTube title exceeds ${config.titleLimit} characters`,
          code: 'YOUTUBE_TITLE_TOO_LONG',
          severity: 'high',
          fixable: true,
        });
      }
    }

    return errors;
  }

  private validateMedia(): ValidationError[] {
    const errors: ValidationError[] = [];

    for (const platform of this.platforms) {
      const config = platformConfig[platform.platform as keyof typeof platformConfig];
      if (!config) continue;

      const images = this.mediaFiles.filter(f => f.type.startsWith('image'));
      const videos = this.mediaFiles.filter(f => f.type.startsWith('video'));

      // Image count validation
      if (images.length > config.maxImages) {
        errors.push({
          type: 'media',
          platform: platform.platform,
          message: `Too many images (${images.length}/${config.maxImages}) for ${platform.platform}`,
          code: 'MEDIA_TOO_MANY_IMAGES',
          severity: 'high',
          fixable: true,
        });
      }

      // Video count validation
      if (videos.length > config.maxVideos) {
        errors.push({
          type: 'media',
          platform: platform.platform,
          message: `Too many videos (${videos.length}/${config.maxVideos}) for ${platform.platform}`,
          code: 'MEDIA_TOO_MANY_VIDEOS',
          severity: 'high',
          fixable: true,
        });
      }

      // File size validation
      for (const media of this.mediaFiles) {
        const sizeInMB = media.size / (1024 * 1024);
        const isImage = media.type.startsWith('image');
        const maxSize = isImage ? config.maxImageSize : config.maxVideoSize;
        
        if (maxSize && sizeInMB > maxSize) {
          errors.push({
            type: 'media',
            platform: platform.platform,
            field: media.name,
            message: `File "${media.name}" (${sizeInMB.toFixed(1)}MB) exceeds ${platform.platform} size limit (${maxSize}MB)`,
            code: 'MEDIA_SIZE_EXCEEDED',
            severity: 'high',
            fixable: true,
            autoFix: {
              action: 'Compress file',
              preview: `Reduce file size to under ${maxSize}MB`,
            },
          });
        }
      }

      // Format validation
      for (const media of this.mediaFiles) {
        const extension = media.name.split('.').pop()?.toLowerCase() || '';
        const isImage = media.type.startsWith('image');
        const supportedFormats = isImage ? config.supportedFormats.image : config.supportedFormats.video;
        
        if (supportedFormats && !supportedFormats.includes(extension)) {
          errors.push({
            type: 'media',
            platform: platform.platform,
            field: media.name,
            message: `File format "${extension}" not supported by ${platform.platform}`,
            code: 'MEDIA_FORMAT_UNSUPPORTED',
            severity: 'high',
            fixable: true,
            autoFix: {
              action: 'Convert format',
              preview: `Convert to ${supportedFormats[0]}`,
            },
          });
        }
      }
    }

    return errors;
  }

  private validateAccessibility(): ValidationWarning[] {
    const warnings: ValidationWarning[] = [];

    // Alt text for images
    const images = this.mediaFiles.filter(f => f.type.startsWith('image'));
    const imagesWithoutAlt = images.filter(img => !img.metadata?.alt);
    
    if (imagesWithoutAlt.length > 0) {
      warnings.push({
        type: 'accessibility',
        message: `${imagesWithoutAlt.length} image(s) missing alt text`,
        suggestion: 'Add descriptive alt text for screen readers',
        impact: 'medium',
      });
    }

    // Color contrast (basic check for emojis and special characters)
    const hasEmojis = /[\\u{1F600}-\\u{1F64F}]|[\\u{1F300}-\\u{1F5FF}]|[\\u{1F680}-\\u{1F6FF}]|[\\u{1F1E0}-\\u{1F1FF}]/u.test(this.content);
    if (!hasEmojis && this.content.length > 100) {
      warnings.push({
        type: 'accessibility',
        message: 'Content might benefit from emojis for visual appeal',
        suggestion: 'Consider adding relevant emojis to improve accessibility and engagement',
        impact: 'low',
      });
    }

    // Reading level check (simplified)
    const sentences = this.content.split(/[.!?]+/).filter(s => s.trim());
    const words = this.content.split(/\\s+/).length;
    const avgWordsPerSentence = words / sentences.length;
    
    if (avgWordsPerSentence > 20) {
      warnings.push({
        type: 'accessibility',
        message: 'Content has complex sentence structure',
        suggestion: 'Break down long sentences for better readability',
        impact: 'medium',
      });
    }

    return warnings;
  }

  private validateCompliance(): ValidationError[] {
    const errors: ValidationError[] = [];

    // FTC compliance for sponsored content
    const sponsoredKeywords = ['#ad', '#sponsored', '#partnership', 'paid partnership'];
    const hasCommercialIntent = /buy now|click here|discount|sale|offer/gi.test(this.content);
    const hasDisclosure = sponsoredKeywords.some(keyword => 
      this.content.toLowerCase().includes(keyword.toLowerCase())
    );

    if (hasCommercialIntent && !hasDisclosure) {
      errors.push({
        type: 'compliance',
        message: 'Commercial content may require FTC disclosure',
        code: 'COMPLIANCE_FTC_DISCLOSURE',
        severity: 'medium',
        fixable: true,
        autoFix: {
          action: 'Add disclosure',
          preview: this.content + '\\n\\n#ad',
        },
      });
    }

    // GDPR compliance for data collection mentions
    const dataKeywords = ['email', 'subscribe', 'newsletter', 'personal data'];
    const hasDataCollection = dataKeywords.some(keyword =>
      this.content.toLowerCase().includes(keyword)
    );

    if (hasDataCollection) {
      const hasPrivacyNotice = /privacy policy|terms of service|gdpr/gi.test(this.content);
      if (!hasPrivacyNotice) {
        errors.push({
          type: 'compliance',
          message: 'Data collection content should reference privacy policy',
          code: 'COMPLIANCE_GDPR_NOTICE',
          severity: 'medium',
          fixable: false,
        });
      }
    }

    return errors;
  }

  private validateEngagement(): ValidationWarning[] {
    const warnings: ValidationWarning[] = [];

    // Call-to-action check
    const ctaPatterns = [
      /what do you think/gi,
      /share your/gi,
      /let me know/gi,
      /comment below/gi,
      /thoughts\\?/gi,
      /click.*link/gi,
    ];

    const hasCTA = ctaPatterns.some(pattern => pattern.test(this.content));
    if (!hasCTA && this.content.length > 100) {
      warnings.push({
        type: 'engagement',
        message: 'Content lacks a clear call-to-action',
        suggestion: 'Add a question or prompt to encourage engagement',
        impact: 'high',
      });
    }

    // Hook analysis
    const firstSentence = this.content.split(/[.!?\\n]/)[0].trim();
    if (firstSentence.length > 100) {
      warnings.push({
        type: 'engagement',
        message: 'Opening sentence is too long',
        suggestion: 'Start with a shorter, more engaging hook',
        impact: 'medium',
      });
    }

    // Hashtag effectiveness
    const hashtags = this.extractHashtags(this.content);
    const genericHashtags = ['#marketing', '#business', '#success', '#motivation'];
    const hasGenericHashtags = hashtags.some(tag => 
      genericHashtags.includes(tag.toLowerCase())
    );

    if (hasGenericHashtags) {
      warnings.push({
        type: 'engagement',
        message: 'Using very generic hashtags',
        suggestion: 'Replace generic hashtags with more specific, niche ones',
        impact: 'medium',
      });
    }

    return warnings;
  }

  private validateBrandGuidelines(): ValidationWarning[] {
    // This would typically integrate with brand guidelines API
    // For now, returning basic tone analysis
    const warnings: ValidationWarning[] = [];

    // Tone consistency check
    const professionalWords = ['expertise', 'professional', 'strategic', 'innovative'];
    const casualWords = ['awesome', 'cool', 'amazing', 'epic'];
    
    const hasProfessional = professionalWords.some(word => 
      this.content.toLowerCase().includes(word)
    );
    const hasCasual = casualWords.some(word => 
      this.content.toLowerCase().includes(word)
    );

    if (hasProfessional && hasCasual) {
      warnings.push({
        type: 'engagement',
        message: 'Mixed tone detected in content',
        suggestion: 'Maintain consistent brand voice throughout',
        impact: 'medium',
      });
    }

    return warnings;
  }

  private validatePlatformOptimization(platform: ContentPlatform): ValidationWarning[] {
    const warnings: ValidationWarning[] = [];
    const config = platformConfig[platform.platform as keyof typeof platformConfig];

    if (!config) return warnings;

    // Character utilization
    const utilization = (this.content.length / config.characterLimit) * 100;
    
    if (utilization < 30) {
      warnings.push({
        type: 'optimization',
        platform: platform.platform,
        message: `Content is quite short for ${platform.platform} (${utilization.toFixed(0)}% of limit used)`,
        suggestion: 'Consider expanding content for better engagement',
        impact: 'low',
      });
    }

    // Platform-specific optimization
    if (platform.platform === 'linkedin' && !this.extractHashtags(this.content).length) {
      warnings.push({
        type: 'optimization',
        platform: platform.platform,
        message: 'LinkedIn content benefits from hashtags',
        suggestion: 'Add 3-5 relevant hashtags',
        impact: 'medium',
      });
    }

    if (platform.platform === 'twitter' && utilization > 90) {
      warnings.push({
        type: 'optimization',
        platform: platform.platform,
        message: 'Twitter content is near character limit',
        suggestion: 'Leave room for retweets and replies',
        impact: 'medium',
      });
    }

    if (platform.platform === 'instagram' && this.mediaFiles.length === 0) {
      warnings.push({
        type: 'optimization',
        platform: platform.platform,
        message: 'Instagram content performs better with media',
        suggestion: 'Add images or videos for better engagement',
        impact: 'high',
      });
    }

    return warnings;
  }

  private generateEngagementSuggestions(): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];

    // Question-based engagement
    if (!this.content.includes('?')) {
      suggestions.push({
        id: 'add-question',
        type: 'improvement',
        title: 'Add engagement question',
        description: 'Include a question to encourage comments and interaction',
        impact: 'high',
        effort: 'easy',
        category: 'engagement',
      });
    }

    // Emoji usage
    const emojiCount = (this.content.match(/[\\u{1F600}-\\u{1F64F}]|[\\u{1F300}-\\u{1F5FF}]|[\\u{1F680}-\\u{1F6FF}]|[\\u{1F1E0}-\\u{1F1FF}]/gu) || []).length;
    if (emojiCount < 2 && this.content.length > 50) {
      suggestions.push({
        id: 'add-emojis',
        type: 'improvement',
        title: 'Add relevant emojis',
        description: 'Emojis can increase engagement and visual appeal',
        impact: 'medium',
        effort: 'easy',
        category: 'engagement',
      });
    }

    // Line breaks for readability
    const lines = this.content.split('\\n').filter(line => line.trim());
    const avgLineLength = this.content.length / lines.length;
    if (avgLineLength > 80) {
      suggestions.push({
        id: 'improve-formatting',
        type: 'improvement',
        title: 'Improve formatting',
        description: 'Break content into shorter paragraphs for better readability',
        impact: 'medium',
        effort: 'easy',
        category: 'engagement',
      });
    }

    return suggestions;
  }

  private extractHashtags(content: string): string[] {
    const hashtagRegex = /#[a-zA-Z0-9_]+/g;
    return content.match(hashtagRegex) || [];
  }

  private extractMentions(content: string): string[] {
    const mentionRegex = /@[a-zA-Z0-9_]+/g;
    return content.match(mentionRegex) || [];
  }

  private calculateScore(errors: ValidationError[], warnings: ValidationWarning[]): number {
    let score = 100;

    // Deduct points for errors
    for (const error of errors) {
      switch (error.severity) {
        case 'critical':
          score -= 30;
          break;
        case 'high':
          score -= 15;
          break;
        case 'medium':
          score -= 10;
          break;
        case 'low':
          score -= 5;
          break;
      }
    }

    // Deduct points for warnings
    for (const warning of warnings) {
      switch (warning.impact) {
        case 'high':
          score -= 8;
          break;
        case 'medium':
          score -= 5;
          break;
        case 'low':
          score -= 2;
          break;
      }
    }

    return Math.max(0, Math.min(100, score));
  }

  private getSeverityWeight(severity: string): number {
    const weights = { critical: 4, high: 3, medium: 2, low: 1 };
    return weights[severity as keyof typeof weights] || 0;
  }

  private getImpactWeight(impact: string): number {
    const weights = { high: 3, medium: 2, low: 1 };
    return weights[impact as keyof typeof weights] || 0;
  }
}

export interface ValidationOptions {
  checkAccessibility?: boolean;
  checkBrandGuidelines?: boolean;
  checkCompliance?: boolean;
  checkEngagement?: boolean;
  strictMode?: boolean;
  customRules?: {
    maxHashtags?: number;
    requiredPhrases?: string[];
    forbiddenWords?: string[];
    minLength?: number;
    maxLength?: number;
  };
}

// Utility function for quick validation
export const validateContent = (
  content: string,
  platforms: ContentPlatform[],
  mediaFiles: MediaFile[] = [],
  options: ValidationOptions = {}
): ValidationResult => {
  const validator = new ContentValidator(content, platforms, mediaFiles, options);
  return validator.validate();
};

// Auto-fix utility
export const applyAutoFixes = (content: string, errors: ValidationError[]): string => {
  let fixedContent = content;

  for (const error of errors) {
    if (error.fixable && error.autoFix) {
      switch (error.code) {
        case 'CONTENT_WHITESPACE':
          fixedContent = fixedContent.replace(/\\s{3,}/g, ' ').replace(/\\n{3,}/g, '\\n\\n');
          break;
        case 'CONTENT_TOO_LONG':
          if (error.autoFix.preview) {
            fixedContent = error.autoFix.preview;
          }
          break;
        case 'COMPLIANCE_FTC_DISCLOSURE':
          if (!fixedContent.includes('#ad') && !fixedContent.includes('#sponsored')) {
            fixedContent += '\\n\\n#ad';
          }
          break;
      }
    }
  }

  return fixedContent;
};