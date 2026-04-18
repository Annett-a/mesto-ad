const getTemplate = () => {
  return document
    .querySelector('#card-template')
    .content
    .querySelector('.card')
    .cloneNode(true);
};

const hasLikeFromUser = (likes, userId) => {
  return likes.some((user) => user._id === userId);
};

export const createCard = (cardData, currentUserId, handlers = {}) => {
  const cardElement = getTemplate();
  const likeButton = cardElement.querySelector('.card__like-button');
  const likeCountElement = cardElement.querySelector('.card__like-count');
  const deleteButton = cardElement.querySelector(
    '.card__control-button_type_delete'
  );
  const infoButton = cardElement.querySelector('.card__control-button_type_info');
  const cardImage = cardElement.querySelector('.card__image');
  const cardTitle = cardElement.querySelector('.card__title');

  const setLikes = (likes) => {
    cardData.likes = likes;
    likeCountElement.textContent = likes.length;
    likeButton.classList.toggle(
      'card__like-button_is-active',
      hasLikeFromUser(likes, currentUserId)
    );
  };

  cardImage.src = cardData.link;
  cardImage.alt = cardData.name;
  cardTitle.textContent = cardData.name;
  setLikes(cardData.likes || []);

  if (cardData.owner?._id !== currentUserId) {
    deleteButton.remove();
  } else if (handlers.onDeleteClick) {
    deleteButton.addEventListener('click', () => {
      handlers.onDeleteClick(cardData, cardElement);
    });
  }

  if (handlers.onInfoClick) {
    infoButton.addEventListener('click', () => {
      handlers.onInfoClick(cardData._id);
    });
  } else {
    infoButton.remove();
  }

  if (handlers.onLikeClick) {
    likeButton.addEventListener('click', () => {
      handlers.onLikeClick(cardData, setLikes);
    });
  }

  if (handlers.onPreviewPicture) {
    cardImage.addEventListener('click', () => {
      handlers.onPreviewPicture(cardData);
    });
  }

  return cardElement;
};
