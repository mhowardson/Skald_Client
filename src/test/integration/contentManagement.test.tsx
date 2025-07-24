import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, mockContent } from '../utils/testUtils';
import { ContentPage } from '../../pages/content/ContentPage';

// Mock the API
vi.mock('../../store/api/contentApi', () => ({
  useGetContentQuery: () => ({
    data: {
      content: [mockContent],
      total: 1,
    },
    isLoading: false,
    error: null,
  }),
  useCreateContentMutation: () => [
    vi.fn().mockResolvedValue({
      unwrap: () => Promise.resolve({ content: mockContent }),
    }),
    { isLoading: false },
  ],
  useUpdateContentMutation: () => [
    vi.fn().mockResolvedValue({
      unwrap: () => Promise.resolve({ content: mockContent }),
    }),
    { isLoading: false },
  ],
  useDeleteContentMutation: () => [
    vi.fn().mockResolvedValue({
      unwrap: () => Promise.resolve({ success: true }),
    }),
    { isLoading: false },
  ],
  usePublishContentMutation: () => [
    vi.fn().mockResolvedValue({
      unwrap: () => Promise.resolve({ content: { ...mockContent, status: 'published' } }),
    }),
    { isLoading: false },
  ],
  useScheduleContentMutation: () => [
    vi.fn().mockResolvedValue({
      unwrap: () => Promise.resolve({ content: { ...mockContent, status: 'scheduled' } }),
    }),
    { isLoading: false },
  ],
}));

describe('Content Management', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Content List', () => {
    it('should display content list', () => {
      renderWithProviders(<ContentPage />);
      
      expect(screen.getByText('Test Content')).toBeInTheDocument();
      expect(screen.getByText('Test content description')).toBeInTheDocument();
      expect(screen.getByText('draft')).toBeInTheDocument();
    });

    it('should filter content by status', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ContentPage />);
      
      const statusFilter = screen.getByLabelText(/status/i);
      await user.click(statusFilter);
      
      const draftOption = screen.getByText('Draft');
      await user.click(draftOption);
      
      await waitFor(() => {
        expect(screen.getByText('Test Content')).toBeInTheDocument();
      });
    });

    it('should search content', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ContentPage />);
      
      const searchInput = screen.getByPlaceholderText(/search content/i);
      await user.type(searchInput, 'Test');
      
      await waitFor(() => {
        expect(screen.getByText('Test Content')).toBeInTheDocument();
      });
    });

    it('should sort content by date', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ContentPage />);
      
      const sortButton = screen.getByText(/sort by/i);
      await user.click(sortButton);
      
      const dateOption = screen.getByText('Date Created');
      await user.click(dateOption);
      
      await waitFor(() => {
        expect(screen.getByText('Test Content')).toBeInTheDocument();
      });
    });
  });

  describe('Content Creation', () => {
    it('should open create content dialog', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ContentPage />);
      
      const createButton = screen.getByText(/create content/i);
      await user.click(createButton);
      
      expect(screen.getByText(/new content/i)).toBeInTheDocument();
    });

    it('should create new content', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ContentPage />);
      
      const createButton = screen.getByText(/create content/i);
      await user.click(createButton);
      
      const titleInput = screen.getByLabelText(/title/i);
      const descriptionInput = screen.getByLabelText(/description/i);
      const contentInput = screen.getByLabelText(/content/i);
      const saveButton = screen.getByText(/save/i);
      
      await user.type(titleInput, 'New Content');
      await user.type(descriptionInput, 'New content description');
      await user.type(contentInput, 'This is new content');
      await user.click(saveButton);
      
      await waitFor(() => {
        expect(screen.getByText(/content created/i)).toBeInTheDocument();
      });
    });

    it('should validate required fields', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ContentPage />);
      
      const createButton = screen.getByText(/create content/i);
      await user.click(createButton);
      
      const saveButton = screen.getByText(/save/i);
      await user.click(saveButton);
      
      await waitFor(() => {
        expect(screen.getByText(/title is required/i)).toBeInTheDocument();
      });
    });

    it('should select platforms', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ContentPage />);
      
      const createButton = screen.getByText(/create content/i);
      await user.click(createButton);
      
      const platformSelect = screen.getByLabelText(/platforms/i);
      await user.click(platformSelect);
      
      const twitterOption = screen.getByText('Twitter');
      await user.click(twitterOption);
      
      expect(screen.getByText('Twitter')).toBeInTheDocument();
    });

    it('should upload media', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ContentPage />);
      
      const createButton = screen.getByText(/create content/i);
      await user.click(createButton);
      
      const fileInput = screen.getByLabelText(/upload media/i);
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      
      await user.upload(fileInput, file);
      
      await waitFor(() => {
        expect(screen.getByText('test.jpg')).toBeInTheDocument();
      });
    });
  });

  describe('Content Editing', () => {
    it('should edit existing content', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ContentPage />);
      
      const editButton = screen.getByLabelText(/edit/i);
      await user.click(editButton);
      
      const titleInput = screen.getByDisplayValue('Test Content');
      await user.clear(titleInput);
      await user.type(titleInput, 'Updated Content');
      
      const saveButton = screen.getByText(/save/i);
      await user.click(saveButton);
      
      await waitFor(() => {
        expect(screen.getByText(/content updated/i)).toBeInTheDocument();
      });
    });

    it('should cancel editing', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ContentPage />);
      
      const editButton = screen.getByLabelText(/edit/i);
      await user.click(editButton);
      
      const cancelButton = screen.getByText(/cancel/i);
      await user.click(cancelButton);
      
      expect(screen.queryByText(/edit content/i)).not.toBeInTheDocument();
    });
  });

  describe('Content Publishing', () => {
    it('should publish content immediately', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ContentPage />);
      
      const publishButton = screen.getByText(/publish/i);
      await user.click(publishButton);
      
      const publishNowButton = screen.getByText(/publish now/i);
      await user.click(publishNowButton);
      
      await waitFor(() => {
        expect(screen.getByText(/content published/i)).toBeInTheDocument();
      });
    });

    it('should schedule content for later', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ContentPage />);
      
      const publishButton = screen.getByText(/publish/i);
      await user.click(publishButton);
      
      const scheduleButton = screen.getByText(/schedule/i);
      await user.click(scheduleButton);
      
      const dateInput = screen.getByLabelText(/scheduled date/i);
      await user.type(dateInput, '2023-12-01');
      
      const timeInput = screen.getByLabelText(/scheduled time/i);
      await user.type(timeInput, '12:00');
      
      const confirmButton = screen.getByText(/schedule content/i);
      await user.click(confirmButton);
      
      await waitFor(() => {
        expect(screen.getByText(/content scheduled/i)).toBeInTheDocument();
      });
    });

    it('should validate schedule date', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ContentPage />);
      
      const publishButton = screen.getByText(/publish/i);
      await user.click(publishButton);
      
      const scheduleButton = screen.getByText(/schedule/i);
      await user.click(scheduleButton);
      
      const dateInput = screen.getByLabelText(/scheduled date/i);
      await user.type(dateInput, '2020-01-01'); // Past date
      
      const confirmButton = screen.getByText(/schedule content/i);
      await user.click(confirmButton);
      
      await waitFor(() => {
        expect(screen.getByText(/schedule date must be in the future/i)).toBeInTheDocument();
      });
    });
  });

  describe('Content Deletion', () => {
    it('should delete content with confirmation', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ContentPage />);
      
      const deleteButton = screen.getByLabelText(/delete/i);
      await user.click(deleteButton);
      
      const confirmButton = screen.getByText(/confirm delete/i);
      await user.click(confirmButton);
      
      await waitFor(() => {
        expect(screen.getByText(/content deleted/i)).toBeInTheDocument();
      });
    });

    it('should cancel deletion', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ContentPage />);
      
      const deleteButton = screen.getByLabelText(/delete/i);
      await user.click(deleteButton);
      
      const cancelButton = screen.getByText(/cancel/i);
      await user.click(cancelButton);
      
      expect(screen.queryByText(/confirm delete/i)).not.toBeInTheDocument();
    });
  });

  describe('Content Templates', () => {
    it('should create content from template', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ContentPage />);
      
      const createButton = screen.getByText(/create content/i);
      await user.click(createButton);
      
      const templatesTab = screen.getByText(/templates/i);
      await user.click(templatesTab);
      
      const templateButton = screen.getByText(/use template/i);
      await user.click(templateButton);
      
      await waitFor(() => {
        expect(screen.getByText(/template applied/i)).toBeInTheDocument();
      });
    });
  });

  describe('Content Preview', () => {
    it('should preview content for different platforms', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ContentPage />);
      
      const previewButton = screen.getByText(/preview/i);
      await user.click(previewButton);
      
      const twitterTab = screen.getByText(/twitter/i);
      await user.click(twitterTab);
      
      expect(screen.getByText('Test content text')).toBeInTheDocument();
    });
  });

  describe('Bulk Operations', () => {
    it('should select multiple content items', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ContentPage />);
      
      const selectAllCheckbox = screen.getByLabelText(/select all/i);
      await user.click(selectAllCheckbox);
      
      expect(screen.getByText(/1 selected/i)).toBeInTheDocument();
    });

    it('should bulk publish content', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ContentPage />);
      
      const selectAllCheckbox = screen.getByLabelText(/select all/i);
      await user.click(selectAllCheckbox);
      
      const bulkPublishButton = screen.getByText(/bulk publish/i);
      await user.click(bulkPublishButton);
      
      await waitFor(() => {
        expect(screen.getByText(/content published/i)).toBeInTheDocument();
      });
    });

    it('should bulk delete content', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ContentPage />);
      
      const selectAllCheckbox = screen.getByLabelText(/select all/i);
      await user.click(selectAllCheckbox);
      
      const bulkDeleteButton = screen.getByText(/bulk delete/i);
      await user.click(bulkDeleteButton);
      
      const confirmButton = screen.getByText(/confirm delete/i);
      await user.click(confirmButton);
      
      await waitFor(() => {
        expect(screen.getByText(/content deleted/i)).toBeInTheDocument();
      });
    });
  });

  describe('Content Analytics', () => {
    it('should display content performance metrics', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ContentPage />);
      
      const analyticsButton = screen.getByText(/analytics/i);
      await user.click(analyticsButton);
      
      expect(screen.getByText(/views/i)).toBeInTheDocument();
      expect(screen.getByText(/engagements/i)).toBeInTheDocument();
      expect(screen.getByText(/shares/i)).toBeInTheDocument();
    });
  });
});