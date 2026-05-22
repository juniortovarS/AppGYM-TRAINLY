import { useWindowDimensions, Platform } from 'react-native';

export const MAX_WEB_WIDTH = 480;

export const useAppWidth = () => {
  const { width } = useWindowDimensions();
  if (Platform.OS === 'web' && width > 768) {
    return MAX_WEB_WIDTH;
  }
  return width;
};

export const useAppHeight = () => {
  const { height, width } = useWindowDimensions();
  if (Platform.OS === 'web' && width > 768) {
    return Math.min(height, 900);
  }
  return height;
};
