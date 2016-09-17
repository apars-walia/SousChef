'use strict'
const http = require('http')
const Bot = require('messenger-bot')
const url = "https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/recipes/"

function getRecipeSrc(id) {
	rawData = httpGetRequest(url + id + "/information")
	jsonObj = JSON.parse(rawData.content)
	return jsonObj.sourceUrl
}

function buildSearchRecipeUrl(base, include) {
		var result = base
		var ingredients = "ingredients=" + include[0]
		for(i = 1; i < include.length; i++) {
			result += "," + include[i]
		}
		result += encodeURIComponent(ingredients)
		result += "&limitLicense=false&number=1&ranking=1"
		return result
}

function httpGetRequest(theUrl) {
		var result = HTTP.call('GET', theUrl, {headers: { "X-Mashape-Key": "3Du1rvTxpWmshZlzeFXQHI0m1Rbxp170fiNjsnyMFTg9IMY6s1" }});
		return result
}

function processRecipeJSON(o) {
	var obj = JSON.parse(o.content);
	return getRecipeSrc(obj[0].id);
}

let bot = new Bot({
  token: 'EAAZA9syQJ28cBAKUVnOXX9RkQT5OA56ut0kjiyAgL46ZBEEyiu7iFYZCHFwguw2WH7CO4ttwMcUJQzDIVDJ3grNKbmPaMKW9L0ZBFTDGHvnH2Cr76voyqt5ZCHI3SnFiqZAeoQFGqX5CduNZAwuIdeTueZAiRwpcTcuYc6fslPlIjwZDZD',
  verify: 'sous_chef_is_the_password'
})

bot.on('error', (err) => {
  console.log(err.message)
})

bot.on('message', (payload, reply) => {
	data = httpGetRequest(buildSearchRecipeUrl(url + "findByIngredients?fillIngredients=false&", ["apple", "sugar"]))
	recipeSrcUrl = processRecipeJSON(data)
	
  let text = recipeSrcUrl

  bot.getProfile(payload.sender.id, (err, profile) => {
    if (err) throw err

    reply({ text }, (err) => {
      if (err) throw err

      console.log(`Echoed back to ${profile.first_name} ${profile.last_name}: ${text}`)
    })
  })
  
  
})

http.createServer(bot.middleware()).listen(3000)
