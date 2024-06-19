<p align="center">
  <img alt="Logo" src="./savegame-editor/src-tauri/icons/128x128@2x.png"></img>
</p>

# Dying Light 2 Save Editor 
<p align="center">
  <img alt="GitHub Downloads (all assets, all releases)" src="https://img.shields.io/github/downloads/Marcel-TO/DL2_Save_Editor/total?style=for-the-badge&logo=Github&logoColor=black&label=Editor%20Downloads&labelColor=899994&color=899994">
  <img alt="GitHub Release" src="https://img.shields.io/github/v/release/Marcel-TO/DL2_Save_Editor?include_prereleases&sort=date&display_name=tag&style=for-the-badge&logo=Github&labelColor=526264&color=526264">
  <img alt="GitHub License" src="https://img.shields.io/github/license/Marcel-TO/DL2_Save_Editor?style=for-the-badge&labelColor=2f4045&color=2f4045">
</p>

## Empowering Gamers, Unleashing Possibilities
*Greetings Pilgrims!*

We are thrilled to present the first Open-Source Save Editor for the Videogame ***Dying Light 2***. This tool allows players to take control of their game saves, unlocking a realm of possibilities and customization. 

## Getting Started
If you want to test out the Editor yourself, feel free to download the Application inside the release and visit the wiki for further details (like Tutorial + QnA).
<p align="center">
  <a href="https://github.com/Marcel-TO/DL2_Save_Editor/wiki/Home" target="_blank">
    <img alt="Static Badge" src="https://img.shields.io/badge/Visit-Wiki-899994?style=for-the-badge&logo=readthedocs&logoColor=fff">
  </a>
  <a href="https://github.com/Marcel-TO/DL2_Save_Editor/wiki/Getting-Started-with-the-Editor" target="_blank">
    <img alt="Static Badge" src="https://img.shields.io/badge/Visit-Getting_Started-899994?style=for-the-badge&logo=readthedocs&logoColor=fff">
  </a>
  <a href="https://github.com/Marcel-TO/DL2_Save_Editor/wiki/Commonly-Asked-Questions-(QnA)" target="_blank">
    <img alt="Static Badge" src="https://img.shields.io/badge/Visit-QnA-899994?style=for-the-badge&logo=readthedocs&logoColor=fff">
  </a>
  <a href="https://github.com/Marcel-TO/DL2_Save_Editor/wiki/Tutorial" target="_blank">
    <img alt="Static Badge" src="https://img.shields.io/badge/Visit-Tutorial-899994?style=for-the-badge&logo=readthedocs&logoColor=fff">
  </a>
  <a href="https://github.com/Marcel-TO/DL2_Save_Editor/releases/tag/app-v1.0.6-no-settings" target="_blank">
    <img alt="Static Badge" src="https://img.shields.io/badge/Visit-Downloads-899994?style=for-the-badge&logo=readthedocs&logoColor=fff">
  </a>
</p>

## What has the Editor to offer?
1. It is fully open source, fostering a collaborative environment where fellow gamers and developers alike can contribute to its evolution.
2. The whole User Interface is customized for *Dying Light 2* and provides not only functionality but a fitting design.
3. Enhancing the gaming experience is the goal of this editor. The community will therefore play a big role regarding future features.

## Key Features
- All Skills can be adjusted and manipulated.
- An Index visualization of all IDs currently inside the game.
- Items can be repaired or switched (currently still limited due to the savefile size).
- Change Inventory Item Stats (Level, Seed, Amount, Durability)
- Swap Inventory Weapons
- Change Skill Values
- Use Templates (for example: to add max durability to all weapons)
- Compress/Decompress Feature

## Planned Features
- Calculating savefile size to switch to every desired weapon or remove an item.
- Change Mods
- Gallery View for items
- Edit Backpack
- Caz Outpost (Stay tuned to learn more about it)
- Automatically update IDs

If you are curious about the process and wanna have a little insight regarding future implementations, check out the Feature release board. It also contains a list of current bugs and a backlog plan:

<a href="https://github.com/users/Marcel-TO/projects/2/views/2" target="_blank">
    <img alt="Static Badge" src="https://img.shields.io/badge/Visit-Feature_Board-899994?style=for-the-badge&logo=readthedocs&logoColor=fff">
</a>

## Tech Stack
This editor uses the *Tauri* Framework for the application.
- **Tauri Framework**
  
  TAURI is a framework for building desktop applications using web technologies (HTML, CSS, JavaScript/TypeScript) as the frontend and Rust as the backend. It provides a bridge between the web and native code to create performant and secure desktop applications.

- **Rust**

  Rust is a systems programming language that focuses on performance, safety, and concurrency. It is used as the backend language in this Editor, handling tasks such as file I/O, data manipulation, and other core functionalities.

- **React**

   React is a JavaScript library for building user interfaces. It follows a component-based architecture, making it easy to create interactive and reusable UI components.

## Prerequisites for programming
> For further Details please visit the wiki entry regarding this topic [here](https://github.com/Marcel-TO/DL2_Save_Editor/wiki/Prerequisites-for-Programming).

- Rust:

  Installation: Before working with TAURI, ensure that Rust is installed on your system. You can install Rust by following the instructions on the official [Rust website](https://www.rust-lang.org/tools/install).

- Node.js and npm (Node Package Manager):

  Installation: TAURI projects typically require Node.js and npm for managing frontend dependencies and building the project. Install Node.js [here](https://nodejs.org/)

- TAURI CLI:

  Installation: The TAURI Command Line Interface (CLI) is essential for creating, building, and managing TAURI projects. Install it globally using npm:
  ```bash
    npm install -g @tauri-apps/cli
  ```

### To run application
After all prerequisites are fulfilled it is possible to start the application with the following command:
```bash
  npm run tauri dev
```


## Contributers
Currently there are 2 contributers that work hard to increase the experience of Dying Light 2. With the help of Caz`s incredible knowledge of savegamefiles and the coding experience of Marcel, the Editor is not only extremely useful, but has a modern UI with Dying Light 2 themed content. A special thanks to Batang as well. He supported us all the time and played a crucial role for the completion of this editor.

<p>
  <a href="https://github.com/Marcel-TO" target="_blank">
    <img alt="Static Badge" src="https://img.shields.io/badge/Developer-MarcelMcHawk-899994?style=for-the-badge">
  </a>
</p>
<p>
  <a href="https://github.com/zCaazual" target="_blank">
    <img alt="Static Badge" src="https://img.shields.io/badge/Reverse Engineer-zCazual-526264?style=for-the-badge">
  </a>
</p>
<p>
  <a href="https://github.com/B-a-t-a-n-g" target="_blank">
    <img alt="Static Badge" src="https://img.shields.io/badge/Tester-Batang-2f4045?style=for-the-badge">
  </a>
</p>

## Join the Community
The Editor was built in collaboration with a dedicated Dying Light 2 Modding Discord Server. If you have any questions feel free to join the Community.

<a href="https://discord.gg/XVn5ntC2EB" target="_blank">
  <img alt="Discord" src="https://img.shields.io/discord/808315053722959873?style=for-the-badge&logo=discord&logoColor=white&labelColor=%235865F2&color=%235865F2">
</a>
