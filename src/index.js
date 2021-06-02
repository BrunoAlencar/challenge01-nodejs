const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');


const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const header = request.header;
  const isInArray = users.some(user => user.username === header.username)
  if(!isInArray){
    return next()
  }

  return response.status(400).json(
    {
      error: 'User already created'
    }
  )
}

app.post('/users', (request, response) => {
  const body = request.body;
  const isInArray = users.some(user => user.username === body.username)
  if(isInArray){
    return response.status(400).json(      {
        error: 'User already created'
      })
  }
  const user = {
    id: uuidv4(),
    todos: [],
    ...body,
  }
  users.push(user)
  return response.status(201).json(user)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const username = request.headers.username;
  const user = users.find(user => user.username == username)
  return response.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {deadline, title} = request.body
  const username = request.headers.username;
  const userIndex = users.findIndex(user => user.username == username)
  const todoItem = {
    id: uuidv4(),
    created_at: new Date(),
    done:false,
    title,
    deadline: new Date(deadline)
  }
  users[userIndex].todos.push(todoItem)
  return response.status(201).json(todoItem)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const username = request.headers.username;
  const {deadline, title} = request.body
  const { id } = request.params;
  const userIndex = users.findIndex(user => user.username == username)
  const todoIndex = users[userIndex].todos.findIndex(todo => todo.id == id)
  if(todoIndex === -1) {
    return response.status(404).json({
      error: 'Todo not found'
    })
  }
  const todoItem = {
    ...users[userIndex].todos[todoIndex],
    title,
    deadline: new Date(deadline),
  }
  users[userIndex].todos[todoIndex] = todoItem
  return response.status(201).json(todoItem)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const username = request.headers.username;
  const { id } = request.params;
  const userIndex = users.findIndex(user => user.username == username)
  const todoIndex = users[userIndex].todos.findIndex(todo => todo.id == id)
  if(todoIndex === -1) {
    return response.status(404).json({
      error: 'Todo not found'
    })
  }
  const todoItem = {
    ...users[userIndex].todos[todoIndex],
    done: true
  }
  users[userIndex].todos[todoIndex] = todoItem
  return response.status(201).json(todoItem)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const username = request.headers.username;
  const { id } = request.params;
  const userIndex = users.findIndex(user => user.username == username)
  const todoIndex = users[userIndex].todos.findIndex(todo => todo.id == id)
  if(todoIndex === -1) {
    return response.status(404).json({
      error: 'Todo not found'
    })
  }
  users[userIndex].todos.splice(todoIndex, 1)
  return response.status(204).send()
});

module.exports = app;