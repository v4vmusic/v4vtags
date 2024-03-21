v4vTags by Kolomona Myer AKA Sir Libre
[SirLibre.com](https://sirlibre.com)

## Objective

This is my attempt to create a "genre" categorization system for music in podcastindex.org's with the medium tag of music.

I reality it could be used for any RSS feed that's in the podcastindex

## Description
The v4vTags project is an API written with node express, mongoose, mongodb in typescript.

It is a database of items (songs) with an array of tags (genres).
The tags are in order of priority with the zeroth one being the most relevant.

## Use Case
A website or podcast app could use this api to display genre information about the songs they display.
Also they can implement a method for users to add tags to songs that are not tagged or improperly tagged.

## Disclaimer
I have no idea what I'm doing. So this may or may not work at all. My hope is that someone smarter than me takes this proof of concept and refines it.

Also I don't really know how to write in typescript properly so I'm likely doing a lot of things "wrong"

Error checking is not very good and I haven't done much testing so be forewarned.

## TODOS
I would like to figure out a better way add tags instead of just replacing them. I think it would be cool if when people added tags it would somehow be cumulative.

**Example:**
The song "[Phatty The Grasshopper](https://podcastindex.org/podcast/6797653)" is tagged by several people
- Person 1
	- bluegrass, folk, country, instrumental, fun
- Person 2
	- bluegrass, americana, instrumental
- Person 3
	- bluegrass, instrumental, country, hillbilly

Should result in a tag array something like:
"bluegrass, instrumental, country, hillbilly, fun"

There should probably be a limit to the amount of tags and when the limit is reached the least important tags get removed from the array.



## Prerequisites
A web host (duh)
Mongodb with a database created. I used "v4vtags"
a reverse proxy to your server (beyond the scope of my expertise)
A podcastindex.org API Key

## Installation - Production
You should be able to clone this repo into the directory that you want to serve from.

Change to the directory and type
`npm install`

Copy the file .env-example to .env
`cp .env-example .env`

Edit the .env file to match your server environment
`vim .env`

Setup your proxy. (Beyond the scope of this page)

Start the server in daemon mode
`npm run start`
(I forgot how to do this properly🙂)

## Installation-Dev
Same as above but run 
`npm run serve`


## Value for Value
[![Donate!](https://sirlibre.com/img/donate-button-red.jpg)](https://paypal.me/KolomonaM)
If you find any of the work that I have done to be valuable please consider putting me in any splits and / or sending me some btc kolomona@getalby.com

Other methods where you can support me can be found at [SirLibre.com/Donate](https://sirlibre.com/donate)

Also listen and send boostagrams to the Best Value for Value Metal Music Podcast in the Universe [Lightning Thrashes](https://lightningthrashes) ⚡️🤘🏻



## API Documentation
I will attempt to document the API routes here

### Delete by ID
Deletes an item from the database using the mongodb's id

**Example:**
DELETE http://localhost:3001/items/65d0fe96c586a2f8bf280f6d
 

### Delete by all items FeedGuid
This will delete all items in the database that match the feedGuid

**Example:**
DELETE http://localhost:3001/items/byguid/bfd83193-932e-5ef0-b557-418769038ead


### Get all items
Getting all items is not supported in this API

**Example:**
http://127.0.0.1:3001/items/

  
### Get one Item by ID
This will retrieve an item from the database using the mongodb id

**Example:**
http://127.0.0.1:3001/items/65d0f19c2f9b54dc5c8481e0

  
### Get Item by feedGuid/itemGuid
This will fetch the item from the local db. If the item doesn't exist in the local db then a call to the podcast index api will be made to retrieve it. The item will then be saved into the local db

**Example:**
http://127.0.0.1:3001/items/byGuid/05b75483-9f5b-5236-bd66-69e9d3e1b995/c372c998-bbec-47fb-b266-f178dce6aba4

### Get all Items by feedGuid
This will fetch all items from the podcastindex api.
If the item already exists in the local db it will be updated with the info from the podcastindex (effectively refreshing any changes)
If the item does not exist in the local db it will then be added.

**Example:**
http://127.0.0.1:3001/items/byGuid/bfd83193-932e-5ef0-b557-418769038ead
  

### Get All Items by tag
This will return all items that contain the tag

**Example:**
http://127.0.0.1:3001/items/bytag/rock

  

### Get All tags
This will retrieve an array of all the known tags in the database, the array will have unique items

**Example:**
http://127.0.0.1:3001/tags/

  

### Add tags by ID
This will replace the current tags array in the item using the mongodb id.
In the future I'd like to figure out a more clever way than just replacing them

PATCH http://localhost:3001/items/addtags/65d0fe96c586a2f8bf280f6d

Content-Type: application/json

{
"tags": [
"Spoken",
"Halloween",
"male vocals",
"Kolomona"]
}


### Add tags by feedGuid/itemGuid
Same as above but using feedGuid and itemGuid

PATCH http://localhost:3001/items/addtags/PATCH http://localhost:3001/items/addtags/05b75483-9f5b-5236-bd66-69e9d3e1b995/372c998-bbec-47fb-b266-f178dce6aba4

Content-Type: application/json
{
"tags": [
"metal",
"progressive metal",
"guitar",
"male vocals"]
}

  

### Add tags by feedGuid
This will add the tags array to every item that matches feedGuid

PATCH http://localhost:3001/items/addtagsbyfeedguid/bfd83193-932e-5ef0-b557-418769038ead

Content-Type: application/json
{
"tags": [
"Rock",
"Hard Rock",
"grunge",
"male vocals"]
}
