import axios from 'axios';
import config from '../../config/env.js';

const { YOUTUBE_API_KEY } = config;

export const coursesService = {
  /**
   * Searches for videos on YouTube based on a query.
   * @param {string} query - The search term (e.g., "React Tutorial")
   * @returns {Promise<Array>} - A list of formatted video results
   */
  searchVideos: async (query) => {
    try {
      const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
        params: {
          part: 'snippet',
          q: query,
          type: 'video',
          maxResults: 12,
          key: YOUTUBE_API_KEY,
        },
      });

      return response.data.items.map((item) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        channel: item.snippet.channelTitle,
        thumbnail: item.snippet.thumbnails.medium.url,
        description: item.snippet.description,
      }));
    } catch (error) {
      throw new Error(`YouTube API Error: ${error.response?.data?.error?.message || error.message}`);
    }
  },
};
