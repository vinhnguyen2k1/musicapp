const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
var currentUser = null;
const dataEdit = JSON.parse(localStorage.getItem('userDataFavorite'));
// ------------------ Firebase --------------------------

// Import the functions you need from the SDKs you need
import { set, ref, child, get, update } from 'https://www.gstatic.com/firebasejs/9.13.0/firebase-database.js';
import {
	signInWithEmailAndPassword,
	createUserWithEmailAndPassword,
	updateProfile,
	updatePassword,
} from 'https://www.gstatic.com/firebasejs/9.13.0/firebase-auth.js';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// import dotenv from 'dotenv';
// dotenv.config();
// console.log(process.env.API_KEY);

import { firebase, auth, database } from './config.js';

function getCookie() {
	return document.cookie.split(';').reduce((res, c) => {
		const [key, val] = c.trim().split('=').map(decodeURIComponent);
		const allNumbers = (str) => /^\d+$/.test(str);
		try {
			return Object.assign(res, { [key]: allNumbers(val) ? val : JSON.parse(val) });
		} catch (e) {
			return Object.assign(res, { [key]: val });
		}
	}, {});
}
function deleteCookie(name) {
	document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}
function renderUser() {
	let keepLoggedIn = localStorage.getItem('keepLoggedIn');
	if (keepLoggedIn) {
		currentUser = JSON.parse(localStorage.getItem('userData'));
	} else {
		currentUser = getCookie().userData;
	}
}

const windowLoad = () => {
	window.onload = function () {
		renderUser();
		if (currentUser != null) {
			// image.src = currentUser.urlImage;
			// $('.header__right-img').style.backgroundImage = `url('${currentUser.urlImage}')`;
			const dbRef = ref(database);
			get(child(dbRef, `users/${dataEdit.userUid}`))
				.then((snapshot) => {
					if (snapshot.exists()) {
						document.querySelector('input[name="fullname"]').value = snapshot.val().username;
						document.querySelector('input[name="email"]').value = snapshot.val().email;
						document.querySelector('input[name="phone"]').value = snapshot.val().phone_number;
						document.querySelector('input[name="birth"]').value = snapshot.val().date_of_birth;
						$('.menu-link__welcome').textContent = 'Xin Ch??o ' + snapshot.val().username;
					} else {
						console.log('No data available');
					}
				})
				.catch((error) => {
					console.error(error);
				});
		}
	};
};

document.querySelector('.item-submit__btn').onclick = () => {
	const dataUserEdit = {
		username: document.querySelector('input[name="fullname"]').value,
		email: document.querySelector('input[name="email"]').value,
		phone_number: document.querySelector('input[name="phone"]').value,
		date_of_birth: document.querySelector('input[name="birth"]').value,
	};
	update(ref(database, 'users/' + dataEdit.userUid), dataUserEdit);
	alert('Thay ?????i Th??nh C??ng Th??ng Tin');
	window.location = 'edit_user.html';
};

$('.back-home-edit-user').onclick = () => {
	window.location = 'index.html';
};

$('.sign-out-edit-user').addEventListener('click', () => {
	deleteCookie('userData');
	localStorage.removeItem('userData');
	localStorage.removeItem('userDataFavorite');
	localStorage.removeItem('keepLoggedIn');
	localStorage.removeItem('dataFavorites');
	window.location = 'index.html';
});

const handleEditUser = () => {
	const localData = JSON.parse(localStorage.getItem('userData'));
	const cookieData = getCookie().userData;
	if (localData || cookieData) {
		windowLoad();
	} else {
		window.location = 'index.html';
	}
};
handleEditUser();

const panes = $$('.form-edit__container');

$$('.column-left__item').forEach((item, index) => {
	const pane = panes[index];
	item.onclick = (e) => {
		$('.column-left__item.active').classList.remove('active');
		$('.form-edit__container.active').classList.remove('active');
		item.classList.add('active');
		pane.classList.add('active');
	};
});

function encPass(pass) {
	var passE = CryptoJS.MD5(pass);
	return passE.toString();
}

$('.item-submit__btn2').onclick = () => {
	const pass = document.querySelector('input[name="Password"]').value;
	const newPass = document.querySelector('input[name="newPassword"]').value;
	const reNewPass = document.querySelector('input[name="re-newPassword"]').value;
	var regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{6,}$/;
	if (newPass.match(regex)) {
		if (encPass(newPass) === encPass(reNewPass)) {
			signInWithEmailAndPassword(auth, currentUser.email, pass)
				.then((userCredential) => {
					updatePassword(auth.currentUser, newPass)
						.then(() => {
							// Update successful.
							update(ref(database, 'users/' + dataEdit.userUid), {
								password: encPass(newPass),
							});
							alert('?????i m???t kh???u th??nh c??ng');
						})
						.catch((error) => {
							console.log(error);
						});
				})
				.catch((error) => {
					alert('M???t kh???u C?? Kh??ng ????ng. Vui L??ng Ki???m Tra L???i');
				});
		} else {
			alert('Nh???p L???i M???t Kh???u Kh??ng Gi???ng. Vui L??ng Ki???m Tra L???i');
		}
	} else {
		alert('M???t Kh???u ph???i bao g???m 6 k?? t??? tr??? l??n v?? ph???i bao g???m 1 ch??? th?????ng, 1 in hoa v?? 1 ch??? s???');
	}
};
