# How to use the Editor
If you find yourself overwhelmed or struggeling with the editor, than this page is for you. In the following steps we will explain the use and features of the editor in detail.

- [How to use the Editor](#how-to-use-the-editor)
  - [How to see, what kind of features are currently supported?](#how-to-see-what-kind-of-features-are-currently-supported)
  - [How to load the save?](#how-to-load-the-save)
  - [How to edit skills?](#how-to-edit-skills)
  - [How to edit inventory items?](#how-to-edit-inventory-items)
  - [How to remove a weapon (v. 1.0.6)?](#how-to-remove-a-weapon-v-106)

---

## How to do backups of my save?
When loading up a save, the editor will automatically create a backup file (For example: `save_main_0.sav.bak`). Even though the editor automatically creates this file, it is always a good idea to not overwrite your current save.

## How to see, what kind of features are currently supported?
On the info page on the editor you find a section called `Key Features`. There you find a list of all supported features.

## How to load the save?
On the main page you find a button called `Load Save`. After clicking on it you can choose between drag&drop or selecting a file. If the save is valid, the save information that is displayed on the page like for example the path or the size will change to the current selected file after finishing the validation process. If for any reason the information is not displayed, please visit the [QnA](./CommonlyAskedQuestions.md#why-cant-i-click-on-some-of-the-icons-in-the-menu) for help. The Editor now has to ability to read compressed save files (for example PC) as well. Keep in mind, that the current Editor does not support CRC calculations. **Therefore editing a PC save will resolve in corruption!**

## How to edit skills?
When visiting the skills page, a list of your base and legendary skills should be visible

![image](https://github.com/Marcel-TO/DL2_Save_Editor/assets/91308057/97cb5568-b7c2-4d39-ad2c-e69d71b0160b)
*The Skill Page displaying the base tab and legendary tab*


Clicking on one of the skills allows you to change the value inside the input field. After clicking on `Change`, skill will be edited with the new input value.

![image](https://github.com/Marcel-TO/DL2_Save_Editor/assets/91308057/94cf478a-dcc7-4c9e-be3f-6357a9db6026)
*Skill Item change Example*

## How to edit inventory items?
When visiting the inventory page, a bunch of tabs will be displayed depending on the amount of various stuff you have in your inventory.

![image](https://github.com/Marcel-TO/DL2_Save_Editor/assets/91308057/6fbf1935-c390-4c34-8453-a72ab83eb3e3)
*Inventory Item Page with different tabs*


Selecting one of the items will give you the option to edit various data of the item like `level, seed, amount, durability`
![image](https://github.com/Marcel-TO/DL2_Save_Editor/assets/91308057/6636a22e-b153-4dd5-bd0e-e49a7265b575)
*Selecting an inventory item*


The level is not displayed like `1-13`, but rather in a u16 integer value, for example: `6543`. The seed is used for generating the stats for the items. Each seed generates a specific stat pattern. However the level affects the seed, the highest level Caz uses for the exotic 13 stats is level = 6543. With this level and the following seed `22352` you get the 13 stats with one 75% stat. For legendary 12 stats level is 5519.

If you want to test out random seeds, the editor has a randomize button besides the seed input. Feel free to play around and share your best seed!

It is also possible to change the ID of an item. The ID is used for telling the game, what item you have. So for example if you want to change the item, just click on the edit button on the right of the ID and enter your desired ID. The autocorrect even displays all possible IDs that are able to be swapped. But there is a catch. Because the editor can't currently edit the size of the save, you can only choose IDs that are the same length or less. This is also the reason why you can't just add Items inside the editor yet.

![image](https://github.com/Marcel-TO/DL2_Save_Editor/assets/91308057/d2baeb4b-43e7-4ff0-bbc2-f32ef8e16c3d)
*ID selecting with Autocomplete feature*

## How to remove a weapon (not supported yet)
>**This feature is currently not supported, because the editor can't currently edit the size of the save!!**

If you replace the current ID of the item you want to remove, just clear the whole ID and save the change. **The game must be loaded and saved for this change to actually take affect!**
