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

<!--<a href="https://github.com/LukenSkyne/Valorant-Match-Spy/releases/latest">![Total Downloads](https://img.shields.io/github/downloads/LukenSkyne/Valorant-Match-Spy/total)</a>-->
<a href="https://github.com/LukenSkyne/Valorant-Match-Spy/stargazers">![Total Stars](https://img.shields.io/github/stars/LukenSkyne/Valorant-Match-Spy)</a>
<a href="https://github.com/LukenSkyne/Valorant-Match-Spy/blob/main/LICENSE">![MIT License](https://img.shields.io/github/license/LukenSkyne/Valorant-Match-Spy)</a>
<a href="https://github.com/LukenSkyne/Valorant-Match-Spy/issues">![Contributions are Welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)</a>

</div>

## About

this project is powered by [Wails](https://wails.io/docs/gettingstarted/installation)
which runs a [Go](https://go.dev/) application with a [Svelte](https://svelte.dev/) frontend.

## Usage

The following screenshot shows the app visualizing a loading screen style overview of the players:

<img src="assets/screenshot-ingame.png" alt="In-Game">

Hovering over a playercard shows details about a players loadout:

<img src="assets/screenshot-playercard-hover.png" alt="Playercard Hover">

Clicking on the playercard brings up the loadout of the respective player:

<img src="assets/screenshot-loadout.png" alt="Loadout">

## Development & Compiling yourself

* To run in live development mode, run `wails dev` in the project directory.
* To build a redistributable, production mode package, use `wails build`.

## Acknowledgements

* [HeyM1ke](https://github.com/HeyM1ke/ValorantClientAPI) for their initial research on the Client API
* [techchrism](https://github.com/techchrism/valorant-api-docs) for documentation on most endpoints
* [Valorant-API.com](https://valorant-api.com/) which provides a lot of assets used by the game

## Disclaimer

This project is not affiliated, authorized or endorsed by Riot Games, and all associated properties are trademarks or registered trademarks of Riot Games, Inc.
