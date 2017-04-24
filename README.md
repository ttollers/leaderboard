# RESTful Leaderboard App

A RESTFUL Leaderboard API built using Node.js and Redis.

## Run
```
npm install
npm start
```

# Add an item
```
POST /:leaderboard_name
```

| Field  |    Type    |  Description |
|----------|:-------------:|------:|
| id |  string | Unique identifier for given key |
| score |    Integer   |  The score value that the user is ranked by |
| foo | any |  Any other amount of properties are accepted as long are valud JSON |

# Get an item
```
GET /:leaderboard_name/:id
```

# Return items by rank between x and y
```
GET /:leaderboard_name?start=x&stop=y
```

# Get items surrounding given id
Useful for getting an item's direct competitors
```
GET /:leaderboard_name/around/:id
```
