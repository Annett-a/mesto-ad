export const likeCard = (likeButton) => {
  likeButton.classList.toggle('card__like-button_is-active');
};

export const deleteCard = (cardElement) => {
  cardElement.remove();
};

export const getTemplate = () => {
  return document
    .querySelector('#card-template')
    .content.querySelector('.card')
    .cloneNode(true);
};

export const createCard = (data, handlers) => {
  const { onPreviewPicture, onLikeIcon, onDeleteCard } = handlers;
  const cardElement = getTemplate();
  const likeButton = cardElement.querySelector('.card__like-button');
  const deleteButton = cardElement.querySelector(
    '.card__control-button_type_delete'
  );
  const cardImage = cardElement.querySelector('.card__image');
  const cardTitle = cardElement.querySelector('.card__title');

  cardImage.src = data.link;
  cardImage.alt = data.name;
  cardTitle.textContent = data.name;

  if (onLikeIcon) {
    likeButton.addEventListener('click', () => onLikeIcon(likeButton));
  }

  if (onDeleteCard) {
    deleteButton.addEventListener('click', () => onDeleteCard(cardElement));
  }

  if (onPreviewPicture) {
    cardImage.addEventListener('click', () => onPreviewPicture(data));
  }

  return cardElement;
};
