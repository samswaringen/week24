var { graphqlHTTP } = require('express-graphql');
var { buildSchema, assertInputType } = require('graphql');
var express = require('express');

// Construct a schema, using GraphQL schema language
var restaurants =  [
    {
      "id": 1,
      "name": "WoodsHill ",
      "description": "American cuisine, farm to table, with fresh produce every day",
      "dishes": [
        {
          "name": "Swordfish grill",
          "price": 27
        },
        {
          "name": "Roasted Broccily",
          "price": 11
        }
      ]
    },
    {
      "id": 2,
      "name": "Fiorellas",
      "description": "Italian-American home cooked food with fresh pasta and sauces",
      "dishes": [
        {
          "name": "Flatbread",
          "price": 14
        },
        {
          "name": "Carbonara",
          "price": 18
        },
        {
          "name": "Spaghetti",
          "price": 19
        }
      ]
    },
    {
      "id": 3,
      "name": "Karma",
      "description": "Malaysian-Chinese-Japanese fusion, with great bar and bartenders",
      "dishes": [
        {
          "name": "Dragon Roll",
          "price": 12
        },
        {
          "name": "Pancake roll",
          "price": 11
        },
        {
          "name": "Cod cakes",
          "price": 13
        }
      ]
    }
  ];
var schema = buildSchema(`
type Query{
  restaurant(id: Int): restaurant
  restaurants: [restaurant]
},
type restaurant {
  id: Int
  name: String
  description: String
  dishes:[Dish]
}
type Dish{
  name: String
  price: Int
}
input restaurantInput{
  id: Int
  name: String
  description: String
  dishes: [DishInput]
}
type DeleteResponse{
  ok: Boolean!
}
input DishInput {
  name: String
  price: Int
}
type Mutation{
  createrestaurant(input: restaurantInput): restaurant
  deleterestaurant(id: Int!): DeleteResponse
  editrestaurant(id: Int!, name: String!, description: String!, dishes: [DishInput!]!): restaurant
  adddish(id: Int!, input:DishInput): Dish
  deletedish(id: Int!, name: String!) : DeleteResponse
  editdish(id: Int!, name:String!, newName:String!, newPrice:Int!) : Dish
}
`);
// The root provides a resolver function for each API endpoint

let index, filtered, dishIndex, filteredDish

const mapFunction = (id)=>{
  clearVar()
  restaurants.map((item,i)=> {
    if(id === item.id){
      filtered = item;
      index = i;
    }
  })
  if(!filtered) {
    throw new Error("Restaurant doesn't exist!")
  }
}

const dishMapFunction = (Dish)=>{
  clearVar()
  filtered.dishes.map((item,i)=>{
    if(item.name === Dish.name){
      filteredDish = item
      dishIndex = i;
    }
  })
  if(!filteredDish) {
    throw new Error("Dish doesn't exist!")
  }
}
clearVar = ()=>{
  index = null;
  filtered = null;
  dishIndex = null;
  filteredDish = null;
}
var root = {
  restaurant : ({id})=>{
    mapFunction(id)
    return filtered
  },
  restaurants : ()=> restaurants,
  createrestaurant : ({input}) => {
    restaurants.push({id:input.id,name:input.name, description:input.description, dishes:input.dishes})
    return input
  },
  deleterestaurant : ({id})=>{
    mapFunction(id)
    const ok = Boolean(filtered)
    restaurants = restaurants.filter(item => item.id !== id)
    return {ok}
  },
  editrestaurant: ({id, ...restaurant}) => {
    mapFunction(id)
    restaurants[index] = {
    ...filtered,...restaurant
    }
    return restaurants[index]
  },
  adddish: ({id, input}) => {
    mapFunction(id) 
    restaurants[index].dishes.push({name:input.name, price:input.price})
    return input
  },
  deletedish: ({id, ...Dish})=>{
    mapFunction(id)
    dishMapFunction(Dish)
    const ok = Boolean(filteredDish)
    restaurants[index].dishes = restaurants[index].dishes.filter((item)=>item.name !== Dish.name)
    return {ok}

  },
  editdish: ({id, ...Dish})=>{
    mapFunction(id)
    dishMapFunction(Dish)
    filteredDish = {name:Dish.newName, price:Dish.newPrice}
    restaurants[index].dishes.splice(dishIndex,1,filteredDish)
    return filteredDish
  }
}

var app = express();
app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}));
var port = 5500
app.listen(5500,()=> console.log('Running Graphql on Port:'+port));