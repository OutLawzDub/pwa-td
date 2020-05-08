import {getTodos, delTodo, newTodo, updateTodo, getOneTodo} from './api/todo.js';
import {setTodo, getNotSynced, getTodo} from './idb.js';
import checkConnectivity from './network.js';

// Service Worker Registration

if ('serviceWorker' in navigator) {
	window.addEventListener('load', function() {
		navigator.serviceWorker.register('/sw.js').then(function(registration) {
			// Registration was successful
			console.log('ServiceWorker registration successful with scope: ', registration.scope);
		}, function(err) {
		// registration failed :(
		console.log('ServiceWorker registration failed: ', err);
		});
	});
}

// Launch boucle test connection

checkConnectivity({});

// Don't detect first connection changed

let dontCheckFirst = false;

document.addEventListener('connection-changed', e => {
	document.offline = !e.detail;

	if(document.offline === false && dontCheckFirst === true) {
		addNewTodos();
	} else {
		dontCheckFirst = true;
	}
});

// First arrival, sync with offline db

async function addNewTodos() {
	let todosNotSync = await getNotSynced();
	
	if(todosNotSync.length !== 0) {
		for(let i = 0; i < todosNotSync.length; i++) {
			let item = todosNotSync[i];

			let exist = await getOneTodo(item.id);
			
			if(exist.id) {
				if(item.deleted == 'true') {
					await delTodo(item.id);
				} else {
					item.sync = 'true';
					await setTodo(item);
					await updateTodo(item);
				}
				
			} else {
				item.sync = 'true';
				await setTodo(item);

				if(item.deleted == 'false') {
					await newTodo(item);
				}
			}
		}
	}
}

// Done todos or undone

async function doneTodo(id, done) {
	let todo = await getTodo(id);

	if(done) {
		todo.done = 'true';
	} else {
		todo.done = 'false';
	}

	if(document.offline) {
		todo.sync = 'false';
		await setTodo(todo);
	} else {
		await updateTodo(todo);
		await setTodo(todo);
	}
}

// Delete Todo 

async function deleteTodo(id) {
	let todo = await getTodo(id);

	todo.deleted = 'true';

	console.log('delete', todo);

	if(document.offline) {
		todo.sync = 'false';
		await setTodo(todo);
	} else {
		await delTodo(todo.id);
		await setTodo(todo);
	}
}

// Add on click events on buttons

async function addOnClickEvent() {
	var close = document.getElementsByClassName("close");

	for (var i = 0; i < close.length; i++) {
		close[i].onclick = function() {
			var div = this.parentElement;

			deleteTodo(div.id);

			div.style.display = "none";
		}
	}
}

// On load

async function loadTodosOnlineArrive() {
	var ul 		= document.getElementById('list');
	var list  	= await getTodos();

	for(let i = 0; i < list.length; i++) {
		let item = list[i];
		
		let existLocal = await getTodo(item.id);

		if(existLocal === undefined) {
			await setTodo(item);
		}
		
		let li 	  = document.createElement('li');
		let span  = document.createElement('span');
		let close = document.createTextNode('❌');
		let texte = document.createTextNode(item.title);

		span.classList.add('close');
		li.id = item.id;

		if(item.done == 'true') {
			li.classList.add('done');
		}

		span.appendChild(close);
		li.appendChild(span);
		li.appendChild(texte);
		ul.appendChild(li);

		addOnClickEvent();
	}
}

async function addTodoDom(todo) {
	let item = todo;

	var ul 		= document.getElementById('list');
	
	let li 	  = document.createElement('li');
	let span  = document.createElement('span');
	let close = document.createTextNode('❌');
	let texte = document.createTextNode(item.title);

	li.id = item.id;
	span.classList.add('close');

	span.appendChild(close);
	li.appendChild(span);
	li.appendChild(texte);
	ul.appendChild(li);

	addOnClickEvent();
}

// Load Config

fetch('/config.json')
	.then((result) => result.json())
	.then(async (config) => {
		window.config = config;

		await addNewTodos();
		await loadTodosOnlineArrive();
	});


var allLi = document.getElementsByTagName('li');

for (var i = 0; i < allLi.length; i++) {
	var span = document.createElement("span");
	var txt = document.createTextNode("❌");

	span.className = "close";
	span.appendChild(txt);

	allLi[i].appendChild(span);
}

// Add a "checked" symbol when clicking on a list item

var list = document.querySelector('ul');

list.addEventListener('click', async function(event) {
	if(event.target.tagName.toLowerCase() === 'li') {
		event.target.classList.toggle('done');

		if(event.target.classList.contains('done')) {
			console.log('il est check', event.target.id);
			
			doneTodo(event.target.id, true)
		} else {
			console.log('uncheck', event.target.id);

			doneTodo(event.target.id, false)
		}
	}
}, false);

// New task

const button = document.querySelector('form');

button.addEventListener('submit', async(event) => {
	event.preventDefault();

	var inputField = document.querySelector('input[type="text"]');

	let formatJson = {
		"id": Date.now(),
		"title": inputField.value,
		"done": 'false',
		"deleted": 'false',
		"sync": 'true',
		"date": Date.now()
	};

	inputField.value = '';

	if(!document.offline) {
		let addTodoOffline = await setTodo(formatJson);
		let addTodoOnline  = await newTodo(formatJson);
	} else {
		formatJson.sync = 'false';

		let addTodoOffline = await setTodo(formatJson);
	}

	addTodoDom(formatJson);

});
