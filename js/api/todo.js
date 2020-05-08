export async function getTodos() {
    const config = window.config;
    
    return fetch(config.api + '/todos', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then(result => result.json())
    .catch(error => {
        console.error(error);
        return false;
    });
}

export async function getOneTodo(id) {
    const config = window.config;
    
    return fetch(config.api + '/todos/' + id, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then(result => result.json())
    .catch(error => {
        console.error(error);
        return false;
    });
}

export async function newTodo(todo) {
    
    const xhr = new XMLHttpRequest();

    // listen for `load` event
    xhr.onload = () => {
    
        // print JSON response
        if (xhr.status >= 200 && xhr.status < 300) {
            // parse JSON
            const response = JSON.parse(xhr.responseText);
            return response;
        }
    };
    
    
    // open request
    xhr.open('POST', config.api + '/todos');
    
    // set `Content-Type` header
    xhr.setRequestHeader('Content-Type', 'application/json');
    
    // send rquest with JSON payload
    xhr.send(JSON.stringify(todo));
}

export async function updateTodo(todo) {
    const config = window.config;
    
    return fetch(config.api + '/todos/' + parseInt(todo.id), {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(todo)
    })
    .then(result => result.json())
    .catch(error => {
        console.error(error);
        return false;
    });
}

export async function delTodo(id) {
    const config = window.config;

    console.log(id);
    
    return fetch(config.api + '/todos/' + id, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(result => result.json())
    .catch(error => {
        console.error(error);
        return false;
    }); 
}