const burgerMenu = document.querySelector('.headerNavBar__burgerMenuIcon');
const navMenu = document.querySelector('.navMenu');

burgerMenu.addEventListener('click', () => {
  navMenu.classList.toggle('navMenu-active');
});

window.addEventListener('click', (event) => {
  if (event.target !== burgerMenu && navMenu.classList.contains('navMenu-active')) {
    navMenu.classList.remove('navMenu-active');
  }
});
