# Commonly asked Questions

- [Commonly asked Questions](#commonly-asked-questions)
  - [Why can't I click on some of the icons in the menu?](#why-cant-i-click-on-some-of-the-icons-in-the-menu)
  - [Is the Editor for PC?](#is-the-editor-for-pc)
  - [Why is my save not loading?](#why-is-my-save-not-loading)

---


## Why can't I click on some of the icons in the menu?
> Some Icons are disabled because those features are not implemented yet.

## Is the Editor for PC?
> In the current state the editor only supports PS4 saves. The CRC implementation is in the works to allow PC players to use the editor as well.

## Why is my save not loading?
> There are certain prerequisites in order to edit the save:
> - Firstly you have to check if your save is decrypted or decompressed, depending on your Platform:
>   -  PS4 savefiles are always encrypted. With the help of Savewizard/Apollo or similar Bot-Services you have to decrypt and extract your save file
>   - PC savefiles are always compressed and you have to decompres it with extract-Applications like winrar or zip
>
> - To test if you decrypted/decompressed it correctly you could right click on your save and open with your desired hex editor (For example [HxD](https://mh-nexus.de/de/hxd/) or [ImHex](https://github.com/WerWolv/ImHex)). The content should look something like this (The ASCII text should contain readable bits like `Savegame`, etc):
> ![image](https://github.com/Marcel-TO/DL2_Save_Editor/assets/91308057/dd2eec27-abbf-4bc8-898c-a4224862e530)
>
> - If the save is still not loading, please contact one of the developers, they will debug the save and correct the issue in the next release