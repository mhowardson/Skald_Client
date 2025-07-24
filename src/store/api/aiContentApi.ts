import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';

const baseQueryWithAuth = fetchBaseQuery({
  baseUrl: '/api/v1',
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as RootState;
    const token = state.auth.accessToken;
    
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    
    const { currentOrganization, currentWorkspace } = state.tenant;
    if (currentOrganization) {
      headers.set('x-organization-id', currentOrganization.id);
    }
    if (currentWorkspace) {
      headers.set('x-workspace-id', currentWorkspace.id);
    }
    
    return headers;
  },
});

export interface GeneratedContent {
  title?: string;
  content: string;
  hashtags: string[];
  callToAction?: string;
  platform: string;
  contentType: string;
  tone: string;
  targetAudience: string;
}

export interface ContentGenerationRequest {
  prompt: string;
  platform: string;
  contentType: 'post' | 'story' | 'reel' | 'video';
  workspaceId: string;
}

export interface VoiceToTextRequest {
  audio: File;
  workspaceId: string;
  platform?: string;
  contentType?: string;
}

export interface VoiceToTextResponse {
  transcription: string;
  generatedContent: GeneratedContent;
}

export interface VideoCaptionsRequest {
  video: File;
  workspaceId: string;
  platform?: string;
}

export interface VideoCaption {
  start: number;
  end: number;
  text: string;
}

export interface VideoCaptionsResponse {
  captions: VideoCaption[];
  duration: number;
}

export interface TranslationRequest {
  content: string;
  targetLanguage: string;
  workspaceId: string;
  sourceLanguage?: string;
}

export interface TranslationResponse {
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  confidence: number;
}

export interface LocalizationRequest {
  content: string;
  targetLanguage: string;
  targetMarket: string;
  workspaceId: string;
}

export interface LocalizationResponse {
  translatedContent: string;
  localizedHashtags: string[];
  culturalNotes: string[];
}

export interface PlatformOptimizationRequest {
  content: string;
  fromPlatform: string;
  toPlatform: string;
  workspaceId: string;
}

export interface TextToSpeechRequest {
  text: string;
  voice?: string;
  language?: string;
}

export interface Voice {
  id: string;
  name: string;
  language: string;
}

export interface Language {
  code: string;
  name: string;
}

export interface LanguageDetectionResponse {
  language: string;
  confidence: number;
  alternatives: Array<{
    language: string;
    confidence: number;
  }>;
}

export const aiContentApi = createApi({
  reducerPath: 'aiContentApi',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['Content', 'Voice', 'Language'],
  endpoints: (builder) => ({
    // Generate content from text prompt
    generateContent: builder.mutation<GeneratedContent, ContentGenerationRequest>({
      query: (data) => ({
        url: '/content/generate',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Content'],
    }),

    // Convert voice to content
    voiceToText: builder.mutation<VoiceToTextResponse, VoiceToTextRequest>({
      query: ({ audio, ...data }) => {
        const formData = new FormData();
        formData.append('audio', audio);
        Object.entries(data).forEach(([key, value]) => {
          if (value) formData.append(key, value);
        });

        return {
          url: '/content/voice-to-text',
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['Content'],
    }),

    // Generate video captions
    generateVideoCaptions: builder.mutation<VideoCaptionsResponse, VideoCaptionsRequest>({
      query: ({ video, ...data }) => {
        const formData = new FormData();
        formData.append('video', video);
        Object.entries(data).forEach(([key, value]) => {
          if (value) formData.append(key, value);
        });

        return {
          url: '/content/video-captions',
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['Content'],
    }),

    // Translate content
    translateContent: builder.mutation<TranslationResponse, TranslationRequest>({
      query: (data) => ({
        url: '/content/translate',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Content'],
    }),

    // Localize content for specific market
    localizeContent: builder.mutation<LocalizationResponse, LocalizationRequest>({
      query: (data) => ({
        url: '/content/localize',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Content'],
    }),

    // Optimize content for different platform
    optimizeForPlatform: builder.mutation<GeneratedContent, PlatformOptimizationRequest>({
      query: (data) => ({
        url: '/content/optimize-platform',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Content'],
    }),

    // Generate speech from text
    textToSpeech: builder.mutation<Blob, TextToSpeechRequest>({
      query: (data) => ({
        url: '/content/text-to-speech',
        method: 'POST',
        body: data,
        responseHandler: (response) => response.blob(),
      }),
    }),

    // Get available voices
    getVoices: builder.query<Voice[], void>({
      query: () => ({
        url: '/content/voices',
        method: 'GET',
      }),
      providesTags: ['Voice'],
    }),

    // Get supported languages
    getLanguages: builder.query<Language[], void>({
      query: () => ({
        url: '/content/languages',
        method: 'GET',
      }),
      providesTags: ['Language'],
    }),

    // Detect language of text
    detectLanguage: builder.mutation<LanguageDetectionResponse, { text: string }>({
      query: (data) => ({
        url: '/content/detect-language',
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const {
  useGenerateContentMutation,
  useVoiceToTextMutation,
  useGenerateVideoCaptionsMutation,
  useTranslateContentMutation,
  useLocalizeContentMutation,
  useOptimizeForPlatformMutation,
  useTextToSpeechMutation,
  useGetVoicesQuery,
  useGetLanguagesQuery,
  useDetectLanguageMutation,
} = aiContentApi;