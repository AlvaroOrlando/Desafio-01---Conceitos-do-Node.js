const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
   const { username } = request.headers;
   console.log(users);

   const user = users.find(user =>  user.username === username);

   if(!user){
    return response.status(404).json({ error: 'User not found!'})
   };

   request.user = user;
   next();

}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userExists = users.some(user => username === user.username);

  if(userExists){
    return response.status(400).json({ error: 'User already exists!' })
  };

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(user);

  response.status(201).json(user);

});


  
app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.status(200).json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date
  }

  user.todos.push(todo);
  response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;

  let todo = user.todos.find(todo => id === todo.id);

  if(!todo){
    return response.status(404).json({ error: 'Todo not found!'})
  }

  todo.title = title;
  todo.deadline = deadline;

  return response.status(201).json(todo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;
  
  const todo = user.todos.find(todo => id === todo.id);

  if(!todo){
    return response.status(404).json({ error: 'Todo not found!'})
  };

  todo.done = true;
  response.status(201).json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
    const { id } = request.params;
    const { user } = request;
    const todoIndex = user.todos.findIndex(todo => id === todo.id);

    if(todoIndex === -1){
      return response.status(404).json({ error: 'Todo not found!' })
    };

    user.todos.splice(todoIndex, 1);

    return response.status(204).send()

});

module.exports = app;