<p align="center" style="text-align: center">
  <a href="https://github.com/LukenSkyne/Valorant-Match-Spy">
    <img src="assets/vms-logo.png" alt="Logo" width="128" height="128">
  </a>
</p>

<h3 align="center">Valorant Match Spy</h3>
<p align="center">
    yet another desktop application to spy on your fellow players
</p>

<div align="center">

<a href="https://github.com/LukenSkyne/Valorant-Match-Spy/releases/latest">![Total Downloads](https://img.shields.io/github/downloads/LukenSkyne/Valorant-Match-Spy/total)</a>
<a href="https://github.com/LukenSkyne/Valorant-Match-Spy/stargazers">![Total Stars](https://img.shields.io/github/stars/LukenSkyne/Valorant-Match-Spy)</a>
<a href="https://github.com/LukenSkyne/Valorant-Match-Spy/blob/main/LICENSE">![MIT License](https://img.shields.io/github/license/LukenSkyne/Valorant-Match-Spy)</a>
<a href="https://github.com/LukenSkyne/Valorant-Match-Spy/issues">![Contributions are Welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)</a>

</div>

## About

this project is powered by [Wails](https://wails.io/docs/gettingstarted/installation)
which runs a [Go](https://go.dev/) application with a [Svelte](https://svelte.dev/) frontend.

## Usage

* download the latest [release](https://github.com/LukenSkyne/Valorant-Match-Spy/releases/latest)
* run the app and proceed through the possible windows warning
* depending on your current game state, the app will show you one of the following:
  * when Valorant is not running, a message saying "Waiting for Valorant to Start..."
  * when you are currently in the Menus, a message saying "Waiting for Match..."
  * while in agent select, the app will display details about your Allies
  * while in-game, the app will display details about every Player

Note that the following screenshot depicts how the app recreates a loading screen style overview of the players.

<img src="assets/screenshot-ingame.png" alt="Logo">

## Development & Compiling yourself

* To run in live development mode, run `wails dev` in the project directory.
* To build a redistributable, production mode package, use `wails build`.

## Acknowledgements

* [HeyM1ke](https://github.com/HeyM1ke/ValorantClientAPI) for their initial research on the Client API
* [techchrism](https://github.com/techchrism/valorant-api-docs) for documentation on most endpoints
* [Valorant-API.com](https://valorant-api.com/) which provides a lot of assets used by the game

## Disclaimer

This project is not affiliated, authorized or endorsed by Riot Games, and all associated properties are trademarks or registered trademarks of Riot Games, Inc.
