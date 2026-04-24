const getTemplate = () => {
  return document
      .querySelector('#card-template')
      .content
      .querySelector('.card')
      .cloneNode(true);
};

const isCardLiked = (cardData, userId) => {
  return (cardData.likes || []).some((user) => user._id === userId);
};

const getCardId = (cardData) => {
  return cardData._id;
};

const getCardLikeRequestData = (cardData, currentUserId) => {
  return {
    cardId: getCardId(cardData),
    isLiked: isCardLiked(cardData, currentUserId),
  };
};

const updateCardLikes = (
    cardData,
    likes,
    likeButton,
    likeCountElement,
    currentUserId
) => {
  cardData.likes = likes;
  likeCountElement.textContent = likes.length;
  likeButton.classList.toggle(
      'card__like-button_is-active',
      isCardLiked(cardData, currentUserId)
  );
};

export const removeCardElement = (cardElement) => {
  cardElement.remove();
};

const getCardInfo = (cardData) => {
  return {
    name: cardData.name,
    createdAt: cardData.createdAt,
    ownerName: cardData.owner?.name || 'Нет данных',
    likesCount: (cardData.likes || []).length,
    likedUserNames: (cardData.likes || []).map((user) => user.name),
  };
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

  cardImage.src = cardData.link;
  cardImage.alt = cardData.name;
  cardTitle.textContent = cardData.name;

  updateCardLikes(
      cardData,
      cardData.likes || [],
      likeButton,
      likeCountElement,
      currentUserId
  );

  if (cardData.owner?._id !== currentUserId) {
    deleteButton.remove();
  } else if (handlers.onDeleteClick) {
    deleteButton.addEventListener('click', () => {
      handlers.onDeleteClick({
        cardId: getCardId(cardData),
        cardElement,
      });
    });
  }

  if (handlers.onInfoClick) {
    infoButton.addEventListener('click', () => {
      handlers.onInfoClick(getCardInfo(cardData));
    });
  }

  if (handlers.onLikeClick) {
    likeButton.addEventListener('click', () => {
      handlers
          .onLikeClick(getCardLikeRequestData(cardData, currentUserId))
          .then((updatedCardData) => {
            updateCardLikes(
                cardData,
                updatedCardData.likes || [],
                likeButton,
                likeCountElement,
                currentUserId
            );
          })
          .catch((err) => {
            if (handlers.onRequestError) {
              handlers.onRequestError(err);
            }
          });
    });
  }

  if (handlers.onPreviewPicture) {
    cardImage.addEventListener('click', () => {
      handlers.onPreviewPicture(cardData);
    });
  }

  return cardElement;
};