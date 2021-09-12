# Cats in the Sky Project

## Configure Database

```
Configure the database in server.js. It is recommended you use a .env file
```

## Installation

```
npm install
```

## Running

```
npm run server
```

## API

### GET /api/create_table

```
Creates the tables needed for the project
```

### GET /api/merged

```
Returns a dictionary of all the veges that match the first letter of the cat's name
```

### POST /api/add

```
Adds a cat or vege to the database
```

### POST /api/delete

```
Deletes a vege from the database. Requires an authentication token. Recieve your token by signing in.
```

### POST /api/signup

```
Creates a user in the database
```

### GET /api/signin

```
Checks if the user is in the database and returns the user's token
```

## Database

```
CREATE TABLE added_cats (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255))
CREATE TABLE added_veges (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255))
CREATE TABLE removed_cats (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255))
CREATE TABLE removed_veges (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255))
CREATE TABLE users (id INT AUTO_INCREMENT PRIMARY KEY, username VARCHAR(255), password VARCHAR(255), token VARCHAR(255))
```

## Testing

```
curl -X POST -H "Content-Type: application/json" -d '{"username":"test", "pwd":"test"}' http://localhost:5000/api/signup
curl -X POST -H "Content-Type: application/json" -d '{"username":"test", "pwd":"test"}' http://localhost:5000/api/signin
curl -X POST -H "Content-Type: application/json" -d '{"vege":"vege"}' http://localhost:5000/api/add
curl -X POST -H "Content-Type: application/json" -d '{"cat":"cat"}' http://localhost:5000/api/add
curl -X POST -H "Content-Type: application/json" -d '{"vege":"vege"}' http://localhost:5000/api/delete
curl -X GET -H "Content-Type: application/json" http://localhost:5000/api/merged
```