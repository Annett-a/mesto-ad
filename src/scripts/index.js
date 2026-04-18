import { createCard } from './components/card.js';
import {
  openModalWindow,
  closeModalWindow,
  setCloseModalWindowEventListeners,
} from './components/modal.js';
import { enableValidation, clearValidation } from './components/validation.js';
import {
  addCard,
  changeLikeCardStatus,
  deleteCardRequest,
  getCardList,
  getUserInfo,
  setUserAvatar,
  setUserInfo,
} from './components/api.js';

const validationSettings = {
  formSelector: '.popup__form',
  inputSelector: '.popup__input',
  submitButtonSelector: '.popup__button',
  inactiveButtonClass: 'popup__button_disabled',
  inputErrorClass: 'popup__input_type_error',
  errorClass: 'popup__error_visible',
};

const finalTaskVariant = Number(import.meta.env.VITE_MESTO_FINAL_VARIANT || '1');

const placesWrap = document.querySelector('.places__list');
const allPopups = document.querySelectorAll('.popup');
const headerLogo = document.querySelector('.header__logo');

const profileFormModalWindow = document.querySelector('.popup_type_edit');
const profileForm = profileFormModalWindow.querySelector('.popup__form');
const profileSubmitButton = profileForm.querySelector('.popup__button');
const profileTitleInput = profileForm.querySelector('.popup__input_type_name');
const profileDescriptionInput = profileForm.querySelector(
  '.popup__input_type_description'
);

const cardFormModalWindow = document.querySelector('.popup_type_new-card');
const cardForm = cardFormModalWindow.querySelector('.popup__form');
const cardSubmitButton = cardForm.querySelector('.popup__button');
const cardNameInput = cardForm.querySelector('.popup__input_type_card-name');
const cardLinkInput = cardForm.querySelector('.popup__input_type_url');

const imageModalWindow = document.querySelector('.popup_type_image');
const imageElement = imageModalWindow.querySelector('.popup__image');
const imageCaption = imageModalWindow.querySelector('.popup__caption');

const avatarFormModalWindow = document.querySelector('.popup_type_edit-avatar');
const avatarForm = avatarFormModalWindow.querySelector('.popup__form');
const avatarSubmitButton = avatarForm.querySelector('.popup__button');
const avatarInput = avatarForm.querySelector('.popup__input_type_avatar');

const removeCardModalWindow = document.querySelector('.popup_type_remove-card');
const removeCardForm = removeCardModalWindow.querySelector('.popup__form');
const removeCardSubmitButton = removeCardForm.querySelector('.popup__button');

const infoModalWindow = document.querySelector('.popup_type_info');
const infoModalTitle = infoModalWindow.querySelector('.popup__title');
const infoModalInfoList = infoModalWindow.querySelector('.popup__info');
const infoModalText = infoModalWindow.querySelector('.popup__text');
const infoModalUsersList = infoModalWindow.querySelector('.popup__list');

const openProfileFormButton = document.querySelector('.profile__edit-button');
const openCardFormButton = document.querySelector('.profile__add-button');

const profileTitle = document.querySelector('.profile__title');
const profileDescription = document.querySelector('.profile__description');
const profileAvatar = document.querySelector('.profile__image');

const infoDefinitionTemplate = document.querySelector(
  '#popup-info-definition-template'
);
const infoUserPreviewTemplate = document.querySelector(
  '#popup-info-user-preview-template'
);

let currentUserId = '';
let cardIdToDelete = '';
let cardElementToDelete = null;

const formatDate = (date) => {
  return date.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const renderLoading = (buttonElement, isLoading, defaultText, loadingText) => {
  buttonElement.textContent = isLoading ? loadingText : defaultText;
};

const createInfoString = (term, description) => {
  const infoItem = infoDefinitionTemplate.content
    .querySelector('.popup__info-item')
    .cloneNode(true);
  const infoTerm = infoItem.querySelector('.popup__info-term');
  const infoDescription = infoItem.querySelector('.popup__info-description');

  infoTerm.textContent = term;
  infoDescription.textContent = description;

  return infoItem;
};

const createUserPreview = (label) => {
  const listItem = infoUserPreviewTemplate.content
    .querySelector('.popup__list-item')
    .cloneNode(true);

  listItem.textContent = label;

  return listItem;
};

const resetInfoModal = () => {
  infoModalInfoList.replaceChildren();
  infoModalUsersList.replaceChildren();
};

const openInfoModal = (title, listTitle, infoItems, userLabels) => {
  resetInfoModal();
  infoModalTitle.textContent = title;
  infoModalText.textContent = listTitle;
  infoModalInfoList.append(...infoItems);

  const labels = userLabels.length > 0 ? userLabels : ['Нет данных'];
  infoModalUsersList.append(...labels.map((label) => createUserPreview(label)));

  openModalWindow(infoModalWindow);
};

const setProfileData = ({ name, about, avatar, _id }) => {
  profileTitle.textContent = name;
  profileDescription.textContent = about;
  profileAvatar.style.backgroundImage = avatar ? `url(${avatar})` : '';

  if (_id) {
    currentUserId = _id;
  }
};

const handlePreviewPicture = ({ name, link }) => {
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;

  openModalWindow(imageModalWindow);
};

const handleLikeClick = (cardData, setLikes) => {
  const isLiked = cardData.likes.some((user) => user._id === currentUserId);

  changeLikeCardStatus(cardData._id, isLiked)
    .then((updatedCardData) => {
      setLikes(updatedCardData.likes);
    })
    .catch((err) => {
      console.log(err);
    });
};

const handleDeleteClick = (cardData, cardElement) => {
  cardIdToDelete = cardData._id;
  cardElementToDelete = cardElement;
  openModalWindow(removeCardModalWindow);
};

const handleInfoClick = (cardId) => {
  getCardList()
    .then((cards) => {
      const cardData = cards.find((card) => card._id === cardId);

      if (!cardData) {
        return;
      }

      const infoItems = [
        createInfoString('Описание:', cardData.name),
        createInfoString(
          'Дата создания:',
          formatDate(new Date(cardData.createdAt))
        ),
        createInfoString('Владелец:', cardData.owner.name),
        createInfoString('Количество лайков:', String(cardData.likes.length)),
      ];

      const userLabels = cardData.likes.map((user) => user.name);

      openInfoModal('Информация о карточке', 'Лайкнули:', infoItems, userLabels);
    })
    .catch((err) => {
      console.log(err);
    });
};

const handleLogoClick = () => {
  getCardList()
    .then((cards) => {
      const cardsByDate = [...cards].sort((firstCard, secondCard) => {
        return new Date(secondCard.createdAt) - new Date(firstCard.createdAt);
      });
      const uniqueOwners = new Map();

      cardsByDate.forEach((card) => {
        uniqueOwners.set(card.owner._id, card.owner.name);
      });

      if (finalTaskVariant === 2) {
        const cardsByOwner = cardsByDate.reduce((accumulator, card) => {
          const ownerCardCount = accumulator.get(card.owner._id) || 0;
          accumulator.set(card.owner._id, ownerCardCount + 1);
          return accumulator;
        }, new Map());
        const maxCardsPerUser = Math.max(0, ...cardsByOwner.values());
        const oldestCard = cardsByDate[cardsByDate.length - 1];
        const newestCard = cardsByDate[0];

        const infoItems = [
          createInfoString('Всего карточек:', String(cardsByDate.length)),
          createInfoString(
            'Первая создана:',
            oldestCard ? formatDate(new Date(oldestCard.createdAt)) : 'Нет данных'
          ),
          createInfoString(
            'Последняя создана:',
            newestCard ? formatDate(new Date(newestCard.createdAt)) : 'Нет данных'
          ),
          createInfoString('Всего пользователей:', String(uniqueOwners.size)),
          createInfoString(
            'Максимум карточек от одного:',
            String(maxCardsPerUser)
          ),
        ];

        openInfoModal(
          'Статистика пользователей',
          'Все пользователи:',
          infoItems,
          Array.from(uniqueOwners.values())
        );
        return;
      }

      if (finalTaskVariant === 3) {
        const likesTotal = cardsByDate.reduce((sum, card) => {
          return sum + card.likes.length;
        }, 0);
        const maxLikesFromOneCard = Math.max(
          0,
          ...cardsByDate.map((card) => card.likes.length)
        );
        const likesByOwner = cardsByDate.reduce((accumulator, card) => {
          const ownerLikes = accumulator.get(card.owner.name) || 0;
          accumulator.set(card.owner.name, ownerLikes + card.likes.length);
          return accumulator;
        }, new Map());
        const championLikes = [...likesByOwner.entries()].sort(
          (firstUser, secondUser) => secondUser[1] - firstUser[1]
        )[0]?.[0] || 'Нет данных';
        const popularCards = [...cardsByDate]
          .sort((firstCard, secondCard) => secondCard.likes.length - firstCard.likes.length)
          .slice(0, 3)
          .map((card) => card.name);

        const infoItems = [
          createInfoString('Всего пользователей:', String(uniqueOwners.size)),
          createInfoString('Всего лайков:', String(likesTotal)),
          createInfoString(
            'Максимально лайков от одного:',
            String(maxLikesFromOneCard)
          ),
          createInfoString('Чемпион лайков:', championLikes),
        ];

        openInfoModal(
          'Статистика карточек',
          'Популярные карточки:',
          infoItems,
          popularCards
        );
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

const renderCard = (cardData, method = 'append') => {
  const cardElement = createCard(cardData, currentUserId, {
    onPreviewPicture: handlePreviewPicture,
    onLikeClick: handleLikeClick,
    onDeleteClick: handleDeleteClick,
    onInfoClick: finalTaskVariant === 1 ? handleInfoClick : null,
  });

  placesWrap[method](cardElement);
};

const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();
  renderLoading(profileSubmitButton, true, 'Сохранить', 'Сохранение...');

  setUserInfo({
    name: profileTitleInput.value,
    about: profileDescriptionInput.value,
  })
    .then((userData) => {
      setProfileData(userData);
      closeModalWindow(profileFormModalWindow);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      renderLoading(profileSubmitButton, false, 'Сохранить', 'Сохранение...');
    });
};

const handleAvatarFormSubmit = (evt) => {
  evt.preventDefault();
  renderLoading(avatarSubmitButton, true, 'Сохранить', 'Сохранение...');

  setUserAvatar({
    avatar: avatarInput.value,
  })
    .then((userData) => {
      setProfileData(userData);
      avatarForm.reset();
      clearValidation(avatarForm, validationSettings);
      closeModalWindow(avatarFormModalWindow);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      renderLoading(avatarSubmitButton, false, 'Сохранить', 'Сохранение...');
    });
};

const handleCardFormSubmit = (evt) => {
  evt.preventDefault();
  renderLoading(cardSubmitButton, true, 'Создать', 'Создание...');

  addCard({
    name: cardNameInput.value,
    link: cardLinkInput.value,
  })
    .then((cardData) => {
      renderCard(cardData, 'prepend');
      cardForm.reset();
      clearValidation(cardForm, validationSettings);
      closeModalWindow(cardFormModalWindow);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      renderLoading(cardSubmitButton, false, 'Создать', 'Создание...');
    });
};

const handleRemoveCardFormSubmit = (evt) => {
  evt.preventDefault();
  renderLoading(removeCardSubmitButton, true, 'Да', 'Удаление...');

  deleteCardRequest(cardIdToDelete)
    .then(() => {
      if (cardElementToDelete) {
        cardElementToDelete.remove();
      }

      closeModalWindow(removeCardModalWindow);
      cardIdToDelete = '';
      cardElementToDelete = null;
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      renderLoading(removeCardSubmitButton, false, 'Да', 'Удаление...');
    });
};

profileForm.addEventListener('submit', handleProfileFormSubmit);
cardForm.addEventListener('submit', handleCardFormSubmit);
avatarForm.addEventListener('submit', handleAvatarFormSubmit);
removeCardForm.addEventListener('submit', handleRemoveCardFormSubmit);

openProfileFormButton.addEventListener('click', () => {
  profileTitleInput.value = profileTitle.textContent;
  profileDescriptionInput.value = profileDescription.textContent;
  clearValidation(profileForm, validationSettings);
  openModalWindow(profileFormModalWindow);
});

profileAvatar.addEventListener('click', () => {
  avatarForm.reset();
  clearValidation(avatarForm, validationSettings);
  openModalWindow(avatarFormModalWindow);
});

openCardFormButton.addEventListener('click', () => {
  cardForm.reset();
  clearValidation(cardForm, validationSettings);
  openModalWindow(cardFormModalWindow);
});

if (finalTaskVariant === 2 || finalTaskVariant === 3) {
  headerLogo.addEventListener('click', handleLogoClick);
}

enableValidation(validationSettings);

allPopups.forEach((popup) => {
  setCloseModalWindowEventListeners(popup);
});

Promise.all([getCardList(), getUserInfo()])
  .then(([cards, userData]) => {
    setProfileData(userData);
    cards.forEach((cardData) => {
      renderCard(cardData);
    });
  })
  .catch((err) => {
    console.log(err);
  });
