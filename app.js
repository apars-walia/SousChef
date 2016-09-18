'use strict'
const http = require('http')
const Bot = require('messenger-bot')
const unirest = require('unirest')
const url = "https://spoonacular-recipe-food-nutrition-v1.p.mashape.com"
const mashape_key = "3Du1rvTxpWmshZlzeFXQHI0m1Rbxp170fiNjsnyMFTg9IMY6s1"
const accept = "application/json"
var fs = require('fs');
const sticker_ids = [554423821312139,554423831312138,554423914645463,554423801312141,554423944645460,554423881312133,554423931312128,554423757978812,554423847978803,554423717978816,554423671312154,554423744645480,554423787978809,554423861312135,554423771312144,554423694645485,554423891312132,554423957978792,144885315685735,144885185685748,144884765685790,144885035685763,144885045685762,144884775685789,144884925685774,144884805685786,144884815685785,144884835685783,144884852352448,144884865685780,144884879019112,144884895685777,144884905685776,144884955685771,144884992352434,144885022352431,144885055685761,144885069019093,144885089019091,144885099019090,144885112352422,144885129019087,144885145685752,144885159019084,144885172352416,144884755685791,144885195685747,144885225685744,144885209019079,144885242352409,144885252352408,144885262352407,144885275685739,144885299019070,144884739019126,144885335685733,144885325685734,144885349019065,144884825685784,144884792352454]

console.log("Before created bot")
let bot = new Bot({
  token: 'EAAZA9ZC5jPpawBAGNrDueGhc3D4rs6XWNaxxZCttBsMWPBunMbZCdSxRA2QCaSlvRmlfX0NObX7eKzAfSQa8EidgwUHNyZCa0qxZCU67B3VByZA6ucugwrogYMZC4mZAGC5ktPjNZAQHL8NctTKMMaAfaNYeJODPqCttkdenJyjJRi2wZDZD',
  verify: 'sous_chef_is_the_password'
})

console.log("Created bot")
console.log(bot.id) 	

function httpGetRequest(payload, reply) {
	if(payload.message.text == undefined) {
		var text = "Oh nyo! Nyo matching recipes!"
		reply({ text }, (err) => {
		if (err) throw err
	  })
		return
	}
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
        let title_text = data[0].title
        let image_url_text = data[0].image
        console.log("recipe_link_url: " + recipe_link_url)
        unirest.get(recipe_link_url)
          .header("X-Mashape-Key", mashape_key)
          .header("Accept", accept)
          .end(function(result) {
            console.log("Second get request returned: " + JSON.stringify(result))
            let item_url_text = result.body.sourceUrl
            console.log("text: " + text)
            // let attachment = {
            //     "type":"image",
            //     "payload":{
            //       "url":"https://petersapparel.com/img/shirt.png"
            //     }
            // }

            result = { attachment: {type: 'template', payload: {template_type: 'generic', elements: [{title: title_text, item_url: item_url_text, image_url: image_url_text}]}}}
            console.log('result: ' + JSON.stringify(result));

            bot.getProfile(payload.sender.id, (err, profile) => {
              if (err) throw err
              reply(result, (err) => {
                if (err) throw err
                console.log(`Echoed back to ${profile.first_name} ${profile.last_name}: ${text}`)
              })
            })
          })
      } else {
        bot.getProfile(payload.sender.id, (err, profile) => {
          if (err) throw err
          text = "Oh nyo! Nyo matching recipes!"
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
	console.log("\npayload: " + JSON.stringify(payload) + "\n")
	if(payload.message.sticker_id != undefined && sticker_ids.indexOf(payload.message.sticker_id)) {
		var text = "MEOOOOOOOOW"
		reply({ text }, (err) => {
			if (err) throw err
            console.log(`Echoed back to ${profile.first_name} ${profile.last_name}: ${text}`)
			})
	}
	else if(payload.message.text != "Oh nyo! Nyo matching recipes!") {
		httpGetRequest(payload, reply)
	}
})

http.createServer(bot.middleware()).listen(3000)
