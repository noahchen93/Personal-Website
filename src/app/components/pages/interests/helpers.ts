import { ContentItem } from '../../content/ContentContext';

export const getInterestImageUrlHelper = (
  interest: ContentItem,
  getImageUrl: (id: string) => string
) => {
  if (interest.data?.imageId) {
    return getImageUrl(interest.data.imageId);
  } else if (interest.data?.imageUrl) {
    const imageIdMatch = interest.data.imageUrl.match(/^\{\{image:([^|}]+)\}\}$/);
    if (imageIdMatch) {
      return getImageUrl(imageIdMatch[1]);
    }
    return interest.data.imageUrl;
  }
  return null;
};

export const handleNavigationHelper = (target: string, external?: boolean) => {
  if (external) {
    window.open(target, '_blank', 'noopener,noreferrer');
  } else {
    window.dispatchEvent(new CustomEvent('navigate', { detail: target }));
  }
};