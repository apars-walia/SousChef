'use strict'
const http = require('http')
const Bot = require('messenger-bot')
const unirest = require('unirest')
const url = "https://spoonacular-recipe-food-nutrition-v1.p.mashape.com"
const mashape_key = "3Du1rvTxpWmshZlzeFXQHI0m1Rbxp170fiNjsnyMFTg9IMY6s1"
const accept = "application/json"

console.log("Before created bot")
let bot = new Bot({
  token: 'EAAZA9syQJ28cBAFd6gOwgIZCZB2NHtZBW9uv3ZBFY3vuXDnOXuYd6ylRV5OHQRsDnl5DumfSzh9Dxr30nXMfzFVLvBBTZC9RDJoRBYqjGGVaeI0awehZCL2p2plj1bd34esmqJFsisISlBenqi82ZCnAU4MLtZATq8TGEpC5Pe5ylcwZDZD',
  verify: 'sous_chef_is_the_password'
})
console.log("Created bot")

function httpGetRequest(payload, reply) {
  unirest.get(url + "/recipes/queries/analyze?q=" + payload.message.text)
  .header("X-Mashape-Key", mashape_key)
  .header("Accept", accept)
  .end(function(result) {
    console.log(result.status, result.headers, result.body)
    let data = result.body
    let ingredients_array = data["ingredients"]
    let ingredients_list = ""
    for (var i = 0; i < ingredients_array.length; i++) {
      if (ingredients_array[i].include) {
        ingredients_list += ingredients_array[i].name + " "
      }
    }
    ingredients_list =
      encodeURIComponent(
        ingredients_list.trim().replace(/&nbsp;/g, ','));
    console.log("ingredients_list: " + ingredients_list);

  	// Find the recipes that match with the search request.
  	unirest.get(url + "/recipes/findByIngredients?fillIngredients=false&ingredients=" + ingredients_list + "&limitLicense=false&number=1&ranking=1")
  	.header("X-Mashape-Key", mashape_key)
  	.header("Accept", accept)
  	.end(function(result) {
  	  console.log(result.status, result.headers, result.body)
  		data = result.body
  		let text = JSON.stringify(data)

  		// Return the link for the top suggested recipe.
      if (data.length > 0) {
        let recipe_link_url = url + "/recipes/" + data[0].id + "/information"
        console.log("recipe_link_url: " + recipe_link_url)
        unirest.get(recipe_link_url)
          .header("X-Mashape-Key", mashape_key)
          .header("Accept", accept)
          .end(function(result) {
            console.log("Second get request returned: " + JSON.stringify(result))
            text = result.body.sourceUrl
            console.log("text: " + text)

            bot.getProfile(payload.sender.id, (err, profile) => {
              if (err) throw err
              reply({ text }, (err) => {
                if (err) throw err
                console.log(`Echoed back to ${profile.first_name} ${profile.last_name}: ${text}`)
              })
            })
          })
      } else {
        bot.getProfile(payload.sender.id, (err, profile) => {
          if (err) throw err
          text = "Oh no, no matching recipes!"
          reply({ text }, (err) => {
            if (err) throw err
            console.log(`Echoed back to ${profile.first_name} ${profile.last_name}: ${text}`)
          })
        })
      }
  	})
  })
}

bot.on('error', (err) => {
  console.log(err.message)
})

bot.on('message', (payload, reply) => {
	console.log("recieved message")
	httpGetRequest(payload, reply)
})

http.createServer(bot.middleware()).listen(3000)
