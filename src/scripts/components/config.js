const mestoGroupId = import.meta.env.VITE_MESTO_GROUP_ID || '{{ Ваш идентификатор группы }}';
const mestoToken = import.meta.env.VITE_MESTO_TOKEN || '{{ Ваш личный токен }}';

export const config = {
    baseUrl: `https://mesto.nomoreparties.co/v1/${mestoGroupId}`,
    headers: {
        authorization: mestoToken,
        'Content-Type': 'application/json',
    },
};