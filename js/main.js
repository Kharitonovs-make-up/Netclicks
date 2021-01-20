//константы
const IMAGE_URL = "https://image.tmdb.org/t/p/w185_and_h278_bestv2";

//элементы со страницы
const leftMenu = document.querySelector('.left-menu'),
		hamburger = document.querySelector('.hamburger'),
		tvShowsList = document.querySelector('.tv-shows__list'),
		modal = document.querySelector('.modal'),
		tvShows = document.querySelector('.tv-shows'),
		tvCardImg = document.querySelector('.tv-card__img'),
		modalTitle = document.querySelector('.modal__title'),
		genresList = document.querySelector('.genres-list'),
		rating = document.querySelector('.rating'),
		description = document.querySelector('.description'),
		modalLink = document.querySelector('.modal__link'),
		searchForm = document.querySelector('.search__form'),
		searchFormInput = document.querySelector('.search__form-input');

const loading = document.createElement('div');
loading.className = 'loading';

//класс для отправки запросов
const DBService = class{
	constructor() {
		this.SERVER = 'https://api.themoviedb.org/3';
		this.API_KEY = 'f18dd63a6005bb87dfa9ca195549c0d1';
	}

	getData = async (url) => {
		const res = await fetch(url);
		if(res.ok){
			return res.json();
		} else {
			throw new Error(`не удалось получить данные по адресу ${url}`);
		}
	};
	getTestData = () => {
		return this.getData ('test.json');
	};

	getTestCard(){
		return this.getData('card.json');
	};

	getSearchResult = query => {
		return this.getData(`${this.SERVER}/search/tv?api_key=${this.API_KEY}&query=${query}&language=ru-RU`);
	};

	getTvShow = id => {
		return this.getData(this.SERVER + '/tv/' + id + '?api_key=' + this.API_KEY + '&language=ru-RU');
	}
};

console.log(new DBService().getSearchResult('Няня'));

const renderCard = response => {
	tvShowsList.textContent = '';
	response.results.forEach(item => {
		const {
			backdrop_path: backdrop,
			name: title,
			poster_path: poster,
			vote_average: vote,
			id
		} = item;

		const posterIMG = poster ? IMAGE_URL + poster : './img/no-poster.jpg',
				backgroundIMG = backdrop ? IMAGE_URL + backdrop : '',
				voteElem = vote ? `<span class = "tv-card__vote">${vote}</span>` : '';

		const card = document.createElement('li');
		card.idTV = id;
		card.className = 'tv-shows__item';
		card.innerHTML = `
			<a href="#" id="${id}" class="tv-card">
				${voteElem}
				<img class = "tv-card__img"
				src="${posterIMG}"
	      data-backdrop="${backgroundIMG}"
	      alt=${title}>
	      <h4 class = "tv-card__head">${title}</h4>
	    </a>
		`;
		tvShowsList.append(card);
	});
	loading.remove();
};

//работаем с поиском
searchForm.addEventListener('submit', event => {
	event.preventDefault();
	const value = searchFormInput.value.trim();
	searchFormInput.value = '';
	if(value){
		tvShows.append(loading);
		new DBService().getSearchResult(value).then(renderCard);

	}

	console.log(value);
});

hamburger.addEventListener('click', (event) => {
	leftMenu.classList.toggle('openMenu');
	hamburger.classList.toggle('open');
});

document.addEventListener('click', (event) => {
	const target = event.target;
	if(!target.closest('.left-menu')){
		leftMenu.classList.remove('openMenu');
		hamburger.classList.remove('open');
	}
});
leftMenu.addEventListener('click', (event) => {
	event.preventDefault();
	const target = event.target;
	const dropDown = target.closest('.dropdown');
	if(dropDown){
		dropDown.classList.toggle('active');
		leftMenu.classList.add('openMenu');
		hamburger.classList.add('open');
	}
});

tvShowsList.addEventListener('click', event => {
	event.preventDefault();
	const target = event.target;
	const card = target.closest('.tv-card');
	if(card){
		tvShows.append(loading);
		tvShows.style.opacity = '0.6';
		new DBService().getTvShow(card.id)
				//через деструктуризацию получаем ответ и присваеваем его свойства новым делам
				.then(({poster_path: posterPath,
					       name: title,
					       genres,
					       vote_average: voteAverage,
					       overview,
					       homepage}) => {
					tvCardImg.src = IMAGE_URL + posterPath;
					tvCardImg.alt = title;
					modalTitle.textContent = title;
					genresList.innerHTML = genres.reduce((acc, item) => `${acc} <li>${item.name}</li>`, '');
					rating.textContent = voteAverage;
					description.textContent = overview;
					modalLink.href = homepage;
				})
				.then(() => {
					loading.remove();
					document.body.style.overflow = 'hidden';
					modal.classList.remove('hide');
				});
	}
});

modal.addEventListener('click', event => {
	if(event.target.closest('.cross') ||
		event.target.classList.contains('modal')){
		document.body.style.overflow = '';
		modal.classList.add('hide');
		tvShows.style.opacity = '1';
	}
});

const changeImage = event => {
	const card = event.target.closest('.tv-shows__item');
	if(card){
		const img = card.querySelector('.tv-card__img');
		if(img.dataset.backdrop){
			[img.src, img.dataset.backdrop] = [img.dataset.backdrop, img.src];
		}
	}
};
tvShowsList.addEventListener('mouseover', changeImage);
tvShowsList.addEventListener('mouseout', changeImage);