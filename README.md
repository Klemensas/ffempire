# [Fast Food Empire](https://klemensas.xyz)

## About the project
Ffempire project is my take on [tribal was](http://tribalwars.net), it borrows the best concepts of the game, attempts to improve them and adds new unique features. The game explores a fast food restaurant management theme.


## Core features
Development is divided into 7 core features:

1. Interaction map
2. Restaurant management
3. Franchises
4. Player interaction
5. Resources
6. Workers
7. World progress

### 1. Interaction map

#### Provides
		Map navigation, sending attacks, neighbor monitoring

#### Features
**0.1.0** `Display all restaurants in game, buttons for navigation the map`

### 2. Restaurant management

#### Provides
		Restaurant upgrading, worker recruiting, resource viewing

#### Features
None yet

### 3. Franchises

#### Provides
		Joining/leaving clans, communication, alliances, team co-ordination, endgame victory

#### Features
None yet

### 4. Player interaction

#### Provides
		Message sending, attacking, takeovers, spying

#### Features
None yet

### 5. Resources

#### Provides
		Workers, restaurant upgrades

#### Features
None yet

### 6. Workers

#### Provides
		Resources, defense, attacking capabilities

#### Features
None yet

### 7. World progress

#### Provides
		Player count control, endgame initiation, world end

#### Features
None yet

## Immediate project goals
* Reach MVP
	- [x] project architecture
	- [x] server setup
	- [ ] user accounts
	- [ ] rudimentary game map
	- [ ] restaurant management
	- [ ] starter restaurant buildings
	- [ ] resources
	- [ ] minimal workers
	- [ ] base interaction
	- [ ] basic franchises
* Create and implement a custom canvas library for better performance
* Balance workers so that every one has an use case
* Balance mainstream strategies (defensive, offensive)

## Future features
These features are idealistic nice to have dreams and have low chance of seeing daylight, which is expressed in 1-10 scale of likeliness of being implemented:

##### District influence `8/10`
Influence that affects player restaurant growth, allows them to control districts. Various objects appear on the map over which players compete to increase their influence. Spheres of influence are drawn over the map.

##### Random events `7/10`
Positive and negative random events influencing players and districts

##### Government `4/10`
A government that proposes various modifiers for the server and individual district on which players vote, later in the game franchises can send their own representatives to influence the modifiers proposed

## Launching the project
**Prerequisites:** `node, bower, gulp, mongodb`
Go into the downloaded project directory.
Run `npm install` then `bower install` to install required libraries.
Use gulp for further interaction:
`gulp serve` to run development version
`gulp build` to build production version